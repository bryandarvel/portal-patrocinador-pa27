import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { SurveyPreviewService } from '../../partnership/survey/survey-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';

type SurveyDialog = 'close' | 'reopen' | 'publish' | 'saved' | 'document' | null;

@Component({
  selector: 'app-rbs-survey',
  imports: [AdminPartnershipShell, NzButtonModule, NzModalModule],
  templateUrl: './survey.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/survey/survey.css', './survey.css']
})
export class RbsSurvey {
  readonly preview = inject(SurveyPreviewService);
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly dialog = signal<SurveyDialog>(null);
  readonly confirmationNote = signal('');
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly title = computed(() => {
    switch (this.dialog()) {
      case 'close': return 'Encerrar envio de materiais?';
      case 'reopen': return 'Reabrir envio de materiais?';
      case 'publish': return 'Publicar resultados';
      case 'saved': return 'Alterações salvas';
      default: return 'Documento da parceria';
    }
  });

  confirmSubmissionChange(): void {
    const dialog = this.dialog();
    if (dialog !== 'close' && dialog !== 'reopen') return;
    this.preview.setSubmissionsOpen(dialog === 'reopen');
    this.showSaved(`Envio ${dialog === 'close' ? 'encerrado' : 'reaberto'} somente nesta simulação.`);
  }

  publish(): void {
    if (this.dialog() !== 'publish') return;
    this.preview.publishExample();
    this.showSaved('Publicação do PDF de exemplo simulada; nenhum arquivo real foi disponibilizado.');
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
    requestAnimationFrame(() => { if (this.dialog() === 'saved') this.heading()?.nativeElement.focus(); });
  }
}
