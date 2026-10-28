import { DatePipe } from '@angular/common';
import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PORTAL_AREAS, PortalContext } from '../../../core/portal-context.service';
import { AuthService } from '../../../core/session.service';
import { ApiStatus } from '../../../shared/api-status';
import { labelPartnershipDialog } from './modal-accessibility';
import { PartnershipReport } from './partnership-report';

interface Notification {
  id: string;
  parceria_id: string;
  area: string;
  descricao: string;
  criado_em: string;
}

@Component({
  selector: 'app-partnership-shell',
  imports: [RouterLink, NzButtonModule, NzModalModule, DatePipe, PartnershipReport, ApiStatus],
  templateUrl: './partnership-shell.html',
  styleUrls: ['./partnership-ui.css', './partnership-shell.css'],
  styles: `
    .account a {
      color: inherit;
      text-decoration: underline;
    }
    .api-notifications {
      list-style: none;
      padding: 0;
    }
    .api-notifications li {
      padding: 16px 0;
      border-bottom: 1px solid #ddd;
    }
    .context-row p {
      overflow-wrap: anywhere;
    }
    .partnership-identity p {
      overflow-wrap: anywhere;
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
  readonly profile = this.context.partnership;
  readonly user = this.context.session.user;
  readonly areas = computed(() =>
    PORTAL_AREAS.filter((area) => this.context.enabled(area.key)).map((area) => ({
      ...area,
      url: this.context.link(area.path),
    })),
  );
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
    this.reportOpen.set(true);
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'shell-dialog-title');
  }
}
