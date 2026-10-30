import { NzIconModule } from 'ng-zorro-antd/icon';
import { CardHeading } from '../../partnership/shared/card-heading';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { PortalContext } from '../../../core/portal-context.service';
import { PortalApi } from '../../../core/portal-api.service';
import {
  CourtesyPreview,
  TicketsPreviewService,
} from '../../partnership/tickets/tickets-preview.service';

@Component({
  selector: 'app-rbs-tickets',
  imports: [AdminPartnershipShell, CardHeading, FormsModule, NzButtonModule, NzIconModule],
  templateUrl: './tickets.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/tickets/tickets.css',
    './tickets.css',
  ],
})
export class RbsTickets {
  readonly context = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly preview = inject(TicketsPreviewService);
  readonly benefits = computed(
    () =>
      this.context
        .partnership()
        ?.beneficios.filter((item) => item.natureza === 'CORTESIA' && !item.publico) ?? [],
  );
  readonly editing = signal<CourtesyPreview | null>(null);
  readonly formOpen = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  quantity = 0;
  benefitId = '';
  type = 'passaporte';
  sector = '';
  periodStart = '';
  periodEnd = '';
  eventDay = '';
  benefitType = 'passaporte';
  benefitSector = '';
  benefitQuantity = 0;
  readonly addingBenefit = signal(false);
  open(item: CourtesyPreview | null = null): void {
    this.editing.set(item);
    this.quantity = item?.quantity ?? 0;
    this.benefitId = item?.benefitId ?? this.benefits()[0]?.id ?? '';
    this.type = item?.type ?? 'passaporte';
    this.sector = item?.sector ?? this.benefits()[0]?.setor ?? '';
    this.periodStart = item?.periodStart ?? '';
    this.periodEnd = item?.periodEnd ?? '';
    this.eventDay = item?.eventDay ?? '';
    this.error.set('');
    this.formOpen.set(true);
  }
  async save(): Promise<void> {
    if (this.saving()) return;
    const benefit = this.benefits().find((item) => item.id === this.benefitId);
    if (
      !benefit ||
      benefit.tipo !== this.type ||
      benefit.setor !== this.sector ||
      !Number.isSafeInteger(this.quantity) ||
      this.quantity < 0 ||
      (this.type === 'passaporte'
        ? !this.periodStart || !this.periodEnd || this.periodEnd < this.periodStart
        : !this.eventDay)
    ) {
      this.error.set('Confira direito, quantidade e datas.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      await this.preview.save(
        {
          quantity: this.quantity,
          type: this.type,
          sector: this.sector,
          benefitId: benefit.id,
          periodStart: this.type === 'passaporte' ? this.periodStart : null,
          periodEnd: this.type === 'passaporte' ? this.periodEnd : null,
          eventDay: this.type === 'passaporte' ? null : this.eventDay,
        },
        this.editing()?.id,
      );
      this.formOpen.set(false);
      this.api.notice.set('Cortesia salva.');
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.saving.set(false);
    }
  }
  async addBenefit(): Promise<void> {
    if (this.saving()) return;
    if (
      !this.benefitSector.trim() ||
      !Number.isSafeInteger(this.benefitQuantity) ||
      this.benefitQuantity < 0
    ) {
      this.error.set('Informe setor e quantidade válida.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      await this.api.post(this.context.url('/beneficios'), {
        natureza: 'CORTESIA',
        tipo: this.benefitType,
        setor: this.benefitSector.trim(),
        publico: '',
        quantidade: this.benefitQuantity,
      });
      await this.context.refresh();
      this.addingBenefit.set(false);
      this.api.notice.set('Direito de cortesia cadastrado.');
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.saving.set(false);
    }
  }
  async changeLimit(benefitId: string, quantity: number, version: number): Promise<void> {
    if (this.saving()) return;
    if (!Number.isSafeInteger(quantity) || quantity < 0) {
      this.error.set('Informe uma quantidade válida.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      await this.api.patch(this.context.url(`/beneficios/${benefitId}`), {
        quantidade: quantity,
        versao: version,
      });
      await this.context.refresh();
      this.api.notice.set('Limite atualizado.');
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.saving.set(false);
    }
  }
}
