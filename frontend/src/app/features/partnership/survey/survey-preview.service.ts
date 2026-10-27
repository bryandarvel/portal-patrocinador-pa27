import { Injectable, signal } from '@angular/core';

export interface SurveyQuestions {
  readonly question1: string;
  readonly question2: string;
  readonly question3: string;
}

/** Exemplo do Cliente Amarelo no frame 10:421, sem definir direitos de outras cotas. */
@Injectable({ providedIn: 'root' })
export class SurveyPreviewService {
  private readonly savedQuestions = signal<SurveyQuestions>({
    question1: 'Você visitou a ativação do Cliente Amarelo?',
    question2: 'Como você avalia sua experiência na ativação?',
    question3: 'O que mais chamou sua atenção?'
  });
  readonly questions = this.savedQuestions.asReadonly();

  saveQuestions(questions: SurveyQuestions): void {
    this.savedQuestions.set({
      question1: questions.question1.trim(),
      question2: questions.question2.trim(),
      question3: questions.question3.trim()
    });
  }
}
