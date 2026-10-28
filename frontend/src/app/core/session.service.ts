import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { PortalApi } from './portal-api.service';

export interface PortalUser {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN_RBS' | 'ADMIN_PATROCINADOR';
  parcerias: string[];
  mfaEnabled?: boolean;
}
export interface LoginResult {
  status: 'AUTHENTICATED' | 'MFA_REQUIRED';
  token: string | null;
  challenge: string | null;
}

@Injectable({ providedIn: 'root' })
export class SessionStore {
  readonly token = signal<string | null>(sessionStorage.getItem('portal.access'));
  readonly user = signal<PortalUser | null>(null);
  readonly isAdmin = computed(() => this.user()?.role === 'ADMIN_RBS');
  save(token: string): void {
    this.token.set(token);
    sessionStorage.setItem('portal.access', token);
  }
  clear(): void {
    this.token.set(null);
    this.user.set(null);
    sessionStorage.removeItem('portal.access');
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly session = inject(SessionStore);
  private readonly api = inject(PortalApi);
  private readonly router = inject(Router);
  private restoring: Promise<PortalUser | null> | null = null;
  readonly challenge = signal<string | null>(null);

  async restore(): Promise<PortalUser | null> {
    if (this.session.user()) return this.session.user();
    if (!this.session.token()) return null;
    const token = this.session.token();
    if (!this.restoring)
      this.restoring = this.api
        .get<PortalUser>('/api/auth/me')
        .then((user) => {
          if (this.session.token() !== token) return null;
          this.session.user.set(user);
          return user;
        })
        .catch(() => {
          if (this.session.token() === token) this.session.clear();
          return null;
        })
        .finally(() => (this.restoring = null));
    return this.restoring;
  }
  async login(email: string, senha: string): Promise<LoginResult> {
    this.session.clear();
    const result = await this.api.post<LoginResult>('/api/auth/login', { email, senha });
    this.challenge.set(result.challenge);
    if (result.token) await this.accept(result.token);
    return result;
  }
  async validateMfa(codigo: string): Promise<void> {
    const response = await this.api.post<{ token: string }>('/api/auth/validar-mfa', {
      challenge: this.challenge(),
      codigo,
    });
    await this.accept(response.token);
    this.challenge.set(null);
  }
  private async accept(token: string): Promise<void> {
    this.session.save(token);
    await this.api
      .get<PortalUser>('/api/auth/me')
      .then((user) => this.session.user.set(user))
      .catch((error) => {
        this.session.clear();
        throw error;
      });
  }
  home(): string {
    const user = this.session.user();
    return user?.role === 'ADMIN_RBS'
      ? '/rbs/patrocinadores'
      : user?.parcerias.length === 1
        ? `/parcerias/${user.parcerias[0]}/perfil`
        : '/parcerias';
  }
  logout(): void {
    this.session.clear();
    this.challenge.set(null);
    this.api.clearFeedback();
    void this.router.navigateByUrl('/login');
  }
}

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const session = inject(SessionStore);
  const router = inject(Router);
  const local = request.url.startsWith('/api/');
  const token = session.token();
  const outgoing =
    local && token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(outgoing).pipe(
    catchError((error: unknown) => {
      if (
        local &&
        token &&
        session.token() === token &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        !['/api/auth/login', '/api/auth/validar-mfa'].includes(request.url)
      ) {
        session.clear();
        void router.navigate(['/login'], { queryParams: { sessao: 'expirada' } });
      }
      return throwError(() => error);
    }),
  );
};
