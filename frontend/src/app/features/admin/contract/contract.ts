import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { ContractPreviewService } from '../../partnership/contract/contract-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';

type ContractDialog = 'document' | 'history' | 'correction' | 'publish-signed' | 'signed' | 'saved' | null;

@Component({
  selector: 'app-rbs-contract',
  imports: [AdminPartnershipShell, NzButtonModule, NzModalModule, DatePipe],
  templateUrl: './contract.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/contract/contract.css', './contract.css']
})
export class RbsContract {
  readonly preview = inject(ContractPreviewService);
  readonly dialog = signal<ContractDialog>(null);
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly documentButton = viewChild<ElementRef<HTMLButtonElement>>('documentButton');
  readonly title = computed(() => {
    switch (this.dialog()) {
      case 'history': return 'Histórico do contrato';
      case 'correction': return 'Publicar versão corrigida';
      case 'publish-signed': return 'Disponibilizar contrato assinado';
      case 'signed': return 'Contrato final assinado';
      case 'saved': return 'Alterações salvas';
      default: return 'Contrato para validação';
    }
  });
  private restoreDocumentFocus = false;

  openPublication(kind: 'correction' | 'publish-signed'): void {
    if (kind === 'correction' ? this.preview.canPublishCorrection() : this.preview.canPublishSigned()) this.dialog.set(kind);
  }

  publish(): void {
    const dialog = this.dialog();
    const saved = dialog === 'correction' ? this.preview.publishCorrection() : dialog === 'publish-signed' && this.preview.publishSigned();
    if (!saved) return;
    this.dialog.set('saved');
    requestAnimationFrame(() => { if (this.dialog() === 'saved') this.heading()?.nativeElement.focus(); });
  }

  close(): void {
    this.restoreDocumentFocus = this.dialog() === 'saved';
    this.dialog.set(null);
  }

  afterClose(): void {
    if (!this.restoreDocumentFocus) return;
    this.restoreDocumentFocus = false;
    requestAnimationFrame(() => { if (this.dialog() === null) this.documentButton()?.nativeElement.focus(); });
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-contract-dialog-title');
  }
}
