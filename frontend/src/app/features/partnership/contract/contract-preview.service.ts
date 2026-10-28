import { computed, Injectable, signal } from '@angular/core';

export type ContractDecision =
  | { readonly kind: 'approved'; readonly recordedAt: Date }
  | { readonly kind: 'adjustments'; readonly recordedAt: Date; readonly comment: string };

export interface ContractVersion {
  readonly number: number;
  readonly name: string;
  readonly publishedAt: Date | null;
  readonly decision: ContractDecision | null;
}

export interface SignedContractPreview {
  readonly name: string;
  readonly baseVersion: number;
  readonly publishedAt: Date;
}

/** Estado demonstrativo do frame 10:527. Nenhuma decisão é transmitida à RBS. */
@Injectable({ providedIn: 'root' })
export class ContractPreviewService {
  readonly signatory = { name: 'Representante Amarelo', email: 'assinatura@example.com' } as const;
  private readonly versionsState = signal<readonly ContractVersion[]>([
    { number: 1, name: 'contrato_amarelo_v1.pdf', publishedAt: null, decision: null }
  ]);
  private readonly signedState = signal<SignedContractPreview | null>(null);
  readonly history = this.versionsState.asReadonly();
  readonly version = computed(() => this.versionsState()[0]);
  readonly decision = computed(() => this.version().decision);
  readonly signed = this.signedState.asReadonly();
  readonly canDecide = computed(() => this.decision() === null);
  readonly canPublishCorrection = computed(() => this.decision()?.kind === 'adjustments' && this.signed() === null);
  readonly canPublishSigned = computed(() => this.decision()?.kind === 'approved' && this.signed() === null);
  readonly correctionFileName = computed(() => `contrato_amarelo_v${this.version().number + 1}.pdf`);
  readonly signedFileName = computed(() => `contrato_amarelo_v${this.version().number}_assinado.pdf`);
  readonly comment = computed(() => {
    const decision = this.decision();
    return decision?.kind === 'adjustments' ? decision.comment : null;
  });
  readonly status = computed(() => {
    if (this.signed()) return 'Contrato assinado';
    switch (this.decision()?.kind) {
      case 'approved': return 'Aprovado para assinatura';
      case 'adjustments': return 'Ajustes solicitados';
      default: return this.version().number === 1 ? 'Aguardando validação' : `Aguardando validação · Versão ${this.version().number}`;
    }
  });
  readonly guidance = computed(() => {
    if (this.signed()) return 'O arquivo final está disponível para consulta nesta simulação.';
    switch (this.decision()?.kind) {
      case 'approved': return 'Assinatura fora do portal · A RBS publicará o arquivo final.';
      case 'adjustments': return 'RBS · Revise o comentário e publique uma versão corrigida.';
      default: return this.version().number === 1 ? 'Patrocinador · Confira a versão atual e aprove ou solicite ajustes.' : 'Patrocinador · Confira a nova versão.';
    }
  });
  readonly versionStatus = computed(() => this.statusFor(this.decision()));

  statusFor(decision: ContractDecision | null): string {
    switch (decision?.kind) {
      case 'approved': return 'Aprovado pelo patrocinador';
      case 'adjustments': return 'Ajustes solicitados pelo patrocinador';
      default: return 'Aguardando validação';
    }
  }

  approve(): boolean {
    if (!this.canDecide()) return false;
    this.recordDecision({ kind: 'approved', recordedAt: new Date() });
    return true;
  }

  requestAdjustments(comment: string): boolean {
    const text = comment.trim();
    if (!this.canDecide() || !text) return false;
    this.recordDecision({ kind: 'adjustments', comment: text, recordedAt: new Date() });
    return true;
  }

  publishCorrection(): boolean {
    if (!this.canPublishCorrection()) return false;
    const version: ContractVersion = {
      number: this.version().number + 1, name: this.correctionFileName(), publishedAt: new Date(), decision: null
    };
    this.versionsState.update(versions => [version, ...versions]);
    return true;
  }

  publishSigned(): boolean {
    if (!this.canPublishSigned()) return false;
    this.signedState.set({ name: this.signedFileName(), baseVersion: this.version().number, publishedAt: new Date() });
    return true;
  }

  private recordDecision(decision: ContractDecision): void {
    const number = this.version().number;
    this.versionsState.update(versions => versions.map(version => version.number === number ? { ...version, decision } : version));
  }
}
