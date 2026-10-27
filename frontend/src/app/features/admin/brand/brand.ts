import { DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { MaterialSelection, PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';

type BrandDialog = 'upload' | 'replace' | 'progress' | 'received' | 'cancelled' | 'history' | 'document' | 'close' | 'reopen' | 'saved';

@Component({
  selector: 'app-rbs-brand-applications',
  imports: [AdminPartnershipShell, NzButtonModule, NzModalModule, DatePipe],
  templateUrl: './brand.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/brand/brand.css', './brand.css']
})
export class RbsBrandApplications {
  readonly preview = inject(PartnershipPreviewService);
  readonly dialog = signal<BrandDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly modal = viewChild<NzModalComponent>('brandModal');
  readonly materialsHeading = viewChild<ElementRef<HTMLElement>>('materialsHeading');
  readonly submissionButton = viewChild<ElementRef<HTMLButtonElement>>('submissionButton');
  readonly dialogTitle = computed(() => {
    switch (this.dialog()) {
      case 'upload': return 'Enviar manual de identidade visual';
      case 'replace': return 'Substituir manual de identidade visual';
      case 'progress': return 'Enviando material';
      case 'received': return 'Material recebido';
      case 'cancelled': return 'Operação cancelada';
      case 'history': return 'Histórico · MIV';
      case 'close': return 'Encerrar envio de materiais?';
      case 'reopen': return 'Reabrir envio de materiais?';
      case 'saved': return 'Alterações salvas';
      default: return 'Documento da parceria';
    }
  });
  private pendingUpload: ReturnType<typeof setTimeout> | undefined;
  private focusMaterialsAfterClose = false;
  private focusSubmissionAfterClose = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopPendingUpload());
  }

  openUpload(): void {
    if (!this.preview.brandSubmissionsOpen()) return;
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set(this.preview.currentMiv() ? 'replace' : 'upload');
  }

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    input.value = '';
    if (!file || !this.preview.brandSubmissionsOpen() || !['upload', 'replace'].includes(this.dialog() ?? '')) return;
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
    if (!selection || !this.preview.brandSubmissionsOpen() || !['upload', 'replace'].includes(this.dialog() ?? '')) return;
    this.dialog.set('progress');
    this.focusDialogTitle();
    // Duração apenas demonstrativa, igual à transição de um segundo no Figma.
    this.pendingUpload = setTimeout(() => {
      this.pendingUpload = undefined;
      if (!this.preview.brandSubmissionsOpen()) { this.close(); return; }
      this.focusMaterialsAfterClose = this.preview.currentMiv() === null;
      this.preview.recordMiv(selection, 'Admin RBS');
      this.dialog.set('received');
      this.focusDialogTitle();
    }, 1000);
  }

  cancel(): void {
    this.stopPendingUpload();
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set('cancelled');
    this.focusDialogTitle();
  }

  close(): void {
    this.stopPendingUpload();
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set(null);
  }

  afterClose(): void {
    const target = this.focusMaterialsAfterClose
      ? this.materialsHeading()?.nativeElement
      : this.focusSubmissionAfterClose ? this.submissionButton()?.nativeElement : null;
    this.focusSubmissionAfterClose = false;
    this.focusMaterialsAfterClose = false;
    // Aguarda a restauração de foco do NG-ZORRO; Enviar MIV já não existe após o primeiro envio.
    if (target) requestAnimationFrame(() => { if (this.dialog() === null) target.focus(); });
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-brand-dialog-title');
  }

  confirmSubmissionChange(): void {
    const dialog = this.dialog();
    if (dialog !== 'close' && dialog !== 'reopen') return;
    this.preview.setBrandSubmissionsOpen(dialog === 'reopen');
    this.focusSubmissionAfterClose = true;
    this.dialog.set('saved');
    this.focusDialogTitle();
  }

  private stopPendingUpload(): void {
    if (this.pendingUpload !== undefined) clearTimeout(this.pendingUpload);
    this.pendingUpload = undefined;
  }

  private focusDialogTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#rbs-brand-dialog-title')?.focus();
    });
  }
}
