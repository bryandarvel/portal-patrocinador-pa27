import { NzIconModule } from 'ng-zorro-antd/icon';
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
    NzIconModule,
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
  readonly sponsorId: AdminSponsorId =
    inject(ActivatedRoute).snapshot.data['sponsorId'] ?? 'amarelo';
  readonly preview = inject(FaqPreviewService);
  readonly saving = signal(false);
  readonly searchField = new FormControl('', { nonNullable: true });
  readonly categories = computed(() => ['Todas', ...this.preview.categories()]);
  readonly selection = signal<FaqSelection>({ kind: 'category', category: null });
  readonly dialog = signal<FaqDialog>(null);
  readonly editingId = signal<string | null>(null);
  readonly editingVersion = signal<number | null>(null);
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
  readonly results = signal<readonly FaqEntry[]>([]);
  readonly loading = signal(false);
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

  async search(): Promise<void> {
    const query = this.searchField.value.trim();
    this.selection.set(query ? { kind: 'search', query } : { kind: 'category', category: null });
    this.dialog.set('results');
    await this.fetchResults(query);
  }

  async showCategory(category: 'Todas' | FaqCategory): Promise<void> {
    this.selection.set({ kind: 'category', category: category === 'Todas' ? null : category });
    this.dialog.set('results');
    await this.fetchResults('', category === 'Todas' ? null : category);
  }

  private async fetchResults(query: string, category: string | null = null): Promise<void> {
    this.loading.set(true);
    try {
      this.results.set(await this.preview.load(query, category));
    } catch {
      this.results.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  openEditor(entry: FaqEntry | null = null): void {
    this.returnToResults = this.dialog() === 'results';
    this.originId = entry?.id ?? null;
    this.editingId.set(entry?.id ?? null);
    this.editingVersion.set(entry?.version ?? null);
    this.form.reset(
      entry
        ? { question: entry.question, answer: entry.answer, category: entry.category }
        : { question: '', answer: '', category: '' },
    );
    this.dialog.set('editor');
    this.focusTitle();
  }

  async save(): Promise<void> {
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
    if (this.saving()) return;
    this.saving.set(true);
    try {
      const saved = await this.preview.save(
        { ...value, category: value.category },
        this.editingId(),
        this.editingVersion() ?? undefined,
      );
      const selection = this.selection();
      const matches =
        selection.kind === 'search'
          ? `${saved.question} ${saved.answer}`
              .toLocaleLowerCase('pt-BR')
              .includes(selection.query.toLocaleLowerCase('pt-BR'))
          : !selection.category || saved.category === selection.category;
      this.results.update((items) => [
        ...items.filter((item) => item.id !== saved.id),
        ...(matches ? [saved] : []),
      ]);
    } catch {
      this.saving.set(false);
      return;
    }
    this.saving.set(false);
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
