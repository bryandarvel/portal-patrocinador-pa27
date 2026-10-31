import { EmptyState } from '../../partnership/shared/empty-state';
import { ExecutionStatus } from '../../partnership/shared/execution-status';
import { CardHeading } from '../../partnership/shared/card-heading';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PortalContext } from '../../../core/portal-context.service';
import { PortalApi } from '../../../core/portal-api.service';
import { DeliveriesPreviewService } from '../../partnership/deliveries/deliveries-preview.service';
import { DeliveryReport } from '../../partnership/shared/delivery-report';
import { DeliveryOrganizer } from '../shared/delivery-organizer';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';

@Component({
  selector: 'app-rbs-deliveries',
  imports: [
    EmptyState,
    ExecutionStatus,
    CardHeading,
    AdminPartnershipShell,
    RouterLink,
    FormsModule,
    NzButtonModule,
    DeliveryReport,
    DeliveryOrganizer,
  ],
  templateUrl: './deliveries.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/deliveries/deliveries.css',
    './deliveries.css',
  ],
})
export class RbsDeliveries {
  readonly preview = inject(DeliveriesPreviewService);
  readonly ctx = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly reportOpen = signal(false);
  readonly organizerOpen = signal(false);
  readonly selectedId = signal('');
  readonly createOpen = signal(false);
  readonly error = signal('');
  area = '';
  title = '';
  description = '';
  detailLink(id: string): string {
    return `${this.ctx.link('entregas')}/${id}`;
  }
  async reload(): Promise<void> {
    try {
      await this.preview.load();
    } catch {}
  }
  async create(): Promise<void> {
    if (!this.area || !this.title.trim()) {
      this.error.set('Selecione uma área e informe o título.');
      return;
    }
    try {
      await this.preview.create(this.area, this.title.trim(), this.description.trim());
      this.createOpen.set(false);
      this.area = '';
      this.title = '';
      this.description = '';
      this.error.set('');
    } catch {}
  }
}
