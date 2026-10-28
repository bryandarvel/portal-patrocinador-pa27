import { Injectable, signal } from '@angular/core';

export type FaqCategory = 'Materiais' | 'Parceria';

export interface FaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: FaqCategory;
}

export type FaqContent = Pick<FaqEntry, 'question' | 'answer' | 'category'>;

@Injectable({ providedIn: 'root' })
export class FaqPreviewService {
  readonly categories = ['Materiais', 'Parceria'] as const;
  private nextId = 1;
  // Conteúdo publicado no frame 11:946. Não representa uma consulta à API.
  private readonly entriesState = signal<readonly FaqEntry[]>([
    {
      id: 'miv',
      category: 'Materiais',
      question: 'O que é MIV?',
      answer:
        'É o manual de identidade visual. Ele reúne as orientações de uso da marca e deve ser enviado em Aplicações de marca.',
    },
    {
      id: 'substituir-arquivo',
      category: 'Materiais',
      question: 'Posso substituir um arquivo?',
      answer:
        'Enquanto o envio estiver aberto pela RBS, você pode substituir seus próprios materiais. A versão anterior continua no histórico.',
    },
    {
      id: 'relatorio',
      category: 'Parceria',
      question: 'Onde encontro o relatório?',
      answer:
        'Use “Relatório da parceria”, no cabeçalho da área. O arquivo aparece após a publicação pela RBS.',
    },
    {
      id: 'contrato',
      category: 'Parceria',
      question: 'Aprovar o contrato é assinar?',
      answer:
        'A aprovação registra sua concordância com uma versão. A assinatura acontece fora do portal.',
    },
  ]);
  readonly entries = this.entriesState.asReadonly();

  save(content: FaqContent, id: string | null = null): FaqEntry | null {
    const question = content.question.trim();
    const answer = content.answer.trim();
    if (!question || !answer || !this.categories.includes(content.category)) return null;
    if (id !== null && !this.entries().some((entry) => entry.id === id)) return null;
    const entry: FaqEntry = {
      id: id ?? `faq-${this.nextId++}`,
      question,
      answer,
      category: content.category,
    };
    this.entriesState.update((entries) =>
      id === null ? [...entries, entry] : entries.map((item) => (item.id === id ? entry : item)),
    );
    return entry;
  }

  search(query: string, category: FaqCategory | null = null): readonly FaqEntry[] {
    const terms = this.normalize(query).split(/\s+/).filter(Boolean);
    return this.entries().filter((entry) => {
      const text = this.normalize(`${entry.question} ${entry.answer}`);
      return (
        (category === null || entry.category === category) &&
        terms.every((term) => text.includes(term))
      );
    });
  }

  private normalize(value: string): string {
    return value
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('pt-BR');
  }
}
