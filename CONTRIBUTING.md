# Guia de colaboração

Este guia orienta as contribuições ao **Portal do Patrocinador — Planeta Atlântida**, do Desafio GC para o Grupo RBS. Para conhecer o produto, as tecnologias e a execução local, consulte o [README.md](README.md).

## 1. Fluxo de trabalho

A branch `main` representa a versão integrada do projeto. Toda correção, melhoria ou nova funcionalidade começa por uma **Issue**, é desenvolvida em uma **branch de tarefa** e chega à `main` por um **Pull Request (PR)**, que permite revisar as mudanças antes de incorporá-las.

Use mudanças pequenas, com objetivo e critérios de aceite claros. Evite misturar documentação, reorganizações e funcionalidades sem relação na mesma tarefa.

As regras deste guia orientam a colaboração. Proteções de branch e verificações obrigatórias dependem da configuração do repositório no GitHub.

## 2. Acesso e preparação

Repositório: **https://github.com/gbarceloz/Desafio-GC-RBS**.

Para enviar alterações, sua conta precisa ter acesso de escrita. Caso o acesso dependa de convite, aceite-o com a conta autorizada antes de clonar ou publicar sua branch. Combine o acesso com o responsável pelo repositório.

Se ainda não possui um clone:

```powershell
git clone https://github.com/gbarceloz/Desafio-GC-RBS.git
cd Desafio-GC-RBS
```

Se já possui um clone, trabalhe nele. Uma pasta obtida por download de ZIP não contém, necessariamente, o histórico Git do projeto.

Prepare o ambiente conforme o [README.md](README.md). Use as versões e dependências declaradas no projeto. Alterações em dependências ou configuração precisam estar relacionadas à Issue e ser explicadas no PR.

## 3. Criar uma Issue e registrar o escopo

Abra uma Issue antes de começar. Se o repositório oferecer um modelo adequado, utilize-o. Caso contrário, inclua:

- **Problema ou objetivo:** o que precisa mudar e por quê.
- **Escopo:** quais comportamentos e componentes serão afetados.
- **Critérios de aceite:** como a equipe verificará que a tarefa foi concluída.
- **Dependências:** decisões do PO, dados, acessos ou trabalho de outros integrantes.

Anote o número da Issue. Ele será usado na branch e no PR.

Antes de implementar uma mudança não trivial, reutilize a documentação vigente em `docs/` com objetivo, escopo, critérios e tarefas. Para esta implementação, a fonte é [integração do backend](docs/integracao-backend.md), apoiada pelo [TAP e planos comerciais](docs/regras-negocio/README.md). OpenSpec deixou de ser usado em 22/10/2026; os arquivos antigos permanecem como histórico.

Registre decisões confirmadas, propostas e dúvidas de forma explícita. Hipóteses sobre cotas, permissões ou relatórios precisam ser validadas antes de virar regras do sistema.

## 4. Criar uma branch de tarefa

Na raiz do clone:

```powershell
git status
git switch main
git pull --ff-only origin main
git switch -c feat/NUMERO-nome-curto-da-tarefa
```

Substitua `NUMERO` pelo número real da Issue. Antes de trocar de branch, confira o resultado de `git status` e preserve qualquer trabalho pendente. Se o `pull --ff-only` informar divergência, revise a situação antes de continuar.

| Prefixo | Uso | Exemplo ilustrativo |
| --- | --- | --- |
| `feat/` | Nova funcionalidade | `feat/42-perfil-patrocinador` |
| `fix/` | Correção de erro | `fix/57-validacao-email` |
| `docs/` | Documentação | `docs/63-guia-contribuicao` |
| `refactor/` | Reorganização sem mudança de comportamento | `refactor/64-organizacao-autenticacao` |
| `test/` | Criação ou ajuste de testes | `test/65-proxy-frontend` |
| `chore/` | Configuração e manutenção | `chore/66-configuracao-ambiente` |

Os números da tabela são exemplos. Use nomes curtos, em minúsculas, sem espaços ou acentos.

## 5. Padrões de desenvolvimento

### Organização do código

O projeto mantém aplicações separadas em `backend/` e `frontend/`. Essas pastas representam aplicações; os domínios de negócio são definidos a partir do TAP e das decisões da equipe.

A organização por domínio, associada a DDD, procura manter juntas as regras de uma mesma parte do negócio. A base atual do backend ainda usa pacotes técnicos como `controller`, `service`, `entity` e `repository`. O README anterior já orientava organizar futuras funcionalidades por domínio; qualquer reorganização do código existente deve ter escopo próprio.

| Parte | Orientação para novas funcionalidades |
| --- | --- |
| Backend | `com.rbs.portal_patrocinador.<dominio>` pode organizar `domain` para regras de negócio, `application` para casos de uso, `infrastructure` para persistência e integrações e `interfaces` para entrada HTTP. |
| Frontend | `src/app/features/<dominio>/` reúne páginas, componentes e consumo de API da funcionalidade. `core/` recebe capacidades transversais e `shared/` elementos com reutilização real. |

Crie pastas e abstrações quando houver código que justifique sua existência. Uma aba do portal não define automaticamente um domínio independente. Preserve os padrões da funcionalidade que estiver alterando e explique mudanças estruturais no PR.

### Frontend

- Siga [DESIGN.md](DESIGN.md) e os tokens de `frontend/src/styles.less`.
- Importe o módulo NG-ZORRO necessário na funcionalidade correspondente.
- Utilize as variáveis de cor existentes, como `--color-primary`, `--color-text` e `--color-surface`.
- Preserve navegação por teclado, foco visível, rótulos e mensagens de erro compreensíveis. Estados devem ter texto ou ícone além da cor.
- Respeite os limites de tamanho configurados no Angular. Registre avisos e avalie sua causa antes de propor mudança nos limites.
- Preserve a origem e o uso autorizado dos materiais PA27, descritos em [frontend/public/images/README.md](frontend/public/images/README.md).

### Backend, APIs e dados

- Verifique permissões e regras de negócio no backend, incluindo acesso a arquivos, dados e relatórios de cada patrocinador.
- Combine mudanças nas APIs com quem consome os dados. Documente campos, identificadores, respostas e erros relevantes para a tarefa.
- Para relatórios e indicadores, registre origem dos dados, unidade de medida, período, tratamento aplicado e vínculo com a parceria.
- Diferencie quantidade contratada, entrega realizada e comprovação disponível conforme as regras aprovadas.
- Mudanças em banco, integrações ou formatos de entrada precisam informar seus impactos para as outras partes do sistema.

Frontend e banco são trabalhos conjuntos. Coordene dependências entre as trilhas Java e IA & Dados na Issue e na revisão do PR.

### Documentação

| Documento | Responsabilidade |
| --- | --- |
| `README.md` | Apresentação, estado atual, tecnologias, execução e navegação. |
| `CONTRIBUTING.md` | Colaboração, padrões, commits, PRs e verificações. |
| `PRODUCT.md` | Contexto e limites do produto. |
| `DESIGN.md` | Identidade visual e decisões de interface. |
| `docs/` | Requisitos específicos, decisões, tarefas e evidências datadas. `openspec/` permanece como histórico. |

Atualize a documentação afetada pela tarefa. Registre resultados de verificações com data e limites, distinguindo leitura de código, compilação, testes e validação da aplicação em execução.

## 6. Verificações antes do PR

Execute as verificações pertinentes à mudança e registre o resultado. Os comandos Docker abaixo são executados na raiz do repositório.

### Backend

O backend usa PostgreSQL no Compose, migrações Flyway e configuração local em `.env`. Consulte o [guia da API](docs/backend-api.md) para as variáveis e os limites das verificações.

Para evitar execuções simultâneas de Maven na mesma pasta:

```powershell
docker compose stop backend
docker compose run --rm backend sh ./mvnw test
```

O serviço de banco é dependência do backend. H2 cobre somente o teste de contexto; a validação de negócio com PostgreSQL é feita pelo smoke HTTP. Se o backend estava ativo e for necessário retomá-lo após a verificação:

```powershell
docker compose up -d backend
```

Para quem já possui JDK 21 e banco acessível configurado fora do Docker, a alternativa no PowerShell é:

```powershell
cd backend
.\mvnw.cmd test
cd ..
```

A suíte inclui contexto, autenticação e regras de domínio. Com backend, banco e Mailpit ativos, execute também `python3 backend/scripts/check-portal-api.py` na raiz para validar os fluxos reais de API. O smoke usa contas sintéticas e adiciona registros identificados por `Smoke`, sem apagar dados anteriores. Essas verificações locais não substituem a homologação com serviços externos.

### Frontend

No Docker:

```powershell
docker compose stop frontend
docker compose run --rm --no-deps frontend sh -c "npm ci && npm run test:proxy && npm run build"
```

Se o frontend estava ativo e for necessário retomá-lo:

```powershell
docker compose up -d frontend
```

Alternativa no PowerShell, com Node compatível:

```powershell
cd frontend
npm.cmd ci
npm.cmd run test:proxy
npm.cmd run build
cd ..
```

Em WSL, Linux ou macOS, use `npm` no lugar de `npm.cmd` e `./mvnw` no lugar de `mvnw.cmd`.

O script `test:proxy` verifica os destinos local e Docker do proxy. A base analisada não define scripts `lint` ou `test` no frontend, nem uma suíte de componentes ou testes de ponta a ponta. Para mudanças visuais, confira também os estados afetados no navegador, em desktop e em uma tela estreita.

### Documentação e revisão do diff

Para mudanças somente de documentação, confira links, caminhos, comandos e a prévia Markdown. Execute:

```powershell
git diff --check
git diff
```

Esse tipo de alteração, por si só, não exige repetir build e testes da aplicação. Antes do commit, revise também o conteúdo preparado com `git diff --staged`.

Se alguma verificação falhar ou não puder ser executada, informe o comando, o resultado e o motivo no PR. Separe falhas introduzidas pela mudança de problemas preexistentes.

## 7. Commits e publicação da branch

Use mensagens com tipo e descrição objetiva:

```text
tipo: descreve a alteração
```

Os tipos seguem os prefixos das branches: `feat`, `fix`, `docs`, `refactor`, `test` e `chore`. Quando ajudar, acrescente o componente como escopo:

```text
docs: organiza README e guia de contribuição
fix(frontend): corrige validação do e-mail
test(backend): cobre regras de acesso ao patrocinador
```

Selecione somente os arquivos da tarefa e revise-os antes de registrar o commit:

```powershell
git status
git add caminho/do/arquivo1 caminho/do/arquivo2
git diff --staged --check
git diff --staged
git commit -m "docs: organiza README e guia de contribuição"
git push -u origin docs/NUMERO-guia-contribuicao
```

Adapte a mensagem e o nome da branch à tarefa real. Evite `git add .` e `git add -A` quando houver alterações de outros trabalhos na pasta.

Arquivos que não devem entrar no commit incluem dependências instaladas (`node_modules/`), resultados de build (`dist/`, `target/`), cobertura, arquivos temporários, `.env` com valores locais e segredos. Exemplos de configuração podem ser versionados com valores fictícios. Mantenha o `package-lock.json` quando houver mudança intencional nas dependências.

O uso de assistentes não transfere a responsabilidade pela revisão. Neste fluxo, commits, push, abertura de PR, merge e deploy são ações realizadas pelos integrantes responsáveis; assistentes podem preparar arquivos, revisar e sugerir comandos.

## 8. Abrir e revisar o Pull Request

No GitHub, abra o PR da sua branch para `main`. Confira **base: `main`** e **compare: sua branch**.

Use um título que descreva a mudança e uma descrição contendo:

- Problema ou objetivo e comportamento resultante.
- Principais mudanças e limites do escopo.
- Como conferir o resultado.
- Verificações executadas, resultados e pendências.
- Referência à Issue.

Use `Closes #NUMERO` quando o PR resolver a Issue por completo; use `Refs #NUMERO` quando entregar somente parte dela. O fechamento automático por palavra-chave depende da integração na branch padrão do repositório.

Solicite revisão de outro integrante, preferencialmente alguém que conheça a parte afetada. O merge deve ocorrer após a revisão e a resolução dos pontos levantados. Se houver verificações automáticas exigidas pelo GitHub, elas também precisam passar. O ZIP analisado não contém workflows de CI ou modelos de Issue/PR; os resultados locais devem ser registrados na descrição.

Antes do merge, confira se o PR contém somente os arquivos da tarefa, se a documentação acompanha o comportamento do código e se as pendências relevantes estão explícitas. Mudanças ainda incompletas podem ser apresentadas como Draft PR.

## 9. Atualizar a branch e encerrar a tarefa

Quando a `main` receber alterações novas, com o trabalho local já preservado:

```powershell
git switch main
git pull --ff-only origin main
git switch feat/NUMERO-nome-curto-da-tarefa
git merge main
```

Se houver conflitos, resolva os arquivos indicados, execute as verificações afetadas e finalize o merge. Os comandos abaixo se aplicam quando o Git informar que o merge está pendente de conclusão:

```powershell
git add caminho/do/arquivo-resolvido
git diff --staged
git commit
git push
```

Após confirmar que o PR foi integrado:

```powershell
git switch main
git pull --ff-only origin main
git branch -d feat/NUMERO-nome-curto-da-tarefa
```

Se o Git recusar a exclusão da branch, confira o histórico e a integração do PR antes de tentar outra ação. Uma integração por squash pode não ser reconhecida como merge dos commits originais.

## Referências

- [Guias de contribuição no GitHub](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/setting-guidelines-for-repository-contributors).
- [Criar um Pull Request](https://docs.github.com/en/pull-requests/how-tos/create-pull-requests/creating-a-pull-request).
- [git switch](https://git-scm.com/docs/git-switch) e [git pull](https://git-scm.com/docs/git-pull).
