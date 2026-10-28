import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { CourtesyPreview, TicketsPreviewService } from '../../partnership/tickets/tickets-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
import { ActivatedRoute } from '@angular/router';
import { AdminSponsorId, ClientPreviewService } from '../shared/client-preview.service';

type CourtesyDialog = 'add' | 'edit' | 'saved' | null;

@Component({
  selector: 'app-rbs-tickets',
  imports: [AdminPartnershipShell, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './tickets.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/tickets/tickets.css', './tickets.css']
})
export class RbsTickets {
  readonly preview = inject(TicketsPreviewService);
  readonly sponsorId: AdminSponsorId = inject(ActivatedRoute).snapshot.data['sponsorId'] ?? 'amarelo';
  private readonly amareloProfile = inject(RbsProfilePreviewService).profile;
  private readonly clients = inject(ClientPreviewService);
  readonly profile = computed(() => this.sponsorId === 'amarelo' ? this.amareloProfile() : this.clients.profile(this.sponsorId));
  readonly dialog = signal<CourtesyDialog>(null);
  readonly editing = signal<CourtesyPreview | null>(null);
  readonly form = new FormGroup({
    quantity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), control => control.value === null || Number.isSafeInteger(control.value) ? null : { integer: true }]
    }),
    type: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    sector: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] })
  });
  readonly formElement = viewChild<unknown, ElementRef<HTMLFormElement>>('formElement', { read: ElementRef });
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly title = computed(() => this.dialog() === 'add' ? 'Adicionar cortesia' : this.dialog() === 'edit' ? 'Editar cortesia' : 'Alteração salva');
  readonly formError = signal('');

  invalid(field: keyof typeof this.form.controls): boolean {
    return this.form.controls[field].touched && this.form.controls[field].invalid;
  }

  openAdd(): void {
    this.editing.set(null);
    this.form.reset({ quantity: null, type: '', sector: '' });
    this.formError.set('');
    this.dialog.set('add');
  }

  openEdit(courtesy: CourtesyPreview): void {
    this.editing.set(courtesy);
    this.form.reset({ quantity: courtesy.quantity, type: courtesy.type, sector: courtesy.sector });
    this.formError.set('');
    this.dialog.set('edit');
  }

  save(): void {
    const dialog = this.dialog();
    if (dialog !== 'add' && dialog !== 'edit') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      requestAnimationFrame(() => {
        if (this.dialog() === dialog) this.formElement()?.nativeElement.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus();
      });
      return;
    }
    const { quantity, type, sector } = this.form.getRawValue();
    if (quantity === null) return;
    const input = { quantity, type, sector };
    const id = this.editing()?.id;
    const saved = dialog === 'add' ? this.preview.add(input) !== null : id !== undefined && this.preview.update(id, input);
    if (!saved) { this.formError.set('Não foi possível salvar este registro. Feche o diálogo e tente novamente.'); return; }
    this.dialog.set('saved');
    requestAnimationFrame(() => { if (this.dialog() === 'saved') this.heading()?.nativeElement.focus(); });
  }

  close(): void {
    this.dialog.set(null);
    this.form.reset();
    this.formError.set('');
    this.editing.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-tickets-dialog-title');
  }
}
