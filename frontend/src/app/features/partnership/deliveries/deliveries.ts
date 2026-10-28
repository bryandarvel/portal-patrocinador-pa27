import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PartnershipShell } from '../shared/partnership-shell';
import { PartnershipPreviewService } from '../shared/partnership-preview.service';
import { DeliveryReport } from '../shared/delivery-report';
import { DeliveriesPreviewService } from './deliveries-preview.service';

@Component({
  selector: 'app-partnership-deliveries',
  imports: [PartnershipShell, RouterLink, NzButtonModule, DeliveryReport],
  templateUrl: './deliveries.html',
  styleUrls: ['../shared/partnership-ui.css', './deliveries.css']
})
export class PartnershipDeliveries {
  readonly preview = inject(DeliveriesPreviewService);
  readonly partnershipPreview = inject(PartnershipPreviewService);
  readonly reportOpen = signal(false);
}
