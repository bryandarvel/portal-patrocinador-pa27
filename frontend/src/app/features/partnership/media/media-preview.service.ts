import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { MaterialSelection } from '../shared/partnership-preview.service';
import { PortalApi, PortalArquivo } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface MediaVersion {
  readonly id?: string;
  readonly name: string;
  readonly size: number | null;
  readonly version: number;
  readonly receivedAt: Date | null;
  readonly sender?: 'Admin Patrocinador' | 'Admin RBS';
}

export interface MediaPublication {
  id: string;
  titulo: string;
  texto: string | null;
  url: string | null;
  arquivoId: string | null;
  criadoEm: string;
}
export interface Placement {
  id: string;
  canal: string;
  descricao: string;
  url: string | null;
  veiculadoEm: string | null;
}
interface MediaView {
  arquivos: PortalArquivo[];
  versoes: { arquivoId: string | null; texto: string | null; versao: number; criadoEm: string }[];
  briefing: { texto: string } | null;
  veiculacoes: Placement[];
  veiculacoesVersao: number;
  publicacoes: MediaPublication[];
  recebimento: { aberto: boolean; prazo: string | null };
}
@Injectable({ providedIn: 'root' })
export class MediaPreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  private readonly versionsState = signal<readonly MediaVersion[]>([]);
  private readonly briefingState = signal('');
  private readonly submissionsOpenState = signal(false);
  readonly deadline = signal<string | null>(null);
  readonly placements = signal<readonly Placement[]>([]);
  readonly placementsVersion = signal(0);
  readonly publications = signal<readonly MediaPublication[]>([]);
  readonly versions = this.versionsState.asReadonly();
  readonly currentFile = computed(() => this.versionsState().find((v) => !!v.id) ?? null);
  readonly briefing = this.briefingState.asReadonly();
  readonly submissionsOpen = this.submissionsOpenState.asReadonly();

  constructor() {
    effect(() => {
      const id = this.ctx.id();
      this.versionsState.set([]);
      this.briefingState.set('');
      this.submissionsOpenState.set(false);
      this.placements.set([]);
      this.publications.set([]);
      if (id) void this.load(id).catch(() => {});
    });
  }
  async load(id = this.ctx.id()): Promise<void> {
    const view = await this.api.get<MediaView>(`/api/parcerias/${id}/midia`);
    if (id !== this.ctx.id()) return;
    this.versionsState.set(
      view.versoes.map((v) => {
        const file = view.arquivos.find((f) => f.id === v.arquivoId);
        return {
          id: v.arquivoId ?? undefined,
          name: file?.nome ?? v.texto ?? 'Texto',
          size: file?.tamanho ?? null,
          version: v.versao,
          receivedAt: new Date(v.criadoEm),
        };
      }),
    );
    this.briefingState.set(view.briefing?.texto ?? '');
    this.placements.set(view.veiculacoes);
    this.placementsVersion.set(view.veiculacoesVersao);
    this.publications.set(view.publicacoes);
    this.deadline.set(view.recebimento.prazo);
    this.submissionsOpenState.set(
      view.recebimento.aberto &&
        (!view.recebimento.prazo || Date.parse(view.recebimento.prazo) > Date.now()),
    );
  }
  async setSubmissionsOpen(open: boolean, prazo: string | null = this.deadline()): Promise<void> {
    await this.api.patch(this.ctx.url('/midia/recebimento'), { aberto: open, prazo });
    await this.load();
  }
  async savePlacements(items: Omit<Placement, 'id'>[]): Promise<void> {
    await this.api.patch(this.ctx.url('/midia/veiculacoes'), {
      versao: this.placementsVersion(),
      itens: items,
    });
    await this.load();
  }
  async publish(titulo: string, texto: string, url: string, file: File | null): Promise<void> {
    await this.api.publication(
      this.ctx.url('/midia/publicacoes'),
      { titulo, texto: texto || null, url: url || null },
      file,
    );
    await this.load();
  }
  async download(id: string, name: string): Promise<void> {
    await this.api.download(this.ctx.url(`/arquivos/${id}`), name);
  }

  async recordFile(selection: MaterialSelection): Promise<void> {
    if (!selection.file) throw new Error('Selecione um arquivo.');
    await this.api.upload(this.ctx.url('/midia/versoes'), selection.file);
    await this.load();
  }
  async saveBriefing(text: string): Promise<void> {
    await this.api.put(this.ctx.url('/midia/briefing'), { texto: text.trim() });
    await this.load();
  }
  async sendText(text: string): Promise<void> {
    const body = new FormData();
    body.append('texto', text.trim());
    await this.api.post(this.ctx.url('/midia/versoes'), body);
    await this.load();
  }
}
