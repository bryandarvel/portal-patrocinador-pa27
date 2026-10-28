import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface Signatario {
  id?: string;
  nome: string;
  email: string;
  cargo: string;
}
export interface ContractVersion {
  id: string;
  numero: number;
  arquivo_id: string;
  criado_em: string;
  decisao: 'APROVADO' | 'AJUSTES' | null;
  comentario: string | null;
  decidido_em: string | null;
}
export interface SignedContract {
  versao_id: string;
  arquivo_id: string;
  criado_em: string;
}
interface ContractView {
  signatarios: Signatario[];
  versoes: ContractVersion[];
  assinado: SignedContract[];
}

@Injectable({ providedIn: 'root' })
export class ContractPreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  private readonly state = signal<ContractView>({ signatarios: [], versoes: [], assinado: [] });
  readonly loading = signal(false);
  readonly signatories = computed(() => this.state().signatarios);
  readonly history = computed(() => this.state().versoes);
  readonly version = computed(() => this.history()[0] ?? null);
  readonly signed = computed(() => this.state().assinado[0] ?? null);
  readonly canDecide = computed(
    () => !this.ctx.admin() && !!this.version() && !this.version()?.decisao,
  );
  readonly canPublishVersion = computed(
    () =>
      this.ctx.admin() &&
      this.signatories().length > 0 &&
      (!this.version() || this.version()?.decisao === 'AJUSTES') &&
      !this.signed(),
  );
  readonly canPublishSigned = computed(
    () => this.ctx.admin() && this.version()?.decisao === 'APROVADO' && !this.signed(),
  );
  readonly status = computed(() =>
    this.signed()
      ? 'Contrato assinado'
      : this.version()?.decisao === 'APROVADO'
        ? 'Aprovado para assinatura'
        : this.version()?.decisao === 'AJUSTES'
          ? 'Ajustes solicitados'
          : this.version()
            ? 'Aguardando validação'
            : 'Aguardando publicação',
  );
  readonly guidance = computed(() =>
    !this.signatories().length
      ? 'O patrocinador deve informar os signatários.'
      : !this.version()
        ? 'A RBS pode publicar a primeira versão.'
        : this.version()?.decisao === 'AJUSTES'
          ? 'A RBS deve publicar uma versão corrigida.'
          : this.version()?.decisao === 'APROVADO'
            ? 'A assinatura ocorre fora do portal; a RBS publicará o arquivo final.'
            : 'Confira o arquivo e registre sua decisão.',
  );

  constructor() {
    effect(() => {
      const id = this.ctx.id();
      this.state.set({ signatarios: [], versoes: [], assinado: [] });
      if (id) void this.load(id).catch(() => {});
    });
  }
  async load(id = this.ctx.id()): Promise<void> {
    this.loading.set(true);
    try {
      const [view, versoes] = await Promise.all([
        this.api.get<ContractView>(`/api/parcerias/${id}/contrato`),
        this.api.get<ContractVersion[]>(`/api/parcerias/${id}/contrato/versoes`),
      ]);
      if (id === this.ctx.id()) this.state.set({ ...view, versoes });
    } finally {
      if (id === this.ctx.id()) this.loading.set(false);
    }
  }
  async saveSignatories(signatarios: Signatario[]): Promise<void> {
    await this.api.put(this.ctx.url('/contrato/signatarios'), { signatarios });
    await this.load();
  }
  async decide(decisao: 'APROVADO' | 'AJUSTES', comentario = ''): Promise<void> {
    const version = this.version();
    if (!version) throw new Error('Nenhuma versão disponível.');
    await this.api.post(this.ctx.url(`/contrato/versoes/${version.id}/decisoes`), {
      decisao,
      comentario,
    });
    await this.load();
  }
  async publishVersion(file: File): Promise<void> {
    await this.api.upload(this.ctx.url('/contrato/versoes'), file);
    await this.load();
  }
  async publishSigned(file: File): Promise<void> {
    const version = this.version();
    if (!version) throw new Error('Nenhuma versão aprovada.');
    await this.api.upload(this.ctx.url('/contrato/assinado'), file, { versaoId: version.id });
    await this.load();
  }
  async download(id: string, name: string): Promise<void> {
    await this.api.download(this.ctx.url(`/arquivos/${id}`), name);
  }
}
