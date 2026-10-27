import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { SponsorPreview, SponsorsPreviewService } from './sponsors-preview.service';

@Component({
  selector: 'app-rbs-sponsors',
  imports: [RouterLink, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './sponsors.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', './sponsors.css']
})
export class RbsSponsors {
  readonly preview = inject(SponsorsPreviewService);
  readonly searchField = new FormControl('', { nonNullable: true });
  readonly query = signal('');
  readonly results = computed(() => this.preview.search(this.query()));
  readonly dialog = signal<'search' | 'register' | 'registered' | 'notifications' | null>(null);
  readonly registered = signal<SponsorPreview | null>(null);
  readonly dialogHeading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly registration = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    quota: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] })
  });
  readonly title = computed(() => {
    switch (this.dialog()) {
      case 'search': return 'Buscar patrocinadores';
      case 'register': return 'Cadastrar patrocinador e acesso';
      case 'registered': return 'Patrocinador cadastrado';
      default: return 'Notificações';
    }
  });

  search(): void {
    this.query.set(this.searchField.value.trim());
    this.dialog.set('search');
  }

  openRegistration(): void {
    this.registration.reset();
    this.dialog.set('register');
  }

  invalid(field: keyof typeof this.registration.controls): boolean {
    const control = this.registration.controls[field];
    return control.touched && control.invalid;
  }

  register(): void {
    if (this.dialog() !== 'register') return;
    this.registration.markAllAsTouched();
    if (this.registration.invalid) return;
    const { name, quota, email } = this.registration.getRawValue();
    const sponsor = this.preview.register({ name, quota, email });
    if (!sponsor) return;
    this.registration.reset();
    this.showAccess(sponsor);
  }

  showAccess(sponsor: SponsorPreview): void {
    this.registered.set(sponsor);
    this.dialog.set('registered');
    requestAnimationFrame(() => {
      if (this.dialog() === 'registered') this.dialogHeading()?.nativeElement.focus();
    });
  }

  closeDialog(): void {
    this.registration.reset();
    this.dialog.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'sponsors-dialog-title');
  }
}
