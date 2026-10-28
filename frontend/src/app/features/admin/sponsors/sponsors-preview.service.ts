import { inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';

export interface SponsorPreview {
  readonly id: string;
  readonly name: string;
  readonly quota: string;
  readonly edition: string;
}
export interface QuotaBenefit {
  natureza: 'CORTESIA' | 'CREDENCIAL';
  tipo: string;
  setor: string;
  publico: string;
  quantidade: number;
}
export interface QuotaDelivery {
  area: string;
  titulo: string;
  descricao: string;
}
export interface Quota {
  id: string;
  nome: string;
  versao: number;
  areas: string[];
  entregas: QuotaDelivery[];
  beneficios: QuotaBenefit[];
}
interface SponsorPage {
  itens: { id: string; nome: string; cota: string; edicao: string }[];
  total: number;
  pagina: number;
}
export interface PortalAccess {
  id: string;
  nome: string;
  email: string;
  role: string;
  ativo: boolean;
}

@Injectable({ providedIn: 'root' })
export class SponsorsPreviewService {
  private readonly api = inject(PortalApi);
  private requestVersion = 0;
  readonly sponsors = signal<readonly SponsorPreview[]>([]);
  readonly total = signal(0);
  readonly page = signal(0);
  readonly quotas = signal<readonly Quota[]>([]);
  async load(query = '', page = 0): Promise<void> {
    const version = ++this.requestVersion;
    const result = await this.api.get<SponsorPage>(
      `/api/parcerias?busca=${encodeURIComponent(query)}&pagina=${page}`,
    );
    if (version !== this.requestVersion) return;
    this.sponsors.set(
      result.itens.map((item) => ({
        id: item.id,
        name: item.nome,
        quota: item.cota,
        edition: item.edicao,
      })),
    );
    this.total.set(result.total);
    this.page.set(result.pagina);
  }
  async loadQuotas(): Promise<void> {
    this.quotas.set(await this.api.get<Quota[]>('/api/cotas'));
  }
  async saveQuota(input: Omit<Quota, 'id'>, id?: string): Promise<void> {
    if (id) await this.api.patch(`/api/cotas/${id}`, input);
    else await this.api.post('/api/cotas', input);
    await this.loadQuotas();
  }
  async findUser(email: string): Promise<PortalAccess | null> {
    const users = await this.api.get<PortalAccess[]>(
      `/api/admin/usuarios?busca=${encodeURIComponent(email)}`,
    );
    return users.find((user) => user.email.toLowerCase() === email.toLowerCase()) ?? null;
  }
  async invite(
    name: string,
    email: string,
    password: string,
    role: 'ADMIN_PATROCINADOR' | 'ADMIN_RBS',
  ): Promise<void> {
    await this.api.post(role === 'ADMIN_RBS' ? '/api/admin/usuarios' : '/api/auth/cadastro', {
      nome: name,
      email,
      senha: password,
      role,
    });
  }
  async createPartnership(
    name: string,
    edition: string,
    quotaId: string,
    userId: string,
  ): Promise<SponsorPreview> {
    const data = await this.api.post<{ id: string; nome: string; cota: string; edicao: string }>(
      '/api/parcerias',
      { nome: name, edicao: edition, cotaId: quotaId, usuarioIds: [userId] },
    );
    return { id: data.id, name: data.nome, quota: data.cota, edition: data.edicao };
  }
}
