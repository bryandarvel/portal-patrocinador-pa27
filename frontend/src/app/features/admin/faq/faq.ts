import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import {
  FaqCategory,
  FaqEntry,
  FaqPreviewService,
} from '../../partnership/faq/faq-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { ActivatedRoute } from '@angular/router';
import { AdminSponsorId } from '../shared/client-preview.service';

type FaqSelection =
  { kind: 'search'; query: string } | { kind: 'category'; category: FaqCategory | null };
type FaqDialog = 'results' | 'editor' | 'saved' | null;

@Component({
  selector: 'app-rbs-faq',
  imports: [
    NgTemplateOutlet,
    AdminPartnershipShell,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './faq.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/faq/faq.css',
    './faq.css',
  ],
})
export class RbsFaq {
  readonly sponsorId: AdminSponsorId = inject(ActivatedRoute).snapshot.data['sponsorId'] ?? 'amarelo';
  readonly preview = inject(FaqPreviewService);
  readonly searchField = new FormControl('', { nonNullable: true });
  readonly categories = ['Todas', ...this.preview.categories] as const;
  readonly selection = signal<FaqSelection>({ kind: 'category', category: null });
  readonly dialog = signal<FaqDialog>(null);
  readonly editingId = signal<string | null>(null);
  readonly form = new FormGroup({
    question: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    answer: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    category: new FormControl<FaqCategory | ''>('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });
  readonly results = computed(() => {
    const selection = this.selection();
    return selection.kind === 'search'
      ? this.preview.search(selection.query)
      : this.preview.search('', selection.category);
  });
  readonly resultTitle = computed(() => {
    const selection = this.selection();
    return selection.kind === 'search'
      ? `Resultado para “${selection.query}”`
      : selection.category
        ? `Categoria: ${selection.category}`
        : 'Todas as dúvidas';
  });
  readonly title = computed(() =>
    this.dialog() === 'results'
      ? this.resultTitle()
      : this.dialog() === 'saved'
        ? 'Alteração salva'
        : this.editingId()
          ? 'Editar dúvida frequente'
          : 'Nova dúvida frequente',
  );
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly resultsPanel = viewChild<ElementRef<HTMLElement>>('resultsPanel');
  readonly editorForm = viewChild<ElementRef<HTMLFormElement>>('editorForm');
  private returnToResults = false;
  private originId: string | null = null;

  search(): void {
    const query = this.searchField.value.trim();
    this.selection.set(query ? { kind: 'search', query } : { kind: 'category', category: null });
    this.dialog.set('results');
  }

  showCategory(category: 'Todas' | FaqCategory): void {
    this.selection.set({ kind: 'category', category: category === 'Todas' ? null : category });
    this.dialog.set('results');
  }

  openEditor(entry: FaqEntry | null = null): void {
    this.returnToResults = this.dialog() === 'results';
    this.originId = entry?.id ?? null;
    this.editingId.set(entry?.id ?? null);
    this.form.reset(
      entry
        ? { question: entry.question, answer: entry.answer, category: entry.category }
        : { question: '', answer: '', category: '' },
    );
    this.dialog.set('editor');
    this.focusTitle();
  }

  save(): void {
    if (this.dialog() !== 'editor') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      requestAnimationFrame(() =>
        this.editorForm()
          ?.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')
          ?.focus(),
      );
      return;
    }
    const value = this.form.getRawValue();
    if (!value.category) return;
    if (!this.preview.save({ ...value, category: value.category }, this.editingId())) return;
    this.form.reset();
    this.dialog.set('saved');
    this.focusTitle();
  }

  close(): void {
    if (this.returnToResults && (this.dialog() === 'editor' || this.dialog() === 'saved')) {
      this.form.reset();
      this.dialog.set('results');
      requestAnimationFrame(() => {
        const buttons =
          this.resultsPanel()?.nativeElement.querySelectorAll<HTMLButtonElement>(
            'button[data-entry-id]',
          );
        const origin = Array.from(buttons ?? []).find(
          (button) => button.dataset['entryId'] === this.originId,
        );
        if (origin) origin.focus();
        else this.heading()?.nativeElement.focus();
      });
      return;
    }
    this.dialog.set(null);
    this.form.reset();
    this.returnToResults = false;
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-faq-dialog-title');
  }

  private focusTitle(): void {
    requestAnimationFrame(() => this.heading()?.nativeElement.focus());
  }
}
