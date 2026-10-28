import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  EyeInvisibleOutline,
  EyeOutline,
  PauseOutline,
  CaretRightOutline,
} from '@ant-design/icons-angular/icons';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule, provideNzIconsPatch } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/session.service';
import { PortalApi, apiError } from '../../../core/portal-api.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    NzButtonModule,
    NzFormModule,
    NzIconModule,
    NzInputModule,
    NzModalModule,
  ],
  providers: [
    provideNzIconsPatch([EyeOutline, EyeInvisibleOutline, PauseOutline, CaretRightOutline]),
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  readonly auth = inject(AuthService);
  readonly api = inject(PortalApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly authError = signal('');
  readonly busy = signal(false);
  readonly otp = inject(FormBuilder).nonNullable.control('', [
    Validators.required,
    Validators.pattern(/^\d{6}$/),
  ]);
  readonly slides = [
    { image: '/images/pa27-festival.jpg', title: 'Só quem\nvai sente.' },
    { image: '/images/pa27-experiencia.jpg', title: 'Sua marca\nfaz parte.' },
    { image: '/images/pa27-publico.jpg', title: 'Encontros\nque ficam.' },
  ];
  readonly activeSlide = signal(0);
  readonly paused = signal(false);
  readonly hovered = signal(false);
  readonly focused = signal(false);
  readonly reducedMotion = signal(true);
  readonly hidden = signal(true);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    afterNextRender(() => {
      const motion = this.document.defaultView!.matchMedia('(prefers-reduced-motion: reduce)');
      const updateMotion = () => this.reducedMotion.set(motion.matches);
      const updateVisibility = () => this.hidden.set(this.document.hidden);
      updateMotion();
      updateVisibility();
      motion.addEventListener('change', updateMotion);
      this.document.addEventListener('visibilitychange', updateVisibility);
      this.destroyRef.onDestroy(() => {
        motion.removeEventListener('change', updateMotion);
        this.document.removeEventListener('visibilitychange', updateVisibility);
      });
    });
    effect((onCleanup) => {
      if (
        this.paused() ||
        this.hidden() ||
        this.reducedMotion() ||
        this.hovered() ||
        this.focused() ||
        this.helpOpen()
      )
        return;
      const timer = setInterval(
        () => this.activeSlide.update((index) => (index + 1) % this.slides.length),
        3000,
      );
      onCleanup(() => clearInterval(timer));
    });
  }

  selectSlide(index: number): void {
    this.activeSlide.set(index);
  }

  leaveCarousel(event: FocusEvent): void {
    this.focused.set(
      (event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null),
    );
  }

  labelHelpDialog(modal: NzModalComponent): void {
    // NG-ZORRO 22 não expõe inputs para o nome acessível do container e do botão de fechar.
    const dialog = modal.getElement()?.closest<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    dialog.setAttribute('aria-labelledby', 'login-help-title');
    dialog.setAttribute('aria-modal', 'true');
    dialog.querySelector('.ant-modal-close')?.setAttribute('aria-label', 'Fechar orientações');
    dialog.querySelector<HTMLElement>('#login-help-title')?.focus();
  }

  readonly passwordVisible = signal(false);
  readonly helpOpen = signal(false);
  readonly submitted = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  async submit(): Promise<void> {
    if (this.busy()) return;
    this.form.markAllAsTouched();
    this.submitted.set(true);
    if (this.form.invalid) return;
    this.busy.set(true);
    this.authError.set('');
    try {
      const result = await this.auth.login(
        this.form.controls.email.value,
        this.form.controls.password.value,
      );
      this.form.controls.password.reset();
      if (result.status === 'AUTHENTICATED') await this.openPortal();
    } catch (error) {
      this.authError.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }

  async sendMfa(): Promise<void> {
    this.otp.markAsTouched();
    if (this.otp.invalid || this.busy()) return;
    this.busy.set(true);
    this.authError.set('');
    try {
      await this.auth.validateMfa(this.otp.value);
      await this.openPortal();
    } catch (error) {
      this.authError.set(apiError(error));
    } finally {
      this.busy.set(false);
    }
  }

  private async openPortal(): Promise<void> {
    const retorno = this.route.snapshot.queryParamMap.get('retorno');
    await this.router.navigateByUrl(
      retorno?.startsWith('/') && !retorno.startsWith('//') && !retorno.startsWith('/login')
        ? retorno
        : this.auth.home(),
    );
  }
}
