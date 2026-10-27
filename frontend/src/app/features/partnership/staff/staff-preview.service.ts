import { Injectable } from '@angular/core';

export interface AccreditationPreview {
  readonly quantity: number;
  readonly type: string;
  readonly sector: string;
}

/** Dados demonstrativos do frame 10:332; não define direitos da parceria. */
@Injectable({ providedIn: 'root' })
export class StaffPreviewService {
  readonly accreditation: AccreditationPreview = {
    quantity: 12,
    type: 'Equipe de ativação',
    sector: 'Área de ativação'
  };
}
