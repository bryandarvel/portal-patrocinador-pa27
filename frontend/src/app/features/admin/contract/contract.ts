import { reportMaterialLabel } from '../../partnership/shared/report-format';
import { CardHeading } from '../../partnership/shared/card-heading';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Component, computed, effect, inject, signal, viewChild } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { ContractPreviewService } from '../../partnership/contract/contract-preview.service';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';

@Component({
  selector: 'app-rbs-contract',
  imports: [
    CardHeading,
    NzIconModule,
    AdminPartnershipShell,
    DatePipe,
    NzButtonModule,
    NzModalModule,
  ],
  templateUrl: './contract.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/contract/contract.css',
    './contract.css',
  ],
})
export class RbsContract {
  readonly materialLabel = reportMaterialLabel;
  readonly preview = inject(ContractPreviewService);
  readonly api = inject(PortalApi);
  readonly dialog = signal<'history' | 'version' | 'signed' | 'saved' | null>(null);
  readonly file = signal<File | null>(null);
  readonly error = signal('');
  readonly modal = viewChild<NzModalComponent>('contractModal');
  readonly title = computed(
    () =>
      ({
        history: 'Histórico do contrato',
        version: this.preview.version() ? 'Publicar versão corrigida' : 'Publicar primeira versão',
        signed: 'Publicar contrato assinado',
        saved: 'Alterações salvas',
      })[this.dialog() ?? 'history'],
  );
  constructor() {
    effect(() => {
      if (this.dialog()) this.focusTitle();
    });
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-contract-dialog-title');
    this.focusTitle();
  }
  private focusTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#rbs-contract-dialog-title')?.focus();
    });
  }
  open(kind: 'version' | 'signed'): void {
    this.file.set(null);
    this.error.set('');
    this.dialog.set(kind);
  }
  select(input: HTMLInputElement): void {
    this.file.set(input.files?.item(0) ?? null);
    this.error.set('');
  }
  async publish(): Promise<void> {
    const file = this.file();
    if (!file || file.size === 0) {
      this.error.set('Selecione um arquivo com conteúdo.');
      return;
    }
    try {
      if (this.dialog() === 'version') await this.preview.publishVersion(file);
      else if (this.dialog() === 'signed') await this.preview.publishSigned(file);
      else return;
      this.dialog.set('saved');
      this.file.set(null);
    } catch {}
  }
  async download(id: string, name: string): Promise<void> {
    try {
      await this.preview.download(id, name);
    } catch {}
  }
}
