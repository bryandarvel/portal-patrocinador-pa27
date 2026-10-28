import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PortalApi } from '../../../core/portal-api.service';
import { PartnershipShell } from '../shared/partnership-shell';
import { CourtesyPreview, TicketsPreviewService } from './tickets-preview.service';

@Component({
  selector: 'app-partnership-tickets',
  imports: [PartnershipShell, FormsModule, NzButtonModule],
  templateUrl: './tickets.html',
  styleUrls: ['../shared/partnership-ui.css', './tickets.css'],
})
export class PartnershipTickets {
  readonly preview = inject(TicketsPreviewService);
  readonly api = inject(PortalApi);
  readonly courtesies = this.preview.courtesies;
  readonly selected = signal<CourtesyPreview | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  quantity = 1;
  destination = '';
  open(item: CourtesyPreview): void {
    this.selected.set(item);
    this.quantity = 1;
    this.destination = '';
    this.error.set('');
  }
  async destine(): Promise<void> {
    const item = this.selected();
    if (!item || this.saving()) return;
    if (
      !Number.isSafeInteger(this.quantity) ||
      this.quantity < 1 ||
      this.quantity > item.quantity - item.allocated ||
      !this.destination.trim()
    ) {
      this.error.set('Informe uma destinação e quantidade dentro do saldo.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      await this.preview.destine(item.id, this.quantity, this.destination);
      this.selected.set(null);
      this.api.notice.set('Destinação registrada.');
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.saving.set(false);
    }
  }
}
