import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface DeliveryMaterial {
  id: string;
  numero: number;
  arquivo_id: string;
  estado: 'RECEBIDO' | 'EM_ANALISE' | 'AJUSTES' | 'APROVADO';
  correcao: string | null;
  avaliado_em: string | null;
  avaliado_por: string | null;
}
export interface DeliveryProof {
  id: string;
  descricao: string;
  material_id: string;
  arquivo_id: string | null;
  criado_em: string;
  autor: string;
}
export interface Delivery {
  id: string;
  parceria_id: string;
  area: string;
  titulo: string;
  descricao: string;
  execucao: 'PROGRAMADA' | 'EM_EXECUCAO' | 'REALIZADA';
  versao: number;
  responsavel_id: string | null;
  responsavel: string | null;
  materiais: DeliveryMaterial[];
  comprovacoes: DeliveryProof[];
}

@Injectable({ providedIn: 'root' })
export class LogoDeliveryPreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  private requestedId = '';
  private readonly state = signal<Delivery | null>(null);
  readonly delivery = this.state.asReadonly();
  readonly loading = signal(false);
  readonly current = computed(() => this.state()?.materiais[0] ?? null);
  readonly versions = computed(() => this.state()?.materiais ?? []);
  readonly proof = computed(() => this.state()?.comprovacoes.at(-1) ?? null);
  readonly stage = computed(() => {
    const d = this.delivery();
    const m = this.current();
    if (!d) return 'awaiting';
    if (this.proof()) return 'proof';
    if (d.execucao === 'REALIZADA') return 'realized';
    if (d.execucao === 'EM_EXECUCAO') return 'executing';
    return (
      (
        {
          RECEBIDO: 'received',
          EM_ANALISE: 'analysis',
          AJUSTES: 'adjustment',
          APROVADO: 'approved',
        } as Record<string, string>
      )[m?.estado ?? ''] ?? 'awaiting'
    );
  });
  readonly canUpload = computed(() => {
    const d = this.delivery();
    return (
      !!d &&
      !this.ctx.admin() &&
      this.ctx.submissionsOpen(d.area) &&
      d.execucao === 'PROGRAMADA' &&
      (!this.current() || this.current()?.estado === 'AJUSTES')
    );
  });
  readonly owner = computed(() => this.delivery()?.responsavel ?? 'Responsável ainda não definido');
  readonly badge = computed(
    () =>
      (
        ({
          awaiting: 'Aguardando material',
          received: 'Material recebido',
          analysis: 'Material em análise',
          adjustment: 'Ajuste solicitado',
          approved: 'Material aprovado',
          executing: 'Entrega em andamento',
          realized: 'Entrega realizada',
          proof: 'Comprovação disponível',
        }) as Record<string, string>
      )[this.stage()],
  );
  readonly tone = computed(() =>
    ['proof', 'approved', 'realized'].includes(this.stage())
      ? 'done'
      : ['awaiting', 'adjustment'].includes(this.stage())
        ? 'awaiting'
        : 'progress',
  );
  readonly icon = computed(() =>
    this.tone() === 'done'
      ? '/images/status-concluido.svg'
      : this.tone() === 'awaiting'
        ? '/images/status-aguardando.svg'
        : '/images/status-em-andamento.svg',
  );
  readonly guidance = computed(
    () =>
      (
        ({
          awaiting: 'Patrocinador · Envie o material desta entrega.',
          received: 'RBS · Confira o arquivo enviado pelo patrocinador.',
          analysis: 'RBS · Avalie o material recebido.',
          adjustment: 'Patrocinador · Envie uma versão corrigida.',
          approved: 'A execução da entrega está programada.',
          executing: 'RBS · Registre a realização quando a ação acontecer.',
          realized: 'RBS · Adicione uma comprovação da execução.',
          proof: 'O registro está disponível para consulta.',
        }) as Record<string, string>
      )[this.stage()],
  );
  readonly journeyStep = computed(() =>
    ['awaiting', 'adjustment'].includes(this.stage())
      ? 0
      : ['received', 'analysis'].includes(this.stage())
        ? 1
        : ['approved', 'executing'].includes(this.stage())
          ? 2
          : 3,
  );
  readonly summary = computed(() => ({
    context: this.delivery()?.area ?? '',
    title: this.delivery()?.titulo ?? '',
    owner: this.owner(),
    material: this.badge(),
    execution: this.delivery()?.execucao ?? 'PROGRAMADA',
    nextStep: this.guidance(),
  }));
  constructor() {
    effect(() => {
      this.ctx.id();
      this.state.set(null);
    });
  }
  async load(id: string, partnershipId = this.ctx.id()): Promise<void> {
    this.requestedId = id;
    this.state.set(null);
    this.loading.set(true);
    try {
      const d = await this.api.get<Delivery>(`/api/parcerias/${partnershipId}/entregas/${id}`);
      if (partnershipId === this.ctx.id() && id === this.requestedId) this.state.set(d);
    } finally {
      if (partnershipId === this.ctx.id() && id === this.requestedId) this.loading.set(false);
    }
  }
  async upload(file: File): Promise<void> {
    const d = this.delivery();
    if (!d) throw new Error('Entrega indisponível.');
    const result = await this.api.upload<Delivery>(
      this.ctx.url(`/entregas/${d.id}/materiais/versoes`),
      file,
    );
    if (d.parceria_id === this.ctx.id()) this.state.set(result);
  }
  async evaluate(acao: 'ANALISAR' | 'APROVAR' | 'AJUSTAR', comentario = ''): Promise<void> {
    const d = this.delivery(),
      m = this.current();
    if (!d || !m) throw new Error('Material indisponível.');
    const result = await this.api.post<Delivery>(
      this.ctx.url(`/entregas/${d.id}/materiais/versoes/${m.id}/avaliacoes`),
      { acao, comentario },
    );
    if (d.parceria_id === this.ctx.id()) this.state.set(result);
  }
  async execute(estado: 'EM_EXECUCAO' | 'REALIZADA'): Promise<void> {
    const d = this.delivery();
    if (!d) throw new Error('Entrega indisponível.');
    const result = await this.api.patch<Delivery>(this.ctx.url(`/entregas/${d.id}/execucao`), {
      estado,
      versao: d.versao,
    });
    if (d.parceria_id === this.ctx.id()) this.state.set(result);
  }
  async assign(usuarioId: string): Promise<void> {
    const d = this.delivery();
    if (!d) throw new Error('Entrega indisponível.');
    const result = await this.api.patch<Delivery>(this.ctx.url(`/entregas/${d.id}/responsavel`), {
      usuarioId,
      versao: d.versao,
    });
    if (d.parceria_id === this.ctx.id()) this.state.set(result);
  }
  async publishProof(descricao: string, file: File | null): Promise<void> {
    const d = this.delivery();
    if (!d) throw new Error('Entrega indisponível.');
    const body = new FormData();
    body.append('descricao', descricao);
    if (file) body.append('arquivo', file);
    const result = await this.api.post<Delivery>(
      this.ctx.url(`/entregas/${d.id}/comprovacoes`),
      body,
    );
    if (d.parceria_id === this.ctx.id()) this.state.set(result);
  }
  async download(id: string, name: string): Promise<void> {
    await this.api.download(this.ctx.url(`/arquivos/${id}`), name);
  }
}
