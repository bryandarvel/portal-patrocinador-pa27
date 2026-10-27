import { computed, Injectable, signal } from '@angular/core';

export type ContractDecision =
  | { readonly kind: 'approved'; readonly recordedAt: Date }
  | { readonly kind: 'adjustments'; readonly recordedAt: Date; readonly comment: string };

/** Estado demonstrativo do frame 10:527. Nenhuma decisão é transmitida à RBS. */
@Injectable({ providedIn: 'root' })
export class ContractPreviewService {
  readonly version = { number: 1, name: 'contrato_amarelo_v1.pdf' } as const;
  readonly signatory = { name: 'Representante Amarelo', email: 'assinatura@example.com' } as const;
  private readonly decisionState = signal<ContractDecision | null>(null);
  readonly decision = this.decisionState.asReadonly();
  readonly canDecide = computed(() => this.decision() === null);
  readonly comment = computed(() => {
    const decision = this.decision();
    return decision?.kind === 'adjustments' ? decision.comment : null;
  });
  readonly status = computed(() => {
    switch (this.decision()?.kind) {
      case 'approved': return 'Aprovado para assinatura';
      case 'adjustments': return 'Ajustes solicitados';
      default: return 'Aguardando validação';
    }
  });
  readonly guidance = computed(() => {
    switch (this.decision()?.kind) {
      case 'approved': return 'Assinatura fora do portal · A RBS publicará o arquivo final.';
      case 'adjustments': return 'RBS · Revise o comentário e publique uma versão corrigida.';
      default: return 'Patrocinador · Confira a versão atual e aprove ou solicite ajustes.';
    }
  });
  readonly versionStatus = computed(() => {
    switch (this.decision()?.kind) {
      case 'approved': return 'Aprovado pelo patrocinador';
      case 'adjustments': return 'Ajustes solicitados pelo patrocinador';
      default: return 'Aguardando validação';
    }
  });

  approve(): boolean {
    if (!this.canDecide()) return false;
    this.decisionState.set({ kind: 'approved', recordedAt: new Date() });
    return true;
  }

  requestAdjustments(comment: string): boolean {
    const text = comment.trim();
    if (!this.canDecide() || !text) return false;
    this.decisionState.set({ kind: 'adjustments', comment: text, recordedAt: new Date() });
    return true;
  }
}
