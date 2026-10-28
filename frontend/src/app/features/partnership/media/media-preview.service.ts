import { computed, Injectable, signal } from '@angular/core';
import { MaterialSelection } from '../shared/partnership-preview.service';

export interface MediaVersion {
  readonly name: string;
  readonly size: number | null;
  readonly version: number;
  readonly receivedAt: Date | null;
  readonly sender?: 'Admin Patrocinador' | 'Admin RBS';
}

/** Exemplos do protótipo e registros locais; não representa dados da API. */
@Injectable({ providedIn: 'root' })
export class MediaPreviewService {
  private readonly versionsState = signal<readonly MediaVersion[]>([
    { name: 'campanha_amarelo_v1.mp4', size: null, version: 1, receivedAt: null }
  ]);
  private readonly briefingState = signal('');
  private readonly submissionsOpenState = signal(true);
  private readonly storiesState = signal(1);
  private readonly publicationState = signal(false);
  readonly versions = this.versionsState.asReadonly();
  readonly currentFile = computed(() => this.versionsState()[0]);
  readonly briefing = this.briefingState.asReadonly();
  readonly submissionsOpen = this.submissionsOpenState.asReadonly();
  readonly displayedStories = this.storiesState.asReadonly();
  readonly displayedStoriesLabel = computed(() => `${this.storiesState()} ${this.storiesState() === 1 ? 'inserção' : 'inserções'}`);
  readonly publicationConfirmed = this.publicationState.asReadonly();

  setSubmissionsOpen(open: boolean): void {
    this.submissionsOpenState.set(open);
  }

  saveDisplayedStories(count: number): void {
    if (Number.isSafeInteger(count) && count >= 0) this.storiesState.set(count);
  }

  publishExample(): void {
    this.publicationState.set(true);
  }

  recordFile(selection: MaterialSelection, sender: 'Admin Patrocinador' | 'Admin RBS' = 'Admin Patrocinador'): void {
    if (!this.submissionsOpen()) return;
    const version: MediaVersion = {
      ...selection, version: this.versionsState().length + 1, receivedAt: new Date(), sender
    };
    this.versionsState.update(versions => [version, ...versions]);
  }

  saveBriefing(text: string): void {
    if (!this.submissionsOpen()) return;
    const trimmed = text.trim();
    if (trimmed) this.briefingState.set(trimmed);
  }
}
