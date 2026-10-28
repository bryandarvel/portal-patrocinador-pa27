import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { FaqCategory, FaqPreviewService } from './faq-preview.service';

type FaqSelection =
  { kind: 'search'; query: string } | { kind: 'category'; category: FaqCategory | null };

@Component({
  selector: 'app-partnership-faq',
  imports: [
    NgTemplateOutlet,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
    PartnershipShell,
  ],
  templateUrl: './faq.html',
  styleUrls: ['../shared/partnership-ui.css', './faq.css'],
})
export class PartnershipFaq {
  readonly preview = inject(FaqPreviewService);
  readonly searchField = new FormControl('', { nonNullable: true });
  readonly categories = computed(() => ['Todas', ...this.preview.categories()]);
  readonly selection = signal<FaqSelection | null>(null);
  readonly results = signal<readonly import('./faq-preview.service').FaqEntry[]>([]);
  readonly loading = signal(false);
  readonly resultTitle = computed(() => {
    const selection = this.selection();
    if (selection?.kind === 'search') return `Resultado para “${selection.query}”`;
    return selection?.category ? `Categoria: ${selection.category}` : 'Todas as dúvidas';
  });

  async search(): Promise<void> {
    const query = this.searchField.value.trim();
    this.selection.set(query ? { kind: 'search', query } : { kind: 'category', category: null });
    await this.fetchResults(query);
  }

  async showCategory(category: 'Todas' | FaqCategory): Promise<void> {
    this.selection.set({ kind: 'category', category: category === 'Todas' ? null : category });
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

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'faq-dialog-title');
  }
}
