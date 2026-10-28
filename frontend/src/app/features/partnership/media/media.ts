import { DatePipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { MaterialSelection } from '../shared/partnership-preview.service';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { MediaPreviewService } from './media-preview.service';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

type MediaDialog =
  | 'upload'
  | 'progress'
  | 'received'
  | 'cancelled'
  | 'history'
  | 'document'
  | 'briefing'
  | 'saved'
  | 'post';

@Component({
  selector: 'app-partnership-media',
  imports: [
    PartnershipShell,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './media.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './media.css'],
})
export class PartnershipMedia {
  readonly preview = inject(MediaPreviewService);
  readonly api = inject(PortalApi);
  readonly ctx = inject(PortalContext);
  readonly busy = signal(false);
  readonly dialog = signal<MediaDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly documentName = signal('');
  readonly briefingControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });
  readonly briefingForm = new FormGroup({ text: this.briefingControl });
  readonly modal = viewChild<NzModalComponent>('mediaModal');
  readonly briefingInput = viewChild<ElementRef<HTMLTextAreaElement>>('briefingInput');
  readonly dialogTitle = computed(() => {
    switch (this.dialog()) {
      case 'upload':
        return 'Enviar material de mídia';
      case 'progress':
        return 'Enviando material';
      case 'received':
        return 'Material recebido';
      case 'cancelled':
        return 'Operação cancelada';
      case 'history':
        return 'Histórico · Mídia';
      case 'briefing':
        return 'Texto / briefing';
      case 'saved':
        return 'Alterações salvas';
      case 'post':
        return 'Link da publicação';
      default:
        return 'Documento da parceria';
    }
  });

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

  async sendBriefing(): Promise<void> {
    if (this.dialog() !== 'briefing' || !this.preview.submissionsOpen()) return;
    this.briefingControl.markAsTouched();
    if (this.briefingControl.invalid) {
      this.briefingInput()?.nativeElement.focus();
      return;
    }
    if (this.busy()) return;
    this.busy.set(true);
    try {
      await this.preview.saveBriefing(this.briefingControl.value);
      this.dialog.set('saved');
      this.focusDialogTitle();
    } catch {
    } finally {
      this.busy.set(false);
    }
  }
  async sendText(): Promise<void> {
    if (this.busy() || this.briefingControl.invalid) return;
    this.busy.set(true);
    try {
      await this.preview.sendText(this.briefingControl.value);
      this.dialog.set('saved');
    } catch {
    } finally {
      this.busy.set(false);
    }
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
    this.selected.set({ name: file.name, size: file.size, file });
    this.focusDialogTitle();
  }

  chooseAnother(): void {
    this.selected.set(null);
    this.inputError.set('');
    this.focusDialogTitle();
  }

  async send(): Promise<void> {
    const selection = this.selected();
    if (
      !selection?.file ||
      this.busy() ||
      this.dialog() !== 'upload' ||
      !this.preview.submissionsOpen()
    )
      return;
    this.busy.set(true);
    this.dialog.set('progress');
    this.focusDialogTitle();
    try {
      await this.preview.recordFile(selection);
      this.dialog.set('received');
      this.focusDialogTitle();
    } catch {
      this.dialog.set('upload');
    } finally {
      this.busy.set(false);
    }
  }

  cancel(): void {
    if (this.busy()) return;
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set('cancelled');
    this.focusDialogTitle();
  }

  close(): void {
    if (this.busy()) return;
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'media-dialog-title');
  }

  async download(): Promise<void> {
    const file = this.preview.currentFile();
    if (file?.id)
      try {
        await this.preview.download(file.id, file.name);
      } catch {}
  }

  private focusDialogTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#media-dialog-title')?.focus();
    });
  }
}
