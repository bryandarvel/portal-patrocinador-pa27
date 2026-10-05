import { DOCUMENT } from '@angular/common';
import { afterNextRender, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { EyeInvisibleOutline, EyeOutline, ArrowRightOutline } from '@ant-design/icons-angular/icons';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzIconModule, provideNzIconsPatch } from 'ng-zorro-antd/icon';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, NzAlertModule, NzButtonModule, NzFormModule, NzIconModule, NzInputModule],
  providers: [provideNzIconsPatch([EyeOutline, EyeInvisibleOutline, ArrowRightOutline])],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  readonly slides = [
    { image: '/images/pa27-festival.jpg', title: 'Só quem vai sente.', caption: 'Sua marca também vive o Planeta.' },
    { image: '/images/pa27-experiencia.jpg', title: 'Sua marca faz parte.', caption: 'Experiências que aproximam marcas e planetários.' },
    { image: '/images/pa27-publico.jpg', title: 'Encontros que ficam.', caption: 'Conexões que continuam além do festival.' }
  ];
  readonly activeSlide = signal(0);
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
    effect(onCleanup => {
      if (this.hidden() || this.reducedMotion() || this.hovered() || this.focused()) return;
      const timer = setInterval(() => this.activeSlide.update(index => (index + 1) % this.slides.length), 3000);
      onCleanup(() => clearInterval(timer));
    });
  }

  selectSlide(index: number): void {
    this.activeSlide.set(index);
  }

  leaveCarousel(event: FocusEvent): void {
    this.focused.set((event.currentTarget as HTMLElement).contains(event.relatedTarget as Node | null));
  }

  readonly passwordVisible = signal(false);
  readonly submitted = signal(false);
  readonly validated = signal(false);
  readonly form = inject(FormBuilder).nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  showError(field: 'email' | 'password'): boolean {
    const control = this.form.controls[field];
    return control.invalid && (control.touched || this.submitted());
  }

  submit(): void {
    this.form.markAllAsTouched();
    this.submitted.set(true);
    this.validated.set(this.form.valid);
  }
}
