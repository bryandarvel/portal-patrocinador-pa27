import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { Delivery } from '../delivery-detail/logo-delivery-preview.service';

interface DeliveryList {
  itens: Delivery[];
  totais: { pendentes: number; emCurso: number; realizadas: number };
}
@Injectable({ providedIn: 'root' })
export class DeliveriesPreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  private readonly state = signal<DeliveryList>({
    itens: [],
    totais: { pendentes: 0, emCurso: 0, realizadas: 0 },
  });
  readonly loading = signal(false);
  readonly items = computed(() => this.state().itens);
  readonly totals = computed(() => [
    { label: 'Pendentes', value: this.state().totais.pendentes, state: 'pending' },
    { label: 'Em curso', value: this.state().totais.emCurso, state: 'progress' },
    { label: 'Realizadas', value: this.state().totais.realizadas, state: 'done' },
  ]);
  constructor() {
    effect(() => {
      const id = this.ctx.id();
      this.state.set({ itens: [], totais: { pendentes: 0, emCurso: 0, realizadas: 0 } });
      if (id) void this.load(id).catch(() => {});
    });
  }
  async load(id = this.ctx.id()): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.get<DeliveryList>(`/api/parcerias/${id}/entregas`);
      if (id === this.ctx.id()) this.state.set(data);
    } finally {
      if (id === this.ctx.id()) this.loading.set(false);
    }
  }
  async create(area: string, titulo: string, descricao: string): Promise<void> {
    await this.api.post(this.ctx.url('/entregas'), { area, titulo, descricao });
    await this.load();
  }
}
