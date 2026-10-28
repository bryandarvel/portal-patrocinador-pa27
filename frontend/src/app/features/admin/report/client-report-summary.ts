import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import {
  CLIENT_NAMES,
  ClientPreviewService,
  PreviewClientId,
} from '../shared/client-preview.service';

@Component({
  selector: 'app-client-report-summary',
  imports: [RouterLink, NzButtonModule, NzModalModule],
  templateUrl: './client-report-summary.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    './client-report-summary.css',
  ],
})
export class ClientReportSummary {
  readonly sponsorId = input.required<PreviewClientId>();
  readonly open = model(false);
  readonly preview = inject(ClientPreviewService);
  readonly stage = signal<'summary' | 'publish' | 'saved' | 'view'>('summary');
  readonly profile = computed(() => this.preview.profile(this.sponsorId()));
  readonly published = computed(() => this.preview.published(this.sponsorId(), 'report'));
  readonly title = computed(
    () =>
      ({
        summary: 'Relatório da parceria',
        publish: 'Publicar relatório',
        saved: 'Informações salvas',
        view: `Documento de ${CLIENT_NAMES[this.sponsorId()]}`,
      })[this.stage()],
  );
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');
  private readonly injector = inject(Injector);

  change(stage: 'summary' | 'publish' | 'view'): void {
    this.stage.set(stage);
    this.focusTitle();
  }
  publish(): void {
    if (this.stage() !== 'publish') return;
    this.preview.publish(this.sponsorId(), 'report');
    this.stage.set('saved');
    this.focusTitle();
  }
  close(): void {
    this.open.set(false);
    this.stage.set('summary');
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'client-report-dialog-title');
  }
  private focusTitle(): void {
    afterNextRender(
      { write: () => this.heading()?.nativeElement.focus() },
      { injector: this.injector },
    );
  }
}
