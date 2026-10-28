import { Component, effect, inject, input, model, output, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { LogoDeliveryPreviewService } from '../../partnership/delivery-detail/logo-delivery-preview.service';

interface Responsible {
  id: string;
  nome: string;
  email: string;
}
@Component({
  selector: 'app-delivery-organizer',
  imports: [NzButtonModule, NzModalModule],
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
  readonly api = inject(PortalApi);
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly owners = signal<Responsible[]>([]);
  readonly selected = signal('');
  readonly stage = signal<'choose' | 'saved'>('choose');
  constructor() {
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
    try {
      const [owners] = await Promise.all([
        this.api.get<Responsible[]>('/api/admin/responsaveis'),
        this.preview.load(id),
      ]);
      if (this.open() && this.deliveryId() === id) {
        this.owners.set(owners);
        this.selected.set(this.preview.delivery()?.responsavel_id ?? '');
      }
    } catch {}
  }
  async save(): Promise<void> {
    if (!this.selected()) return;
    try {
      await this.preview.assign(this.selected());
      this.stage.set('saved');
      this.saved.emit();
    } catch {}
  }
}
