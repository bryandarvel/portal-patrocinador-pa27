import { SubmissionStatus } from '../../partnership/shared/submission-status';
import { CardHeading } from '../../partnership/shared/card-heading';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { SurveyPreviewService } from '../../partnership/survey/survey-preview.service';
import {
  deadlineFromLocal,
  deadlineToLocal,
} from '../../partnership/shared/partnership-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
import { PortalApi } from '../../../core/portal-api.service';

type SurveyDialog = 'close' | 'reopen' | 'publish' | 'saved' | 'document' | null;

@Component({
  selector: 'app-rbs-survey',
  imports: [
    CardHeading,
    SubmissionStatus,
    NzIconModule,
    AdminPartnershipShell,
    NzButtonModule,
    NzModalModule,
  ],
  templateUrl: './survey.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/survey/survey.css',
    './survey.css',
  ],
})
export class RbsSurvey {
  readonly preview = inject(SurveyPreviewService);
  readonly api = inject(PortalApi);
  readonly busy = signal(false);
  readonly selected = signal<File | null>(null);
  readonly inputError = signal('');
  readonly deadlineInput = signal('');
  readonly deadlineError = signal('');
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly dialog = signal<SurveyDialog>(null);
  readonly confirmationNote = signal('');
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly title = computed(() => {
    switch (this.dialog()) {
      case 'close':
        return 'Encerrar envio de materiais?';
      case 'reopen':
        return 'Reabrir envio de materiais?';
      case 'publish':
        return 'Publicar resultados';
      case 'saved':
        return 'Alterações salvas';
      default:
        return 'Documento da parceria';
    }
  });

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
      this.showSaved(`Envio ${dialog === 'close' ? 'encerrado' : 'reaberto'}.`);
    } catch {
    } finally {
      this.busy.set(false);
    }
  }

  selectFile(input: HTMLInputElement): void {
    const file = input.files?.item(0);
    if (!file) return;
    if (!file.size) {
      this.inputError.set('O arquivo está vazio.');
      return;
    }
    this.selected.set(file);
    this.inputError.set('');
  }
  async publish(): Promise<void> {
    if (this.dialog() !== 'publish' || this.busy()) return;
    const file = this.selected();
    if (!file) {
      this.inputError.set('Selecione o arquivo de resultados.');
      return;
    }
    this.busy.set(true);
    try {
      await this.preview.publish(file);
      this.selected.set(null);
      this.showSaved('Resultados publicados.');
    } catch {
    } finally {
      this.busy.set(false);
    }
  }
  async download(): Promise<void> {
    const file = this.preview.results()[0];
    if (file)
      try {
        await this.preview.download(file);
      } catch {}
  }

  close(): void {
    this.dialog.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-survey-dialog-title');
  }

  private showSaved(note: string): void {
    this.confirmationNote.set(note);
    this.dialog.set('saved');
    requestAnimationFrame(() => {
      if (this.dialog() === 'saved') this.heading()?.nativeElement.focus();
    });
  }
}
