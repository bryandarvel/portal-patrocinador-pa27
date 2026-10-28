import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';
import { Credential, StaffPreviewService } from '../../partnership/staff/staff-preview.service';

@Component({
  selector: 'app-rbs-staff',
  imports: [AdminPartnershipShell, FormsModule, RouterLink, NzButtonModule],
  templateUrl: './staff.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/shared/material-ui.css',
    '../../partnership/staff/staff.css',
    './staff.css',
  ],
})
export class RbsStaff {
  readonly preview = inject(StaffPreviewService);
  readonly context = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly accreditation = this.preview.accreditation;
  readonly benefits = computed(
    () =>
      this.context.partnership()?.beneficios.filter((item) => item.natureza === 'CREDENCIAL') ?? [],
  );
  readonly editing = signal(false);
  readonly saving = signal(false);
  readonly error = signal('');
  readonly rows = signal<Credential[]>([]);
  url = '';
  open(): void {
    this.rows.set((this.accreditation()?.itens ?? []).map((item) => ({ ...item })));
    this.url = this.accreditation()?.urlOpenStaff ?? '';
    this.error.set('');
    this.editing.set(true);
  }
  add(): void {
    const benefit = this.benefits()[0];
    if (benefit)
      this.rows.update((items) => [
        ...items,
        {
          setor: benefit.setor,
          tipo: benefit.tipo,
          publico: benefit.publico,
          quantidade: 0,
          beneficioId: benefit.id,
        },
      ]);
  }
  select(row: Credential): void {
    const benefit = this.benefits().find((item) => item.id === row.beneficioId);
    if (benefit) {
      row.tipo = benefit.tipo;
      row.setor = benefit.setor;
      row.publico = benefit.publico;
    }
  }
  remove(index: number): void {
    this.rows.update((items) => items.filter((_, position) => position !== index));
  }
  async save(): Promise<void> {
    if (this.saving()) return;
    if (!this.preview.validUrl(this.url)) {
      this.error.set('Informe uma URL http ou https para o Open Staff.');
      return;
    }
    if (
      this.rows().some(
        (item) =>
          !this.benefits().some(
            (benefit) =>
              benefit.id === item.beneficioId &&
              benefit.tipo === item.tipo &&
              benefit.setor === item.setor &&
              benefit.publico === item.publico,
          ) ||
          !Number.isSafeInteger(item.quantidade) ||
          item.quantidade < 0,
      )
    ) {
      this.error.set('Confira direito e quantidade das credenciais.');
      return;
    }
    this.saving.set(true);
    this.error.set('');
    try {
      await this.preview.update(this.url, this.rows());
      this.editing.set(false);
      this.api.notice.set('Credenciamento atualizado.');
    } catch {
      this.error.set(this.api.error());
    } finally {
      this.saving.set(false);
    }
  }
}
