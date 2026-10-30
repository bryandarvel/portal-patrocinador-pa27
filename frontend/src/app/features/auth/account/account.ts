import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AuthService, SessionStore } from '../../../core/session.service';
import { PortalApi } from '../../../core/portal-api.service';
import { ApiStatus } from '../../../shared/api-status';
import { PortalHeader } from '../../../shared/portal-header';

// Telas avulsas da conta: mesmo cabeçalho e cartão do portal (tokens em src/styles.less).
const accountStyles = `:host{display:flex;flex-direction:column;min-height:100svh;background:var(--color-paper);color:var(--color-text)}main{width:min(680px,calc(100% - 32px));margin:clamp(24px,6vw,64px) auto;padding:clamp(20px,4vw,36px);border:1px solid var(--color-border);border-radius:var(--radius-card);background:var(--color-surface);box-shadow:var(--shadow-card)}h1{margin:0 0 24px;font-family:var(--font-display);font-size:clamp(36px,5vw,48px);line-height:1.05;font-weight:700;text-transform:uppercase}h2{margin:32px 0 8px;font-family:var(--font-display);font-size:28px;line-height:32px;font-weight:700}p{color:var(--color-muted);font-size:15px;line-height:22px}input{display:block;margin:12px 0 24px;max-width:440px}.ant-btn{height:48px;margin:8px 12px 8px 0;padding:0 22px;border-radius:999px;font-weight:500}a.ant-btn{display:inline-flex;align-items:center}img{max-width:240px;width:100%;height:auto}code{display:block;overflow-wrap:anywhere;padding:12px;border-radius:8px;background:var(--color-paper)}label{display:block}:focus-visible{outline:2px solid var(--color-focus);outline-offset:3px}`;

@Component({
  imports: [NzButtonModule, ApiStatus],
  template: `<main>
    <h1>Ativação da conta</h1>
    <app-api-status />
    <p role="status">{{ message() }}</p>
    <button nz-button nzType="primary" type="button" (click)="auth.logout()">
      Ir para o login
    </button>
  </main>`,
  styles: accountStyles,
})
export class VerifyAccount {
  readonly auth = inject(AuthService);
  private readonly api = inject(PortalApi);
  readonly message = signal('Validando o link de ativação…');
  constructor() {
    const token = inject(ActivatedRoute).snapshot.queryParamMap.get('token');
    if (!token) {
      this.message.set(
        'O link não contém o token de ativação. Use o endereço recebido por e-mail.',
      );
      return;
    }
    void this.api
      .get(`/api/auth/verificar?token=${encodeURIComponent(token)}`)
      .then(() => this.message.set('Sua conta foi ativada. Entre com seu e-mail e senha.'))
      .catch(() =>
        this.message.set(
          'Não foi possível ativar a conta. O link pode ter expirado ou já ter sido utilizado.',
        ),
      );
  }
}

@Component({
  imports: [
    RouterLink,
    NzButtonModule,
    NzInputModule,
    ReactiveFormsModule,
    ApiStatus,
    PortalHeader,
  ],
  template: `<app-portal-header />
    <main>
      <h1>Minha conta</h1>
      <app-api-status />
      <p>{{ session.user()?.nome }}</p>
      <p>{{ session.user()?.email }}</p>
      <h2>Autenticação em duas etapas</h2>
      @if (!configured()) {
        <p>Associe sua conta a um aplicativo autenticador.</p>
        <button nz-button type="button" [disabled]="api.pending() > 0" (click)="setup()">
          Configurar autenticador
        </button>
      }
      @if (qr()) {
        <img [src]="qr()" alt="QR Code para configurar seu autenticador" /><label
          >Chave para configuração manual</label
        ><code>{{ secret() }}</code>
        <form (submit)="$event.preventDefault(); confirm()">
          <label for="account-otp">Código do autenticador</label
          ><input
            nz-input
            id="account-otp"
            [formControl]="code"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
          /><button
            nz-button
            nzType="primary"
            type="submit"
            [disabled]="api.pending() > 0 || code.invalid"
          >
            Ativar autenticação em duas etapas
          </button>
        </form>
      }
      @if (configured()) {
        <p role="status">Autenticação em duas etapas configurada.</p>
      }
      <p>
        <a nz-button [routerLink]="auth.home()">Voltar ao portal</a
        ><button nz-button type="button" (click)="auth.logout()">Sair</button>
      </p>
    </main>`,
  styles: accountStyles,
})
export class Account {
  readonly api = inject(PortalApi);
  readonly auth = inject(AuthService);
  readonly session = inject(SessionStore);
  readonly qr = signal('');
  readonly secret = signal('');
  readonly configured = signal(!!this.session.user()?.mfaEnabled);
  readonly code = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.pattern(/^\d{6}$/)],
  });
  async setup(): Promise<void> {
    try {
      const value = await this.api.post<{ qrCode: string; secret: string }>(
        `/api/mfa/setup/${encodeURIComponent(this.session.user()!.email)}`,
      );
      this.qr.set(value.qrCode);
      this.secret.set(value.secret);
    } catch {}
  }
  async confirm(): Promise<void> {
    if (this.code.invalid || this.api.pending()) return;
    try {
      await this.api.post(`/api/mfa/confirm/${encodeURIComponent(this.session.user()!.email)}`, {
        code: this.code.value,
      });
      this.configured.set(true);
      this.session.user.update((user) => (user ? { ...user, mfaEnabled: true } : user));
      this.qr.set('');
      this.secret.set('');
      this.code.reset();
    } catch {}
  }
}

@Component({
  imports: [RouterLink, NzButtonModule, ApiStatus, PortalHeader],
  template: `<app-portal-header />
    <main>
      <h1>{{ retry ? 'Não foi possível carregar a parceria' : 'Acesso indisponível' }}</h1>
      <app-api-status />
      @if (retry) {
        <p>A conexão com o servidor falhou. Tente carregar esta página novamente.</p>
        <a nz-button [routerLink]="retry">Tentar novamente</a>
      } @else {
        <p>
          Esta área não está disponível para sua conta ou parceria. Selecione uma parceria
          autorizada ou entre novamente.
        </p>
      }
      <a nz-button [routerLink]="auth.home()">Selecionar parceria</a
      ><button nz-button type="button" (click)="auth.logout()">Ir para o login</button>
    </main>`,
  styles: accountStyles,
})
export class AccessUnavailable {
  readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  get retry(): string | null {
    const retorno = this.route.snapshot.queryParamMap.get('retorno');
    return retorno?.startsWith('/') && !retorno.startsWith('//') ? retorno : null;
  }
}
