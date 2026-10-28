import { Component, inject, input, model } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { LogoDeliveryPreviewService } from '../delivery-detail/logo-delivery-preview.service';
import { PartnershipPreviewService } from './partnership-preview.service';
import { labelPartnershipDialog } from './modal-accessibility';

@Component({
  selector: 'app-delivery-report',
  imports: [NzButtonModule, NzModalModule],
  templateUrl: './delivery-report.html',
  styleUrls: ['./partnership-ui.css', './delivery-report.css']
})
export class DeliveryReport {
  readonly open = model(false);
  readonly sponsorName = input<string | null>(null);
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly partnership = inject(PartnershipPreviewService).partnership;

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'delivery-report-title');
  }
}
