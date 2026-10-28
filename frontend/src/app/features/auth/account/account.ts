import { Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { AuthService, SessionStore } from '../../../core/session.service';
import { PortalApi } from '../../../core/portal-api.service';
import { ApiStatus } from '../../../shared/api-status';

const accountStyles = `:host{display:block;min-height:100svh;background:var(--color-surface,#fff);padding:clamp(24px,6vw,80px)}main{max-width:680px;margin:auto}h1{margin-bottom:24px}input{display:block;margin:12px 0 24px;max-width:440px}button,a{margin:8px 12px 8px 0}img{max-width:240px;width:100%;height:auto}code{display:block;overflow-wrap:anywhere;padding:12px;background:#f3f3f3}label{display:block}`;

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
  imports: [RouterLink, NzButtonModule, NzInputModule, ReactiveFormsModule, ApiStatus],
  template: `<main>
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
  imports: [RouterLink, NzButtonModule, ApiStatus],
  template: `<main>
    <h1>{{ retry ? 'Não foi possível carregar a parceria' : 'Acesso indisponível' }}</h1>
    <app-api-status />
    @if (retry) {
      <p>A conexão com o servidor falhou. Tente carregar esta página novamente.</p>
      <a nz-button [routerLink]="retry">Tentar novamente</a>
    } @else {
      <p>
        Esta área não está disponível para sua conta ou parceria. Selecione uma parceria autorizada
        ou entre novamente.
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
