import { CourtesyCard } from './courtesy-card';
import { reportBenefitLabel } from '../shared/report-format';
import { CardHeading } from '../shared/card-heading';
import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { PortalApi } from '../../../core/portal-api.service';
import { PartnershipShell } from '../shared/partnership-shell';
import { CourtesyPreview, TicketsPreviewService } from './tickets-preview.service';
import { focusFormSection } from '../shared/form-focus';

@Component({
  selector: 'app-partnership-tickets',
  imports: [CourtesyCard, CardHeading, PartnershipShell, FormsModule, NzButtonModule],
  templateUrl: './tickets.html',
  styleUrls: ['../shared/partnership-ui.css', './tickets.css'],
})
export class PartnershipTickets {
  readonly benefitLabel = reportBenefitLabel;
  readonly preview = inject(TicketsPreviewService);
  readonly api = inject(PortalApi);
  readonly courtesies = this.preview.courtesies;
  readonly selected = signal<CourtesyPreview | null>(null);
  readonly saving = signal(false);
  readonly error = signal('');
  private readonly formSection = viewChild<ElementRef<HTMLElement>>('destinationForm');
  private origin: HTMLElement | null = null;
  quantity = 1;
  destination = '';
  constructor() {
    effect(() => {
      const item = this.selected();
      const section = this.formSection()?.nativeElement;
      if (item && section)
        requestAnimationFrame(() => {
          if (this.selected()?.id === item.id) focusFormSection(section);
        });
    });
  }
  open(item: CourtesyPreview, origin: EventTarget | null): void {
    this.origin = origin instanceof HTMLElement ? origin : null;
    this.selected.set(item);
    this.quantity = 1;
    this.destination = '';
    this.error.set('');
  }
  close(): void {
    this.selected.set(null);
    this.origin?.focus();
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
