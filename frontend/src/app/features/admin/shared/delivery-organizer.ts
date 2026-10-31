import { Component, effect, inject, input, model, output, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FormsModule } from '@angular/forms';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { PortalApi } from '../../../core/portal-api.service';
import { LogoDeliveryPreviewService } from '../../partnership/delivery-detail/logo-delivery-preview.service';

interface Responsible {
  id: string;
  nome: string;
  email: string;
}
@Component({
  selector: 'app-delivery-organizer',
  imports: [FormsModule, NzButtonModule, NzModalModule],
  templateUrl: './delivery-organizer.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    './delivery-organizer.css',
  ],
})
export class DeliveryOrganizer {
  readonly open = model(false);
  readonly deliveryId = input('');
  readonly saved = output<void>();
  readonly closed = output<void>();
  readonly api = inject(PortalApi);
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly owners = signal<Responsible[]>([]);
  readonly selected = signal('');
  readonly stage = signal<'choose' | 'saved'>('choose');
  readonly loading = signal(false);
  private readonly modal = viewChild<NzModalComponent>('organizerModal');
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'delivery-organizer-title');
  }
  constructor() {
    effect(() => {
      if (this.open()) {
        this.stage();
        const modal = this.modal();
        if (modal) this.labelDialog(modal);
      }
    });
    effect(() => {
      const id = this.deliveryId(),
        isOpen = this.open();
      if (isOpen && id) {
        this.stage.set('choose');
        void this.load(id);
      }
    });
  }
  private async load(id: string): Promise<void> {
    this.loading.set(true);
    this.owners.set([]);
    this.selected.set('');
    try {
      const [owners] = await Promise.all([
        this.api.get<Responsible[]>('/api/admin/responsaveis'),
        this.preview.load(id),
      ]);
      if (this.open() && this.deliveryId() === id) {
        this.owners.set(owners);
        this.selected.set(this.preview.delivery()?.responsavel_id ?? '');
      }
    } catch {
    } finally {
      if (this.deliveryId() === id) this.loading.set(false);
    }
  }
  async save(): Promise<void> {
    if (this.loading() || !this.selected()) return;
    try {
      await this.preview.assign(this.selected());
      this.stage.set('saved');
      this.saved.emit();
    } catch {}
  }
}
