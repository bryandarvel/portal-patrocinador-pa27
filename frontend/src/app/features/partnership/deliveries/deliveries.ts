import { EmptyState } from '../shared/empty-state';
import { ExecutionStatus } from '../shared/execution-status';
import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { PortalContext } from '../../../core/portal-context.service';
import { PartnershipShell } from '../shared/partnership-shell';
import { DeliveryReport } from '../shared/delivery-report';
import { DeliveriesPreviewService } from './deliveries-preview.service';

@Component({
  selector: 'app-partnership-deliveries',
  imports: [
    EmptyState,
    ExecutionStatus,
    PartnershipShell,
    RouterLink,
    NzButtonModule,
    NzIconModule,
    DeliveryReport,
  ],
  templateUrl: './deliveries.html',
  styleUrls: ['../shared/partnership-ui.css', './deliveries-sponsor.css'],
})
export class PartnershipDeliveries {
  readonly preview = inject(DeliveriesPreviewService);
  readonly ctx = inject(PortalContext);
  readonly reportOpen = signal(false);
  readonly selectedId = signal('');
  detailLink(id: string): string {
    return `${this.ctx.link('entregas')}/${id}`;
  }
}
