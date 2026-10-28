import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { CommercialDocumentPreview } from '../../partnership/shared/partnership-preview.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { RbsProfilePreviewService } from './profile-preview.service';

type ProfileDialog = 'saved' | 'access' | 'access-saved' | 'publish' | 'published' | 'document' | null;

@Component({
  selector: 'app-rbs-profile',
  imports: [AdminPartnershipShell, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './profile.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/profile/profile.css', '../../partnership/shared/material-ui.css', './profile.css']
})
export class RbsProfile {
  readonly preview = inject(RbsProfilePreviewService);
  readonly form = new FormGroup({
    name: new FormControl(this.preview.profile().name, { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    quota: new FormControl(this.preview.profile().quota, { nonNullable: true, validators: [Validators.required, Validators.pattern(/\S/)] }),
    email: new FormControl(this.preview.profile().email, { nonNullable: true, validators: [Validators.required, Validators.email] })
  });
  readonly accessEmail = new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] });
  readonly dialog = signal<ProfileDialog>(null);
  readonly selectedDocument = signal<CommercialDocumentPreview | null>(null);
  readonly heading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly title = computed(() => {
    switch (this.dialog()) {
      case 'saved': return 'Cadastro atualizado';
      case 'access': return 'Acesso do patrocinador';
      case 'publish': return 'Disponibilizar documento';
      case 'document': return 'Documento da parceria';
      default: return 'Alterações salvas';
    }
  });

  invalid(field: keyof typeof this.form.controls): boolean {
    return this.form.controls[field].touched && this.form.controls[field].invalid;
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.preview.save(this.form.getRawValue());
    this.form.reset(this.preview.profile());
    this.dialog.set('saved');
  }

  openAccess(): void {
    this.accessEmail.reset(this.preview.profile().email);
    this.dialog.set('access');
  }

  saveAccess(): void {
    if (this.dialog() !== 'access') return;
    this.accessEmail.markAsTouched();
    if (this.accessEmail.invalid) return;
    this.preview.saveEmail(this.accessEmail.value);
    // Preserva nome e cota ainda não salvos no formulário principal.
    this.form.controls.email.reset(this.preview.profile().email);
    this.showConfirmation('access-saved');
  }

  publish(): void {
    if (this.dialog() !== 'publish') return;
    this.preview.publishExample();
    this.showConfirmation('published');
  }

  openDocument(document: CommercialDocumentPreview): void {
    this.selectedDocument.set(document);
    this.dialog.set('document');
  }

  closeDialog(): void {
    this.accessEmail.reset();
    this.dialog.set(null);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'rbs-profile-dialog-title');
  }

  private showConfirmation(dialog: 'access-saved' | 'published'): void {
    this.dialog.set(dialog);
    requestAnimationFrame(() => {
      if (this.dialog() === dialog) this.heading()?.nativeElement.focus();
    });
  }
}
