import { DatePipe } from '@angular/common';
import { Component, DestroyRef, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { MaterialSelection } from '../shared/partnership-preview.service';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { MediaPreviewService } from './media-preview.service';

type MediaDialog = 'upload' | 'progress' | 'received' | 'cancelled' | 'history' | 'document' | 'briefing' | 'saved' | 'post';

@Component({
  selector: 'app-partnership-media',
  imports: [PartnershipShell, NzButtonModule, NzInputModule, NzModalModule, ReactiveFormsModule, DatePipe],
  templateUrl: './media.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './media.css']
})
export class PartnershipMedia {
  readonly preview = inject(MediaPreviewService);
  readonly dialog = signal<MediaDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly documentName = signal('');
  readonly briefingControl = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] });
  readonly briefingForm = new FormGroup({ text: this.briefingControl });
  readonly modal = viewChild<NzModalComponent>('mediaModal');
  readonly briefingInput = viewChild<ElementRef<HTMLTextAreaElement>>('briefingInput');
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
      default: return 'Documento da parceria';
    }
  });
  private pendingUpload: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.stopPendingUpload());
  }

  openUpload(): void {
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set('upload');
  }

  openDocument(name: string): void {
    this.documentName.set(name);
    this.dialog.set('document');
  }

  openBriefing(): void {
    this.briefingControl.reset(this.preview.briefing());
    this.dialog.set('briefing');
  }

  sendBriefing(): void {
    this.briefingControl.markAsTouched();
    if (this.briefingControl.invalid) {
      this.briefingInput()?.nativeElement.focus();
      return;
    }
    this.preview.saveBriefing(this.briefingControl.value);
    this.dialog.set('saved');
    this.focusDialogTitle();
  }

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    input.value = '';
    if (!file) return;
    if (file.size === 0) {
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
    if (!selection || this.dialog() !== 'upload') return;
    this.dialog.set('progress');
    this.focusDialogTitle();
    // Transição demonstrativa de um segundo, conforme o Figma; não mede upload.
    this.pendingUpload = setTimeout(() => {
      this.pendingUpload = undefined;
      this.preview.recordFile(selection);
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
    labelPartnershipDialog(modal, 'media-dialog-title');
  }

  private stopPendingUpload(): void {
    if (this.pendingUpload !== undefined) clearTimeout(this.pendingUpload);
    this.pendingUpload = undefined;
  }

  private focusDialogTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#media-dialog-title')?.focus();
    });
  }
}
