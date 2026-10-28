import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PartnershipShell } from '../shared/partnership-shell';
import { StaffPreviewService } from './staff-preview.service';

@Component({
  selector: 'app-partnership-staff',
  imports: [PartnershipShell, NzButtonModule],
  templateUrl: './staff.html',
  styleUrls: ['../shared/partnership-ui.css', './staff.css'],
})
export class PartnershipStaff {
  readonly preview = inject(StaffPreviewService);
  readonly accreditation = this.preview.accreditation;
}
