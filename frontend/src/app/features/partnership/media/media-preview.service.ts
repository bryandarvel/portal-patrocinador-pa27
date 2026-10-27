import { computed, Injectable, signal } from '@angular/core';
import { MaterialSelection } from '../shared/partnership-preview.service';

export interface MediaVersion {
  readonly name: string;
  readonly size: number | null;
  readonly version: number;
  readonly receivedAt: Date | null;
}

/** Exemplos do protótipo e registros locais; não representa dados da API. */
@Injectable({ providedIn: 'root' })
export class MediaPreviewService {
  private readonly versionsState = signal<readonly MediaVersion[]>([
    { name: 'campanha_amarelo_v1.mp4', size: null, version: 1, receivedAt: null }
  ]);
  private readonly briefingState = signal('');
  readonly versions = this.versionsState.asReadonly();
  readonly currentFile = computed(() => this.versionsState()[0]);
  readonly briefing = this.briefingState.asReadonly();

  recordFile(selection: MaterialSelection): void {
    const version: MediaVersion = {
      ...selection, version: this.versionsState().length + 1, receivedAt: new Date()
    };
    this.versionsState.update(versions => [version, ...versions]);
  }

  saveBriefing(text: string): void {
    const trimmed = text.trim();
    if (trimmed) this.briefingState.set(trimmed);
  }
}
