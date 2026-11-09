# Portal do Patrocinador — Planeta Atlântida

MVP do Desafio Geração Caldeira 2026, desenvolvido pelas trilhas Java e IA & Dados para o desafio do Grupo RBS. Centraliza materiais, acompanhamento, comprovações e relatórios das parcerias.

**Esta é a demonstração PA27**, no repositório `bryandarvel/portal-patrocinador-pa27`, branch `demo-pa27`. Usa marcas reais como referência e dados operacionais fictícios. Não é uma implantação operacional ou homologada pela RBS.

- [Abrir o portal](https://portal-patrocinador-pa27.vercel.app/login)
- [Matriz da Entrega 3](docs/entrega-3-matriz.md): requisitos, evidências e pendências.
- [Guia de execução e acessos](docs/demo-pa27.md)
- [Arquitetura](docs/arquitetura-demo-pa27.md)
- [Validação e limitações](docs/validacao-final-pa27.md)
- [Roteiro de vídeo até 2min50s](docs/entrega-3-video.md)
- [Estado para o pitch](docs/estado-para-pitch.md)

## Executar uma cópia nova

Requer Git e Docker Desktop com containers Linux. Java, Node, PostgreSQL e Mailpit são fornecidos pelo Docker; Node ou Angular CLI globais não são necessários para executar a stack.

```powershell
git clone --branch demo-pa27 --single-branch https://github.com/bryandarvel/portal-patrocinador-pa27.git
Set-Location portal-patrocinador-pa27
if (!(Test-Path .env)) { Copy-Item .env.demo.example .env }
```

Preencha localmente `PORTAL_JWT_SECRET` (pelo menos 32 bytes aleatórios), `PORTAL_BOOTSTRAP_PASSWORD` e `PORTAL_SEED_PASSWORD` no `.env`. Use senhas distintas, de pelo menos 12 caracteres e até 72 bytes UTF-8. Não altere um `.env` existente sem conferir sua configuração. O template da demonstração usa portas 4217, 8087 e 8027.

```powershell
docker compose -p portal-pa27-demo up -d
docker compose -p portal-pa27-demo ps
```

Aguarde [o health local](http://localhost:8087/api/health) responder UP. Para ver logs, use `docker compose -p portal-pa27-demo logs --tail 50 backend frontend`, sem publicar saídas que contenham segredos. Um container ativo não comprova prontidão.

Para carregar as oito marcas em uma instalação local nova, os scripts exigem Python 3 no host, sem bibliotecas adicionais:

```powershell
python -X utf8 frontend/scripts/seed-demo-pa27.py
python -X utf8 frontend/scripts/seed-demo-pa27.py --aplicar
python -X utf8 backend/scripts/check-relatorios-pa27.py
```

O primeiro comando apenas mostra o plano. Os outros criam dados fictícios pela API e usam Mailpit para ativação. O verificador de relatórios importa exemplos, publica um Excel individual e pode completar fontes ausentes; leia o guia antes de executá-lo em uma base preparada. Não execute o seed legado de três marcas sobre esta demonstração.

| Serviço local | Endereço |
| --- | --- |
| Portal | http://localhost:4217/login |
| API / health | http://localhost:8087/api/health |
| Swagger | http://localhost:8087/swagger-ui/index.html |
| Mailpit | http://localhost:8027 |
| PostgreSQL | `db:5432`, somente na rede Docker |

Os endereços seguem o `.env`; ajuste se essas portas estiverem ocupadas. Use sempre `-p portal-pa27-demo`: o nome legado no Compose é histórico e não deve selecionar a stack do projeto original. Para parar preservando dados: `docker compose -p portal-pa27-demo stop`. Não é necessário apagar volumes para executar ou avaliar o MVP.

## Acessos de demonstração

Admin RBS: `rbs.pa27@example.test`. Patrocinadores: `renner.pa27@example.test`, `coca-cola.pa27@example.test`, `banrisul.pa27@example.test`, `monster.pa27@example.test`, `mastercard.pa27@example.test`, `absolut-sprite.pa27@example.test`, `aperol.pa27@example.test` e `claro-jbl.pa27@example.test`.

Na instalação local criada pelo template, o administrador usa `PORTAL_BOOTSTRAP_PASSWORD` e os patrocinadores usam `PORTAL_SEED_PASSWORD`. As contas públicas já ativadas usam as credenciais fornecidas pelo responsável pela demonstração, por canal privado. Clonar o repositório não fornece acesso ao banco público nem suas senhas. Nunca importe `.env.render` ou `.env.cloud` na Vercel.

RBS gerencia parcerias e direitos; patrocinadores entram no contexto autorizado. Master, Subcota G e Subcota M têm cenários demonstrativos distintos. Renner apresenta as sete áreas; Claro + JBL é uma parceria com duas marcas. Perfil é acessado pelo card da parceria, não por um oitavo item duplicado no menu.

## Stack e organização

Angular 22.2.1, NG-ZORRO 22.1.1 e TypeScript 6.0.3 estão travados no lockfile; Node 24.15.0 no Compose; Java 21, Spring Boot 4.1.1 e Apache POI 6.0.0 no Maven; PostgreSQL 17 e Flyway. O backend usa PostgreSQL por padrão; H2 é exclusivo do teste de contexto.

- `frontend/`: apresentação, rotas, serviços HTTP e assets PA27.
- `backend/`: API, autorização, transações, arquivos, relatórios e testes.
- `docs/`: execução, arquitetura, regras, evidências e histórico.
- `openspec/`: histórico anterior; não é requisito para executar a demonstração.

Vercel serve o frontend e encaminha `/api` para Render. Banco e anexos privados ficam no Supabase. A [arquitetura](docs/arquitetura-demo-pa27.md) explica os dois relatórios e o controle de acesso.

## Verificações e limites

Os relatórios locais Java registram 31 testes sem falhas. Há scripts de API e Playwright com resultados anteriores documentados; não constituem homologação humana. Os [registros de validação](docs/validacao-final-pa27.md) separam local/QA, publicação e conferência de arquivos por bibliotecas.

```powershell
docker compose -p portal-pa27-demo exec -T backend sh ./mvnw -B -ntp test
docker compose -p portal-pa27-demo exec -T frontend npm run test:proxy
python -X utf8 backend/scripts/test_migrate_supabase_pa27.py
python -X utf8 frontend/scripts/seed-demo-pa27.test.py
```

Os testes de API/Chrome que criam registros sintéticos devem ser executados em QA isolado, não na base pública preparada. Consulte os requisitos de Playwright em `frontend/scripts` e no guia de integração; não há instalação automática de ferramentas.

Render Free pode demorar para retomar após inatividade. Convites novos por e-mail na nuvem dependem de serviço de envio. DOCX/XLSX são processados apenas no modelo demonstrativo, até 500 linhas e 1 MB; outros tipos permitidos podem ser armazenados. Impactos são informados na fonte, sem atribuição causal medida. A matriz registra homologação, modelos oficiais, conferência visual no Office e demais pendências.

## Origem e colaboração

O projeto deriva do trabalho colaborativo em [gbarceloz/Desafio-GC-RBS](https://github.com/gbarceloz/Desafio-GC-RBS), desenvolvido por três integrantes da trilha Java e dois de IA & Dados. O histórico e os créditos foram preservados. O repositório original e sua infraestrutura não são dependências para executar esta cópia.

[PRODUCT.md](PRODUCT.md), [DESIGN.md](DESIGN.md), [regras de negócio](docs/regras-negocio/README.md) e [integração histórica](docs/integracao-backend.md) registram as decisões. [CONTRIBUTING.md](CONTRIBUTING.md) conserva o fluxo da equipe original; para esta revisão, commit, push e publicação são feitos por Bryan após conferir o diff. A preparação técnica não comprova que todos os critérios da Entrega 3 foram aceitos pela banca.
