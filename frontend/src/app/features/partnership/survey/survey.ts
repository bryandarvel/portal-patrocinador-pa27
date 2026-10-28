import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { SurveyPreviewService } from './survey-preview.service';

function atLeastOneQuestion(control: AbstractControl): ValidationErrors | null {
  const hasQuestion = ['question1', 'question2', 'question3'].some(key => {
    const value: unknown = control.get(key)?.value;
    return typeof value === 'string' && value.trim().length > 0;
  });
  return hasQuestion ? null : { emptyQuestions: true };
}

@Component({
  selector: 'app-partnership-survey',
  imports: [PartnershipShell, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './survey.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './survey.css']
})
export class PartnershipSurvey {
  readonly preview = inject(SurveyPreviewService);
  readonly submitted = signal(false);
  readonly confirmationOpen = signal(false);
  readonly documentOpen = signal(false);
  readonly sentCount = signal(0);
  readonly firstQuestion = viewChild<unknown, ElementRef<HTMLTextAreaElement>>('firstQuestion', { read: ElementRef });
  readonly form = new FormGroup({
    question1: new FormControl(this.preview.questions().question1, { nonNullable: true }),
    question2: new FormControl(this.preview.questions().question2, { nonNullable: true }),
    question3: new FormControl(this.preview.questions().question3, { nonNullable: true })
  }, { validators: atLeastOneQuestion });

  sendQuestions(): void {
    if (!this.preview.submissionsOpen()) return;
    this.submitted.set(true);
    if (this.form.invalid) {
      this.firstQuestion()?.nativeElement.focus();
      return;
    }
    if (!this.preview.saveQuestions(this.form.getRawValue())) return;
    const saved = this.preview.questions();
    this.form.reset(saved);
    this.sentCount.set(Object.values(saved).filter(value => value.length > 0).length);
    this.submitted.set(false);
    this.confirmationOpen.set(true);
  }

  closeDialog(): void {
    this.confirmationOpen.set(false);
    this.documentOpen.set(false);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'survey-dialog-title');
  }
}
