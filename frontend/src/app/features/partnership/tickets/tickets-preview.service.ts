import { effect, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export const EMPTY_TICKETS_PREVIEW = new InjectionToken<boolean>('EMPTY_TICKETS_PREVIEW');
export interface CourtesyPreview {
  id: string;
  quantity: number;
  type: string;
  sector: string;
  version: number;
  benefitId: string;
  periodStart: string | null;
  periodEnd: string | null;
  eventDay: string | null;
  allocated: number;
  destinations: { id: string; quantidade: number; destinacao: string; criadoEm: string }[];
}
export interface CourtesyInput {
  quantity: number;
  type: string;
  sector: string;
  benefitId: string;
  periodStart: string | null;
  periodEnd: string | null;
  eventDay: string | null;
}
interface CourtesyResponse {
  id: string;
  quantidade: number;
  tipo: string;
  setor: string;
  versao: number;
  beneficioId: string;
  periodoInicio: string | null;
  periodoFim: string | null;
  diaEvento: string | null;
  destinadas: number;
  destinacoes: CourtesyPreview['destinations'];
}
const mapCourtesy = (item: CourtesyResponse): CourtesyPreview => ({
  id: item.id,
  quantity: item.quantidade,
  type: item.tipo,
  sector: item.setor,
  version: item.versao,
  benefitId: item.beneficioId,
  periodStart: item.periodoInicio,
  periodEnd: item.periodoFim,
  eventDay: item.diaEvento,
  allocated: item.destinadas,
  destinations: item.destinacoes,
});

@Injectable({ providedIn: 'root' })
export class TicketsPreviewService {
  private readonly api = inject(PortalApi);
  private readonly context = inject(PortalContext);
  private readonly records = signal<readonly CourtesyPreview[]>([]);
  readonly courtesies = this.records.asReadonly();
  constructor() {
    effect(() => {
      const id = this.context.id();
      this.records.set([]);
      if (id) void this.load().catch(() => {});
    });
  }
  async load(): Promise<void> {
    const id = this.context.id();
    if (!id) return;
    const data = await this.api.get<CourtesyResponse[]>(this.context.url('/cortesias'));
    if (id === this.context.id()) this.records.set(data.map(mapCourtesy));
  }
  async save(input: CourtesyInput, id: string | null = null): Promise<CourtesyPreview> {
    const partnershipId = this.context.id();
    const current = this.courtesies().find((item) => item.id === id);
    const body = {
      quantidade: input.quantity,
      tipo: input.type,
      setor: input.sector,
      beneficioId: input.benefitId,
      periodoInicio: input.periodStart,
      periodoFim: input.periodEnd,
      diaEvento: input.eventDay,
      versao: current?.version ?? null,
    };
    const data = id
      ? await this.api.patch<CourtesyResponse>(this.context.url(`/cortesias/${id}`), body)
      : await this.api.post<CourtesyResponse>(this.context.url('/cortesias'), body);
    const item = mapCourtesy(data);
    if (partnershipId === this.context.id())
      this.records.update((items) =>
        id ? items.map((existing) => (existing.id === id ? item : existing)) : [...items, item],
      );
    return item;
  }
  async destine(id: string, quantity: number, destination: string): Promise<void> {
    await this.api.post(this.context.url(`/cortesias/${id}/destinacoes`), {
      quantidade: quantity,
      destinacao: destination.trim(),
    });
    await this.load();
  }
}
