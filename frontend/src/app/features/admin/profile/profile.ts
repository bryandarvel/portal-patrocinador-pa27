import { CardHeading } from '../../partnership/shared/card-heading';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { PortalApi } from '../../../core/portal-api.service';
import { Beneficio, PORTAL_AREAS, PortalContext } from '../../../core/portal-context.service';
import { AdminPartnershipShell } from '../shared/admin-partnership-shell';
import { RbsProfilePreviewService, SponsorUser } from './profile-preview.service';

@Component({
  selector: 'app-rbs-profile',
  imports: [
    CardHeading,
    NzIconModule,
    AdminPartnershipShell,
    FormsModule,
    NzButtonModule,
    NzInputModule,
    NzModalModule,
  ],
  templateUrl: './profile.html',
  styleUrls: [
    '../../partnership/shared/partnership-ui.css',
    '../../partnership/profile/profile.css',
    '../../partnership/shared/material-ui.css',
    './profile.css',
  ],
})
export class RbsProfile {
  readonly preview = inject(RbsProfilePreviewService);
  readonly ctx = inject(PortalContext);
  readonly api = inject(PortalApi);
  readonly dialog = signal<'access' | 'publish' | 'saved' | null>(null);
  readonly error = signal('');
  readonly file = signal<File | null>(null);
  readonly selected = signal<string[]>([]);
  readonly searchResults = signal<SponsorUser[]>([]);
  readonly inviteCreated = signal(false);
  readonly areaOptions = PORTAL_AREAS;
  readonly rightsOpen = signal(false);
  readonly rightsError = signal('');
  readonly areasDraft = signal<string[]>(['perfil']);
  readonly quantityDraft = signal<Record<string, number>>({});
  newNature: 'CORTESIA' | 'CREDENCIAL' = 'CORTESIA';
  newType = 'passaporte';
  newSector = '';
  newAudience = '';
  newQuantity = 0;
  name = '';
  cotaId = '';
  search = '';
  inviteName = '';
  inviteEmail = '';
  invitePassword = '';
  private lastId = '';
  constructor() {
    effect(() => {
      const p = this.ctx.partnership();
      if (p && p.id !== this.lastId) {
        this.lastId = p.id;
        this.name = p.nome;
        this.cotaId = p.cota_id;
      }
    });
  }
  async save(): Promise<void> {
    if (!this.name.trim() || !this.cotaId) {
      this.error.set('Informe nome e cota.');
      return;
    }
    try {
      await this.preview.save(this.name.trim(), this.cotaId);
      this.error.set('');
      this.dialog.set('saved');
    } catch {}
  }
  openAccess(): void {
    this.selected.set(this.ctx.partnership()?.acessos?.map((u) => u.id) ?? []);
    this.searchResults.set([]);
    this.error.set('');
    this.invitePassword = '';
    this.dialog.set('access');
  }
  selectedUser(id: string): boolean {
    return this.selected().includes(id);
  }
  toggleUser(id: string, checked: boolean): void {
    this.selected.update((ids) =>
      checked ? [...new Set([...ids, id])] : ids.filter((item) => item !== id),
    );
  }
  async find(): Promise<void> {
    try {
      this.searchResults.set(await this.preview.searchUsers(this.search.trim()));
      this.error.set('');
    } catch {}
  }
  async saveAccess(): Promise<void> {
    try {
      await this.preview.saveAccess(this.selected());
      this.invitePassword = '';
      this.dialog.set('saved');
      this.error.set('');
    } catch {}
  }
  async invite(): Promise<void> {
    const nome = this.inviteName.trim(),
      email = this.inviteEmail.trim().toLowerCase(),
      senha = this.invitePassword;
    if (
      !nome ||
      !/^\S+@\S+\.\S+$/.test(email) ||
      senha.length < 12 ||
      new TextEncoder().encode(senha).length > 72
    ) {
      this.error.set('Informe nome, e-mail válido e senha de 12 a 72 bytes.');
      return;
    }
    try {
      if (!this.inviteCreated()) {
        await this.preview.invite(nome, email, senha);
        this.inviteCreated.set(true);
      }
      const users = await this.preview.searchUsers(email);
      const account = users.find((u) => u.email.toLowerCase() === email);
      if (!account) {
        this.error.set('Conta criada. Busque o e-mail novamente para vincular o acesso.');
        return;
      }
      this.selected.update((ids) => [...new Set([...ids, account.id])]);
      this.searchResults.set(users);
      this.error.set('Conta encontrada. Salve os acessos para vinculá-la à parceria.');
      this.invitePassword = '';
      this.inviteCreated.set(false);
    } catch {
      this.error.set(
        this.inviteCreated()
          ? 'Conta criada. Busque o e-mail para concluir o vínculo.'
          : 'Não foi possível criar o convite. Confira a mensagem de erro.',
      );
    }
  }
  selectFile(input: HTMLInputElement): void {
    this.file.set(input.files?.item(0) ?? null);
    this.error.set('');
  }
  async publish(): Promise<void> {
    const file = this.file();
    if (!file || !file.size) {
      this.error.set('Selecione um arquivo com conteúdo.');
      return;
    }
    try {
      await this.preview.publish(file);
      this.file.set(null);
      this.dialog.set('saved');
      this.error.set('');
    } catch {}
  }
  async download(id: string, name: string): Promise<void> {
    try {
      await this.preview.download(id, name);
    } catch {}
  }
  closeDialog(): void {
    if (this.api.pending() > 0) return;
    this.invitePassword = '';
    this.error.set('');
    this.file.set(null);
    this.dialog.set(null);
  }
  openRights(): void {
    this.areasDraft.set(
      this.ctx
        .partnership()
        ?.areas.filter((a) => a.habilitada)
        .map((a) => a.area) ?? ['perfil'],
    );
    this.quantityDraft.set(
      Object.fromEntries(
        (this.ctx.partnership()?.beneficios ?? []).map((b) => [b.id, b.quantidade]),
      ),
    );
    this.rightsError.set('');
    this.rightsOpen.set(true);
  }
  toggleArea(area: string, checked: boolean): void {
    if (area === 'perfil') return;
    this.areasDraft.update((items) =>
      checked ? [...new Set([...items, area])] : items.filter((item) => item !== area),
    );
  }
  changeNature(value: string): void {
    this.newNature = value === 'CREDENCIAL' ? 'CREDENCIAL' : 'CORTESIA';
    this.newType = this.newNature === 'CORTESIA' ? 'passaporte' : '';
  }
  setQuantity(id: string, value: string): void {
    this.quantityDraft.update((items) => ({ ...items, [id]: Number(value) }));
  }
  async saveAreas(): Promise<void> {
    try {
      await this.api.put(this.ctx.url('/areas'), { areas: this.areasDraft() });
      await this.ctx.refresh();
      this.rightsError.set('');
      this.api.notice.set('Áreas da parceria atualizadas.');
    } catch {
      this.rightsError.set(this.api.error());
    }
  }
  async saveQuantity(benefit: Beneficio): Promise<void> {
    const quantidade = this.quantityDraft()[benefit.id];
    if (!Number.isInteger(quantidade) || quantidade < 0) {
      this.rightsError.set('Informe uma quantidade inteira não negativa.');
      return;
    }
    try {
      await this.api.patch(this.ctx.url(`/beneficios/${benefit.id}`), {
        quantidade,
        versao: benefit.versao,
      });
      await this.ctx.refresh();
      this.rightsError.set('');
      this.api.notice.set('Limite contratual atualizado.');
    } catch {
      this.rightsError.set(this.api.error());
    }
  }
  async addBenefit(): Promise<void> {
    const quantidade = Number(this.newQuantity),
      area = this.newNature === 'CORTESIA' ? 'cortesias' : 'credenciamento';
    if (
      !this.areasDraft().includes(area) ||
      !this.newType.trim() ||
      !this.newSector.trim() ||
      !Number.isInteger(quantidade) ||
      quantidade < 0 ||
      (this.newNature === 'CREDENCIAL' && !this.newAudience.trim())
    ) {
      this.rightsError.set(
        'Habilite a área e informe tipo, setor, público quando necessário e quantidade válida.',
      );
      return;
    }
    try {
      await this.api.post(this.ctx.url('/beneficios'), {
        natureza: this.newNature,
        tipo: this.newType.trim(),
        setor: this.newSector.trim(),
        publico: this.newNature === 'CORTESIA' ? '' : this.newAudience.trim(),
        quantidade,
      });
      await this.ctx.refresh();
      this.quantityDraft.update((draft) =>
        Object.fromEntries(
          (this.ctx.partnership()?.beneficios ?? []).map((b) => [
            b.id,
            draft[b.id] ?? b.quantidade,
          ]),
        ),
      );
      this.newSector = '';
      this.newAudience = '';
      this.newQuantity = 0;
      this.rightsError.set('');
      this.api.notice.set('Direito contratual adicionado.');
    } catch {
      this.rightsError.set(this.api.error());
    }
  }
}
