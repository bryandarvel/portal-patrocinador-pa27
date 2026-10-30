import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PORTAL_AREAS, PortalContext } from '../../../core/portal-context.service';
import { AuthService } from '../../../core/session.service';
import { ApiStatus } from '../../../shared/api-status';
import { PortalHeader } from '../../../shared/portal-header';
import { registerPortalIcons } from '../../../shared/portal-icons';
import { labelPartnershipDialog } from './modal-accessibility';
import { PartnershipReport } from './partnership-report';

interface Notification {
  id: string;
  parceria_id: string;
  area: string;
  descricao: string;
  criado_em: string;
}

const AREA_ICONS: Record<string, string> = {
  perfil: 'user',
  marca: 'tag',
  midia: 'picture',
  cortesias: 'gift',
  credenciamento: 'idcard',
  pesquisa: 'bar-chart',
  contrato: 'file-text',
};

@Component({
  selector: 'app-partnership-shell',
  imports: [
    RouterLink,
    NgTemplateOutlet,
    NzAvatarModule,
    NzButtonModule,
    NzDrawerModule,
    NzIconModule,
    NzModalModule,
    NzTagModule,
    DatePipe,
    PartnershipReport,
    ApiStatus,
    PortalHeader,
  ],
  templateUrl: './partnership-shell.html',
  styleUrls: ['./partnership-ui.css', './partnership-shell.css'],
  styles: `
    .api-notifications {
      list-style: none;
      padding: 0;
    }
    .api-notifications li {
      padding: 16px 0;
      border-bottom: 1px solid #ddd;
    }
  `,
})
export class PartnershipShell {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
  readonly activeArea = input<string>('01');
  readonly pageUrl = input('');
  readonly logoSrc = input('/images/pa27-logo.png');
  readonly context = inject(PortalContext);
  readonly auth = inject(AuthService);
  readonly api = inject(PortalApi);
  readonly router = inject(Router);
  private readonly http = inject(HttpClient);
  constructor() {
    registerPortalIcons();
    // Consulta silenciosa: PortalApi limparia a mensagem de erro exibida pela página.
    effect(() => {
      const id = this.context.id();
      if (!id) return;
      this.http.get<Notification[]>('/api/notificacoes').subscribe({
        next: (values) => this.hasNotifications.set(values.some((v) => v.parceria_id === id)),
        error: () => this.hasNotifications.set(false),
      });
    });
  }
  readonly profile = this.context.partnership;
  readonly user = this.context.session.user;
  readonly areas = computed(() => [
    ...PORTAL_AREAS.filter((area) => this.context.enabled(area.key)).map((area) => ({
      key: area.key,
      number: area.number,
      label: area.label,
      icon: AREA_ICONS[area.key],
      active: area.number as string,
      url: this.context.link(area.path),
    })),
    {
      key: 'entregas',
      number: '08',
      label: 'Entregas da parceria',
      icon: 'carry-out',
      active: 'deliveries',
      url: this.context.link('entregas'),
    },
  ]);
  readonly menuOpen = signal(false);
  readonly hasNotifications = signal(false);
  readonly dialog = signal<'notifications' | null>(null);
  readonly reportOpen = signal(false);
  readonly notifications = signal<Notification[]>([]);
  async openNotifications(): Promise<void> {
    this.notifications.set([]);
    this.dialog.set('notifications');
    try {
      const values = await this.api.get<Notification[]>('/api/notificacoes');
      this.notifications.set(values.filter((value) => value.parceria_id === this.context.id()));
    } catch {}
  }
  notificationLink(area: string): string {
    return this.context.link(PORTAL_AREAS.find((item) => item.key === area)?.path ?? 'perfil');
  }
  openReport(): void {
    this.menuOpen.set(false);
    this.reportOpen.set(true);
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'shell-dialog-title');
  }
}
