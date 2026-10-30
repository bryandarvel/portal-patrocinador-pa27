import { CardHeading } from '../../partnership/shared/card-heading';
import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import {
  CLIENT_NAMES,
  ClientPreviewService,
  previewClientId,
} from '../shared/client-preview.service';

@Component({
  selector: 'app-client-staff',
  imports: [
    CardHeading,
    AdminPartnershipShell,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './client-staff.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/profile/profile.css',
    './client-areas.css',
  ],
})
export class ClientStaff {
  readonly sponsorId = previewClientId(inject(ActivatedRoute).snapshot.data['sponsorId']);
  readonly clientName = CLIENT_NAMES[this.sponsorId];
  readonly preview = inject(ClientPreviewService);
  readonly profile = computed(() => this.preview.profile(this.sponsorId));
  readonly staff = computed(() => this.preview.staff(this.sponsorId));
  readonly dialog = signal<'edit' | 'saved' | null>(null);
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('heading');
  readonly formElement = viewChild<unknown, ElementRef<HTMLFormElement>>('staffForm', {
    read: ElementRef,
  });
  private readonly injector = inject(Injector);
  readonly form = new FormGroup({
    quantity: new FormControl<number | null>(null, {
      validators: [
        Validators.required,
        Validators.min(0),
        (c) => (c.value === null || Number.isSafeInteger(c.value) ? null : { integer: true }),
      ],
    }),
    sector: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
  });
  openEditor(): void {
    this.form.reset(this.staff() ?? { quantity: null, sector: '' });
    this.dialog.set('edit');
  }
  invalid(field: keyof typeof this.form.controls): boolean {
    return this.form.controls[field].touched && this.form.controls[field].invalid;
  }
  save(): void {
    if (this.dialog() !== 'edit') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const field = this.form.controls.quantity.invalid ? 'quantity' : 'sector';
      this.formElement()
        ?.nativeElement.querySelector<HTMLInputElement>(`[formControlName="${field}"]`)
        ?.focus();
      return;
    }
    const value = this.form.getRawValue();
    if (
      value.quantity === null ||
      !this.preview.saveStaff(this.sponsorId, { ...value, quantity: value.quantity })
    )
      return;
    this.dialog.set('saved');
    afterNextRender(
      { write: () => this.heading()?.nativeElement.focus() },
      { injector: this.injector },
    );
  }
  close(): void {
    this.dialog.set(null);
    this.form.reset();
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'client-staff-title');
  }
}
