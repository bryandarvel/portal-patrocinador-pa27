import { Injectable, signal } from '@angular/core';

export interface PartnershipReportPublication {
  readonly name: string;
  readonly publishedAt: Date;
}

/** Publicação ilustrativa do Amarelo. Não contém PDF nem comunica com APIs. */
@Injectable({ providedIn: 'root' })
export class PartnershipReportPreviewService {
  readonly exampleName = 'relatorio_cliente_amarelo.pdf';
  private readonly publicationState = signal<PartnershipReportPublication | null>(null);
  readonly publication = this.publicationState.asReadonly();

  publishExample(): void {
    if (this.publication()) return;
    this.publicationState.set({ name: this.exampleName, publishedAt: new Date() });
  }
}
