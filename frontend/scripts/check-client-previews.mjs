// Usa apenas Node, TypeScript e Angular já declarados no projeto.
import '@angular/compiler';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import { Injector } from '@angular/core';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const modules = new Map();
async function sourceModule(path) {
  if (modules.has(path)) return modules.get(path);
  const source = await readFile(path, 'utf8');
  let code = ts.transpileModule(source, {
    compilerOptions: {
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      experimentalDecorators: true,
    },
  }).outputText;
  const imports = [...code.matchAll(/from\s+['"]([^'"]+)['"]/g)];
  for (const match of imports) {
    const specifier = match[1];
    const url = specifier.startsWith('.')
      ? await sourceModule(resolve(dirname(path), `${specifier}.ts`))
      : import.meta.resolve(specifier);
    code = code.replace(match[0], `from ${JSON.stringify(url)}`);
  }
  const url = `data:text/javascript;base64,${Buffer.from(code).toString('base64')}`;
  modules.set(path, url);
  return url;
}
const load = async (path) => import(await sourceModule(resolve(root, path)));
const { ClientPreviewService } = await load(
  'src/app/features/admin/shared/client-preview.service.ts',
);
const { TicketsPreviewService, EMPTY_TICKETS_PREVIEW } = await load(
  'src/app/features/partnership/tickets/tickets-preview.service.ts',
);
const { FaqPreviewService } = await load('src/app/features/partnership/faq/faq-preview.service.ts');
const { SourceSheetsPreviewService, SOURCE_SHEETS_CLIENT } = await load(
  'src/app/features/admin/report/source-sheets-preview.service.ts',
);
const { clientPreviewRoutes } = await load(
  'src/app/features/admin/client-areas/client-preview.routes.ts',
);

const client = new ClientPreviewService();
assert.equal(client.profile('roxo').quota, 'Subcota G');
assert.equal(client.profile('verde').quota, 'Subcota');
assert.equal(
  client.saveProfile('roxo', { name: ' ', quota: 'G', email: 'teste@example.com' }),
  false,
);
assert.equal(
  client.saveProfile('roxo', {
    name: ' Roxo teste ',
    quota: ' Subcota G ',
    email: ' roxo.teste@example.com ',
  }),
  true,
);
assert.equal(client.profile('roxo').name, 'Roxo teste');
assert.equal(client.profile('verde').name, 'Cliente Verde');
for (const area of ['profile', 'brand', 'media', 'research', 'report']) {
  client.publish('roxo', area);
  client.publish('roxo', area);
  assert.equal(client.published('roxo', area), true);
  assert.equal(client.published('verde', area), false);
}
assert.equal(client.saveStaff('roxo', { quantity: 1.5, sector: 'Arena' }), false);
assert.equal(client.saveStaff('roxo', { quantity: -1, sector: 'Arena' }), false);
assert.equal(client.saveStaff('roxo', { quantity: 10, sector: ' ' }), false);
assert.equal(client.saveStaff('roxo', { quantity: 0, sector: ' Arena ' }), true);
assert.deepEqual(client.staff('roxo'), { quantity: 0, sector: 'Arena' });
assert.equal(client.staff('verde'), null);
assert.equal(new ClientPreviewService().published('roxo', 'report'), false);

const parent = Injector.create({
  providers: [TicketsPreviewService, FaqPreviewService, SourceSheetsPreviewService],
});
assert.equal(parent.get(TicketsPreviewService).courtesies().length, 2);
assert.equal(parent.get(SourceSheetsPreviewService).examples[0].name, 'midia_amarelo.xlsx');
const routes = [...clientPreviewRoutes('roxo'), ...clientPreviewRoutes('verde')];
assert.equal(routes.length, 20); // Perfil Roxo existente + 19 versões novas.
assert.equal(new Set(routes.map((route) => route.path)).size, 20);
const scopes = {};
for (const id of ['roxo', 'verde']) {
  scopes[id] = {};
  for (const [page, service] of [
    ['cortesias', TicketsPreviewService],
    ['duvidas-frequentes', FaqPreviewService],
    ['relatorio-da-parceria', SourceSheetsPreviewService],
  ]) {
    const route = routes.find((route) => route.path === `previa/rbs/${id}/${page}`);
    assert.ok(route);
    assert.equal(route.data.sponsorId, id);
    const injector = Injector.create({ parent, providers: route.providers });
    scopes[id][page] = { injector, service: injector.get(service) };
  }
}
const roxoTickets = scopes.roxo.cortesias.service;
const verdeTickets = scopes.verde.cortesias.service;
assert.equal(roxoTickets.courtesies().length, 0);
assert.equal(verdeTickets.courtesies().length, 0);
assert.equal(roxoTickets.add({ quantity: -1, type: 'Diária', sector: 'Pista' }), null);
assert.equal(roxoTickets.add({ quantity: 2.5, type: 'Diária', sector: 'Pista' }), null);
assert.equal(roxoTickets.add({ quantity: 2, type: ' ', sector: 'Pista' }), null);
const courtesy = roxoTickets.add({ quantity: 30, type: ' Passaporte ', sector: ' VIP ' });
assert.ok(courtesy);
assert.equal(
  roxoTickets.update(courtesy.id, { quantity: 40, type: 'Diária', sector: 'Pista' }),
  true,
);
assert.equal(roxoTickets.courtesies().length, 1);
assert.equal(
  roxoTickets.update('missing', { quantity: 40, type: 'Diária', sector: 'Pista' }),
  false,
);
assert.equal(verdeTickets.courtesies().length, 0);
assert.equal(parent.get(TicketsPreviewService).courtesies().length, 2);
const roxoFaq = scopes.roxo['duvidas-frequentes'].service;
const verdeFaq = scopes.verde['duvidas-frequentes'].service;
assert.ok(roxoFaq.save({ question: ' Nova dúvida ', answer: ' Resposta ', category: 'Materiais' }));
assert.equal(roxoFaq.entries().length, 5);
assert.equal(verdeFaq.entries().length, 4);
assert.equal(parent.get(FaqPreviewService).entries().length, 4);
assert.equal(roxoFaq.search('nova duvida', 'Materiais').length, 1);
const roxoSheets = scopes.roxo['relatorio-da-parceria'].service;
const verdeSheets = scopes.verde['relatorio-da-parceria'].service;
assert.equal(roxoSheets.examples[0].name, 'midia_roxo.xlsx');
assert.equal(verdeSheets.examples[0].name, 'midia_verde.xlsx');
roxoSheets.addExamples();
roxoSheets.addExamples();
assert.equal(roxoSheets.sheets().length, 2);
assert.equal(verdeSheets.sheets().length, 0);
assert.equal(parent.get(SourceSheetsPreviewService).sheets().length, 0);
assert.notEqual(EMPTY_TICKETS_PREVIEW, SOURCE_SHEETS_CLIENT);
for (const scope of Object.values(scopes))
  for (const value of Object.values(scope)) value.injector.destroy();
parent.destroy();
console.log(
  'PASS: 20 rotas, perfis, publicação por área, cortesias, credenciamento, FAQ, planilhas e isolamento entre parcerias.',
);
