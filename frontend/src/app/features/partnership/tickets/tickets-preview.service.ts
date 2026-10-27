import { Injectable } from '@angular/core';

export interface CourtesyPreview {
  readonly id: string;
  readonly quantity: number;
  readonly type: string;
  readonly sector: string;
}

/** Exemplos do frame 10:242; não define limites ou direitos da cota. */
@Injectable({ providedIn: 'root' })
export class TicketsPreviewService {
  readonly courtesies: readonly CourtesyPreview[] = [
    { id: 'camarote-passaporte', quantity: 50, type: 'Passaporte', sector: 'Camarote' },
    { id: 'vip-passaporte', quantity: 30, type: 'Passaporte', sector: 'VIP' }
  ];
}
