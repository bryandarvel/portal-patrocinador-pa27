import { Injectable, signal } from '@angular/core';

export interface AccreditationPreview {
  readonly quantity: number;
  readonly type: string;
  readonly sector: string;
}

/** Dados demonstrativos do frame 10:332; não define direitos da parceria. */
@Injectable({ providedIn: 'root' })
export class StaffPreviewService {
  private readonly record = signal<AccreditationPreview>({
    quantity: 12,
    type: 'Equipe de ativação',
    sector: 'Área de ativação'
  });
  readonly accreditation = this.record.asReadonly();

  update(quantity: number, sector: string): boolean {
    const normalizedSector = sector.trim();
    if (!Number.isSafeInteger(quantity) || quantity < 0 || !normalizedSector) return false;
    this.record.update(current => ({ ...current, quantity, sector: normalizedSector }));
    return true;
  }
}
