import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { DeliveriesPreviewService } from '../../partnership/deliveries/deliveries-preview.service';
import { PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';
import { DeliveryReport } from '../../partnership/shared/delivery-report';
import { DeliveryOrganizer } from '../shared/delivery-organizer';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';

@Component({
  selector: 'app-rbs-deliveries',
  imports: [AdminPartnershipShell, RouterLink, NzButtonModule, DeliveryReport, DeliveryOrganizer],
  templateUrl: './deliveries.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/deliveries/deliveries.css', './deliveries.css']
})
export class RbsDeliveries {
  readonly preview = inject(DeliveriesPreviewService);
  readonly partnershipPreview = inject(PartnershipPreviewService);
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly reportOpen = signal(false);
  readonly organizerOpen = signal(false);
  readonly areas = this.preview.areas.map(area => ({ ...area, path: area.path.replace('/previa/', '/previa/rbs/amarelo/') }));

}
