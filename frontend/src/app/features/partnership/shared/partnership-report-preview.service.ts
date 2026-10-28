import { effect, inject, Injectable, signal } from '@angular/core';
import { PortalApi } from '../../../core/portal-api.service';
import { PortalContext } from '../../../core/portal-context.service';

export interface ReportFile {
  id: string;
  nome: string;
  versao: number;
  criado_em: string;
}
export interface PartnershipReportData {
  geradoEm: string;
  parceria: { nome: string; edicao: string; cota: string };
  entregas: {
    titulo: string;
    descricao: string;
    area: string;
    execucao: string;
    responsavel: string | null;
  }[];
  comprovacoes: { entrega: string; descricao: string; criado_em: string }[];
  veiculacoes: {
    canal: string;
    descricao: string;
    url: string | null;
    veiculado_em: string | null;
  }[];
  perguntas: { ordem: number; pergunta: string }[];
  arquivos: { id: string; nome: string; tipo: string; area: string; versao: number }[];
  cortesias: {
    quantidade: number;
    tipo: string;
    setor: string;
    destinadas: number;
    dia_evento: string | null;
    periodo_inicio: string | null;
    periodo_fim: string | null;
  }[];
  credenciamento: { setor: string; tipo: string; publico: string; quantidade: number }[];
  relatoriosPublicados: ReportFile[];
}

@Injectable({ providedIn: 'root' })
export class PartnershipReportPreviewService {
  private readonly api = inject(PortalApi);
  private readonly context = inject(PortalContext);
  private readonly state = signal<PartnershipReportData | null>(null);
  readonly report = this.state.asReadonly();
  constructor() {
    effect(() => {
      const id = this.context.id();
      this.state.set(null);
      if (id) void this.load().catch(() => {});
    });
  }
  async load(): Promise<void> {
    const id = this.context.id();
    if (!id) return;
    const data = await this.api.get<PartnershipReportData>(this.context.url('/relatorio'));
    if (id === this.context.id()) this.state.set(data);
  }
  async exportHtml(): Promise<void> {
    await this.api.download(this.context.url('/relatorio/exportar'), 'relatorio-parceria.html');
  }
  async publish(file: File): Promise<void> {
    await this.api.upload(this.context.url('/relatorio/publicacoes'), file);
    await this.load();
  }
  async download(file: ReportFile): Promise<void> {
    await this.api.download(this.context.url(`/arquivos/${file.id}`), file.nome);
  }
}
