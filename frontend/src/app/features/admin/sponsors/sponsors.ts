import { Component, computed, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalComponent, NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { PORTAL_AREAS } from '../../../core/portal-context.service';
import { AuthService, SessionStore } from '../../../core/session.service';
import { labelPartnershipDialog } from '../../partnership/shared/modal-accessibility';
import {
  Quota,
  QuotaBenefit,
  QuotaDelivery,
  SponsorPreview,
  SponsorsPreviewService,
} from './sponsors-preview.service';

type Dialog = 'register' | 'registered' | 'quotas' | 'quota' | 'team' | null;
const passwordValid = (value: string) =>
  value.length >= 12 && value.length <= 128 && new TextEncoder().encode(value).length <= 72;
@Component({
  selector: 'app-rbs-sponsors',
  imports: [RouterLink, ReactiveFormsModule, NzButtonModule, NzInputModule, NzModalModule],
  templateUrl: './sponsors.html',
  styleUrls: ['../../partnership/shared/partnership-ui.css', './sponsors.css'],
})
export class RbsSponsors {
  readonly preview = inject(SponsorsPreviewService);
  readonly api = inject(PortalApi);
  readonly session = inject(SessionStore);
  readonly auth = inject(AuthService);
  readonly admin = this.session.isAdmin;
  readonly areas = PORTAL_AREAS;
  readonly searchField = new FormControl('', { nonNullable: true });
  readonly query = signal('');
  readonly dialog = signal<Dialog>(null);
  readonly busy = signal(false);
  readonly localError = signal('');
  readonly partial = signal('');
  readonly registered = signal<SponsorPreview | null>(null);
  readonly dialogHeading = viewChild<ElementRef<HTMLHeadingElement>>('dialogHeading');
  readonly registration = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(200)],
    }),
    edition: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)],
    }),
    quotaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    contactName: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', { nonNullable: true }),
  });
  readonly team = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(120)],
    }),
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(254)],
    }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });
  readonly quotaName = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.maxLength(120)],
  });
  readonly quotaId = signal<string | null>(null);
  readonly quotaVersion = signal(0);
  readonly quotaAreas = signal<string[]>(['perfil']);
  readonly quotaDeliveries = signal<QuotaDelivery[]>([]);
  readonly quotaBenefits = signal<QuotaBenefit[]>([]);
  readonly title = computed(
    () =>
      (
        ({
          register: 'Cadastrar parceria e acesso',
          registered: 'Parceria cadastrada',
          quotas: 'Cotas e benefícios',
          quota: 'Editar cota e direitos',
          team: 'Convidar equipe',
        }) as Record<string, string>
      )[this.dialog() ?? ''] ?? '',
  );
  readonly hasMore = computed(
    () =>
      this.preview.sponsors().length > 0 && (this.preview.page() + 1) * 50 < this.preview.total(),
  );
  constructor() {
    void this.preview.load().catch(() => {});
  }
  async search(page = 0): Promise<void> {
    this.query.set(this.searchField.value.trim());
    this.localError.set('');
    try {
      await this.preview.load(this.query(), page);
    } catch {}
  }
  async openRegistration(): Promise<void> {
    this.localError.set('');
    this.partial.set('');
    try {
      await this.preview.loadQuotas();
      this.dialog.set('register');
    } catch {}
  }
  async openQuotas(): Promise<void> {
    this.localError.set('');
    try {
      await this.preview.loadQuotas();
      this.dialog.set('quotas');
    } catch {}
  }
  invalid(field: keyof typeof this.registration.controls): boolean {
    const c = this.registration.controls[field];
    return c.touched && c.invalid;
  }
  async register(): Promise<void> {
    if (this.busy()) return;
    this.registration.markAllAsTouched();
    if (this.registration.invalid) {
      this.localError.set('Revise os campos obrigatórios.');
      return;
    }
    const form = this.registration.getRawValue();
    this.busy.set(true);
    this.localError.set('');
    try {
      let user = await this.preview.findUser(form.email.trim());
      if (user && user.role !== 'ADMIN_PATROCINADOR')
        throw new Error('Este e-mail pertence a outro tipo de acesso.');
      if (!user) {
        if (!passwordValid(form.password))
          throw new Error('Senha inicial: 12 a 128 caracteres e até 72 bytes UTF-8.');
        await this.preview.invite(
          form.contactName.trim(),
          form.email.trim(),
          form.password,
          'ADMIN_PATROCINADOR',
        );
        this.partial.set(
          'Convite enviado. Se a parceria falhar, mantenha este formulário e tente novamente.',
        );
        user = await this.preview.findUser(form.email.trim());
      }
      if (!user)
        throw new Error(
          'Convite enviado, mas o acesso ainda não está disponível para vínculo. Tente novamente.',
        );
      const sponsor = await this.preview.createPartnership(
        form.name.trim(),
        form.edition.trim(),
        form.quotaId,
        user.id,
      );
      this.registered.set(sponsor);
      this.registration.controls.password.reset();
      this.partial.set('');
      this.dialog.set('registered');
      void this.preview.load(this.query()).catch(() => {});
      requestAnimationFrame(() => this.dialogHeading()?.nativeElement.focus());
    } catch (error) {
      this.localError.set(
        error instanceof Error ? error.message : 'Não foi possível concluir o cadastro.',
      );
    } finally {
      this.busy.set(false);
    }
  }
  openQuota(quota?: Quota): void {
    this.localError.set('');
    this.quotaId.set(quota?.id ?? null);
    this.quotaVersion.set(quota?.versao ?? 0);
    this.quotaName.reset(quota?.nome ?? '');
    this.quotaAreas.set(quota?.areas ?? ['perfil']);
    this.quotaDeliveries.set(quota?.entregas.map((x) => ({ ...x })) ?? []);
    this.quotaBenefits.set(quota?.beneficios.map((x) => ({ ...x })) ?? []);
    this.dialog.set('quota');
  }
  toggleArea(area: string): void {
    if (area === 'perfil') return;
    this.quotaAreas.update((v) => (v.includes(area) ? v.filter((a) => a !== area) : [...v, area]));
  }
  addDelivery(): void {
    this.quotaDeliveries.update((v) => [...v, { area: 'perfil', titulo: '', descricao: '' }]);
  }
  changeDelivery(index: number, key: keyof QuotaDelivery, value: string): void {
    this.quotaDeliveries.update((v) =>
      v.map((item, i) => (i === index ? { ...item, [key]: value } : item)),
    );
  }
  removeDelivery(index: number): void {
    this.quotaDeliveries.update((v) => v.filter((_, i) => i !== index));
  }
  addBenefit(): void {
    this.quotaBenefits.update((v) => [
      ...v,
      { natureza: 'CORTESIA', tipo: 'passaporte', setor: '', publico: '', quantidade: 0 },
    ]);
  }
  changeBenefit(index: number, key: keyof QuotaBenefit, value: string): void {
    this.quotaBenefits.update((v) =>
      v.map((item, i) =>
        i === index ? { ...item, [key]: key === 'quantidade' ? Number(value) : value } : item,
      ),
    );
  }
  removeBenefit(index: number): void {
    this.quotaBenefits.update((v) => v.filter((_, i) => i !== index));
  }
  async saveQuota(): Promise<void> {
    if (this.busy()) return;
    this.quotaName.markAsTouched();
    if (
      this.quotaName.invalid ||
      this.quotaDeliveries().some((x) => !x.titulo.trim() || !this.quotaAreas().includes(x.area)) ||
      this.quotaBenefits().some(
        (x) =>
          !x.tipo.trim() ||
          !x.setor.trim() ||
          !Number.isInteger(x.quantidade) ||
          x.quantidade < 0 ||
          !this.quotaAreas().includes(x.natureza === 'CORTESIA' ? 'cortesias' : 'credenciamento'),
      )
    ) {
      this.localError.set('Revise nome, áreas, entregas e benefícios.');
      return;
    }
    this.busy.set(true);
    this.localError.set('');
    try {
      await this.preview.saveQuota(
        {
          nome: this.quotaName.value.trim(),
          versao: this.quotaVersion(),
          areas: this.quotaAreas(),
          entregas: this.quotaDeliveries(),
          beneficios: this.quotaBenefits().map((b) => ({
            ...b,
            publico: b.natureza === 'CORTESIA' ? '' : b.publico,
          })),
        },
        this.quotaId() ?? undefined,
      );
      this.dialog.set('quotas');
    } catch {
    } finally {
      this.busy.set(false);
    }
  }
  async inviteTeam(): Promise<void> {
    if (this.busy()) return;
    this.team.markAllAsTouched();
    const form = this.team.getRawValue();
    if (this.team.invalid || !passwordValid(form.password)) {
      this.localError.set(
        'Confira nome, e-mail e senha de 12 a 128 caracteres, até 72 bytes UTF-8.',
      );
      return;
    }
    this.busy.set(true);
    this.localError.set('');
    try {
      await this.preview.invite(form.name.trim(), form.email.trim(), form.password, 'ADMIN_RBS');
      this.team.reset();
      this.dialog.set(null);
      this.api.notice.set('Convite enviado para ativação.');
    } catch {
    } finally {
      this.busy.set(false);
    }
  }
  closeDialog(): void {
    if (this.busy()) return;
    this.dialog.set(null);
    this.localError.set('');
    this.registration.controls.password.reset();
    this.team.controls.password.reset();
  }
  labelDialog(modal: NzModalComponent): void {
    labelPartnershipDialog(modal, 'sponsors-dialog-title');
  }
  logout(): void {
    this.auth.logout();
  }
}
