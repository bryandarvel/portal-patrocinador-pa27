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
import { labelPartnershipDialog } from './modal-accessibility';
import { PartnershipReportPreviewService } from './partnership-report-preview.service';

@Component({
  selector: 'app-partnership-report',
  imports: [RouterLink, NzButtonModule, NzModalModule],
  templateUrl: './partnership-report.html',
  styleUrls: ['./partnership-ui.css', './material-ui.css', './partnership-report.css'],
})
export class PartnershipReport {
  readonly open = model(false);
  readonly admin = input(false);
  readonly sponsorName = input.required<string>();
  readonly preview = inject(PartnershipReportPreviewService);
  readonly stage = signal<'overview' | 'publish' | 'view' | 'saved'>('overview');
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly title = computed(
    () =>
      ({
        overview: 'Relatório da parceria',
        publish: 'Disponibilizar relatório',
        view: 'Relatório personalizado',
        saved: 'Alterações salvas',
      })[this.stage()],
  );

  showPublication(): void {
    if (!this.admin()) return;
    this.stage.set('publish');
    this.focusTitle();
  }

  showFile(): void {
    if (!this.preview.publication()) return;
    this.stage.set('view');
    this.focusTitle();
  }

  publish(): void {
    if (!this.admin() || this.stage() !== 'publish') return;
    this.preview.publishExample();
    this.stage.set('saved');
    this.focusTitle();
  }

  close(): void {
    this.open.set(false);
    this.stage.set('overview');
  }

  afterOpen(modal: NzModalComponent): void {
    this.stage.set('overview');
    labelPartnershipDialog(modal, 'partnership-report-title');
  }

  private focusTitle(): void {
    requestAnimationFrame(() => this.heading()?.nativeElement.focus());
  }
}
