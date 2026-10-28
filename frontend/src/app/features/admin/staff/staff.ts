import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { StaffPreviewService } from '../../partnership/staff/staff-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';

@Component({
  selector: 'app-rbs-staff',
  imports: [AdminPartnershipShell, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './staff.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/material-ui.css', '../../partnership/staff/staff.css', './staff.css']
})
export class RbsStaff {
  readonly preview = inject(StaffPreviewService);
  readonly accreditation = this.preview.accreditation;
  readonly dialog = signal<'edit' | 'saved' | null>(null);
  readonly form = new FormGroup({
    quantity: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0), control => control.value === null || Number.isSafeInteger(control.value) ? null : { integer: true }]
    }),
    sector: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] })
  });
  readonly formElement = viewChild<unknown, ElementRef<HTMLFormElement>>('formElement', { read: ElementRef });
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');

  invalid(field: keyof typeof this.form.controls): boolean {
    return this.form.controls[field].touched && this.form.controls[field].invalid;
  }

  openEdit(): void {
    const { quantity, sector } = this.accreditation();
    this.form.reset({ quantity, sector });
    this.dialog.set('edit');
  }

  save(): void {
    if (this.dialog() !== 'edit') return;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      requestAnimationFrame(() => {
        if (this.dialog() === 'edit') this.formElement()?.nativeElement.querySelector<HTMLInputElement>('input[aria-invalid="true"]')?.focus();
      });
      return;
    }
    const { quantity, sector } = this.form.getRawValue();
    if (quantity === null || !this.preview.update(quantity, sector)) return;
    this.dialog.set('saved');
    requestAnimationFrame(() => { if (this.dialog() === 'saved') this.heading()?.nativeElement.focus(); });
  }

  close(): void {
    this.dialog.set(null);
    this.form.reset();
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-staff-dialog-title');
  }
}
