import assert from 'node:assert/strict';
import test from 'node:test';
import { downloadFilename } from '../src/app/core/download-filename.ts';
import {
  formatReportDate,
  reportBenefitLabel,
  reportExecutionLabel,
  reportFileLabel,
  reportMaterialLabel,
} from '../src/app/features/partnership/shared/report-format.ts';

test('download prefere filename* UTF-8 ao nome codificado de compatibilidade', () => {
  assert.equal(
    downloadFilename(
      'attachment; filename="compat.pdf"; filename*=UTF-8\'\'Comprova%C3%A7%C3%A3o%20final.pdf',
      'comprovacao',
    ),
    'Comprovação final.pdf',
  );
});

test('download interpreta nome entre aspas contendo ponto e virgula', () => {
  assert.equal(
    downloadFilename('attachment; filename="relatorio; final.pdf"', 'arquivo'),
    'relatorio; final.pdf',
  );
});

test('download aceita idioma e espacos no parametro estendido', () => {
  assert.equal(
    downloadFilename("attachment; filename* = UTF-8'pt'Logo%20PA27.png", 'comprovacao'),
    'Logo PA27.png',
  );
});

test('header ausente ou nome estendido invalido preserva fallback com extensao', () => {
  assert.equal(downloadFilename(null, 'relatorio-parceria.html'), 'relatorio-parceria.html');
  assert.equal(
    downloadFilename("attachment; filename*=UTF-8''%ZZ; filename=material.txt", 'midia'),
    'material.txt',
  );
  assert.equal(
    downloadFilename("attachment; filename*=UTF-8''%ZZ", 'material.txt'),
    'material.txt',
  );
});

test('nome do download nao transporta caminhos ou nomes vazios', () => {
  assert.equal(
    downloadFilename('attachment; filename="../../contrato.pdf"', 'arquivo'),
    'contrato.pdf',
  );
  assert.equal(downloadFilename('attachment; filename=".."', 'relatorio.pdf'), 'relatorio.pdf');
  assert.equal(downloadFilename(null, ''), 'arquivo');
});

test('datas comerciais mantem o dia em vez de recuar pelo fuso brasileiro', () => {
  assert.equal(formatReportDate('2027-01-29T00:00:00Z', true), '29/01/2027');
  assert.equal(formatReportDate('2027-01-30', true), '30/01/2027');
});

test('instantes mostram data e horario locais em portugues', () => {
  const value = formatReportDate('2026-10-29T00:18:00Z');
  assert.match(value, /\d{2}\/\d{2}\/2026/);
  assert.match(value, /\d{2}:\d{2}/);
  assert.doesNotMatch(value, /T|Z/);
});

test('datas ausentes e desconhecidas nao derrubam o relatorio', () => {
  assert.equal(formatReportDate(null), 'Não informada');
  assert.equal(formatReportDate('data-nao-reconhecida'), 'data-nao-reconhecida');
});

test('tipos tecnicos de entrega sao apresentados sem identificadores internos', () => {
  assert.equal(
    reportFileLabel('material_entrega_6b22f46b-bc88-47b2-bb71-8f3795654e58'),
    'Material da entrega',
  );
  assert.equal(
    reportFileLabel('comprovacao_6b22f46b-bc88-47b2-bb71-8f3795654e58'),
    'Comprovação da entrega',
  );
  assert.equal(reportFileLabel('contrato_assinado'), 'Contrato final');
});

test('estados e beneficios conhecidos recebem rotulos sem mudar valores desconhecidos', () => {
  assert.equal(reportExecutionLabel('EM_EXECUCAO'), 'Em execução');
  assert.equal(reportExecutionLabel('REALIZADA'), 'Realizada');
  assert.equal(reportBenefitLabel('sabado'), 'Sábado');
  assert.equal(reportBenefitLabel('Beneficio especial'), 'Beneficio especial');
  assert.equal(reportFileLabel('tipo_futuro'), 'tipo_futuro');
  assert.equal(reportExecutionLabel('ESTADO_FUTURO'), 'ESTADO_FUTURO');
  assert.equal(reportExecutionLabel('constructor'), 'constructor');
  assert.equal(reportFileLabel('__proto__'), '__proto__');
  assert.equal(reportBenefitLabel('toString'), 'toString');
});

test('estados do material recebem rotulos preservando valores futuros', () => {
  assert.equal(reportMaterialLabel('EM_ANALISE'), 'Em análise');
  assert.equal(reportMaterialLabel('APROVADO'), 'Aprovado');
  assert.equal(reportMaterialLabel('AJUSTES'), 'Ajustes solicitados');
  assert.equal(reportMaterialLabel('ESTADO_FUTURO'), 'ESTADO_FUTURO');
  assert.equal(reportMaterialLabel('constructor'), 'constructor');
});
