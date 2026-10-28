import { Component, computed, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import { PartnershipPreviewService } from '../../partnership/shared/partnership-preview.service';
import { RbsProfilePreviewService } from '../profile/profile-preview.service';
import { PartnershipReport } from '../../partnership/shared/partnership-report';
import { AdminSponsorId, CLIENT_NAMES, ClientPreviewService } from './client-preview.service';
import { ClientReportSummary } from '../report/client-report-summary';

@Component({
  selector: 'app-admin-partnership-shell',
  imports: [RouterLink, NzButtonModule, NzModalModule, PartnershipReport, ClientReportSummary],
  templateUrl: './admin-partnership-shell.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', '../../partnership/shared/partnership-shell.css', './admin-partnership-shell.css']
})
export class AdminPartnershipShell {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly logoSrc = input('/images/pa27-logo.png');
  readonly sponsorId = input<AdminSponsorId>('amarelo');
  readonly activeArea = input<'01' | '02' | '03' | '04' | '05' | '06' | '07' | 'deliveries' | 'delivery-detail' | 'faq' | 'report'>('01');
  readonly pageUrl = computed(() => {
    switch (this.activeArea()) {
      case 'report': return this.baseUrl() + '/relatorio-da-parceria';
      case 'faq': return this.baseUrl() + '/duvidas-frequentes';
      case 'delivery-detail': return this.baseUrl() + '/entregas/logo-no-telao';
      case 'deliveries': return this.baseUrl() + '/entregas';
      default: return this.areas().find(area => area.number === this.activeArea())?.path ?? this.baseUrl() + '/perfil';
    }
  });
  private readonly amareloProfile = inject(RbsProfilePreviewService).profile;
  private readonly clients = inject(ClientPreviewService);
  readonly baseUrl = computed(() => `/previa/rbs/${this.sponsorId()}`);
  readonly profile = computed(() => { const id = this.sponsorId(); return id === 'amarelo' ? this.amareloProfile() : this.clients.profile(id); });
  readonly quotaLabel = computed(() => this.sponsorId() === 'amarelo' ? `Cota ${this.profile().quota}` : this.profile().quota);
  readonly contextLabel = computed(() => { const id = this.sponsorId(); return id === 'amarelo' ? 'Amarelo' : CLIENT_NAMES[id]; });
  readonly preview = inject(PartnershipPreviewService);
  readonly dialog = signal<'notifications' | null>(null);
  readonly reportOpen = signal(false);
  private readonly amareloAreas = [
    { number: '01', label: 'Perfil do cliente', path: '/previa/rbs/amarelo/perfil' },
    { number: '02', label: 'Aplicações de marca', path: '/previa/rbs/amarelo/aplicacoes-de-marca' },
    { number: '03', label: 'Mídia e conteúdo', path: '/previa/rbs/amarelo/midia-e-conteudo' },
    { number: '04', label: 'Cortesias', path: '/previa/rbs/amarelo/cortesias' },
    { number: '05', label: 'Credenciamento', path: '/previa/rbs/amarelo/credenciamento' },
    { number: '06', label: 'Pesquisa da ativação', path: '/previa/rbs/amarelo/pesquisa-da-ativacao' },
    { number: '07', label: 'Contrato', path: '/previa/rbs/amarelo/contrato' }
  ];
  readonly areas = computed(() => this.amareloAreas.map(area => ({
    ...area,
    path: area.path.replace('/amarelo/', `/${this.sponsorId()}/`),
  })));

  openReport(): void {
    this.reportOpen.set(true);
  }

  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'admin-shell-dialog-title');
  }
}
