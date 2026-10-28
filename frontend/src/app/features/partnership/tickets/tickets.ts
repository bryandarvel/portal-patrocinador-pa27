import { Component, inject } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PartnershipShell } from '../shared/partnership-shell';
import { TicketsPreviewService } from './tickets-preview.service';

@Component({
  selector: 'app-partnership-tickets',
  imports: [PartnershipShell, NzButtonModule],
  templateUrl: './tickets.html',
  styleUrls: ['../shared/partnership-ui.css', './tickets.css']
})
export class PartnershipTickets {
  readonly courtesies = inject(TicketsPreviewService).courtesies;
}
