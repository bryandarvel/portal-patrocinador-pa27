import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';

@Component({
  selector: 'app-admin-partnership-shell',
  imports: [RouterLink, NzButtonModule, NzModalModule],
  templateUrl: './admin-partnership-shell.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/partnership-shell.css', './admin-partnership-shell.css']
})
export class AdminPartnershipShell {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly activeArea = input<'01' | '02'>('01');
  readonly pageUrl = computed(() => this.activeArea() === '02' ? '/previa/rbs/amarelo/aplicacoes-de-marca' : '/previa/rbs/amarelo/perfil');
  readonly profile = inject(RbsProfilePreviewService).profile;
  readonly preview = inject(PartnershipPreviewService);
  readonly dialog = signal<'notifications' | 'report' | null>(null);
  readonly areas = [
    { number: '01', label: 'Perfil do cliente', path: '/previa/rbs/amarelo/perfil' },
    { number: '02', label: 'Aplicações de marca', path: '/previa/rbs/amarelo/aplicacoes-de-marca' },
    { number: '03', label: 'Mídia e conteúdo', path: null },
    { number: '04', label: 'Cortesias', path: null },
    { number: '05', label: 'Credenciamento', path: null },
    { number: '06', label: 'Pesquisa da ativação', path: null },
    { number: '07', label: 'Contrato', path: null }
  ];

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'admin-shell-dialog-title');
  }
}
