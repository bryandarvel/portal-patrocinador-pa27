import { Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { StaffPreviewService } from './staff-preview.service';

@Component({
  selector: 'app-partnership-staff',
  imports: [PartnershipShell, NzButtonModule, NzModalModule],
  templateUrl: './staff.html',
  styleUrls: ['../shared/partnership-ui.css', './staff.css']
})
export class PartnershipStaff {
  readonly accreditation = inject(StaffPreviewService).accreditation;
  readonly openStaffDialog = signal(false);

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'staff-dialog-title');
  }
}
