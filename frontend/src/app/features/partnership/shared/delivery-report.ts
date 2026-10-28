import { Component, effect, inject, input, model, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { Delivery } from '../delivery-detail/logo-delivery-preview.service';

@Component({
  selector: 'app-delivery-report',
  imports: [DatePipe, NzButtonModule, NzModalModule],
  templateUrl: './delivery-report.html',
  styleUrls: ['./partnership-ui.css', './delivery-report.css'],
})
export class DeliveryReport {
  readonly open = model(false);
  readonly deliveryId = input('');
  readonly sponsorName = input<string | null>(null);
  readonly ctx = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly data = signal<Delivery | null>(null);
  readonly loading = signal(false);
  constructor() {
    effect(() => {
      const id = this.deliveryId(),
        isOpen = this.open(),
        partnershipId = this.ctx.id();
      this.data.set(null);
      if (isOpen && id && partnershipId) void this.load(id, partnershipId);
    });
  }
  private async load(id: string, partnershipId: string): Promise<void> {
    this.loading.set(true);
    try {
      const data = await this.api.get<Delivery>(`/api/parcerias/${partnershipId}/entregas/${id}`);
      if (this.open() && this.deliveryId() === id && this.ctx.id() === partnershipId)
        this.data.set(data);
    } catch {
    } finally {
      if (this.deliveryId() === id) this.loading.set(false);
    }
  }
}
