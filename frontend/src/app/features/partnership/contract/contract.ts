import { DatePipe } from '@angular/common';
import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipShell } from '../shared/partnership-shell';
import { labelPartnershipDialog } from '../shared/modal-accessibility';
import { ContractPreviewService } from './contract-preview.service';

type ContractDialog = 'document' | 'history' | 'approve' | 'adjust' | 'saved';

@Component({
  selector: 'app-partnership-contract',
  imports: [PartnershipShell, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule, DatePipe],
  templateUrl: './contract.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './contract.css']
})
export class PartnershipContract {
  readonly preview = inject(ContractPreviewService);
  readonly dialog = signal<ContractDialog | null>(null);
  readonly adjustError = signal(false);
  readonly commentControl = new FormControl('', {
    nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)]
  });
  readonly adjustmentForm = new FormGroup({ comment: this.commentControl });
  readonly commentInput = viewChild<ElementRef<HTMLTextAreaElement>>('commentInput');
  readonly documentButton = viewChild<ElementRef<HTMLButtonElement>>('documentButton');
  readonly modal = viewChild<NzModalComponent>('contractModal');
  readonly dialogTitle = computed(() => {
    switch (this.dialog()) {
      case 'document': return 'Contrato para validação';
      case 'history': return 'Histórico do contrato';
      case 'approve': return `Aprovar versão ${this.preview.version.number}?`;
      case 'adjust': return this.adjustError() ? 'Inclua um comentário' : 'Solicitar ajustes';
      default: return 'Alterações salvas';
    }
  });
  private restoreDocumentFocus = false;

  openDecision(kind: 'approve' | 'adjust'): void {
    if (!this.preview.canDecide()) return;
    this.commentControl.reset();
    this.adjustError.set(false);
    this.dialog.set(kind);
  }

  approve(): void {
    if (this.dialog() !== 'approve' || !this.preview.approve()) return;
    this.showSaved();
  }

  sendAdjustment(): void {
    if (this.dialog() !== 'adjust') return;
    this.commentControl.markAsTouched();
    if (this.adjustmentForm.invalid) {
      this.adjustError.set(true);
      this.focusComment();
      return;
    }
    if (this.preview.requestAdjustments(this.commentControl.value)) this.showSaved();
  }

  focusComment(): void {
    this.commentInput()?.nativeElement.focus();
  }

  close(): void {
    this.restoreDocumentFocus = this.dialog() === 'saved';
    this.dialog.set(null);
    this.commentControl.reset();
    this.adjustError.set(false);
  }

  afterClose(): void {
    // A ação original desaparece depois da decisão; o documento permanece acessível.
    if (this.restoreDocumentFocus) this.documentButton()?.nativeElement.focus();
    this.restoreDocumentFocus = false;
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'contract-dialog-title');
  }

  private showSaved(): void {
    this.dialog.set('saved');
    requestAnimationFrame(() => {
      this.modal()?.getElement()?.querySelector<HTMLElement>('#contract-dialog-title')?.focus();
    });
  }
}
