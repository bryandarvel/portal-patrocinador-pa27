import { computed, Injectable, signal } from '@angular/core';

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
}
export interface MaterialVersion extends MaterialSelection {
  readonly version: number;
  readonly receivedAt: Date;
  readonly sender?: 'Admin Patrocinador' | 'Admin RBS';
}

/** Dados de apresentação do frame 9:154. Não representa uma sessão autenticada. */
@Injectable({ providedIn: 'root' })
export class PartnershipPreviewService {
  readonly partnership: PartnershipProfilePreview = {
    sponsorName: 'Cliente Amarelo',
    sponsorContext: 'Amarelo',
    quota: 'Master',
    email: 'amarelo@example.com',
    roleLabel: 'Admin Patrocinador',
    documents: [
      { id: 'commercial-plan', title: 'Plano comercial 2027', description: 'Condições da cota Master' },
      { id: 'ticket-purchase', title: 'Compra de ingressos', description: 'Condição de patrocinador' }
    ]
  };
  private readonly versionsState = signal<readonly MaterialVersion[]>([]);
  readonly mivVersions = this.versionsState.asReadonly();
  readonly currentMiv = computed(() => this.versionsState()[0] ?? null);
  private readonly brandOpenState = signal(true);
  readonly brandSubmissionsOpen = this.brandOpenState.asReadonly();

  setBrandSubmissionsOpen(open: boolean): void {
    this.brandOpenState.set(open);
  }

  // Apenas metadados em memória; não lê, transmite ou persiste o conteúdo do arquivo.
  recordMiv(selection: MaterialSelection, sender: 'Admin Patrocinador' | 'Admin RBS' = 'Admin Patrocinador'): void {
    if (!this.brandSubmissionsOpen()) return;
    const version: MaterialVersion = {
      ...selection, version: this.versionsState().length + 1, receivedAt: new Date(), sender
    };
    this.versionsState.update(versions => [version, ...versions]);
  }
}
