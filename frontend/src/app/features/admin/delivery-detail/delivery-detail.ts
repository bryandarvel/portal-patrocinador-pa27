import { DatePipe } from '@angular/common';
import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { LogoDeliveryPreviewService } from '../../partnership/delivery-detail/logo-delivery-preview.service';
import { PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';
import { DeliveryReport } from '../../partnership/shared/delivery-report';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { DeliveryOrganizer } from '../shared/delivery-organizer';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';

type LogoDialog =
  | 'document'
  | 'history'
  | 'approve'
  | 'adjust'
  | 'realize'
  | 'add-proof'
  | 'proof'
  | 'saved'
  | null;

@Component({
  selector: 'app-rbs-logo-delivery',
  imports: [
    AdminPartnershipShell,
    DeliveryOrganizer,
    DeliveryReport,
    RouterLink,
    DatePipe,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './delivery-detail.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/delivery-detail/delivery-detail.css',
    './delivery-detail.css',
  ],
})
export class RbsLogoDelivery {
  readonly preview = inject(LogoDeliveryPreviewService);
  readonly partnership = inject(PartnershipPreviewService);
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly dialog = signal<LogoDialog>(null);
  readonly reportOpen = signal(false);
  readonly organizerOpen = signal(false);
  readonly steps = [
    'Material do patrocinador',
    'Análise pela RBS',
    'Execução da ação',
    'Comprovação e relatório',
  ];
  readonly proofControl = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/\S/)],
  });
  readonly proofForm = new FormGroup({ description: this.proofControl });
  readonly proofInput = viewChild<unknown, ElementRef<HTMLTextAreaElement>>('proofInput', {
    read: ElementRef,
  });
  readonly materialHeading = viewChild<ElementRef<HTMLHeadingElement>>('materialHeading');
  readonly dialogHeading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly sessionDate = new Date();
  readonly title = computed(
    () =>
      ({
        document: 'Material recebido',
        history: 'Histórico do material',
        approve: 'Aprovar material?',
        adjust: 'Solicitar ajuste no material',
        realize: 'Registrar realização',
        'add-proof': 'Registrar comprovação',
        proof: 'Comprovação da entrega',
        saved: 'Alterações salvas',
      })[this.dialog() ?? 'saved'],
  );
  private restoreMaterialFocus = false;

  constructor() {
    if (inject(ActivatedRoute).snapshot.queryParamMap.get('exemplo') === 'material-recebido')
      this.preview.seedReceivedExample();
  }

  startAnalysis(): void {
    if (this.preview.startAnalysis()) this.focusMaterial();
  }

  startExecution(): void {
    if (this.preview.startExecution()) this.focusMaterial();
  }

  openProofForm(): void {
    if (this.preview.stage() !== 'realized') return;
    this.proofControl.reset(this.preview.proofExample);
    this.dialog.set('add-proof');
  }

  confirm(): void {
    const dialog = this.dialog();
    const saved =
      dialog === 'approve'
        ? this.preview.approveMaterial()
        : dialog === 'adjust'
          ? this.preview.requestAdjustment()
          : dialog === 'realize' && this.preview.realize();
    if (saved) this.showSaved();
  }

  publishProof(): void {
    if (this.dialog() !== 'add-proof') return;
    this.proofControl.markAsTouched();
    if (this.proofControl.invalid) {
      this.proofInput()?.nativeElement.focus();
      return;
    }
    if (this.preview.publishProof(this.proofControl.value)) this.showSaved();
  }

  close(): void {
    this.restoreMaterialFocus = this.dialog() === 'saved';
    this.dialog.set(null);
    this.proofControl.reset();
  }

  afterClose(): void {
    if (this.restoreMaterialFocus) this.focusMaterial();
    this.restoreMaterialFocus = false;
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-logo-dialog-title');
  }

  private focusMaterial(): void {
    requestAnimationFrame(() => this.materialHeading()?.nativeElement.focus());
  }

  private showSaved(): void {
    this.dialog.set('saved');
    requestAnimationFrame(() => {
      if (this.dialog() === 'saved') this.dialogHeading()?.nativeElement.focus();
    });
  }
}
