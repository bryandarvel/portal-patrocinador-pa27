import { NzIconModule } from 'ng-zorro-antd/icon';
import {
  Component,
  computed,
  ElementRef,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PORTAL_AREAS, PortalContext } from '../../../core/portal-context.service';
import { labelPartnershipDialog } from './modal-accessibility';
import { PartnershipReportPreviewService, ReportFile } from './partnership-report-preview.service';
import {
  formatReportDate,
  reportBenefitLabel,
  reportExecutionLabel,
  reportFileLabel,
} from './report-format';

@Component({
  selector: 'app-partnership-report',
  imports: [NzIconModule, RouterLink, NzButtonModule, NzModalModule],
  templateUrl: './partnership-report.html',
  styleUrls: ['./partnership-ui.css', './material-ui.css', './partnership-report.css'],
})
export class PartnershipReport {
  readonly open = model(false);
  readonly admin = input(false);
  readonly sponsorName = input.required<string>();
  readonly preview = inject(PartnershipReportPreviewService);
  readonly context = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly stage = signal<'overview' | 'publish'>('overview');
  readonly busy = signal(false);
  readonly error = signal('');
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly formatDate = formatReportDate;
  readonly executionLabel = reportExecutionLabel;
  readonly fileLabel = reportFileLabel;
  readonly benefitLabel = reportBenefitLabel;
  areaLabel(value: string): string {
    return PORTAL_AREAS.find((area) => area.key === value)?.label ?? value;
  }
  readonly title = computed(() =>
    this.stage() === 'publish' ? 'Publicar relatório complementar' : 'Relatório da parceria',
  );
  file: File | null = null;
  showPublication(): void {
    if (this.admin()) {
      this.error.set('');
      this.stage.set('publish');
      this.focusTitle();
    }
  }
  selectFile(event: Event): void {
    this.file = (event.target as HTMLInputElement).files?.[0] ?? null;
  }
  async publish(): Promise<void> {
    if (!this.admin() || !this.file || this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.preview.publish(this.file);
      this.file = null;
      this.stage.set('overview');
      this.api.notice.set('Relatório complementar publicado.');
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.busy.set(false);
    }
  }
  async exportHtml(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.preview.exportHtml();
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.busy.set(false);
    }
  }
  async download(file: ReportFile): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set('');
    try {
      await this.preview.download(file);
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.busy.set(false);
    }
  }
  close(): void {
    if (this.busy()) return;
    this.open.set(false);
    this.stage.set('overview');
    this.file = null;
    this.error.set('');
  }
  afterOpen(modal: NzModalComponent): void {
    this.stage.set('overview');
    labelPartnershipDialog(modal, 'partnership-report-title');
    void this.preview.load().catch(() => {});
  }
  private focusTitle(): void {
    requestAnimationFrame(() => this.heading()?.nativeElement.focus());
  }
}
