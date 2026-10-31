import { EmptyState } from '../../partnership/shared/empty-state';
import { CardHeading } from '../../partnership/shared/card-heading';
import { SubmissionStatus } from '../../partnership/shared/submission-status';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DatePipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import {
  deadlineFromLocal,
  deadlineToLocal,
  MaterialSelection,
} from '../../partnership/shared/partnership-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { MediaPreviewService } from '../../partnership/media/media-preview.service';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
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
  | 'post'
  | 'close'
  | 'reopen'
  | 'publish'
  | 'edit';

@Component({
  selector: 'app-rbs-media',
  imports: [
    EmptyState,
    CardHeading,
    SubmissionStatus,
    NzIconModule,
    AdminPartnershipShell,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    ReactiveFormsModule,
    DatePipe,
  ],
  templateUrl: './media.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/media/media.css',
    './media.css',
  ],
})
export class RbsMedia {
  readonly preview = inject(MediaPreviewService);
  readonly api = inject(PortalApi);
  readonly ctx = inject(PortalContext);
  readonly busy = signal(false);
  readonly deadlineInput = signal('');
  readonly deadlineError = signal('');
  readonly publicationTitle = signal('');
  readonly publicationText = signal('');
  readonly publicationUrl = signal('');
  readonly publicationFile = signal<File | null>(null);
  readonly placementsDraft = signal<
    { canal: string; descricao: string; url: string | null; veiculadoEm: string | null }[]
  >([]);
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly dialog = signal<MediaDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly documentName = signal('');
  readonly briefingControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });
  readonly briefingForm = new FormGroup({ text: this.briefingControl });
  readonly submissionButton = viewChild<unknown, ElementRef<HTMLButtonElement>>(
    'submissionButton',
    { read: ElementRef },
  );
  readonly confirmationNote = signal('');
  readonly modal = viewChild<NzModalComponent>('mediaModal');
  readonly briefingInput = viewChild<unknown, ElementRef<HTMLTextAreaElement>>('briefingInput', {
    read: ElementRef,
  });
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
      case 'close':
        return 'Encerrar envio de materiais?';
      case 'reopen':
        return 'Reabrir envio de materiais?';
      case 'publish':
        return 'Publicar mídia';
      case 'edit':
        return 'Atualizar veiculações';
      default:
        return 'Documento da parceria';
    }
  });
  private restoreSubmissionFocus = false;

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
      this.showSaved('Texto registrado na parceria.');
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
      this.showSaved('Texto enviado.');
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
    labelPartnershipDialog(modal, 'rbs-media-dialog-title');
  }

  openEdit(): void {
    this.placementsDraft.set(
      this.preview.placements().map((p) => ({
        canal: p.canal,
        descricao: p.descricao,
        url: p.url,
        veiculadoEm: p.veiculadoEm,
      })),
    );
    this.dialog.set('edit');
  }

  addPlacement(): void {
    this.placementsDraft.update((items) => [
      ...items,
      { canal: '', descricao: '', url: null, veiculadoEm: null },
    ]);
  }
  removePlacement(index: number): void {
    this.placementsDraft.update((items) => items.filter((_, i) => i !== index));
  }
  updatePlacement(
    index: number,
    key: 'canal' | 'descricao' | 'url' | 'veiculadoEm',
    value: string,
  ): void {
    this.placementsDraft.update((items) =>
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              [key]: key === 'veiculadoEm' && value ? new Date(value).toISOString() : value || null,
            }
          : item,
      ),
    );
  }
  async saveStories(): Promise<void> {
    if (this.dialog() !== 'edit' || this.busy()) return;
    if (this.placementsDraft().some((item) => !item.canal?.trim() || !item.descricao?.trim())) {
      this.inputError.set('Informe canal e descrição de cada veiculação.');
      return;
    }
    this.busy.set(true);
    try {
      await this.preview.savePlacements(this.placementsDraft());
      this.showSaved('Veiculações atualizadas.');
    } catch {
    } finally {
      this.busy.set(false);
    }
  }

  selectPublication(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    if (file) {
      if (!file.size) {
        this.inputError.set('O arquivo está vazio.');
        return;
      }
      this.publicationFile.set(file);
      this.inputError.set('');
    }
  }
  async publish(): Promise<void> {
    if (this.dialog() !== 'publish' || this.busy()) return;
    if (
      !this.publicationTitle().trim() ||
      !(this.publicationText().trim() || this.publicationUrl().trim() || this.publicationFile())
    ) {
      this.inputError.set('Informe título e arquivo, texto ou link.');
      return;
    }
    this.busy.set(true);
    try {
      await this.preview.publish(
        this.publicationTitle().trim(),
        this.publicationText().trim(),
        this.publicationUrl().trim(),
        this.publicationFile(),
      );
      this.publicationTitle.set('');
      this.publicationText.set('');
      this.publicationUrl.set('');
      this.publicationFile.set(null);
      this.showSaved('Conteúdo publicado.');
    } catch {
    } finally {
      this.busy.set(false);
    }
  }

  openSubmissionDialog(): void {
    this.deadlineInput.set(deadlineToLocal(this.preview.deadline()));
    this.deadlineError.set('');
    this.dialog.set(this.preview.submissionsOpen() ? 'close' : 'reopen');
  }
  async confirmSubmissionChange(): Promise<void> {
    const dialog = this.dialog();
    if ((dialog !== 'close' && dialog !== 'reopen') || this.busy()) return;
    let deadline: string | null;
    try {
      deadline = deadlineFromLocal(this.deadlineInput(), dialog === 'reopen');
      this.deadlineError.set('');
    } catch (error) {
      this.deadlineError.set(error instanceof Error ? error.message : 'Prazo inválido.');
      return;
    }
    this.busy.set(true);
    try {
      await this.preview.setSubmissionsOpen(dialog === 'reopen', deadline);
      this.restoreSubmissionFocus = true;
      this.showSaved(`Envio ${dialog === 'close' ? 'encerrado' : 'reaberto'}.`);
    } catch {
    } finally {
      this.busy.set(false);
    }
  }

  afterClose(): void {
    if (!this.restoreSubmissionFocus) return;
    this.restoreSubmissionFocus = false;
    requestAnimationFrame(() => {
      if (this.dialog() === null) this.submissionButton()?.nativeElement.focus();
    });
  }

  private showSaved(note: string): void {
    this.confirmationNote.set(note);
    this.dialog.set('saved');
    this.focusDialogTitle();
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
      this.modal()?.getElement()?.querySelector<HTMLElement>('#rbs-media-dialog-title')?.focus();
    });
  }
}
