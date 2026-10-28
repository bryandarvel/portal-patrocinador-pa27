import { effect, inject, Injectable, InjectionToken, signal } from '@angular/core';
import { PortalArquivo, PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import type { AdminSponsorId } from '../shared/client-preview.service';

export const SOURCE_SHEETS_CLIENT = new InjectionToken<AdminSponsorId>('SOURCE_SHEETS_CLIENT');
export interface SourceSheetPreview {
  id: string;
  name: string;
  origin: string;
}
@Injectable({ providedIn: 'root' })
export class SourceSheetsPreviewService {
  private readonly api = inject(PortalApi);
  private readonly context = inject(PortalContext);
  private readonly state = signal<PortalArquivo[]>([]);
  readonly sheets = this.state.asReadonly();
  constructor() {
    effect(() => {
      const id = this.context.id();
      this.state.set([]);
      if (id) void this.load().catch(() => {});
    });
  }
  async load(): Promise<void> {
    const id = this.context.id();
    if (!id) return;
    const files = await this.api.get<PortalArquivo[]>(this.context.url('/relatorio/planilhas'));
    if (id === this.context.id()) this.state.set(files);
  }
  async add(file: File): Promise<void> {
    const id = this.context.id();
    const saved = await this.api.upload<PortalArquivo>(
      this.context.url('/relatorio/planilhas'),
      file,
    );
    if (id === this.context.id()) this.state.update((files) => [...files, saved]);
  }
  async download(file: PortalArquivo): Promise<void> {
    await this.api.download(this.context.url(`/arquivos/${file.id}`), file.nome);
  }
}
