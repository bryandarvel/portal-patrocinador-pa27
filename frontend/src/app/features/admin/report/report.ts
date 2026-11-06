import { EmptyState } from '../../partnership/shared/empty-state';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { formatReportDate } from '../../partnership/shared/report-format';
import { CardHeading } from '../../partnership/shared/card-heading';
import { Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { PortalApi, PortalArquivo } from '../../../core/portal-api.service';
import { SourceSheetsPreviewService } from './source-sheets-preview.service';

@Component({
  selector: 'app-rbs-report',
  imports: [EmptyState, NzIconModule, CardHeading, AdminPartnershipShell, NzButtonModule],
  templateUrl: './report.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    './report.css',
  ],
})
export class RbsReport {
  readonly formatDate = formatReportDate;
  readonly sheets = inject(SourceSheetsPreviewService);
  readonly api = inject(PortalApi);
  readonly selected = signal<File[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  choose(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length) return;

    const accepted = files.filter((file) => file.size > 0 && /\.(docx?|xlsx?|txt)$/i.test(file.name));
    const selection = [...this.selected()];
    for (const file of accepted) {
      if (
        !selection.some(
          (item) => item.name === file.name && item.size === file.size && item.lastModified === file.lastModified,
        )
      ) {
        selection.push(file);
      }
    }
    this.selected.set(selection);
    this.error.set(
      accepted.length === files.length
        ? ''
        : 'Alguns arquivos não foram selecionados. Use arquivos Word, Excel ou TXT com conteúdo.',
    );
  }
  remove(index: number): void {
    this.selected.update((files) => files.filter((_, position) => position !== index));
  }
  async add(): Promise<void> {
    if (this.busy() || !this.selected().length) return;
    this.busy.set(true);
    this.error.set('');
    const failed: File[] = [];
    for (const file of this.selected()) {
      try {
        await this.sheets.add(file);
      } catch {
        failed.push(file);
      }
    }
    this.selected.set(failed);
    if (failed.length)
      this.error.set(
        failed.length === 1
          ? 'Um arquivo não foi enviado. Revise o arquivo e tente novamente.'
          : `${failed.length} arquivos não foram enviados. Revise os arquivos e tente novamente.`,
      );
    else this.api.notice.set('Arquivos armazenados.');
    this.busy.set(false);
  }
  async download(file: PortalArquivo): Promise<void> {
    try {
      await this.sheets.download(file);
    } catch {
      this.error.set(this.api.error());
    }
  }
}
