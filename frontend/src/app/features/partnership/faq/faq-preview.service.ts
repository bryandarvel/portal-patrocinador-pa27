import { Injectable } from '@angular/core';

export type FaqCategory = 'Materiais' | 'Parceria';

export interface FaqEntry {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
  readonly category: FaqCategory;
}

@Injectable({ providedIn: 'root' })
export class FaqPreviewService {
  // Conteúdo publicado no frame 11:946. Não representa uma consulta à API.
  readonly entries: readonly FaqEntry[] = [
    {
      id: 'miv', category: 'Materiais', question: 'O que é MIV?',
      answer: 'É o manual de identidade visual. Ele reúne as orientações de uso da marca e deve ser enviado em Aplicações de marca.'
    },
    {
      id: 'substituir-arquivo', category: 'Materiais', question: 'Posso substituir um arquivo?',
      answer: 'Enquanto o envio estiver aberto pela RBS, você pode substituir seus próprios materiais. A versão anterior continua no histórico.'
    },
    {
      id: 'relatorio', category: 'Parceria', question: 'Onde encontro o relatório?',
      answer: 'Use “Relatório da parceria”, no cabeçalho da área. O arquivo aparece após a publicação pela RBS.'
    },
    {
      id: 'contrato', category: 'Parceria', question: 'Aprovar o contrato é assinar?',
      answer: 'A aprovação registra sua concordância com uma versão. A assinatura acontece fora do portal.'
    }
  ];

  search(query: string, category: FaqCategory | null = null): readonly FaqEntry[] {
    const terms = this.normalize(query).split(/\s+/).filter(Boolean);
    return this.entries.filter(entry => {
      const text = this.normalize(`${entry.question} ${entry.answer}`);
      return (category === null || entry.category === category) && terms.every(term => text.includes(term));
    });
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
  }
}
