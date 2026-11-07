import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi, PortalArquivo } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface SurveyQuestions {
  readonly question1: string;
  readonly question2: string;
  readonly question3: string;
}

interface SurveyView {
  recebimento: { aberto: boolean; prazo: string | null };
  versoes: { versao: number; criadoEm: string; perguntas: string[] }[];
  resultados: PortalArquivo[];
}
@Injectable({ providedIn: 'root' })
export class SurveyPreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  private readonly savedQuestions = signal<SurveyQuestions>({
    question1: '',
    question2: '',
    question3: '',
  });
  readonly questions = this.savedQuestions.asReadonly();
  readonly versions = signal<SurveyView['versoes']>([]);
  readonly results = signal<PortalArquivo[]>([]);
  readonly deadline = signal<string | null>(null);
  private readonly loadedId = signal<string | null>(null);
  readonly submissionsReady = computed(() => this.loadedId() === this.ctx.id());
  private readonly submissionsOpenState = signal(false);
  readonly submissionsOpen = this.submissionsOpenState.asReadonly();
  readonly resultsPublished = computed(() => this.results().length > 0);
  readonly resultsFileName = computed(() => this.results()[0]?.nome ?? '');

  constructor() {
    effect(() => {
      const id = this.ctx.id();
      this.savedQuestions.set({ question1: '', question2: '', question3: '' });
      this.versions.set([]);
      this.results.set([]);
      this.loadedId.set(null);
      this.submissionsOpenState.set(false);
      if (id) void this.load(id).catch(() => {});
    });
  }
  async load(id = this.ctx.id()): Promise<void> {
    const view = await this.api.get<SurveyView>(`/api/parcerias/${id}/pesquisa`);
    if (id !== this.ctx.id()) return;
    const q = view.versoes[0]?.perguntas ?? [];
    this.savedQuestions.set({
      question1: q[0] ?? '',
      question2: q[1] ?? '',
      question3: q[2] ?? '',
    });
    this.versions.set(view.versoes);
    this.results.set(view.resultados);
    this.deadline.set(view.recebimento.prazo);
    this.loadedId.set(id);
    this.submissionsOpenState.set(
      view.recebimento.aberto &&
        (!view.recebimento.prazo || Date.parse(view.recebimento.prazo) > Date.now()),
    );
  }
  async setSubmissionsOpen(open: boolean, prazo: string | null = this.deadline()): Promise<void> {
    await this.api.patch(this.ctx.url('/pesquisa/recebimento'), { aberto: open, prazo });
    await this.load();
  }
  async publish(file: File): Promise<void> {
    await this.api.upload(this.ctx.url('/pesquisa/resultados'), file);
    await this.load();
  }
  async download(file: PortalArquivo): Promise<void> {
    await this.api.download(this.ctx.url(`/arquivos/${file.id}`), file.nome);
  }
  async saveQuestions(questions: SurveyQuestions): Promise<void> {
    const perguntas = Object.values(questions)
      .map((q) => q.trim())
      .filter(Boolean);
    if (perguntas.length < 1 || perguntas.length > 3)
      throw new Error('Informe de uma a três perguntas.');
    await this.api.put(this.ctx.url('/pesquisa/perguntas'), { perguntas });
    await this.load();
  }
}
