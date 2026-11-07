// E2E local com contas e parcerias sintéticas isoladas por execução.
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const ROOT = path.resolve(__dirname, '../..');
const API = `http://127.0.0.1:${process.env.BACKEND_PORT || '8080'}`;
const WEB = `http://localhost:${process.env.FRONTEND_PORT || '4200'}`;
const MAIL = `http://127.0.0.1:${process.env.MAILPIT_PORT || '8025'}`;
const OUT = process.env.PORTAL_E2E_OUTPUT || path.join(require('node:os').tmpdir(), 'rbs-front-e2e');
const areas = ['perfil', 'marca', 'midia', 'cortesias', 'credenciamento', 'pesquisa', 'contrato'];
const suffix = crypto.randomUUID().slice(0, 8);
const pdf = { name: `E2E-${suffix}.pdf`, mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF') };
const txt = { name: `E2E-${suffix}.txt`, mimeType: 'text/plain', buffer: Buffer.from(`E2E ${suffix}\n`) };
let checks = 0;

function bootstrap() {
  const env = Object.fromEntries(fs.readFileSync(path.join(ROOT, '.env'), 'utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#') && line.includes('=')).map(line => {
    const [key, ...value] = line.split('=');
    return [key.trim(), value.join('=').trim().replace(/^['"]|['"]$/g, '')];
  }));
  assert(env.PORTAL_BOOTSTRAP_EMAIL && env.PORTAL_BOOTSTRAP_PASSWORD, 'Bootstrap local ausente.');
  return { email: env.PORTAL_BOOTSTRAP_EMAIL, password: env.PORTAL_BOOTSTRAP_PASSWORD };
}
async function request(method, route, body, token, expected = 200) {
  const response = await fetch((route.startsWith('http') ? '' : API) + route, {
    method, headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body ? { 'Content-Type': 'application/json' } : {}) },
    ...(body ? { body: JSON.stringify(body) } : {})
  });
  assert.equal(response.status, expected, `${method} ${route.split('?')[0]} retornou ${response.status}, esperado ${expected}`);
  checks++;
  const text = await response.text();
  try { return JSON.parse(text); } catch { return text; }
}
async function activate(email, token) {
  let code;
  for (let attempt = 0; attempt < 20 && !code; attempt++) {
    const messages = (await request('GET', `${MAIL}/api/v1/messages`)).messages;
    for (const message of messages) {
      if (!message.To?.some(to => to.Address === email)) continue;
      const detail = await request('GET', `${MAIL}/api/v1/message/${message.ID}`);
      code = /token=([a-zA-Z0-9-]+)/.exec(detail.Text || '')?.[1];
      if (code) break;
    }
    if (!code) await new Promise(resolve => setTimeout(resolve, 250));
  }
  assert(code, `Ativação sintética não chegou ao Mailpit para ${email}`);
  await request('GET', `/api/auth/verificar?token=${code}`);
  return (await request('POST', '/api/auth/login', { email, senha: token })).token;
}
async function fixture() {
  const local = bootstrap();
  const admin = (await request('POST', '/api/auth/login', { email: local.email, senha: local.password })).token;
  const password = crypto.randomBytes(18).toString('base64url');
  const accounts = [];
  for (let index = 0; index < 2; index++) {
    const email = `e2e-${suffix}-${index}@example.test`;
    await request('POST', '/api/auth/cadastro', { nome: `E2E pessoa ${index}`, email, senha: password }, admin);
    const token = await activate(email, password);
    accounts.push({ token, id: (await request('GET', '/api/auth/me', undefined, token)).id });
  }
  const benefits = [
    { natureza: 'CORTESIA', tipo: 'passaporte', setor: 'E2E Arena', publico: '', quantidade: 2 },
    { natureza: 'CORTESIA', tipo: 'sexta', setor: 'E2E Arena', publico: '', quantidade: 3 },
    { natureza: 'CORTESIA', tipo: 'sabado', setor: 'E2E Arena', publico: '', quantidade: 2 },
    { natureza: 'CREDENCIAL', tipo: 'servico', setor: 'E2E Arena', publico: 'marca', quantidade: 2 },
    { natureza: 'CREDENCIAL', tipo: 'servico', setor: 'E2E Arena', publico: 'agencia', quantidade: 2 },
    { natureza: 'CREDENCIAL', tipo: 'servico', setor: 'E2E Arena', publico: 'setor', quantidade: 2 }
  ];
  const quota = await request('POST', '/api/cotas', { nome: `E2E cota ${suffix}`, areas, entregas: [{ area: 'marca', titulo: `E2E entrega ${suffix}`, descricao: 'Entrega sintética para integração' }], beneficios: benefits, versao: 0 }, admin, 201);
  const first = await request('POST', '/api/parcerias', { nome: `E2E parceria ${suffix}`, edicao: 'E2E 2027', cotaId: quota.id, usuarioIds: [accounts[0].id] }, admin, 201);
  const second = await request('POST', '/api/parcerias', { nome: `E2E isolada ${suffix}`, edicao: 'E2E 2027', cotaId: quota.id, usuarioIds: [accounts[1].id] }, admin, 201);
  for (const area of ['marca', 'midia', 'pesquisa']) await request('PATCH', `/api/parcerias/${first.id}/${area}/recebimento`, { aberto: true, prazo: '2027-12-31T23:59:59Z' }, admin);
  return { admin, sponsor: accounts[0].token, other: accounts[1].token, first, second };
}
function pageFor(browser, token, viewport = { width: 1440, height: 900 }) {
  return browser.newContext({ viewport, acceptDownloads: true }).then(async context => {
    await context.addInitScript(value => sessionStorage.setItem('portal.access', value), token);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    return { context, page, errors };
  });
}
async function visit(page, url, heading) {
  await page.goto(WEB + url);
  try {
    await page.getByRole('heading', { name: heading, exact: true }).first().waitFor();
  } catch (error) {
    const displayed = await page.locator('h1').allTextContents();
    throw new Error(`Ao abrir ${url}, a página ficou em ${new URL(page.url()).pathname}. Títulos: ${displayed.join(', ') || 'nenhum'}`, { cause: error });
  }
  assert(!page.url().includes('/login'), `Rota redirecionou ao login: ${url}`);
  const broken = await page.locator('img:visible').evaluateAll(async images => { await Promise.all(images.map(image => image.decode().catch(() => {}))); return images.filter(image => image.naturalWidth === 0).map(image => image.getAttribute('src')); });
  assert.deepEqual(broken, [], `Imagem não carregou em ${url}`);
  checks++;
}
async function upload(input, file = txt) { await input.setInputFiles(file); checks++; }
async function button(page, name) { await page.getByRole('button', { name, exact: true }).last().click(); }
async function screenshot(page, name) { await page.screenshot({ path: path.join(OUT, name), fullPage: true }); }

async function run() {
  fs.mkdirSync(OUT, { recursive: true });
  const data = await fixture();
  const browser = await chromium.launch({ headless: true, ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE } : {}) });
  const sessions = [];
  try {
    const rbs = await pageFor(browser, data.admin); sessions.push(rbs);
    const pat = await pageFor(browser, data.sponsor); sessions.push(pat);
    const a = `/rbs/parcerias/${data.first.id}`;
    const p = `/parcerias/${data.first.id}`;
    const routes = [
      ['perfil', 'Perfil do cliente'], ['aplicacoes-de-marca', 'Aplicações de marca'],
      ['midia-e-conteudo', 'Mídia e conteúdo'], ['cortesias', 'Cortesias'],
      ['credenciamento', 'Credenciamento'], ['pesquisa-da-ativacao', 'Pesquisa da ativação'],
      ['contrato', 'Contrato'], ['entregas', 'Entregas da parceria'], ['duvidas-frequentes', 'Dúvidas frequentes']
    ];
    for (const [route, title] of routes) { await visit(rbs.page, `${a}/${route}`, title); await visit(pat.page, `${p}/${route}`, title); }
    await visit(pat.page, `${p}/contrato`, 'Contrato');
    await button(pat.page, 'Informar signatários');
    await pat.page.locator('#sign-name-0').fill('E2E Signatário');
    await pat.page.locator('#sign-email-0').fill(`e2e-sign-${suffix}@example.test`);
    await pat.page.locator('#sign-role-0').fill('Representante');
    await button(pat.page, 'Salvar signatários');
    await visit(rbs.page, `${a}/contrato`, 'Contrato');
    await button(rbs.page, 'Publicar primeira versão');
    await upload(rbs.page.locator('#contract-upload'), pdf);
    await button(rbs.page, 'Publicar arquivo');
    await visit(pat.page, `${p}/contrato`, 'Contrato');
    await button(pat.page, 'Aprovar');
    await button(pat.page, 'Confirmar aprovação');
    await visit(rbs.page, `${a}/contrato`, 'Contrato');
    await button(rbs.page, 'Publicar contrato assinado');
    await upload(rbs.page.locator('#contract-upload'), pdf);
    await button(rbs.page, 'Publicar arquivo');
    await visit(pat.page, `${p}/contrato`, 'Contrato');
    await pat.page.getByText('Contrato assinado').first().waitFor();

    const delivery = (await request('GET', `/api/parcerias/${data.first.id}/entregas`, undefined, data.sponsor)).itens[0].id;
    await visit(pat.page, `${p}/entregas/${delivery}`, `E2E entrega ${suffix}`);
    await button(pat.page, 'Enviar material');
    await upload(pat.page.locator('#delivery-file'));
    await button(pat.page, 'Enviar material');
    await visit(rbs.page, `${a}/entregas/${delivery}`, `E2E entrega ${suffix}`);
    await button(rbs.page, 'Iniciar análise');
    await button(rbs.page, 'Aprovar material');
    await button(rbs.page, 'Confirmar aprovação');
    await button(rbs.page, 'Concluir');
    await button(rbs.page, 'Iniciar execução');
    await button(rbs.page, 'Registrar realização');
    await button(rbs.page, 'Confirmar realização');
    await button(rbs.page, 'Concluir');
    await button(rbs.page, 'Adicionar comprovação');
    await rbs.page.locator('#proof-description').fill(`E2E comprovação ${suffix}`);
    await upload(rbs.page.locator('#proof-file'));
    await button(rbs.page, 'Publicar comprovação');
    await visit(pat.page, `${p}/entregas/${delivery}`, `E2E entrega ${suffix}`);
    await pat.page.getByText(`E2E comprovação ${suffix}`).waitFor();
    await screenshot(pat.page, 'entrega-desktop.png');

    for (const [area, route, title] of [
      ['marca', 'aplicacoes-de-marca', 'Aplicações de marca'],
      ['midia', 'midia-e-conteudo', 'Mídia e conteúdo'],
      ['pesquisa', 'pesquisa-da-ativacao', 'Pesquisa da ativação']
    ]) {
      // O backend rejeita prazo vencido com recebimento aberto. Fechado com prazo vencido é o estado reproduzível.
      await request('PATCH', `/api/parcerias/${data.first.id}/${area}/recebimento`, { aberto: false, prazo: '2020-01-01T00:00:00Z' }, data.admin);
      await visit(rbs.page, `${a}/${route}`, title);
      await button(rbs.page, 'Reabrir envio');
      const deadline = rbs.page.locator(`#${area === 'marca' ? 'brand' : area === 'midia' ? 'media' : 'survey'}-deadline`);
      assert.match(await deadline.inputValue(), /^2019-12-31|^2020-01-01/, `Prazo antigo não foi pré-preenchido em ${area}`);
      await button(rbs.page, 'Limpar prazo');
      await rbs.page.waitForFunction(selector => document.querySelector(selector)?.value === '', `#${area === 'marca' ? 'brand' : area === 'midia' ? 'media' : 'survey'}-deadline`);
      await button(rbs.page, 'Reabrir envio');
      await button(rbs.page, 'Concluir');
      const state = await request('GET', `/api/parcerias/${data.first.id}/${area}`, undefined, data.admin);
      assert.equal(state.recebimento.aberto, true, `${area}: recebimento não abriu`);
      assert.equal(state.recebimento.prazo, null, `${area}: prazo não foi limpo`);
      checks += 3;
    }

    await visit(rbs.page, `${a}/entregas`, 'Entregas da parceria');
    await button(rbs.page, 'Organizar entrega');
    const owners = await request('GET', '/api/admin/responsaveis', undefined, data.admin);
    assert(owners.length, 'Nenhum responsável RBS ativo no ambiente local');
    await rbs.page.locator('#owner-select').selectOption(owners[0].id);
    await button(rbs.page, 'Salvar responsável');
    await button(rbs.page, 'Concluir');
    await rbs.page.locator('.delivery-areas .delivery-card').first().getByText(owners[0].nome).waitFor();
    checks++;

    await visit(rbs.page, `${a}/relatorio-da-parceria`, 'Relatório da parceria');

    await visit(rbs.page, `${a}/perfil`, 'Perfil do cliente');
    await button(rbs.page, 'Disponibilizar documento');
    await upload(rbs.page.locator('#profile-file'), pdf);
    await button(rbs.page, 'Publicar arquivo');
    await rbs.page.getByText(pdf.name).first().waitFor();
    await visit(pat.page, `${p}/perfil`, 'Perfil do cliente');
    await pat.page.getByText(pdf.name).first().waitFor();
    await screenshot(pat.page, 'perfil-desktop.png');

    await visit(pat.page, `${p}/aplicacoes-de-marca`, 'Aplicações de marca');
    await button(pat.page, 'Enviar MIV');
    await upload(pat.page.getByLabel('Arquivo do manual de identidade visual'), pdf);
    await button(pat.page, 'Enviar arquivo');
    await pat.page.getByText('Arquivo enviado à RBS.').waitFor();
    await visit(pat.page, `${p}/aplicacoes-de-marca`, 'Aplicações de marca');
    await pat.page.getByText(pdf.name).first().waitFor();
    await visit(pat.page, `${p}/midia-e-conteudo`, 'Mídia e conteúdo');
    await button(pat.page, 'Enviar arquivo de mídia');
    await upload(pat.page.locator('input[aria-label="Arquivo de mídia"]'));
    await button(pat.page, 'Enviar arquivo');
    await visit(rbs.page, `${a}/midia-e-conteudo`, 'Mídia e conteúdo');
    await rbs.page.getByText(txt.name).first().waitFor();
    await button(rbs.page, 'Publicar arquivo ou link');
    await rbs.page.locator('#media-publication-title').fill(`E2E publicação ${suffix}`);
    await rbs.page.locator('#media-publication-text').fill('Conteúdo sintético E2E');
    await button(rbs.page, 'Publicar');
    await visit(pat.page, `${p}/midia-e-conteudo`, 'Mídia e conteúdo');
    await pat.page.getByText(`E2E publicação ${suffix}`).waitFor();

    await visit(rbs.page, `${a}/cortesias`, 'Cortesias');
    await button(rbs.page, 'Adicionar cortesia');
    await rbs.page.locator('#courtesy-benefit').selectOption(data.first.beneficios.find(item => item.natureza === 'CORTESIA' && item.tipo === 'sexta').id);
    await rbs.page.locator('#courtesy-type').selectOption('sexta');
    await rbs.page.locator('#courtesy-sector').fill('E2E Arena');
    await rbs.page.locator('#courtesy-quantity').fill('2');
    await rbs.page.locator('#event-day').fill('2027-01-29');
    await button(rbs.page, 'Salvar cortesia');
    await visit(pat.page, `${p}/cortesias`, 'Cortesias');
    await pat.page.getByRole('button', { name: /^Destinar cortesias:/ }).first().click();
    await pat.page.locator('#destination-quantity').fill('1');
    await pat.page.locator('#destination-name').fill(`E2E destino ${suffix}`);
    await button(pat.page, 'Confirmar destinação');
    await pat.page.getByText(`E2E destino ${suffix}`).waitFor();
    await pat.page.reload();
    await pat.page.getByText(`E2E destino ${suffix}`).waitFor();

    await visit(rbs.page, `${a}/credenciamento`, 'Credenciamento');
    await button(rbs.page, 'Editar credenciamento');
    await rbs.page.locator('#staff-url').fill('https://example.test/open-staff');
    for (const index of [0, 1, 2]) { await button(rbs.page, 'Adicionar linha'); await rbs.page.locator(`#staff-benefit-${index}`).selectOption({ index }); await rbs.page.locator(`#staff-quantity-${index}`).fill('1'); }
    await button(rbs.page, 'Salvar informações');
    await visit(pat.page, `${p}/credenciamento`, 'Credenciamento');
    const openStaff = pat.page.getByRole('link', { name: 'Acessar Open Staff' });
    assert.equal(await openStaff.getAttribute('href'), 'https://example.test/open-staff');
    assert.match(await openStaff.getAttribute('rel'), /noopener/);

    await visit(rbs.page, `${a}/duvidas-frequentes`, 'Dúvidas frequentes');
    await button(rbs.page, 'Nova dúvida');
    await rbs.page.locator('#rbs-faq-question').fill(`E2E pergunta ${suffix}?`);
    await rbs.page.locator('#rbs-faq-answer').fill(`E2E resposta ${suffix}`);
    await rbs.page.locator('#rbs-faq-category').fill('Operação E2E');
    await rbs.page.route(`**/api/parcerias/${data.first.id}/faq`, route => route.request().method() === 'POST' ? route.abort() : route.continue(), { times: 1 });
    await button(rbs.page, 'Salvar dúvida');
    await rbs.page.getByRole('alert').last().waitFor();
    await rbs.page.locator('#rbs-faq-question').waitFor();
    assert.equal(await rbs.page.getByText('Alteração salva').count(), 0, 'FAQ mostrou sucesso após falha de rede');
    await button(rbs.page, 'Salvar dúvida');
    await rbs.page.getByText(`E2E pergunta ${suffix}?`).first().waitFor();
    await visit(pat.page, `${p}/duvidas-frequentes`, 'Dúvidas frequentes');
    await pat.page.getByText(`E2E pergunta ${suffix}?`).first().waitFor();
    await pat.page.locator('#faq-query').fill(suffix);
    await pat.page.locator('#faq-query').press('Enter');
    await pat.page.getByText(`E2E resposta ${suffix}`).last().waitFor();

    await visit(pat.page, `${p}/pesquisa-da-ativacao`, 'Pesquisa da ativação');
    await pat.page.locator('#survey-question-1').fill(`E2E pesquisa ${suffix}?`);
    await button(pat.page, 'Enviar perguntas');
    await pat.page.getByText('pergunta foi enviada').first().waitFor();
    await visit(rbs.page, `${a}/pesquisa-da-ativacao`, 'Pesquisa da ativação');
    await rbs.page.getByText(`E2E pesquisa ${suffix}?`).waitFor();
    await button(rbs.page, 'Publicar resultados'); await upload(rbs.page.locator('#survey-results-file'));
    await button(rbs.page, 'Publicar arquivo');
    await visit(pat.page, `${p}/pesquisa-da-ativacao`, 'Pesquisa da ativação');
    await pat.page.getByText(txt.name).first().waitFor();

    await visit(rbs.page, `${a}/relatorio-da-parceria`, 'Relatório da parceria');
    await upload(rbs.page.locator('#source-sheets-file'));
    await button(rbs.page, 'Enviar arquivo');
    await rbs.page.getByText(txt.name).first().waitFor();
    await button(rbs.page, 'Abrir relatório');
    await rbs.page.getByRole('heading', { name: 'Relatório da parceria' }).last().waitFor();
    await button(rbs.page, 'Publicar complemento');
    await upload(rbs.page.locator('#report-file'), pdf);
    const publication = rbs.page.waitForResponse(response =>
      response.request().method() === 'POST' &&
      response.url().endsWith(`/api/parcerias/${data.first.id}/relatorio/publicacoes`));
    await button(rbs.page, 'Publicar arquivo');
    assert.equal((await publication).status(), 201);
    await rbs.page.locator('#report-file').waitFor({ state: 'hidden' });
    const report = await request('GET', `/api/parcerias/${data.first.id}/relatorio`, undefined, data.sponsor);
    assert(report.perguntas.some(item => item.pergunta.includes(suffix)));
    assert(report.comprovacoes.some(item => item.descricao.includes(suffix)));
    assert(report.relatoriosPublicados.some(item => item.nome === pdf.name));
    const download = rbs.page.waitForEvent('download');
    await button(rbs.page, 'Gerar e baixar HTML');
    assert.match((await download).suggestedFilename(), /\.html$/);
    await visit(pat.page, `${p}/perfil`, 'Perfil do cliente');
    await button(pat.page, 'Relatório da parceria');
    await pat.page.getByRole('heading', { name: 'Relatório da parceria' }).last().waitFor();
    await screenshot(pat.page, 'report-desktop.png');

    const foreign = await pageFor(browser, data.other); sessions.push(foreign);
    await foreign.page.goto(`${WEB}/parcerias/${data.first.id}/perfil`);
    await foreign.page.waitForURL(url => !url.pathname.endsWith(`/parcerias/${data.first.id}/perfil`));
    assert(!foreign.page.url().endsWith(`/parcerias/${data.first.id}/perfil`), 'Outra conta acessou parceria alheia');
    await request('GET', `/api/parcerias/${data.first.id}/relatorio`, undefined, data.other, 404);

    const mobile = await pageFor(browser, data.sponsor, { width: 390, height: 844 }); sessions.push(mobile);
    await visit(mobile.page, `${p}/cortesias`, 'Cortesias');
    assert.equal(await mobile.page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Overflow horizontal em 390 px');
    await mobile.page.keyboard.press('Tab');
    assert(await mobile.page.evaluate(() => document.activeElement !== document.body), 'Foco de teclado ausente');
    await screenshot(mobile.page, 'cortesias-mobile.png');
    for (const session of sessions) assert.deepEqual(session.errors, [], 'Erro JavaScript não tratado no navegador');
    console.log(`PASS: ${checks} verificações E2E em contas E2E-${suffix}; capturas em ${OUT}.`);
  } catch (error) {
    const active = sessions.at(-1)?.page;
    if (active) {
      await active.screenshot({ path: path.join(OUT, 'failure.png'), fullPage: true }).catch(() => {});
      console.error('Diálogo:', (await active.locator('.dialog-title').allTextContents().catch(() => [])).join(' | '));
      console.error('Alertas:', (await active.getByRole('alert').allTextContents().catch(() => [])).join(' | '));
    }
    throw error;
  } finally {
    await Promise.all(sessions.map(session => session.context.close()));
    await browser.close();
  }
}
run().catch(error => { console.error(error.message); process.exitCode = 1; });
