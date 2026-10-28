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
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { ActivatedRoute } from '@angular/router';
import { CLIENT_NAMES, ClientPreviewService, previewClientId } from '../shared/client-preview.service';

@Component({
  selector: 'app-rbs-roxo-profile',
  imports: [
    AdminPartnershipShell,
    ReactiveFormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './roxo-profile.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/profile/profile.css',
    '../../partnership/shared/material-ui.css',
    './roxo-profile.css',
  ],
})
export class RbsRoxoProfile {
  private readonly injector = inject(Injector);
  readonly sponsorId = previewClientId(inject(ActivatedRoute).snapshot.data['sponsorId']);
  readonly clientName = CLIENT_NAMES[this.sponsorId];
  readonly preview = inject(ClientPreviewService).profilePreview(this.sponsorId);
  readonly form = new FormGroup({
    name: new FormControl(this.preview.profile().name, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    quota: new FormControl(this.preview.profile().quota, {
      nonNullable: true,
      validators: [Validators.required, Validators.pattern(/\S/)],
    }),
    email: new FormControl(this.preview.profile().email, {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  readonly dialog = signal<'saved' | 'publish' | 'document' | null>(null);
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly profileForm = viewChild<unknown, ElementRef<HTMLFormElement>>('profileForm', {
    read: ElementRef,
  });
  readonly title = computed(() =>
    this.dialog() === 'publish'
      ? 'Disponibilizar material'
      : this.dialog() === 'document'
        ? `Documento de ${this.clientName}`
        : 'Informações salvas',
  );

  invalid(field: keyof typeof this.form.controls): boolean {
    const control = this.form.controls[field];
    return control.touched && control.invalid;
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      const firstInvalid = (Object.keys(this.form.controls) as (keyof typeof this.form.controls)[])
        .find((field) => this.form.controls[field].invalid);
      this.profileForm()?.nativeElement
        .querySelector<HTMLElement>(`[formControlName="${firstInvalid}"]`)
        ?.focus();
      return;
    }
    if (!this.preview.save(this.form.getRawValue())) return;
    this.form.reset(this.preview.profile());
    this.showSaved();
  }

  publish(): void {
    if (this.dialog() !== 'publish') return;
    this.preview.publishExample();
    this.showSaved();
  }

  openDocument(): void {
    if (this.preview.publicationConfirmed()) this.dialog.set('document');
  }

  close(): void {
    this.dialog.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'roxo-profile-dialog-title');
  }

  private showSaved(): void {
    const alreadyOpen = this.dialog() !== null;
    this.dialog.set('saved');
    // Na primeira abertura o NG-ZORRO posiciona e contém o foco no diálogo.
    // Ao trocar o conteúdo aberto, o botão anterior sai do DOM.
    if (!alreadyOpen) return;
    afterNextRender(
      {
        write: () => {
          if (this.dialog() === 'saved') this.heading()?.nativeElement.focus();
        },
      },
      { injector: this.injector },
    );
  }
}
