import { DatePipe, DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import {
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
  TemplateRef,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzDrawerModule, NzDrawerRef, NzDrawerService } from 'ng-zorro-antd/drawer';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { apiError, PortalApi } from '../../../core/portal-api.service';
import { PORTAL_AREAS, PortalContext } from '../../../core/portal-context.service';
import { AuthService } from '../../../core/session.service';
import { ApiStatus } from '../../../shared/api-status';
import { DemoPa27Brand, demoBrand } from '../../../shared/demo-pa27-brand';
import { PortalHeader } from '../../../shared/portal-header';
import { registerPortalIcons } from '../../../shared/portal-icons';
import { PartnershipReport } from './partnership-report';

interface Notification {
  id: string;
  parceria_id: string;
  area: string;
  descricao: string;
  criado_em: string;
}

const notificationDayFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' });

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
    NzButtonModule,
    NzDrawerModule,
    NzIconModule,
    NzTagModule,
    DatePipe,
    PartnershipReport,
    ApiStatus,
    PortalHeader,
    DemoPa27Brand,
  ],
  templateUrl: './partnership-shell.html',
  styleUrls: ['./partnership-ui.css', './partnership-shell.css', './partnership-notifications.css'],
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
  private readonly document = inject(DOCUMENT);
  private readonly drawerService = inject(NzDrawerService);
  private notificationsDrawer?: NzDrawerRef;
  private notificationsClosing = false;
  constructor() {
    registerPortalIcons();
    inject(DestroyRef).onDestroy(() => this.closeNotifications());
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
  readonly demoBrand = computed(() => {
    const profile = this.profile();
    return profile ? demoBrand(profile.id, profile.nome, profile.edicao) : undefined;
  });
  readonly areas = computed(() => {
    const areas = [
      ...PORTAL_AREAS.filter((area) => area.key !== 'perfil' && this.context.enabled(area.key)).map(
        (area) => ({
          key: area.key,
          number: area.number,
          label: area.label,
          icon: AREA_ICONS[area.key],
          active: area.number as string,
          url: this.context.link(area.path),
        }),
      ),
      {
        key: 'entregas',
        number: '08',
        label: 'Entregas da parceria',
        icon: 'carry-out',
        active: 'deliveries',
        url: this.context.link('entregas'),
      },
    ];
    return areas.map((area, index) => ({
      ...area,
      number: String(index + 1).padStart(2, '0'),
    }));
  });
  readonly menuOpen = signal(false);
  readonly hasNotifications = signal(false);
  readonly reportOpen = signal(false);
  readonly notifications = signal<Notification[]>([]);
  readonly notificationGroups = computed(() => {
    const groups = new Map<string, Notification[]>();
    for (const notification of this.notifications()) {
      const date = new Date(notification.criado_em);
      const day = Number.isNaN(date.getTime())
        ? 'Data não informada'
        : notificationDayFormat.format(date);
      const items = groups.get(day);
      if (items) items.push(notification);
      else groups.set(day, [notification]);
    }
    return Array.from(groups, ([day, items]) => ({ day, items }));
  });
  readonly notificationsLoading = signal(false);
  readonly notificationsError = signal('');
  openNotifications(content: TemplateRef<{ $implicit: unknown; drawerRef: NzDrawerRef }>): void {
    if (this.notificationsDrawer) return;
    const drawer = this.drawerService.create<object, unknown>({
      nzContent: content,
      nzPlacement: 'right',
      nzWidth: 'min(440px, 100vw)',
      nzClosable: false,
      nzBodyStyle: { padding: '0', display: 'flex', overflow: 'hidden' },
      nzWrapClassName: 'pa-notifications-drawer',
      nzNoAnimation:
        this.document.defaultView?.matchMedia('(prefers-reduced-motion: reduce)').matches ?? false,
      nzOnCancel: async () => {
        this.closeNotifications();
        return false;
      },
    });
    this.notificationsDrawer = drawer;
    drawer.afterClose.subscribe(() => {
      this.notificationsDrawer = undefined;
      this.notificationsClosing = false;
    });
    void this.loadNotifications();
  }
  closeNotifications(): void {
    if (!this.notificationsDrawer || this.notificationsClosing) return;
    this.notificationsClosing = true;
    this.notificationsDrawer.close();
  }
  async loadNotifications(): Promise<void> {
    if (this.notificationsLoading()) return;
    this.notifications.set([]);
    this.notificationsError.set('');
    this.notificationsLoading.set(true);
    try {
      const values = await this.api.get<Notification[]>('/api/notificacoes');
      this.notifications.set(values.filter((value) => value.parceria_id === this.context.id()));
    } catch (error) {
      this.notificationsError.set(apiError(error));
    } finally {
      this.notificationsLoading.set(false);
    }
  }
  notificationArea(area: string) {
    const match = PORTAL_AREAS.find((item) => item.key === area);
    return match ? { label: match.label, icon: AREA_ICONS[match.key], path: match.path } : null;
  }
  openReport(): void {
    this.menuOpen.set(false);
    this.reportOpen.set(true);
  }
}
