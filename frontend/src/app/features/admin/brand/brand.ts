import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import {
  deadlineFromLocal,
  deadlineToLocal,
  MaterialSelection,
  PartnershipPreviewService,
} from '../../partnership/shared/partnership-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

type BrandDialog =
  | 'upload'
  | 'replace'
  | 'progress'
  | 'received'
  | 'cancelled'
  | 'history'
  | 'document'
  | 'close'
  | 'reopen'
  | 'saved'
  | 'publish';

@Component({
  selector: 'app-rbs-brand-applications',
  imports: [AdminPartnershipShell, RouterLink, NzButtonModule, NzModalModule, DatePipe],
  templateUrl: './brand.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/brand/brand.css',
    './brand.css',
  ],
})
export class RbsBrandApplications {
  readonly preview = inject(PartnershipPreviewService);
  readonly api = inject(PortalApi);
  readonly ctx = inject(PortalContext);
  readonly title = signal('');
  readonly text = signal('');
  readonly url = signal('');
  readonly publicationFile = signal<File | null>(null);
  readonly dialog = signal<BrandDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly modal = viewChild<NzModalComponent>('brandModal');
  readonly materialsHeading = viewChild<ElementRef<HTMLElement>>('materialsHeading');
  readonly submissionButton = viewChild<ElementRef<HTMLButtonElement>>('submissionButton');
  readonly dialogTitle = computed(() => {
    switch (this.dialog()) {
      case 'upload':
        return 'Enviar manual de identidade visual';
      case 'replace':
        return 'Substituir manual de identidade visual';
      case 'progress':
        return 'Enviando material';
      case 'received':
        return 'Material recebido';
      case 'cancelled':
        return 'Operação cancelada';
      case 'history':
        return 'Histórico · MIV';
      case 'close':
        return 'Encerrar envio de materiais?';
      case 'reopen':
        return 'Reabrir envio de materiais?';
      case 'saved':
        return 'Alterações salvas';
      case 'publish':
        return 'Publicar conteúdo de marca';
      default:
        return 'Documento da parceria';
    }
  });
  readonly busy = signal(false);
  readonly deadlineInput = signal('');
  readonly deadlineError = signal('');
  private focusMaterialsAfterClose = false;
  private focusSubmissionAfterClose = false;

  openUpload(): void {
    if (!this.preview.brandSubmissionsOpen()) return;
    this.selected.set(null);
    this.inputError.set('');
    this.dialog.set(this.preview.currentMiv() ? 'replace' : 'upload');
  }

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    input.value = '';
    if (
      !file ||
      !this.preview.brandSubmissionsOpen() ||
      !['upload', 'replace'].includes(this.dialog() ?? '')
    )
      return;
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
      !this.preview.brandSubmissionsOpen() ||
      !['upload', 'replace'].includes(this.dialog() ?? '')
    )
      return;
    this.busy.set(true);
    this.dialog.set('progress');
    this.focusDialogTitle();
    try {
      this.focusMaterialsAfterClose = this.preview.currentMiv() === null;
      await this.preview.recordMiv(selection);
      this.dialog.set('received');
      this.focusDialogTitle();
    } catch {
      this.dialog.set(this.preview.currentMiv() ? 'replace' : 'upload');
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

  afterClose(): void {
    const target = this.focusMaterialsAfterClose
      ? this.materialsHeading()?.nativeElement
      : this.focusSubmissionAfterClose
        ? this.submissionButton()?.nativeElement
        : null;
    this.focusSubmissionAfterClose = false;
    this.focusMaterialsAfterClose = false;
    // Aguarda a restauração de foco do NG-ZORRO; Enviar MIV já não existe após o primeiro envio.
    if (target)
      requestAnimationFrame(() => {
        if (this.dialog() === null) target.focus();
      });
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-brand-dialog-title');
  }

  openSubmissionDialog(): void {
    this.deadlineInput.set(deadlineToLocal(this.preview.deadline()));
    this.deadlineError.set('');
    this.dialog.set(this.preview.brandSubmissionsOpen() ? 'close' : 'reopen');
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
      await this.preview.setBrandSubmissionsOpen(dialog === 'reopen', deadline);
      this.focusSubmissionAfterClose = true;
      this.dialog.set('saved');
      this.focusDialogTitle();
    } catch {
    } finally {
      this.busy.set(false);
    }
  }

  async download(): Promise<void> {
    const file = this.preview.currentMiv();
    if (file?.id)
      try {
        await this.preview.download(file.id, file.name);
      } catch {}
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
    if (
      this.busy() ||
      !this.title().trim() ||
      !(this.text().trim() || this.url().trim() || this.publicationFile())
    ) {
      this.inputError.set('Informe título e arquivo, texto ou link.');
      return;
    }
    this.busy.set(true);
    try {
      await this.preview.publish(
        this.title().trim(),
        this.text().trim(),
        this.url().trim(),
        this.publicationFile(),
      );
      this.title.set('');
      this.text.set('');
      this.url.set('');
      this.publicationFile.set(null);
      this.dialog.set('saved');
    } catch {
    } finally {
      this.busy.set(false);
    }
  }

  private focusDialogTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#rbs-brand-dialog-title')?.focus();
    });
  }
}
