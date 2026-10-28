import { inject, Injectable, InjectionToken, signal } from '@angular/core';

export const EMPTY_TICKETS_PREVIEW = new InjectionToken<boolean>('EMPTY_TICKETS_PREVIEW');

export interface CourtesyPreview {
  readonly id: string;
  readonly quantity: number;
  readonly type: string;
  readonly sector: string;
}

export type CourtesyInput = Omit<CourtesyPreview, 'id'>;

/** Exemplos do frame 10:242; não define limites ou direitos da cota. */
@Injectable({ providedIn: 'root' })
export class TicketsPreviewService {
  private readonly records = signal<readonly CourtesyPreview[]>(inject(EMPTY_TICKETS_PREVIEW, { optional: true }) ? [] : [
    { id: 'camarote-passaporte', quantity: 50, type: 'Passaporte', sector: 'Camarote' },
    { id: 'vip-passaporte', quantity: 30, type: 'Passaporte', sector: 'VIP' }
  ]);
  readonly courtesies = this.records.asReadonly();
  private nextId = 1;

  add(input: CourtesyInput): CourtesyPreview | null {
    const data = this.normalize(input);
    if (!data) return null;
    const record: CourtesyPreview = { id: `courtesy-preview-${this.nextId++}`, ...data };
    this.records.update(records => [...records, record]);
    return record;
  }

  update(id: string, input: CourtesyInput): boolean {
    const data = this.normalize(input);
    if (!data || !this.records().some(record => record.id === id)) return false;
    this.records.update(records => records.map(record => record.id === id ? { ...record, ...data } : record));
    return true;
  }

  private normalize(input: CourtesyInput): CourtesyInput | null {
    const type = input.type.trim();
    const sector = input.sector.trim();
    if (!Number.isSafeInteger(input.quantity) || input.quantity < 0 || !type || !sector) return null;
    return { quantity: input.quantity, type, sector };
  }
}
