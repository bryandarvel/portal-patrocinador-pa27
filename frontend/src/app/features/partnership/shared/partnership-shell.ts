import { Component, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PartnershipPreviewService } from './partnership-preview.service';
import { labelPartnershipDialog } from './modal-accessibility';

@Component({
  selector: 'app-partnership-shell',
  imports: [RouterLink, NzButtonModule, NzModalModule],
  templateUrl: './partnership-shell.html',
  styleUrls: ['./partnership-ui.css', './partnership-shell.css']
})
export class PartnershipShell {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly activeArea = input.required<'01' | '02' | '03' | '04' | '05' | '06' | '07' | 'deliveries' | 'delivery-detail' | 'faq'>();
  readonly pageUrl = input.required<string>();
  readonly preview = inject(PartnershipPreviewService);
  readonly partnership = this.preview.partnership;
  readonly dialog = signal<'notifications' | 'report' | null>(null);
  readonly areas = [
    { number: '01', label: 'Perfil do cliente', path: '/previa/perfil' },
    { number: '02', label: 'Aplicações de marca', path: '/previa/aplicacoes-de-marca' },
    { number: '03', label: 'Mídia e conteúdo', path: '/previa/midia-e-conteudo' },
    { number: '04', label: 'Cortesias', path: '/previa/cortesias' },
    { number: '05', label: 'Credenciamento', path: '/previa/credenciamento' },
    { number: '06', label: 'Pesquisa da ativação', path: '/previa/pesquisa-da-ativacao' },
    { number: '07', label: 'Contrato', path: '/previa/contrato' }
  ];

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'shell-dialog-title');
  }
}
