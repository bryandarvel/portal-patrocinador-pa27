# Portal do Patrocinador - Planeta Atlântida

Projeto do **Desafio GC 2026**, desenvolvido pelas trilhas **Java** e **IA & Dados** para o **Grupo RBS**.

O portal busca centralizar o acompanhamento das parcerias entre a RBS e os patrocinadores do Planeta Atlântida, do fechamento do contrato ao pós-evento. O objetivo é reunir informações, materiais, comprovações e relatórios, oferecendo autonomia aos patrocinadores e reduzindo a consolidação manual do time B2B.

Na branch `demo-pa27`, use o [guia da demonstração PA27](docs/demo-pa27.md) para subir a stack isolada, carregar as oito marcas fictícias e testar os relatórios setoriais.

## Estado atual

Atualização em **28/10/2026**. O backend foi implementado e validado localmente conforme o [TAP e planos comerciais](docs/regras-negocio/README.md). O [plano de integração](docs/integracao-backend.md) registra contratos, verificações e limites da entrega.

| Componente | Situação encontrada |
| --- | --- |
| Frontend | Login e áreas de patrocinador/RBS integrados às APIs do portal. |
| Backend | Módulos de identidade, cotas/parcerias/acessos, arquivos, áreas operacionais, contratos, entregas, histórico e relatório automático. |
| Autenticação | BCrypt, ativação de conta, JWT configurável, desafio MFA e cadastro de acessos pela RBS. Chaves e credenciais são locais, fora do código versionado. |
| Banco | PostgreSQL 17 no Compose; Flyway aplica migrações versionadas preservando as tabelas existentes. H2 é usado apenas no teste de contexto. |
| Regras comerciais | Capacidades, modelos de entrega e direitos quantitativos são cadastrados e aplicados por parceria. Os PDFs de exemplo não são importados automaticamente. |

As validações antigas da base foram preservadas em [Histórico de configuração](docs/historico-configuracao.md), com suas datas e limitações.

## Escopo do produto

O TAP prevê dois perfis: **Admin RBS**, que gerencia informações e acessos, e **Admin Patrocinador**, utilizado por clientes e agências. Cada patrocinador deve acessar apenas as informações da própria parceria.

As áreas previstas são:

- Perfil do cliente.
- Mídia e conteúdo.
- Pesquisa da ativação.
- Aplicações de marca no evento.
- Cortesias.
- Credenciamento.
- Contrato.

Os materiais comerciais orientam os benefícios de cada parceria. A profundidade de cada área, as exceções por contrato e as integrações devem seguir as decisões registradas com a equipe e o PO. O detalhamento do produto está em [PRODUCT.md](PRODUCT.md) e nos materiais do desafio.

## Tecnologias

Versões identificadas nos arquivos da base analisada:

| Parte | Tecnologia | Fonte |
| --- | --- | --- |
| Backend | Java 21 e Spring Boot 4.1.1 | [backend/pom.xml](backend/pom.xml) |
| Persistência | Spring Data JPA; PostgreSQL 17 no Docker | [backend/pom.xml](backend/pom.xml) e [compose.yaml](compose.yaml) |
| Frontend | Angular 22.2.1, NG-ZORRO 22.1.1 e TypeScript 6.0.3 | [frontend/package-lock.json](frontend/package-lock.json) |
| Runtime do frontend no Docker | Node.js 24.15.0 | [compose.yaml](compose.yaml) |
| Segurança e recursos auxiliares | Spring Security, JJWT, TOTP, JavaMail e GeoIP2 | [backend/pom.xml](backend/pom.xml) |
| Ambiente e colaboração | Docker Compose, Maven Wrapper, npm, Git e GitHub | Configurações na raiz e nas aplicações |

As rotas e exemplos de contratos ficam no Swagger em `http://localhost:8080/swagger-ui/index.html` quando a API usa a porta padrão.

## Como executar

### Obter o projeto

Com Git instalado e acesso ao repositório:

```powershell
git clone https://github.com/gbarceloz/Desafio-GC-RBS.git
cd Desafio-GC-RBS
```

Se já possui um clone, use a pasta existente. Para iniciar uma contribuição, siga o [CONTRIBUTING.md](CONTRIBUTING.md).

### Frontend local

Requer uma versão de Node compatível com o lockfile: `^22.22.3`, `^24.15.0` ou `>=26.0.0`. O Docker do projeto fixa Node **24.15.0**. Não é necessário instalar Angular CLI globalmente.

No PowerShell do Windows:

```powershell
cd frontend
npm.cmd ci
npm.cmd start
```

Acesse **http://localhost:4200/login**. Use `Ctrl+C` para encerrar. Em WSL, Linux ou macOS, use `npm` no lugar de `npm.cmd`.

O login autentica no backend e encaminha conforme o perfil e as parcerias autorizadas. Ativação de conta e MFA também estão conectados. As credenciais locais do administrador estão no `.env`, em `PORTAL_BOOTSTRAP_EMAIL` e `PORTAL_BOOTSTRAP_PASSWORD`.

### Ambiente completo com Docker

Requer Docker Desktop com containers Linux e Docker Compose. As imagens fornecem Java, Node e PostgreSQL; o backend utiliza Maven Wrapper.

O Compose configura URL, driver, usuário, senha e dialeto PostgreSQL por variáveis de ambiente, substituindo a configuração H2 de `backend/src/main/resources/application.properties` apenas nos containers. O envio de e-mails depende de configuração válida para o ambiente utilizado. Veja o [registro da execução local](docs/execucao-docker.md) para evidências e limites da validação.

Na raiz do repositório:

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
# Preencha .env com chave JWT exclusiva (mínimo 32 bytes) e senha inicial (mínimo 12 caracteres).
docker compose up -d
docker compose ps
docker compose logs --tail 50 backend frontend
```

| Serviço | Acesso |
| --- | --- |
| Frontend | http://localhost:4200/login |
| Backend | http://localhost:8080 — disponibilidade das rotas depende da configuração e da inicialização |
| PostgreSQL | `db:5432`, acessível pela rede interna do Docker |
| E-mails de desenvolvimento | http://localhost:8025, caixa local Mailpit; nenhuma entrega externa é feita pelo Compose |

O primeiro início instala dependências. Aguarde os logs de inicialização: um container ativo não comprova que a aplicação está pronta. As portas locais 4200, 8025 e 8080 precisam estar livres; se alguma já estiver em uso, defina `FRONTEND_PORT`, `MAILPIT_PORT` ou `BACKEND_PORT` no `.env` e acesse os serviços nas portas escolhidas. Os scripts de `backend/scripts/` leem as mesmas variáveis.

Para parar os serviços, preservando os volumes:

```powershell
docker compose stop
```

Para remover os containers e a rede deste projeto, preservando os volumes:

```powershell
docker compose down
```

O Compose é destinado ao desenvolvimento local. Cada máquina mantém seus próprios dados e caches. Consulte os arquivos de configuração para as variáveis locais; não use essas configurações como ambiente de produção.

Em Linux/macOS, use `cp .env.example .env` somente se ainda não houver `.env`. Não sobrescreva credenciais existentes. O primeiro administrador é criado apenas quando o bootstrap está habilitado e suas credenciais foram preenchidas. Após a primeira criação, desabilite `PORTAL_BOOTSTRAP_ENABLED` na implantação. O volume `portal-files` preserva os arquivos enviados.

Para validar as APIs localmente, com backend, banco e Mailpit ativos e as credenciais do bootstrap no `.env`:

```sh
python3 backend/scripts/check-portal-api.py
```

Esse teste cria contas e parcerias sintéticas com prefixo `Smoke`, verifica caminhos válidos/negados e não remove registros anteriores.

Para popular a base com dados de demonstração em todas as áreas (três parcerias, uma por cota, com contatos e um segundo Admin RBS já ativados):

```sh
python3 backend/scripts/seed-portal.py
```

O comando usa somente a API, não duplica dados ao rodar de novo e cria nomes marcados `(demo)` com e-mails `@example.test`. Os usuários criados entram com `PORTAL_SEED_PASSWORD` ou, se vazia, com a senha do bootstrap.

Para limpar a base (dados e arquivos enviados; schema e migrações são mantidos):

```sh
backend/scripts/reset-portal.sh --confirmar
```

Antes de apagar, o comando salva `backups/portal-<data>.sql` e `backups/arquivos-<data>.tar.gz`. Depois, o backend reinicia e o bootstrap recria o primeiro Admin RBS. Para voltar a um backup: `backend/scripts/reset-portal.sh --restaurar <data>`.

O `compose.yaml` fixa o nome do projeto (`desafio-gc-rbs-local`): qualquer cópia do repositório na mesma máquina controla a mesma stack, e os comandos acima atuam nela. Para uma stack isolada de testes, defina no `.env` dessa cópia `COMPOSE_PROJECT_NAME` e portas próprias. O relatório automático está disponível em JSON em `/api/parcerias/{id}/relatorio` e como HTML baixável/imprimível em `/api/parcerias/{id}/relatorio/exportar`.

As telas usam os IDs reais retornados pela API. RBS entra em `/rbs/patrocinadores`; patrocinadores acessam suas parcerias em `/parcerias`. Consulte o [inventário de telas e rotas](frontend/docs/telas-portal.md) e a [validação da integração](docs/integracao-backend.md#integração-angular-solicitada). Os roteiros locais em `frontend/scripts/check-auth-integration.cjs` e `check-portal-integration.cjs` usam Playwright já instalado, Chromium e os serviços Docker ativos. Defina `PLAYWRIGHT_MODULE` para o módulo disponível e, se necessário, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para o navegador. Eles criam somente dados sintéticos `E2E` e não removem registros anteriores.

### Comunicação entre as aplicações

O proxy de desenvolvimento do Angular encaminha `/api/**` preservando o caminho. No host, o destino padrão é `http://127.0.0.1:8080`; no Docker, `API_PROXY_TARGET` seleciona `http://backend:8080`. O proxy não realiza autenticação.

O PostgreSQL do Compose não publica porta no host. Executar o backend fora do Docker exige um banco acessível e a configuração correspondente.

## Organização e documentação

| Local | Conteúdo |
| --- | --- |
| `backend/` | Aplicação Spring Boot, Maven Wrapper, configurações e testes. |
| `frontend/` | Aplicação Angular, dependências, proxy e assets. |
| `docs/` | Documentação de funcionalidades e registros históricos. |
| `openspec/` | Histórico de mudanças antigas. O processo deixou de ser usado em 22/10/2026. |
| [Regras de negócio](docs/regras-negocio/README.md) | TAP, planos comerciais e aplicabilidade por edição. |
| [Integração do backend](docs/integracao-backend.md) | Inventário, contratos, decisões, tarefas e evidências da implementação. |
| [API e operação](docs/backend-api.md) | Autenticação, parametrização, DTOs e comandos da API local. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Fluxo de colaboração, padrões de desenvolvimento, commits, PRs e verificações. |
| [PRODUCT.md](PRODUCT.md) | Contexto e limites do produto. |
| [DESIGN.md](DESIGN.md) | Identidade visual, paleta PA27 e decisões de interface. |
| [frontend/README.md](frontend/README.md) | Execução isolada do frontend e detalhes do proxy. |
| [docs/login.md](docs/login.md) | Requisitos e histórico da tela de login. |
| [docs/historico-configuracao.md](docs/historico-configuracao.md) | Evidências antigas da reorganização, biblioteca de interface e tema. |

A paleta é implementada em `frontend/src/styles.less`. A origem das imagens está em [frontend/public/images/README.md](frontend/public/images/README.md). Os assets necessários estão versionados; os PDFs originais não são necessários para executar o frontend.

A implementação atual usa a documentação de tarefas do projeto, sem criar mudanças OpenSpec.

## Como contribuir

Leia o [guia de colaboração](CONTRIBUTING.md) para abrir uma Issue, trabalhar em uma branch, executar as verificações relevantes e preparar um Pull Request.

O time reúne três pessoas da trilha Java e duas da trilha IA & Dados. Frontend, banco e contratos entre componentes exigem alinhamento conjunto; a distribuição individual das tarefas é combinada pela equipe.
