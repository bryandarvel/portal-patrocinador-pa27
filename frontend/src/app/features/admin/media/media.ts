import { DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { MaterialSelection } from '../../partnership/shared/partnership-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { MediaPreviewService } from '../../partnership/media/media-preview.service';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';

type MediaDialog = 'upload' | 'progress' | 'received' | 'cancelled' | 'history' | 'document' | 'briefing' | 'saved' | 'post' | 'close' | 'reopen' | 'publish' | 'edit';

@Component({
  selector: 'app-rbs-media',
  imports: [AdminPartnershipShell, NzButtonModule, NzInputModule, NzModalModule, ReactiveFormsModule, DatePipe],
  templateUrl: './media.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/media/media.css', './media.css']
})
export class RbsMedia {
  readonly preview = inject(MediaPreviewService);
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly dialog = signal<MediaDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly documentName = signal('');
  readonly briefingControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });
  readonly briefingForm = new FormGroup({ text: this.briefingControl });
  readonly storiesControl = new FormControl<number | null>(null, {
    validators: [Validators.required, Validators.min(0), control => control.value === null || Number.isSafeInteger(control.value) ? null : { integer: true }]
  });
  readonly storiesForm = new FormGroup({ count: this.storiesControl });
  readonly storiesInput = viewChild<unknown, ElementRef<HTMLInputElement>>('storiesInput', { read: ElementRef });
  readonly submissionButton = viewChild<unknown, ElementRef<HTMLButtonElement>>('submissionButton', { read: ElementRef });
  readonly confirmationNote = signal('');
  readonly modal = viewChild<NzModalComponent>('mediaModal');
  readonly briefingInput = viewChild<unknown, ElementRef<HTMLTextAreaElement>>('briefingInput', { read: ElementRef });
  readonly dialogTitle = computed(() => {
    switch (this.dialog()) {
      case 'upload': return 'Enviar material de mídia';
      case 'progress': return 'Enviando material';
      case 'received': return 'Material recebido';
      case 'cancelled': return 'Operação cancelada';
      case 'history': return 'Histórico · Mídia';
      case 'briefing': return 'Texto / briefing';
      case 'saved': return 'Alterações salvas';
      case 'post': return 'Link da publicação';
      case 'close': return 'Encerrar envio de materiais?';
      case 'reopen': return 'Reabrir envio de materiais?';
      case 'publish': return 'Publicar mídia';
      case 'edit': return 'Atualizar veiculações';
      default: return 'Documento da parceria';
    }
  });
  private pendingUpload: ReturnType<typeof setTimeout> | undefined;
  private restoreSubmissionFocus = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopPendingUpload());
  }

  openUpload(): void {
    if (!this.preview.submissionsOpen()) return;
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set('upload');
  }

  openDocument(name: string): void {
    this.documentName.set(name);
    this.dialog.set('document');
  }

  openBriefing(): void {
    if (!this.preview.submissionsOpen()) return;
    this.briefingControl.reset(this.preview.briefing());
    this.dialog.set('briefing');
  }

  sendBriefing(): void {
    if (this.dialog() !== 'briefing' || !this.preview.submissionsOpen()) return;
    this.briefingControl.markAsTouched();
    if (this.briefingControl.invalid) {
      this.briefingInput()?.nativeElement.focus();
      return;
    }
    this.preview.saveBriefing(this.briefingControl.value);
    this.showSaved('Texto registrado somente nesta simulação.');
  }

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    input.value = '';
    if (!file || this.dialog() !== 'upload' || !this.preview.submissionsOpen()) return;
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
    if (!selection || this.dialog() !== 'upload' || !this.preview.submissionsOpen()) return;
    this.dialog.set('progress');
    this.focusDialogTitle();
    // Transição demonstrativa de um segundo, conforme o Figma; não mede upload.
    this.pendingUpload = setTimeout(() => {
      this.pendingUpload = undefined;
      if (!this.preview.submissionsOpen()) { this.close(); return; }
      this.preview.recordFile(selection, 'Admin RBS');
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

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-media-dialog-title');
  }

  openEdit(): void {
    this.storiesControl.reset(this.preview.displayedStories());
    this.dialog.set('edit');
  }

  saveStories(): void {
    if (this.dialog() !== 'edit') return;
    this.storiesControl.markAsTouched();
    const count = this.storiesControl.value;
    if (this.storiesControl.invalid || count === null) { this.storiesInput()?.nativeElement.focus(); return; }
    this.preview.saveDisplayedStories(count);
    this.showSaved('Quantidade exibida atualizada somente em memória.');
  }

  publish(): void {
    if (this.dialog() !== 'publish') return;
    this.preview.publishExample();
    this.showSaved('Publicação do PDF de exemplo simulada; nenhum arquivo real foi disponibilizado.');
  }

  confirmSubmissionChange(): void {
    const dialog = this.dialog();
    if (dialog !== 'close' && dialog !== 'reopen') return;
    this.preview.setSubmissionsOpen(dialog === 'reopen');
    this.restoreSubmissionFocus = true;
    this.showSaved(`Envio ${dialog === 'close' ? 'encerrado' : 'reaberto'} somente nesta simulação.`);
  }

  afterClose(): void {
    if (!this.restoreSubmissionFocus) return;
    this.restoreSubmissionFocus = false;
    requestAnimationFrame(() => { if (this.dialog() === null) this.submissionButton()?.nativeElement.focus(); });
  }

  private showSaved(note: string): void {
    this.confirmationNote.set(note);
    this.dialog.set('saved');
    this.focusDialogTitle();
  }

  private stopPendingUpload(): void {
    if (this.pendingUpload !== undefined) clearTimeout(this.pendingUpload);
    this.pendingUpload = undefined;
  }

  private focusDialogTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#rbs-media-dialog-title')?.focus();
    });
  }
}
