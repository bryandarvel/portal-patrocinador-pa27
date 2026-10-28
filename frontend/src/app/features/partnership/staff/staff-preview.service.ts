import { effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface Credential {
  setor: string;
  tipo: string;
  publico: string;
  quantidade: number;
  beneficioId: string;
}
export interface Accreditation {
  urlOpenStaff: string | null;
  versao: number;
  itens: Credential[];
  historico: {
    versao: number;
    urlOpenStaff: string | null;
    itens: Credential[];
    snapshotEm: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class StaffPreviewService {
  private readonly api = inject(PortalApi);
  private readonly context = inject(PortalContext);
  private readonly record = signal<Accreditation | null>(null);
  readonly accreditation = this.record.asReadonly();
  constructor() {
    effect(() => {
      const id = this.context.id();
      this.record.set(null);
      if (id) void this.load().catch(() => {});
    });
  }
  async load(): Promise<void> {
    const id = this.context.id();
    if (!id) return;
    const data = await this.api.get<Accreditation>(this.context.url('/credenciamento'));
    if (id === this.context.id()) this.record.set(data);
  }
  async update(urlOpenStaff: string, itens: Credential[]): Promise<void> {
    const partnershipId = this.context.id();
    const current = this.record();
    if (!current) throw new Error('Aguarde o carregamento do credenciamento.');
    const data = await this.api.put<Accreditation>(this.context.url('/credenciamento'), {
      versao: current.versao,
      urlOpenStaff,
      itens,
    });
    if (partnershipId === this.context.id()) this.record.set(data);
  }
  readonly validUrl = (value: string | null | undefined): boolean => {
    try {
      return ['http:', 'https:'].includes(new URL(value ?? '').protocol);
    } catch {
      return false;
    }
  };
}
