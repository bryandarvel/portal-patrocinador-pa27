import {
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { SourceSheetsPreviewService } from './source-sheets-preview.service';
import { AdminSponsorId, ClientPreviewService } from '../shared/client-preview.service';

type SheetsDialog = 'select' | 'selected' | 'progress' | 'success' | 'error' | 'details' | null;

@Component({
  selector: 'app-rbs-report',
  imports: [AdminPartnershipShell, NzButtonModule, NzModalModule],
  templateUrl: './report.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    './report.css',
  ],
})
export class RbsReport {
  readonly sheets = inject(SourceSheetsPreviewService);
  readonly sponsorId: AdminSponsorId = inject(ActivatedRoute).snapshot.data['sponsorId'] ?? 'amarelo';
  private readonly amareloProfile = inject(RbsProfilePreviewService).profile;
  private readonly clients = inject(ClientPreviewService);
  readonly profile = computed(() => this.sponsorId === 'amarelo' ? this.amareloProfile() : this.clients.profile(this.sponsorId));
  readonly dialog = signal<SheetsDialog>(null);
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly title = computed(
    () =>
      ({
        select: 'Adicionar planilhas',
        selected: 'Conferir planilhas',
        progress: 'Adicionando planilhas',
        success: 'Planilhas adicionadas',
        error: 'Não foi possível adicionar',
        details: 'Planilhas de origem',
      })[this.dialog() ?? 'select'],
  );
  private selected = false;
  private nextAttemptFails =
    inject(ActivatedRoute).snapshot.queryParamMap.get('exemplo') === 'falha-planilhas';
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.cancelTimer());
  }

  openSelection(): void {
    this.selected = false;
    this.dialog.set('select');
  }

  selectExamples(): void {
    if (this.dialog() !== 'select') return;
    this.selected = true;
    this.changeDialog('selected');
  }

  chooseOthers(): void {
    if (this.dialog() !== 'selected') return;
    this.selected = false;
    this.changeDialog('select');
  }

  add(): void {
    if (this.dialog() !== 'selected' || !this.selected) return;
    this.changeDialog('progress');
    this.timer = setTimeout(() => {
      this.timer = undefined;
      if (this.dialog() !== 'progress') return;
      if (this.nextAttemptFails) {
        this.nextAttemptFails = false;
        this.changeDialog('error');
        return;
      }
      this.sheets.addExamples();
      this.selected = false;
      this.changeDialog('success');
    }, 900);
  }

  retry(): void {
    if (this.dialog() === 'error' && this.selected) this.changeDialog('selected');
  }

  showDetails(): void {
    if (this.sheets.sheets().length) this.dialog.set('details');
  }

  close(): void {
    this.cancelTimer();
    this.selected = false;
    this.dialog.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'source-sheets-title');
  }

  private cancelTimer(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
  }

  private changeDialog(dialog: SheetsDialog): void {
    this.dialog.set(dialog);
    requestAnimationFrame(() => this.heading()?.nativeElement.focus());
  }
}
