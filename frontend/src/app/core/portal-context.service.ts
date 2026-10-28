import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { PortalApi } from './portal-api.service';
import { SessionStore } from './session.service';

export interface PortalArea {
  area: string;
  habilitada: boolean;
  recebimento_aberto: boolean;
  prazo: string | null;
}
export interface Beneficio {
  id: string;
  natureza: 'CORTESIA' | 'CREDENCIAL';
  tipo: string;
  setor: string;
  publico: string;
  quantidade: number;
  versao: number;
}
export interface Parceria {
  id: string;
  nome: string;
  edicao: string;
  cota_id: string;
  cota: string;
  versao: number;
  areas: PortalArea[];
  beneficios: Beneficio[];
  acessos?: { id: string; nome: string; email: string; ativo: boolean }[];
}
export const PORTAL_AREAS = [
  { key: 'perfil', number: '01', label: 'Perfil do cliente', path: 'perfil' },
  { key: 'marca', number: '02', label: 'Aplicações de marca', path: 'aplicacoes-de-marca' },
  { key: 'midia', number: '03', label: 'Mídia e conteúdo', path: 'midia-e-conteudo' },
  { key: 'cortesias', number: '04', label: 'Cortesias', path: 'cortesias' },
  { key: 'credenciamento', number: '05', label: 'Credenciamento', path: 'credenciamento' },
  { key: 'pesquisa', number: '06', label: 'Pesquisa da ativação', path: 'pesquisa-da-ativacao' },
  { key: 'contrato', number: '07', label: 'Contrato', path: 'contrato' },
] as const;

@Injectable({ providedIn: 'root' })
export class PortalContext {
  private readonly api = inject(PortalApi);
  readonly session = inject(SessionStore);
  readonly partnership = signal<Parceria | null>(null);
  readonly id = computed(() => this.partnership()?.id ?? '');
  readonly admin = this.session.isAdmin;
  readonly baseUrl = computed(
    () => `${this.admin() ? '/rbs/parcerias' : '/parcerias'}/${this.id()}`,
  );
  private version = 0;
  constructor() {
    effect(() => {
      if (!this.session.token()) this.clear();
    });
  }
  async load(id: string): Promise<void> {
    const version = ++this.version;
    const data = await this.api.get<Parceria>(`/api/parcerias/${encodeURIComponent(id)}`);
    if (version === this.version) this.partnership.set(data);
  }
  refresh(): Promise<void> {
    return this.load(this.id());
  }
  clear(): void {
    this.version++;
    this.partnership.set(null);
  }
  url(suffix = ''): string {
    if (!this.id()) throw new Error('Selecione uma parceria.');
    return `/api/parcerias/${this.id()}${suffix}`;
  }
  link(area: string): string {
    return `${this.baseUrl()}/${area}`;
  }
  enabled(area: string): boolean {
    return (
      this.admin() ||
      !!this.partnership()?.areas.some((item) => item.area === area && item.habilitada)
    );
  }
  submissionsOpen(area: string): boolean {
    const item = this.partnership()?.areas.find((item) => item.area === area);
    return !!item?.recebimento_aberto && (!item.prazo || Date.parse(item.prazo) > Date.now());
  }
}
