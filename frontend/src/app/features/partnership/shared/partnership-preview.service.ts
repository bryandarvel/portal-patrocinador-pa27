import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi, PortalArquivo } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface CommercialDocumentPreview {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

export interface PartnershipProfilePreview {
  readonly sponsorName: string;
  readonly sponsorContext: string;
  readonly quota: string;
  readonly email: string;
  readonly roleLabel: string;
  readonly documents: readonly CommercialDocumentPreview[];
}

export interface MaterialSelection {
  readonly name: string;
  readonly size: number;
  readonly file?: File;
}
export interface MaterialVersion extends MaterialSelection {
  readonly id?: string;
  readonly version: number;
  readonly receivedAt: Date;
  readonly sender?: 'Admin Patrocinador' | 'Admin RBS';
}

export interface BrandPublication {
  id: string;
  titulo: string;
  texto: string | null;
  url: string | null;
  arquivoId: string | null;
  criadoEm: string;
}
interface BrandView {
  arquivos: PortalArquivo[];
  versoes: { arquivoId: string; versao: number; criadoEm: string }[];
  publicacoes: BrandPublication[];
  recebimento: { aberto: boolean; prazo: string | null };
}
export function deadlineToLocal(value: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
}
export function deadlineFromLocal(value: string, open: boolean): string | null {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime()) || deadlineToLocal(date.toISOString()) !== value)
    throw new Error('Informe uma data e hora válidas.');
  if (open && date.getTime() <= Date.now())
    throw new Error('Para reabrir, informe um prazo futuro ou deixe o campo vazio.');
  return date.toISOString();
}

@Injectable({ providedIn: 'root' })
export class PartnershipPreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  private readonly documentsState = signal<readonly CommercialDocumentPreview[]>([]);
  readonly profile = computed<PartnershipProfilePreview>(() => ({
    sponsorName: this.ctx.partnership()?.nome ?? '',
    sponsorContext: this.ctx.partnership()?.edicao ?? '',
    quota: this.ctx.partnership()?.cota ?? '',
    email: this.ctx.session.user()?.email ?? '',
    roleLabel: this.ctx.admin() ? 'Admin RBS' : 'Admin Patrocinador',
    documents: this.documentsState(),
  }));
  get partnership(): PartnershipProfilePreview {
    return this.profile();
  }
  private readonly versionsState = signal<readonly MaterialVersion[]>([]);
  readonly mivVersions = this.versionsState.asReadonly();
  readonly currentMiv = computed(() => this.versionsState()[0] ?? null);
  readonly publications = signal<readonly BrandPublication[]>([]);
  readonly deadline = signal<string | null>(null);
  private readonly brandOpenState = signal(false);
  readonly brandSubmissionsOpen = this.brandOpenState.asReadonly();

  constructor() {
    effect(() => {
      const id = this.ctx.id(),
        brandEnabled = this.ctx.enabled('marca');
      this.versionsState.set([]);
      this.publications.set([]);
      this.documentsState.set([]);
      this.brandOpenState.set(false);
      if (id) {
        if (brandEnabled) void this.load(id).catch(() => {});
        void this.loadDocuments(id);
      }
    });
  }
  async load(id = this.ctx.id()): Promise<void> {
    const view = await this.api.get<BrandView>(`/api/parcerias/${id}/marca`);
    if (id !== this.ctx.id()) return;
    this.versionsState.set(
      view.versoes.map((v) => {
        const file = view.arquivos.find((f) => f.id === v.arquivoId);
        return {
          id: v.arquivoId,
          name: file?.nome ?? 'Arquivo indisponível',
          size: file?.tamanho ?? 0,
          version: v.versao,
          receivedAt: new Date(v.criadoEm),
        };
      }),
    );
    this.publications.set(view.publicacoes);
    this.deadline.set(view.recebimento.prazo);
    this.brandOpenState.set(
      view.recebimento.aberto &&
        (!view.recebimento.prazo || Date.parse(view.recebimento.prazo) > Date.now()),
    );
  }
  private async loadDocuments(id: string): Promise<void> {
    try {
      const data = await this.api.get<PortalArquivo[]>(`/api/parcerias/${id}/documentos`);
      if (id === this.ctx.id())
        this.documentsState.set(
          data.map((file) => ({
            id: file.id,
            title: file.nome,
            description: 'Documento comercial',
          })),
        );
    } catch {}
  }
  async recordMiv(selection: MaterialSelection): Promise<void> {
    if (!selection.file) throw new Error('Selecione um arquivo.');
    await this.api.upload(this.ctx.url('/marca/miv/versoes'), selection.file);
    await this.load();
  }
  async setBrandSubmissionsOpen(
    open: boolean,
    prazo: string | null = this.deadline(),
  ): Promise<void> {
    await this.api.patch(this.ctx.url('/marca/recebimento'), { aberto: open, prazo });
    await this.load();
  }
  async publish(titulo: string, texto: string, url: string, file: File | null): Promise<void> {
    await this.api.publication(
      this.ctx.url('/marca/publicacoes'),
      { titulo, texto: texto || null, url: url || null },
      file,
    );
    await this.load();
  }
  async download(id: string, name: string): Promise<void> {
    await this.api.download(this.ctx.url(`/arquivos/${id}`), name);
  }
}
