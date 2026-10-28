import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import {
  MaterialSelection,
  PartnershipPreviewService,
} from '../shared/partnership-preview.service';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

type BrandDialog =
  'upload' | 'replace' | 'progress' | 'received' | 'cancelled' | 'history' | 'document';

@Component({
  selector: 'app-brand-applications',
  imports: [PartnershipShell, NzButtonModule, NzModalModule, DatePipe, RouterLink],
  templateUrl: './brand.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './brand.css'],
})
export class BrandApplications {
  readonly preview = inject(PartnershipPreviewService);
  readonly api = inject(PortalApi);
  readonly ctx = inject(PortalContext);
  readonly dialog = signal<BrandDialog | null>(null);
  readonly selected = signal<MaterialSelection | null>(null);
  readonly inputError = signal('');
  readonly modal = viewChild<NzModalComponent>('brandModal');
  readonly materialsHeading = viewChild<ElementRef<HTMLElement>>('materialsHeading');
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
      default:
        return 'Documento da parceria';
    }
  });
  readonly busy = signal(false);
  private focusMaterialsAfterClose = false;

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
    if (this.focusMaterialsAfterClose) {
      this.materialsHeading()?.nativeElement.focus();
      this.focusMaterialsAfterClose = false;
    }
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'brand-dialog-title');
  }

  async download(): Promise<void> {
    const file = this.preview.currentMiv();
    if (file?.id)
      try {
        await this.preview.download(file.id, file.name);
      } catch {}
  }
  private focusDialogTitle(): void {
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#brand-dialog-title')?.focus();
    });
  }
}
