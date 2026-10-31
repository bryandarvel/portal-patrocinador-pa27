const timestampFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
});
// Dias de evento são datas comerciais, não instantes no fuso do navegador.
const eventDateFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeZone: 'UTC',
});

export function formatReportDate(value: string | null, dateOnly = false): string {
  if (!value) return 'Não informada';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return (dateOnly ? eventDateFormat : timestampFormat).format(date);
}

const executionLabels: Readonly<Record<string, string>> = {
  PROGRAMADA: 'Programada',
  EM_EXECUCAO: 'Em execução',
  REALIZADA: 'Realizada',
};
export function reportExecutionLabel(value: string): string {
  return Object.hasOwn(executionLabels, value) ? executionLabels[value] : value;
}

const materialLabels: Readonly<Record<string, string>> = {
  ENVIADO: 'Enviado',
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em análise',
  APROVADO: 'Aprovado',
  AJUSTES: 'Ajustes solicitados',
  PENDENTE: 'Pendente',
};
export function reportMaterialLabel(value: string): string {
  return Object.hasOwn(materialLabels, value) ? materialLabels[value] : value;
}

const fileLabels: Readonly<Record<string, string>> = {
  documento_comercial: 'Documento comercial',
  miv: 'Manual de identidade visual',
  material: 'Material de mídia',
  marca_publicacao: 'Publicação de marca',
  midia_publicacao: 'Publicação de mídia',
  contrato: 'Contrato',
  contrato_assinado: 'Contrato final',
  resultados: 'Resultados da pesquisa',
  relatorio: 'Relatório complementar',
  planilha: 'Planilha de origem',
};
export function reportFileLabel(value: string): string {
  if (value.startsWith('material_entrega_')) return 'Material da entrega';
  if (value.startsWith('comprovacao_')) return 'Comprovação da entrega';
  return Object.hasOwn(fileLabels, value) ? fileLabels[value] : value;
}

const benefitLabels: Readonly<Record<string, string>> = {
  passaporte: 'Passaporte',
  sexta: 'Sexta-feira',
  sabado: 'Sábado',
  servico: 'Serviço',
};
export function reportBenefitLabel(value: string): string {
  return Object.hasOwn(benefitLabels, value) ? benefitLabels[value] : value;
}
