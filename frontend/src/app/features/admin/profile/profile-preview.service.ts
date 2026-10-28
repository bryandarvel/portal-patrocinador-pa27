import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi, PortalArquivo } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface RbsProfileData {
  readonly name: string;
  readonly quota: string;
  readonly email: string;
}
export interface QuotaOption {
  id: string;
  nome: string;
}
export interface SponsorUser {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class RbsProfilePreviewService {
  private readonly api = inject(PortalApi);
  private readonly ctx = inject(PortalContext);
  readonly profile = computed<RbsProfileData>(() => ({
    name: this.ctx.partnership()?.nome ?? '',
    quota: this.ctx.partnership()?.cota ?? '',
    email: this.ctx.partnership()?.acessos?.[0]?.email ?? '',
  }));
  readonly documents = signal<PortalArquivo[]>([]);
  readonly quotas = signal<QuotaOption[]>([]);
  readonly users = signal<SponsorUser[]>([]);
  readonly loading = signal(false);
  constructor() {
    effect(() => {
      const id = this.ctx.id();
      this.documents.set([]);
      this.quotas.set([]);
      if (id) {
        void this.loadDocuments(id).catch(() => {});
        void this.loadQuotas().catch(() => {});
      }
    });
  }
  async loadDocuments(id = this.ctx.id()): Promise<void> {
    this.loading.set(true);
    try {
      const docs = await this.api.get<PortalArquivo[]>(`/api/parcerias/${id}/documentos`);
      if (id === this.ctx.id()) this.documents.set(docs);
    } finally {
      if (id === this.ctx.id()) this.loading.set(false);
    }
  }
  async loadQuotas(): Promise<void> {
    const data = await this.api.get<QuotaOption[]>('/api/cotas');
    this.quotas.set(data);
  }
  async searchUsers(busca: string): Promise<SponsorUser[]> {
    const data = await this.api.get<SponsorUser[]>(
      `/api/admin/usuarios?busca=${encodeURIComponent(busca)}`,
    );
    this.users.set(data.filter((u) => u.role === 'ADMIN_PATROCINADOR'));
    return this.users();
  }
  async save(nome: string, cotaId: string): Promise<void> {
    const p = this.ctx.partnership();
    if (!p) throw new Error('Selecione uma parceria.');
    await this.api.patch(this.ctx.url(), { nome, versao: p.versao, cotaId });
    await this.ctx.refresh();
  }
  async saveAccess(usuarioIds: string[]): Promise<void> {
    await this.api.patch(this.ctx.url('/acesso'), { usuarioIds });
    await this.ctx.refresh();
  }
  async invite(nome: string, email: string, senha: string): Promise<void> {
    await this.api.post('/api/auth/cadastro', { nome, email, senha, role: 'ADMIN_PATROCINADOR' });
  }
  async publish(file: File): Promise<void> {
    await this.api.upload(this.ctx.url('/documentos'), file);
    await this.loadDocuments();
  }
  async download(id: string, name: string): Promise<void> {
    await this.api.download(this.ctx.url(`/arquivos/${id}`), name);
  }
}
