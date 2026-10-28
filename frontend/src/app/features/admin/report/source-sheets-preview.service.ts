import { inject, Injectable, InjectionToken, signal } from '@angular/core';
import type { AdminSponsorId } from '../shared/client-preview.service';

export const SOURCE_SHEETS_CLIENT = new InjectionToken<AdminSponsorId>('SOURCE_SHEETS_CLIENT');

export interface SourceSheetPreview {
  readonly id: string;
  readonly name: string;
  readonly origin: string;
}

/** Metadados dos dois exemplos do Figma. Não seleciona, lê ou processa arquivos. */
@Injectable({ providedIn: 'root' })
export class SourceSheetsPreviewService {
  private readonly clientId = inject(SOURCE_SHEETS_CLIENT, { optional: true }) ?? 'amarelo';
  readonly examples: readonly SourceSheetPreview[] = [
    { id: 'midia', name: `midia_${this.clientId}.xlsx`, origin: 'Mídia' },
    { id: 'ativacoes', name: `ativacoes_${this.clientId}.xlsx`, origin: 'Ativações' },
  ];
  private readonly sheetsState = signal<readonly SourceSheetPreview[]>([]);
  readonly sheets = this.sheetsState.asReadonly();

  addExamples(): void {
    if (this.sheets().length) return;
    this.sheetsState.set(this.examples.map((sheet) => ({ ...sheet })));
  }
}
