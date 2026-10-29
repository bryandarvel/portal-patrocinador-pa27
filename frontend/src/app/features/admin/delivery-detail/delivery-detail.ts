import { Component, DestroyRef, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { LogoDeliveryPreviewService } from '../../partnership/delivery-detail/logo-delivery-preview.service';
import { DeliveryReport } from '../../partnership/shared/delivery-report';
import { DeliveryOrganizer } from '../shared/delivery-organizer';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';

@Component({
  selector: 'app-rbs-logo-delivery',
  imports: [
    AdminPartnershipShell,
    DeliveryOrganizer,
    DeliveryReport,
    RouterLink,
    DatePipe,
    FormsModule,
    NzButtonModule,
    NzModalModule,
  ],
  templateUrl: './delivery-detail.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/delivery-detail/delivery-detail.css',
    './delivery-detail.css',
  ],
})
export class RbsLogoDelivery {
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly ctx = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly dialog = signal<'approve' | 'adjust' | 'realize' | 'proof' | 'history' | 'saved' | null>(
    null,
  );
  readonly reportOpen = signal(false);
  readonly organizerOpen = signal(false);
  readonly deliveryId = signal('');
  readonly error = signal('');
  readonly file = signal<File | null>(null);
  comment = '';
  description = '';
  constructor() {
    inject(ActivatedRoute)
      .paramMap.pipe(takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((params) => {
        const id = params.get('entregaId');
        this.deliveryId.set(id ?? '');
        if (id) void this.preview.load(id).catch(() => {});
      });
  }
  async evaluate(action: 'ANALISAR' | 'APROVAR' | 'AJUSTAR'): Promise<void> {
    if (action === 'AJUSTAR' && !this.comment.trim()) {
      this.error.set('Descreva o ajuste solicitado.');
      return;
    }
    try {
      await this.preview.evaluate(action, this.comment.trim());
      this.dialog.set(action === 'ANALISAR' ? null : 'saved');
      this.comment = '';
      this.error.set('');
    } catch {}
  }
  async execute(state: 'EM_EXECUCAO' | 'REALIZADA'): Promise<void> {
    try {
      await this.preview.execute(state);
      this.dialog.set(state === 'REALIZADA' ? 'saved' : null);
    } catch {}
  }
  select(input: HTMLInputElement): void {
    this.file.set(input.files?.item(0) ?? null);
  }
  async publishProof(): Promise<void> {
    if (!this.description.trim()) {
      this.error.set('Descreva a execução.');
      return;
    }
    try {
      await this.preview.publishProof(this.description.trim(), this.file());
      this.dialog.set('saved');
      this.description = '';
      this.file.set(null);
      this.error.set('');
    } catch {}
  }
  async download(id: string, name: string): Promise<void> {
    try {
      await this.preview.download(id, name);
    } catch {}
  }
}
