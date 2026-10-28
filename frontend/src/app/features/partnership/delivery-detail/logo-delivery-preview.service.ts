import { computed, inject, Injectable, signal } from '@angular/core';
import {
  MaterialSelection,
  MaterialVersion,
  PartnershipPreviewService,
} from '../shared/partnership-preview.service';

export type DeliveryOwnerId = 'ana' | 'bruno';
export type LogoStage =
  | 'awaiting'
  | 'received'
  | 'analysis'
  | 'adjustment'
  | 'approved'
  | 'executing'
  | 'realized'
  | 'proof';
export interface LogoMaterialVersion extends MaterialVersion {
  readonly example?: boolean;
  readonly review: 'received' | 'analysis' | 'adjustment' | 'approved';
  readonly reviewedAt?: Date;
  readonly reviewedBy?: string;
  readonly correction?: string;
}
export interface LogoProof {
  readonly description: string;
  readonly author: string;
  readonly publishedAt: Date;
  readonly materialVersion: number;
}

/** Estado local da entrega Logo no telão. Não transmite arquivos à RBS. */
@Injectable({ providedIn: 'root' })
export class LogoDeliveryPreviewService {
  private readonly partnership = inject(PartnershipPreviewService);
  private readonly stageState = signal<LogoStage>('awaiting');
  private readonly proofState = signal<LogoProof | null>(null);
  readonly stage = this.stageState.asReadonly();
  readonly proof = this.proofState.asReadonly();
  readonly correctionText =
    'Por favor, envie a logo com fundo transparente para aplicação no telão.';
  readonly proofExample =
    'A logo do Cliente Amarelo foi exibida no telão durante a ação prevista no evento.';
  readonly canUpload = computed(
    () =>
      this.partnership.brandSubmissionsOpen() &&
      (this.stage() === 'awaiting' || this.stage() === 'adjustment'),
  );
  readonly ownerOptions = [
    { id: 'ana', label: 'Ana Costa · Produção RBS' },
    { id: 'bruno', label: 'Bruno Lima · Mídia RBS' },
  ] as const;
  private readonly ownerState = signal<DeliveryOwnerId>('ana');
  readonly ownerId = this.ownerState.asReadonly();
  readonly owner = computed(() =>
    this.ownerId() === 'ana' ? this.ownerOptions[0].label : this.ownerOptions[1].label,
  );
  private readonly versionsState = signal<readonly LogoMaterialVersion[]>([]);
  readonly versions = this.versionsState.asReadonly();
  readonly current = computed(() => this.versions()[0] ?? null);
  readonly journeyStep = computed(() => {
    switch (this.stage()) {
      case 'awaiting':
      case 'adjustment':
        return 0;
      case 'received':
      case 'analysis':
        return 1;
      case 'approved':
      case 'executing':
        return 2;
      default:
        return 3;
    }
  });
  readonly tone = computed(() =>
    this.stage() === 'proof'
      ? 'info'
      : this.stage() === 'approved' || this.stage() === 'realized'
        ? 'done'
        : this.stage() === 'awaiting' || this.stage() === 'adjustment'
          ? 'awaiting'
          : 'progress',
  );
  readonly icon = computed(() =>
    this.stage() === 'proof'
      ? '/images/status-disponivel.svg'
      : this.stage() === 'approved'
        ? '/images/status-concluido.svg'
        : this.tone() === 'done'
          ? '/images/status-concluido.svg'
          : this.tone() === 'awaiting'
            ? '/images/status-aguardando.svg'
            : '/images/status-em-andamento.svg',
  );
  readonly badge = computed(
    () =>
      ({
        awaiting: 'Aguardando material',
        received: 'Material recebido',
        analysis: 'Material em análise',
        adjustment: 'Ajuste solicitado',
        approved: 'Material aprovado',
        executing: 'Entrega em andamento',
        realized: 'Entrega realizada',
        proof: 'Comprovação disponível',
      })[this.stage()],
  );
  readonly guidance = computed(
    () =>
      ({
        awaiting: 'Patrocinador · Envie a logo da sua marca.',
        received: 'RBS · Confira o arquivo enviado pelo patrocinador.',
        analysis: 'RBS · Avalie o material recebido.',
        adjustment: 'Patrocinador · Envie a logo com fundo transparente.',
        approved: 'A execução da entrega ainda está programada.',
        executing: 'RBS · Registre a realização quando a ação acontecer.',
        realized: 'RBS · Adicione uma comprovação da execução.',
        proof: 'O registro está disponível para consulta e consolidação.',
      })[this.stage()],
  );
  readonly summary = computed(() => ({
    context: 'Aplicações de marca / Entrega 01',
    title: 'Logo no telão',
    owner: this.owner(),
    material:
      this.stage() === 'awaiting'
        ? 'Aguardando envio'
        : this.stage() === 'received'
          ? 'Recebido'
          : this.stage() === 'analysis'
            ? 'Em análise'
            : this.stage() === 'adjustment'
              ? 'Ajuste solicitado'
              : 'Aprovado',
    execution:
      this.stage() === 'executing'
        ? 'Em andamento'
        : this.stage() === 'realized' || this.stage() === 'proof'
          ? 'Realizada'
          : 'Programada',
    nextStep:
      this.stage() === 'awaiting'
        ? 'Patrocinador · Envie a logo para esta entrega.'
        : this.guidance(),
  }));

  setOwner(id: DeliveryOwnerId): boolean {
    if (!this.ownerOptions.some((option) => option.id === id)) return false;
    this.ownerState.set(id);
    return true;
  }

  recordUpload(selection: MaterialSelection): boolean {
    if (
      !this.canUpload() ||
      !selection.name.trim() ||
      !Number.isFinite(selection.size) ||
      selection.size <= 0
    )
      return false;
    this.versionsState.update((versions) => [
      {
        name: selection.name,
        size: selection.size,
        version: versions.length + 1,
        receivedAt: new Date(),
        sender: 'Admin Patrocinador',
        review: 'received',
      },
      ...versions,
    ]);
    this.stageState.set('received');
    return true;
  }

  seedReceivedExample(): boolean {
    if (this.stage() !== 'awaiting' || this.current()) return false;
    // Metadados de demonstração: não representa um upload ou conteúdo de arquivo.
    this.versionsState.set([
      {
        name: 'logo_amarelo_v1.svg',
        size: 0,
        version: 1,
        receivedAt: new Date(),
        sender: 'Admin Patrocinador',
        review: 'received',
        example: true,
      },
    ]);
    this.stageState.set('received');
    return true;
  }

  startAnalysis(): boolean {
    if (this.stage() !== 'received') return false;
    this.review('analysis');
    return true;
  }

  approveMaterial(): boolean {
    if (this.stage() !== 'analysis') return false;
    this.review('approved');
    return true;
  }

  requestAdjustment(): boolean {
    if (this.stage() !== 'analysis') return false;
    this.review('adjustment');
    return true;
  }

  startExecution(): boolean {
    if (this.stage() !== 'approved') return false;
    this.stageState.set('executing');
    return true;
  }

  realize(): boolean {
    if (this.stage() !== 'executing') return false;
    this.stageState.set('realized');
    return true;
  }

  publishProof(description: string): boolean {
    const text = description.trim();
    const material = this.current();
    if (this.stage() !== 'realized' || !material || !text) return false;
    this.proofState.set({
      description: text,
      author: this.owner(),
      publishedAt: new Date(),
      materialVersion: material.version,
    });
    this.stageState.set('proof');
    return true;
  }

  private review(review: LogoMaterialVersion['review']): void {
    const current = this.current();
    if (!current) return;
    this.versionsState.update((versions) =>
      versions.map((version) =>
        version.version === current.version
          ? {
              ...version,
              review,
              reviewedAt: new Date(),
              reviewedBy: this.owner(),
              ...(review === 'adjustment' ? { correction: this.correctionText } : {}),
            }
          : version,
      ),
    );
    this.stageState.set(review);
  }
}
