import { Component, effect, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { apiError, PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { CardHeading } from '../../partnership/shared/card-heading';
import { formatReportDate } from '../../partnership/shared/report-format';

interface Importacao {
  id: number;
  arquivoId: string;
  arquivo: string;
  importadoEm: string;
  linhas: number;
}

@Component({
  selector: 'app-sector-reports',
  imports: [CardHeading, NzButtonModule, NzIconModule],
  styleUrls: ['../../partnership/shared/partnership-ui.css', './report.css'],
  templateUrl: './sector-reports.html',
})
export class SectorReports {
  private readonly api = inject(PortalApi);
  readonly context = inject(PortalContext);
  readonly formatDate = formatReportDate;
  readonly selected = signal<File | null>(null);
  readonly history = signal<Importacao[]>([]);
  readonly loading = signal(false);
  readonly busy = signal(false);
  readonly historyError = signal('');
  readonly error = signal('');
  readonly feedback = signal('');
  readonly month = signal('');
  readonly allPartnerships = signal(false);

  constructor() {
    effect(() => {
      const id = this.context.id();
      this.selected.set(null);
      this.history.set([]);
      this.error.set('');
      this.feedback.set('');
      this.loading.set(false);
      this.historyError.set('');
      if (id) void this.loadHistory(id);
    });
  }

  async loadHistory(id = this.context.id()): Promise<void> {
    this.historyError.set('');
    this.loading.set(true);
    try {
      const result = await this.api.get<Importacao[]>(this.context.url('/relatorio/setorial/importacoes'));
      if (id === this.context.id()) this.history.set(result);
    } catch (error) {
      if (id === this.context.id()) this.historyError.set(apiError(error));
    } finally {
      if (id === this.context.id()) this.loading.set(false);
    }
  }

  choose(input: HTMLInputElement): void {
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    this.feedback.set('');
    if (!/\.(docx|xlsx)$/i.test(file.name) || file.size === 0 || file.size > 1024 * 1024) {
      this.selected.set(null);
      this.error.set('Selecione um arquivo DOCX ou XLSX com conteúdo e até 1 MB.');
      return;
    }
    this.error.set('');
    this.selected.set(file);
  }

  async importFile(picker: HTMLButtonElement): Promise<void> {
    const file = this.selected();
    if (!file || this.busy()) return;
    const id = this.context.id();
    this.busy.set(true);
    this.error.set('');
    this.feedback.set('');
    let completed = false;
    try {
      const result = await this.api.upload<{ importacao: Importacao; repetido: boolean }>(
        this.context.url('/relatorio/setorial/importacoes'), file,
      );
      if (id !== this.context.id()) return;
      this.selected.set(null);
      completed = true;
      this.feedback.set(result.repetido
        ? 'Este arquivo já foi importado. O histórico e os relatórios foram preservados.'
        : `Importação concluída. Linhas registradas: ${result.importacao.linhas}.`);
      await this.loadHistory(id);
    } catch (error) {
      if (id === this.context.id()) this.error.set(apiError(error));
    } finally {
      this.busy.set(false);
      if (completed) requestAnimationFrame(() => { if (picker.isConnected) picker.focus(); });
    }
  }

  async downloadModel(format: 'docx' | 'xlsx'): Promise<void> {
    await this.download(this.context.url(`/relatorio/setorial/modelos/${format}`), `modelo-setorial-pa27.${format}`);
  }

  async exportReport(type: 'vendas' | 'veiculacao'): Promise<void> {
    const base = this.allPartnerships()
      ? '/api/admin/relatorios/setoriais'
      : this.context.url('/relatorio/setorial/exportacoes');
    const filter = this.month() ? `?mes=${encodeURIComponent(this.month())}` : '';
    await this.download(`${base}/${type}${filter}`, `relatorio-${type}.xlsx`);
  }

  async downloadSource(item: Importacao): Promise<void> {
    await this.download(this.context.url(`/arquivos/${item.arquivoId}`), item.arquivo);
  }

  private async download(url: string, name: string): Promise<void> {
    this.error.set('');
    try {
      await this.api.download(url, name);
    } catch (error) {
      this.error.set(apiError(error));
    }
  }
}
