import { DatePipe } from '@angular/common';
import { Component, computed, DestroyRef, ElementRef, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { MaterialSelection, PartnershipPreviewService } from '../shared/partnership-preview.service';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { DeliveryReport } from '../shared/delivery-report';
import { LogoDeliveryPreviewService } from './logo-delivery-preview.service';

type MaterialDialog = 'upload' | 'progress' | 'received' | 'cancelled' | 'history' | 'document' | 'proof';

@Component({
  selector: 'app-delivery-detail',
  imports: [PartnershipShell, DeliveryReport, RouterLink, DatePipe, NzButtonModule, NzModalModule],
  templateUrl: './delivery-detail.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './delivery-detail.css']
})
export class DeliveryDetail {
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly partnership = inject(PartnershipPreviewService);
  readonly dialog = signal<MaterialDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly reportOpen = signal(false);
  readonly materialHeading = viewChild<ElementRef<HTMLElement>>('materialHeading');
  readonly modal = viewChild<NzModalComponent>('materialModal');
  readonly steps = ['Material do patrocinador', 'Análise pela RBS', 'Execução da ação', 'Comprovação e relatório'];
  readonly dialogTitle = computed(() => {
    switch (this.dialog()) {
      case 'upload': return this.preview.current() ? 'Substituir logo da entrega' : 'Enviar logo da entrega';
      case 'proof': return 'Comprovação da entrega';
      case 'progress': return 'Enviando material';
      case 'cancelled': return 'Operação cancelada';
      case 'history': return 'Histórico do material';
      default: return 'Material recebido';
    }
  });
  private pendingUpload: ReturnType<typeof setTimeout> | undefined;
  private restoreMaterialFocus = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopUpload());
  }

  openUpload(): void {
    if (!this.preview.canUpload()) return;
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set('upload');
  }

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    input.value = '';
    if (!file || this.dialog() !== 'upload' || !this.preview.canUpload()) return;
    if (file.size === 0) {
      this.selected.set(null);
      this.inputError.set('O arquivo está vazio. Selecione um arquivo com conteúdo.');
      return;
    }
    this.inputError.set('');
    this.selected.set({ name: file.name, size: file.size });
    this.focusDialogTitle();
  }

  chooseAnother(): void {
    this.selected.set(null);
    this.inputError.set('');
    this.focusDialogTitle();
  }

  send(): void {
    const selection = this.selected();
    if (this.dialog() !== 'upload' || !selection || !this.preview.canUpload()) return;
    this.dialog.set('progress');
    this.focusDialogTitle();
    // Transição de um segundo do Figma; somente metadados permanecem em memória.
    this.pendingUpload = setTimeout(() => {
      this.pendingUpload = undefined;
      if (!this.partnership.brandSubmissionsOpen()) { this.close(); return; }
      if (!this.preview.recordUpload(selection)) { this.close(); return; }
      this.restoreMaterialFocus = true;
      this.dialog.set('received');
      this.focusDialogTitle();
    }, 1000);
  }

  cancel(): void {
    this.stopUpload();
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set('cancelled');
    this.focusDialogTitle();
  }

  close(): void {
    this.stopUpload();
    this.dialog.set(null);
    this.selected.set(null);
    this.inputError.set('');
  }

  afterClose(): void {
    // Enviar logo desaparece após o envio; restaura o foco em um elemento estável.
    if (this.restoreMaterialFocus) this.materialHeading()?.nativeElement.focus();
    this.restoreMaterialFocus = false;
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'delivery-material-dialog-title');
  }

  private stopUpload(): void {
    if (this.pendingUpload !== undefined) clearTimeout(this.pendingUpload);
    this.pendingUpload = undefined;
  }

  private focusDialogTitle(): void {
    requestAnimationFrame(() => this.modal()?.getElement()?.querySelector<HTMLElement>('#delivery-material-dialog-title')?.focus());
  }
}
