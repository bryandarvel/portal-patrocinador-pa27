import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export type FaqCategory = string;
export interface FaqEntry {
  id: string;
  category: string;
  question: string;
  answer: string;
  version: number;
}
export type FaqContent = Pick<FaqEntry, 'category' | 'question' | 'answer'>;
interface FaqResponse {
  id: string;
  categoria: string;
  pergunta: string;
  resposta: string;
  versao: number;
}
const mapFaq = (item: FaqResponse): FaqEntry => ({
  id: item.id,
  category: item.categoria,
  question: item.pergunta,
  answer: item.resposta,
  version: item.versao,
});

@Injectable({ providedIn: 'root' })
export class FaqPreviewService {
  private readonly api = inject(PortalApi);
  private readonly context = inject(PortalContext);
  private readonly entriesState = signal<readonly FaqEntry[]>([]);
  readonly entries = this.entriesState.asReadonly();
  readonly categories = computed(() => [...new Set(this.entries().map((item) => item.category))]);

  constructor() {
    effect(() => {
      const id = this.context.id();
      this.entriesState.set([]);
      if (id) void this.load().catch(() => {});
    });
  }

  async load(query = '', category: string | null = null): Promise<readonly FaqEntry[]> {
    const id = this.context.id();
    if (!id) return [];
    const params = new URLSearchParams();
    if (query.trim()) params.set('busca', query.trim());
    if (category) params.set('categoria', category);
    const data = await this.api.get<FaqResponse[]>(
      this.context.url(`/faq${params.size ? `?${params}` : ''}`),
    );
    const entries = data.map(mapFaq);
    if (id === this.context.id() && !params.size) this.entriesState.set(entries);
    return entries;
  }

  async save(content: FaqContent, id: string | null = null, version?: number): Promise<FaqEntry> {
    const partnershipId = this.context.id();
    const current = this.entries().find((item) => item.id === id);
    const body = {
      categoria: content.category.trim(),
      pergunta: content.question.trim(),
      resposta: content.answer.trim(),
      versao: version ?? current?.version ?? null,
    };
    const data = id
      ? await this.api.patch<FaqResponse>(this.context.url(`/faq/${id}`), body)
      : await this.api.post<FaqResponse>(this.context.url('/faq'), body);
    const entry = mapFaq(data);
    if (partnershipId === this.context.id())
      this.entriesState.update((items) =>
        id ? items.map((item) => (item.id === id ? entry : item)) : [...items, entry],
      );
    return entry;
  }

  search(query: string, category: string | null = null): readonly FaqEntry[] {
    const normalized = query.trim().toLocaleLowerCase('pt-BR');
    return this.entries().filter(
      (item) =>
        (!category || item.category === category) &&
        (!normalized ||
          `${item.question} ${item.answer}`.toLocaleLowerCase('pt-BR').includes(normalized)),
    );
  }
}
