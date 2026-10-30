import { CardHeading } from '../../partnership/shared/card-heading';
import { Component, inject, signal } from '@angular/core';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { PortalApi, PortalArquivo } from '../../../core/portal-api.service';
import { SourceSheetsPreviewService } from './source-sheets-preview.service';

@Component({
  selector: 'app-rbs-report',
  imports: [CardHeading, AdminPartnershipShell, NzButtonModule],
  templateUrl: './report.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    './report.css',
  ],
})
export class RbsReport {
  readonly sheets = inject(SourceSheetsPreviewService);
  readonly api = inject(PortalApi);
  readonly selected = signal<File[]>([]);
  readonly busy = signal(false);
  readonly error = signal('');
  choose(event: Event): void {
    this.selected.set(Array.from((event.target as HTMLInputElement).files ?? []));
    this.error.set('');
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
      this.error.set(`${failed.length} arquivo(s) não enviado(s). Revise e tente novamente.`);
    else this.api.notice.set('Planilhas adicionadas.');
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
