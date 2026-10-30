import { Component, inject, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { AuthService, SessionStore } from '../core/session.service';
import { registerPortalIcons } from './portal-icons';

/**
 * Cabeçalho único do portal autenticado. No layout da parceria mostra menu e notificações;
 * nas demais telas mostra a conta conectada e a saída.
 */
@Component({
  selector: 'app-portal-header',
  imports: [RouterLink, NzBadgeModule, NzIconModule],
  template: `
    <header class="portal-header">
      @if (menu()) {
        <button
          class="icon-button menu-button"
          type="button"
          aria-label="Abrir navegação da parceria"
          (click)="menuClick.emit()"
        >
          <nz-icon nzType="menu" />
        </button>
      }
      <img
        class="portal-logo"
        src="/images/pa27-logo.png"
        alt="Planeta Atlântida"
        width="72"
        height="72"
      />
      <div class="portal-brand">
        <p>Portal do Patrocinador</p>
        <span>{{ subtitle() }}</span>
      </div>
      <div class="header-end">
        @if (notifications() !== null) {
          <button
            class="icon-button"
            type="button"
            [attr.aria-label]="notifications() ? 'Notificações, há atualizações' : 'Notificações'"
            (click)="notificationsClick.emit()"
          >
            <nz-badge [nzDot]="!!notifications()"><nz-icon nzType="bell" /></nz-badge>
          </button>
        } @else if (session.user()) {
          <a class="account-link" routerLink="/conta"
            ><nz-icon nzType="user" aria-hidden="true" /><span
              >{{ session.user()?.nome }} ·
              {{ session.isAdmin() ? 'Admin RBS' : 'Patrocinador' }}</span
            ></a
          >
          <button class="header-pill" type="button" (click)="auth.logout()">
            <nz-icon nzType="logout" aria-hidden="true" />Sair
          </button>
        }
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      flex: 0 0 auto;
    }
    /* Marinho com as manchas de luz azul e magenta da identidade PA27. */
    .portal-header {
      height: 92px;
      padding: 10px 28px;
      display: flex;
      align-items: center;
      gap: 28px;
      color: #fff;
      overflow: hidden;
      background:
        radial-gradient(22% 150% at 99% 0%, #c0138c 0, #c0138c00 100%),
        radial-gradient(30% 170% at 83% -10%, #2f6df2 0, #2f6df200 100%),
        radial-gradient(26% 130% at 70% 120%, #1c46b8 0, #1c46b800 100%),
        linear-gradient(90deg, #0a1326 0, #0d1a38 45%, #112a62 100%);
    }
    .portal-logo {
      width: 72px;
      height: 72px;
      flex: 0 0 auto;
      object-fit: contain;
    }
    .portal-brand {
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .portal-brand p {
      margin: 0;
      font-size: 25px;
      line-height: 30px;
      font-weight: 700;
      letter-spacing: 0.01em;
      text-transform: uppercase;
    }
    .portal-brand span {
      color: #ff4fa3;
      font-size: 14px;
      line-height: 18px;
      font-weight: 700;
      letter-spacing: 0.14em;
      text-transform: uppercase;
    }
    .header-end {
      margin-left: auto;
      display: flex;
      align-items: center;
      gap: 20px;
    }
    .icon-button,
    .header-pill {
      border: 1px solid #ffffff3d;
      background: #ffffff0f;
      color: #fff;
      cursor: pointer;
      transition: background-color 0.2s cubic-bezier(0.16, 1, 0.3, 1);
    }
    .icon-button:hover,
    .header-pill:hover {
      background: #ffffff24;
    }
    .icon-button {
      width: 56px;
      height: 56px;
      flex: 0 0 56px;
      display: grid;
      place-items: center;
      border-radius: 50%;
      font-size: 24px;
    }
    .icon-button nz-badge {
      color: inherit;
      font-size: inherit;
    }
    .icon-button ::ng-deep .ant-badge-dot {
      width: 10px;
      min-width: 10px;
      height: 10px;
      background: #ff3d8f;
      box-shadow: 0 0 0 2px #0f1d3f;
    }
    .menu-button {
      display: none;
    }
    .account-link {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      color: #fff;
      font-size: 15px;
      line-height: 20px;
      font-weight: 500;
      text-decoration: underline;
      text-underline-offset: 4px;
    }
    .account-link:hover {
      color: #fff;
    }
    .header-pill {
      height: 44px;
      padding: 0 18px;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      border-radius: 999px;
      font: 500 15px/20px var(--font-body);
    }
    :focus-visible {
      outline: 2px solid #fff;
      outline-offset: 3px;
    }
    @media (max-width: 959px) {
      .portal-header {
        height: 72px;
        padding: 8px 16px;
        gap: 14px;
      }
      .menu-button {
        display: grid;
      }
      .icon-button {
        width: 44px;
        height: 44px;
        flex-basis: 44px;
        font-size: 20px;
      }
      .portal-logo {
        width: 48px;
        height: 48px;
      }
      .portal-brand p {
        font-size: 16px;
        line-height: 20px;
      }
      .portal-brand span {
        font-size: 10px;
        line-height: 14px;
        letter-spacing: 0.1em;
      }
      .account-link {
        min-width: 44px;
        min-height: 44px;
        justify-content: center;
      }
      .account-link span {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      .header-end {
        gap: 10px;
      }
    }
    @media (max-width: 420px) {
      .portal-brand span {
        display: none;
      }
    }
  `,
})
export class PortalHeader {
  readonly auth = inject(AuthService);
  readonly session = inject(SessionStore);
  readonly subtitle = input('Planeta Atlântida 2027');
  /** Mostra o botão que abre a navegação da parceria em telas estreitas. */
  readonly menu = input(false);
  /** `null` troca o sino pela conta e saída; `true` mostra o ponto de atualização. */
  readonly notifications = input<boolean | null>(null);
  readonly menuClick = output();
  readonly notificationsClick = output();
  constructor() {
    registerPortalIcons();
  }
}
