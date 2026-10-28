import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PartnershipShell } from '../shared/partnership-shell';
import { ContractPreviewService, Signatario } from './contract-preview.service';

@Component({
  selector: 'app-partnership-contract',
  imports: [PartnershipShell, FormsModule, DatePipe, NzButtonModule, NzModalModule],
  templateUrl: './contract.html',
  styleUrls: ['../shared/partnership-ui.css', '../shared/material-ui.css', './contract.css'],
})
export class PartnershipContract {
  readonly preview = inject(ContractPreviewService);
  readonly api = inject(PortalApi);
  readonly dialog = signal<'history' | 'approve' | 'adjust' | 'signatories' | 'saved' | null>(null);
  readonly signatories = signal<Signatario[]>([{ nome: '', email: '', cargo: '' }]);
  readonly comment = signal('');
  readonly localError = signal('');
  readonly title = computed(
    () =>
      ({
        history: 'Histórico do contrato',
        approve: 'Aprovar contrato',
        adjust: 'Solicitar ajustes',
        signatories: 'Quem assina',
        saved: 'Alterações salvas',
      })[this.dialog() ?? 'history'],
  );
  openSignatories(): void {
    this.signatories.set(
      this.preview.signatories().length
        ? this.preview.signatories().map(({ nome, email, cargo }) => ({ nome, email, cargo }))
        : [{ nome: '', email: '', cargo: '' }],
    );
    this.dialog.set('signatories');
  }
  addSignatory(): void {
    this.signatories.update((items) => [...items, { nome: '', email: '', cargo: '' }]);
  }
  removeSignatory(index: number): void {
    this.signatories.update((items) => items.filter((_, i) => i !== index));
  }
  async saveSignatories(): Promise<void> {
    const items = this.signatories().map((s) => ({
      nome: s.nome.trim(),
      email: s.email.trim(),
      cargo: s.cargo.trim(),
    }));
    if (!items.length || items.some((s) => !s.nome || !s.email || !s.cargo)) {
      this.localError.set('Informe nome, e-mail e cargo de ao menos um signatário.');
      return;
    }
    try {
      await this.preview.saveSignatories(items);
      this.dialog.set('saved');
      this.localError.set('');
    } catch {}
  }
  async decide(kind: 'APROVADO' | 'AJUSTES'): Promise<void> {
    if (kind === 'AJUSTES' && !this.comment().trim()) {
      this.localError.set('Descreva o ajuste solicitado.');
      return;
    }
    try {
      await this.preview.decide(kind, this.comment().trim());
      this.dialog.set('saved');
      this.comment.set('');
      this.localError.set('');
    } catch {}
  }
  async download(id: string, name: string): Promise<void> {
    try {
      await this.preview.download(id, name);
    } catch {}
  }
}
