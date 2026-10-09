# Portal do Patrocinador — Planeta Atlântida

Projeto do **Desafio GC 2026**, desenvolvido pelas trilhas **Java** e **IA & Dados** para o **Grupo RBS**.

O portal busca centralizar o acompanhamento das parcerias entre a RBS e os patrocinadores do Planeta Atlântida, do fechamento do contrato ao pós-evento. O objetivo é reunir informações, materiais, comprovações e relatórios, oferecendo autonomia aos patrocinadores e reduzindo a consolidação manual do time B2B.

## Estado atual

Situação identificada pela leitura do código do ZIP recebido em **09/10/2026**. Os itens abaixo descrevem o que está nos arquivos; não representam uma nova validação da aplicação em execução.

| Componente | Situação encontrada |
| --- | --- |
| Frontend | Tela `/login` com identidade PA27, carrossel, validação visual de e-mail e senha e redirecionamento da raiz. O formulário ainda não chama a API nem cria uma sessão. |
| Backend | Código de cadastro, verificação de e-mail, configuração de segundo fator, emissão de JWT e histórico/geolocalização de login. O fluxo de autenticação está em desenvolvimento. |
| Autenticação | A verificação de senha com BCrypt está comentada em `AuthService`; seu método de login ainda retorna um texto provisório no lugar do token. A presença de `TokenService` não significa que o login esteja integrado. |
| Banco | O Compose fornece PostgreSQL 17, mas `application.properties` declara driver e dialeto H2. O `pom.xml` inclui o driver PostgreSQL e não inclui H2. Essa configuração precisa ser alinhada antes de validar o backend. |
| Funcionalidades da parceria | As sete abas, as regras por cota e os relatórios da parceria permanecem como escopo a implementar. |

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

JWT e segundo fator ainda precisam ser integrados ao fluxo completo. BCrypt está previsto no código, mas sua verificação não está ativa no método de login analisado.

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

Essa tela permite conferir a interface e a validação dos campos. A autenticação ainda não está conectada ao backend.

### Ambiente completo com Docker

Requer Docker Desktop com containers Linux e Docker Compose. As imagens fornecem Java, Node e PostgreSQL; o backend utiliza Maven Wrapper.

**Pendência da base:** alinhar o driver e o dialeto H2 de `backend/src/main/resources/application.properties` com o PostgreSQL configurado no Compose. As variáveis atuais do Compose alteram URL, usuário e senha, mas não substituem o driver e o dialeto declarados. O envio de e-mails também depende de configuração válida para o ambiente utilizado. Os comandos abaixo descrevem a inicialização prevista; a execução completa dessa versão ainda precisa ser validada.

Na raiz do repositório:

```powershell
docker compose up -d
docker compose ps
docker compose logs --tail 50 backend frontend
```

| Serviço | Acesso |
| --- | --- |
| Frontend | http://localhost:4200/login |
| Backend | http://localhost:8080 — disponibilidade das rotas depende da configuração e da inicialização |
| PostgreSQL | `db:5432`, acessível pela rede interna do Docker |

O primeiro início instala dependências. Aguarde os logs de inicialização: um container ativo não comprova que a aplicação está pronta. As portas locais 4200 e 8080 precisam estar livres.

Para parar os serviços, preservando os volumes:

```powershell
docker compose stop
```

Para remover os containers e a rede deste projeto, preservando os volumes:

```powershell
docker compose down
```

O Compose é destinado ao desenvolvimento local. Cada máquina mantém seus próprios dados e caches. Consulte os arquivos de configuração para as variáveis locais; não use essas configurações como ambiente de produção.

### Comunicação entre as aplicações

O proxy de desenvolvimento do Angular encaminha `/api/**` preservando o caminho. No host, o destino padrão é `http://127.0.0.1:8080`; no Docker, `API_PROXY_TARGET` seleciona `http://backend:8080`. O proxy não realiza autenticação.

O PostgreSQL do Compose não publica porta no host. Executar o backend fora do Docker exige um banco acessível e a configuração correspondente.

## Organização e documentação

| Local | Conteúdo |
| --- | --- |
| `backend/` | Aplicação Spring Boot, Maven Wrapper, configurações e testes. |
| `frontend/` | Aplicação Angular, dependências, proxy e assets. |
| `docs/` | Documentação de funcionalidades e registros históricos. |
| `openspec/` | Especificações, decisões e tarefas das mudanças documentadas. |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Fluxo de colaboração, padrões de desenvolvimento, commits, PRs e verificações. |
| [PRODUCT.md](PRODUCT.md) | Contexto e limites do produto. |
| [DESIGN.md](DESIGN.md) | Identidade visual, paleta PA27 e decisões de interface. |
| [frontend/README.md](frontend/README.md) | Execução isolada do frontend e detalhes do proxy. |
| [docs/login.md](docs/login.md) | Requisitos e histórico da tela de login. |
| [docs/historico-configuracao.md](docs/historico-configuracao.md) | Evidências antigas da reorganização, biblioteca de interface e tema. |

A paleta é implementada em `frontend/src/styles.less`. A origem das imagens está em [frontend/public/images/README.md](frontend/public/images/README.md). Os assets necessários estão versionados; os PDFs originais não são necessários para executar o frontend.

OpenSpec e as integrações de agentes apoiam o desenvolvimento. Não são dependências de execução da aplicação.

## Como contribuir

Leia o [guia de colaboração](CONTRIBUTING.md) para abrir uma Issue, trabalhar em uma branch, executar as verificações relevantes e preparar um Pull Request.

O time reúne três pessoas da trilha Java e duas da trilha IA & Dados. Frontend, banco e contratos entre componentes exigem alinhamento conjunto; a distribuição individual das tarefas é combinada pela equipe.
