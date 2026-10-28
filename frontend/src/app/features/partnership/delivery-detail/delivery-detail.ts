import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { PartnershipShell } from '../shared/partnership-shell';
import { DeliveryReport } from '../shared/delivery-report';
import { LogoDeliveryPreviewService } from './logo-delivery-preview.service';

@Component({
  selector: 'app-delivery-detail',
  imports: [PartnershipShell, DeliveryReport, RouterLink, DatePipe, NzButtonModule, NzModalModule],
  templateUrl: './delivery-detail.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './delivery-detail.css'],
})
export class DeliveryDetail {
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly ctx = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly dialog = signal<'upload' | 'history' | 'proof' | 'saved' | null>(null);
  readonly selected = signal<File | null>(null);
  readonly error = signal('');
  readonly reportOpen = signal(false);
  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((params) => {
        const id = params.get('entregaId');
        if (id) void this.preview.load(id).catch(() => {});
      });
  }
  select(input: HTMLInputElement): void {
    this.selected.set(input.files?.item(0) ?? null);
    this.error.set('');
  }
  async send(): Promise<void> {
    const file = this.selected();
    if (!file || !file.size) {
      this.error.set('Selecione um arquivo com conteúdo.');
      return;
    }
    try {
      await this.preview.upload(file);
      this.dialog.set('saved');
      this.selected.set(null);
    } catch {}
  }
  async download(id: string, name: string): Promise<void> {
    try {
      await this.preview.download(id, name);
    } catch {}
  }
}
