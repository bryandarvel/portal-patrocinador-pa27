# Organização e execução do projeto

Angular é o frontend e Spring Boot é o backend. A divisão do desafio continua sendo Java e IA & Dados; telas e banco são trabalho conjunto. O TAP e MATERIAIS RBS orientam o produto. A base atual ainda não implementa os perfis, as sete abas ou endpoints de negócio.

## Estado atual e navegação

Atualizado em 04/10/2026: o Angular redireciona `/` para `/login`. A tela valida e-mail e senha e, após um envio válido, informa que a autenticação ainda não está integrada. Ela não autentica nem cria uma sessão; a entrada provisória do Spring Security é separada e serve ao desenvolvimento local.

| Se a tarefa tratar de... | Comece por... |
| --- | --- |
| Escopo, usuários e limites do produto | [PRODUCT.md](PRODUCT.md) |
| Identidade visual e decisões de interface | [DESIGN.md](DESIGN.md) e `frontend/src/styles.less` |
| Rotas e entrada do frontend | [app.routes.ts](frontend/src/app/app.routes.ts), [login.ts](frontend/src/app/features/auth/login/login.ts), [login.html](frontend/src/app/features/auth/login/login.html) e [login.css](frontend/src/app/features/auth/login/login.css) |
| Requisitos, critérios e histórico da tela de login | [docs/login.md](docs/login.md) e [tarefas do change ativo](openspec/changes/refine-login-carousel/tasks.md) |
| API, configuração e testes do backend | [aplicação Spring](backend/src/main/java/com/rbs/portal_patrocinador/PortalPatrocinadorApplication.java), [pom.xml](backend/pom.xml) e `backend/src/test/` |
| Serviços locais, portas e proxy | [compose.yaml](compose.yaml); proxy Angular em `frontend/proxy.conf.cjs` |
| Requisitos e tarefas de uma mudança | Schema em [openspec/config.yaml](openspec/config.yaml) e changes em `openspec/changes/`; atualize ou crie o change pertinente antes de implementar |

Este README é o índice operacional do repositório. Use os documentos e changes apontados como fontes de decisão e requisitos, sem duplicar seu conteúdo aqui.

## Biblioteca de interface NG-ZORRO

Escopo autorizado em 02/10/2026: instalar NG-ZORRO 22.1.1 no frontend Angular 22, registrar dependências no lockfile, importar os estilos oficiais e configurar português do Brasil. Manter a estrutura DDD, o proxy, Docker e a tela inicial existentes. Não gerar layouts, telas ou componentes de negócio nesta instalação.

Critérios de aceite: resolução de dependências compatível, build de produção aprovado dentro do serviço frontend, aplicação inicial carregada sem erros de console e teste existente de proxy aprovado. Preservar os limites de tamanho configurados; registrar avisos reais caso ocorram.

- [x] Instalar a biblioteca e configurar estilos e locale.
- [x] Validar build, proxy e carregamento; encerrar instâncias de validação.

Validação em 02/10/2026: `npm ls` confirmou NG-ZORRO 22.1.1 e Angular 22.2.1 sem conflito de dependências. No Docker, `docker compose run --rm --no-deps frontend sh -c 'npm ci && npm run test:proxy && npm run build'` passou: 1 teste de proxy e build de produção. Bundle inicial: 753,68 kB, com aviso acima de 500 kB e abaixo do limite de erro de 1 MB; os limites foram preservados. O CSS completo oficial responde por 557,04 kB. A tela inicial carregou no navegador em `http://127.0.0.1:4200/`, sem erros de console. O frontend temporário foi encerrado com `docker compose stop frontend`; banco existente preservado. Ainda não há telas ou componentes de negócio usando a biblioteca.

Referências: [instalação oficial](https://ng.ant.design/docs/getting-started/en) e [idiomas](https://ng.ant.design/docs/i18n/en). Nos próximos componentes, importar diretamente o módulo NG-ZORRO necessário na funcionalidade correspondente; usar shared/ somente para reutilização real.

## Paleta do frontend: Planeta Atlântida 2027

Decisão vigente em 02/10/2026: todo o frontend usa a identidade de `Visual_PA27_padrão.pdf`, fornecido pelo grupo. As cores sólidas da página 4 foram extraídas dos preenchimentos vetoriais e convertidas para RGB de tela: magenta `#E2047D`, rosa `#FF8BDA`, azul `#009EE5`, verde `#06A883`, laranja `#E84F15` e laranja claro `#FF8617`. Amarelo `#FFDE03` foi extraído do extremo do degradê da página 3. O PDF não declara códigos HEX textuais; estes valores são uma extração para web, não códigos oficiais impressos.

Escopo: centralizar a paleta em `frontend/src/styles.less`, compilar o tema oficial do NG-ZORRO com magenta como ação principal e disponibilizar as demais cores como variáveis CSS. Usar branco e texto escuro como base de leitura. Tons de interação podem ser derivados para manter contraste. Preservar telas, domínio, backend, proxy e Docker. A compilação Less exige apenas uma dependência de desenvolvimento. Não criar telas de demonstração permanentes.

Critérios de aceite: build de produção no Docker, cores da marca disponíveis globalmente, botão primário e link do CSS compilado com magenta, contraste de texto normal pelo menos 4,5:1 nos pares definidos, aplicação inicial sem erros de console. Preservar e registrar os avisos de orçamento existentes.

- [x] Configurar paleta e tema global NG-ZORRO.
- [x] Validar build, cores compiladas, contraste e carregamento; registrar evidências.

Validação em 02/10/2026: build final no Docker (`docker compose exec -T frontend npm run build`) aprovado, bundle inicial 754,92 kB, com o aviso existente de 500 kB e abaixo do limite de erro de 1 MB. Teste existente de proxy aprovado (1/1). CSS compilado conferido para as sete cores e botão primário magenta. Contrastes com branco: magenta 4,62:1, hover/foco `#C9046F` 5,63:1, ativo `#B00361` 6,93:1, texto principal 15,52:1 e secundário 7:1. O mixin de botão do NG-ZORRO clareia o hover independentemente da variável geral; por isso os estados do botão primário recebem uma correção global de contraste. No navegador, as variáveis primária e amarela e o texto escuro foram confirmados por estilos computados, sem erros de console. Detector de interface sem achados. Frontend temporário encerrado, banco preservado. Nenhuma tela de negócio foi criada; estados semânticos da biblioteca serão avaliados quando forem usados nas telas.

Uso futuro: componentes de negócio consomem `var(--color-primary)`, `var(--color-text)`, `var(--color-surface)` ou as cores `var(--pa-...)` definidas em `frontend/src/styles.less`; não duplicar HEX nas funcionalidades. Usar texto escuro sobre rosa, azul, verde, laranja e amarelo, verificando contraste em cada contexto. Status devem ter rótulo ou ícone, além de cor.

## Organização DDD

A tela de login tem especificação, critérios de aceite e tarefas em [docs/login.md](docs/login.md). Contexto confirmado do produto: [PRODUCT.md](PRODUCT.md). Guia visual vigente para as próximas telas: [DESIGN.md](DESIGN.md). Acesse o frontend em `http://localhost:4200/login`.

Decisão do grupo em 01/10/2026: aplicações separadas em backend/ e frontend/, com documentação, Git e Docker Compose na raiz. Essas pastas representam aplicações, não bounded contexts de negócio.

    Desafio-GC-RBS/
      backend/
        .mvn/
        mvnw
        mvnw.cmd
        pom.xml
        src/main/java/com/rbs/portal_patrocinador/
        src/main/resources/
        src/test/java/com/rbs/portal_patrocinador/
      frontend/
        angular.json
        package.json
        package-lock.json
        proxy.conf.cjs
        proxy.conf.test.cjs
        src/app/
      compose.yaml
      README.md

Organizar futuras funcionalidades por domínio antes da camada técnica:

- Backend: com.rbs.portal_patrocinador.<dominio>.domain, .application, .infrastructure e .interfaces. Domínio contém invariantes; aplicação coordena casos de uso; infraestrutura implementa persistência e integrações; interfaces contém adaptadores HTTP. O domínio não depende de Angular, HTTP ou persistência.
- Frontend: src/app/features/<dominio>/ reúne páginas, componentes e consumo de API da funcionalidade; core/ recebe capacidades transversais e shared/ apenas elementos realmente reutilizados. Autorização e invariantes são verificadas no backend.
- Criar essas pastas somente quando houver código correspondente. Ainda não existem módulos de negócio: a classe principal e a base Angular permanecem no local de bootstrap. Não gerar entidades, interfaces ou camadas vazias para preencher a estrutura.
- Usar os termos do TAP para definir nomes e limites na implementação. Uma aba não é automaticamente um domínio independente.

## Escopo e tarefas da reorganização

Solicitação de 01/10/2026: mover a base Maven para backend/, manter Angular em frontend/ e separar as aplicações no Docker. Preservar versões, código, Spring Security, volume PostgreSQL e cache Maven. Preparação registrada antes das movimentações. Nenhuma tela ou funcionalidade de negócio será implementada nesta tarefa.

Critérios de aceite: teste Spring em backend/; build Angular aprovado; três serviços independentes no Compose; HTTP nas portas locais 8080 e 4200; proxy operando no host e no Docker; volumes anteriores preservados; comandos vigentes atualizados.

- [x] Mover a base Spring para backend/ e ajustar regras de Git.
- [x] Separar os serviços e adequar o proxy ao Docker.
- [x] Atualizar comandos e documentação de organização.
- [x] Validar Spring, build Angular, HTTP e proxy; registrar evidências e encerrar instâncias de validação.

## Execução com Docker

Requisito: Docker Desktop com containers Linux e Compose. Java, Maven, Node e PostgreSQL são fornecidos pelas imagens.

    git clone --branch feat/login-planeta-atlantida https://github.com/gbarceloz/Desafio-GC-RBS.git
    cd Desafio-GC-RBS
    docker compose up -d

Se já clonou, use `git fetch origin` e `git switch feat/login-planeta-atlantida` antes de iniciar. O projeto pode ficar em qualquer diretório: os mounts do Compose são relativos e fotos, logo, wrapper Maven e lockfile npm estão no repositório. Não precisa dos PDFs originais, de OpenSpec, Impeccable ou de configurações do Codex para executar a aplicação. As integrações de agentes versionadas servem ao workflow de desenvolvimento.

As portas 4200 e 8080 precisam estar livres. Containers usam `backend` e `db` para comunicação interna; `localhost` nos links significa a máquina de cada colaborador. O Compose é exclusivamente de desenvolvimento, com credenciais de teste públicas; produção exige configuração e autenticação próprias. Cada máquina cria seus próprios volumes de banco e caches, sem compartilhar dados locais pelo Git. Para encerrar, use `docker compose stop`.

| Serviço | Runtime | Endereço |
| --- | --- | --- |
| frontend | Node 24.15.0 e servidor Angular | http://127.0.0.1:4200 |
| backend | Java 21, Maven Wrapper e Spring Boot | http://127.0.0.1:8080/login |
| db | PostgreSQL 17 | db:5432, somente na rede Docker |

Frontend e backend montam somente suas respectivas pastas. O node_modules do container usa volume próprio, separado da instalação Windows. PostgreSQL e Maven mantêm seus volumes anteriores. O primeiro início instala dependências; container ativo não significa que a aplicação já está pronta. Aguarde os logs de inicialização.

    docker compose ps
    docker compose logs --tail 50 backend frontend
    docker compose down

O último comando encerra este projeto, preservando banco e caches. As portas são publicadas somente no loopback do Windows; o bind 0.0.0.0 do Angular é interno ao container. Login provisório do Spring Security: usuário local, senha local-dev. Credenciais do Compose são somente para desenvolvimento. Para o estado atual da tela Angular e o limite da autenticação, consulte a tabela acima e `docs/login.md`.

## Verificações com Docker

Os comandos abaixo terminam em foreground. Parar os servidores evita execuções simultâneas de Maven ou build na mesma pasta.

    docker compose stop backend frontend
    docker compose run --rm backend sh ./mvnw test
    docker compose run --rm --no-deps frontend sh -c "npm ci && npm run test:proxy && npm run build"
    docker compose up -d backend frontend

O banco permanece disponível para o teste Spring. O teste de proxy usa o test runner nativo do Node, sem dependência adicional, e cobre os destinos local e Docker.

## Execução do Angular no Windows

Requer Node compatível com Angular 22: ^22.22.3 ou ^24.15.0 ou >=26.0.0. Não exige CLI global.

    cd frontend
    npm ci
    npm start

Abra http://localhost:4200; encerre com Ctrl+C. npm run build gera os arquivos em frontend/dist/portal-patrocinador/browser.

proxy.conf.cjs encaminha /api/** preservando o caminho: no host, destino padrão http://127.0.0.1:8080; no container, API_PROXY_TARGET seleciona http://backend:8080. O proxy existe somente no desenvolvimento e não fornece autenticação. Uma consulta sem autenticação a /api/... com Accept: application/json recebe HTTP 401 do Spring.

Para Maven no Windows, use a pasta backend/, JDK 21 e as variáveis SPRING_DATASOURCE_URL, SPRING_DATASOURCE_USERNAME e SPRING_DATASOURCE_PASSWORD para um PostgreSQL acessível. O banco do Compose não publica porta no Windows; a opção completa Docker dispensa esse preparo.

## Evidências e limites

Validação da reorganização em 01/10/2026, horário de São Paulo:

- Teste Spring pelo serviço backend: BUILD SUCCESS, 1 teste, sem falhas, erros ou testes ignorados; conexão ao PostgreSQL confirmada.
- Build Angular no serviço frontend aprovado. Teste nativo do proxy aprovado no host e no container, cobrindo os destinos local e Docker.
- **Evidência histórica de 01/10/2026, antes da tela Angular de login:** frontend no Docker e login Spring retornaram HTTP 200; o navegador mostrou a saudação padrão do Angular sem erros no console. A raiz do backend não possuía endpoint e retornava 404 após autenticação. A rota atual `/login` e a validação visual estão descritas em `docs/login.md`; autenticação integrada continua fora do escopo implementado.
- Os sete arquivos versionados da base Maven/Java foram comparados com HEAD: conteúdo preservado, somente localização alterada. O volume PostgreSQL permaneceu desafio-gc-rbs-local_postgres-data; cache Maven também manteve seu volume.
- docker compose config --quiet e git diff --check passaram. Diretórios de build e node_modules permanecem ignorados pelo Git.
- Com autorização do usuário, a instância Angular anterior, PID 2516, e o antigo serviço app foram parados para a migração. Os novos containers desafio-gc-rbs-local-backend-1 e desafio-gc-rbs-local-frontend-1 foram parados ao concluir a validação usando docker compose stop backend frontend. O banco preexistente permaneceu ativo. Para iniciar as aplicações novamente, executar docker compose up -d.

Não foram criadas funcionalidades de negócio. DDD aqui define a organização das próximas implementações; ainda não existem agregados ou módulos de negócio para estruturar. O material do desafio deve permanecer restrito ao seu contexto.

Fontes técnicas do init: [instalação Angular](https://angular.dev/installation), [compatibilidade](https://angular.dev/reference/versions) e [proxy de desenvolvimento](https://angular.dev/tools/cli/serve#proxying-to-a-backend-server).

<div align="center">

# 🌍 Portal do Patrocinador - Planeta Atlântida 🎸
### Desafio GC 2026 | Trilhas Java & IA e Dados

[![Java](https://img.shields.io/badge/Java-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)](https://www.java.com/)
[![IA & Dados](https://img.shields.io/badge/IA_%26_Dados-FF6F00?style=for-the-badge&logo=databricks&logoColor=white)]()
[![RBS](https://img.shields.io/badge/RBS-Grupo_RBS-005C9E?style=for-the-badge)]()
[![Geração Caldeira](https://img.shields.io/badge/Geração_Caldeira-Desafio_2026-8A2BE2?style=for-the-badge)]()

*"Mais autonomia, transparência e agilidade para os patrocinadores. Menos trabalho manual para o time B2B."*

</div>

---

## 📖 Sobre o Projeto

O **Planeta Atlântida** é o maior festival de música do Sul do Brasil e completa **30 anos em 2026**. Com um público de **80 mil planetários** e **39 marcas patrocinadoras**, o time de Planejamento B2B da RBS enfrenta um grande desafio: gerenciar todas as informações dessas parcerias de forma centralizada.

Atualmente, os dados ficam espalhados em **e-mail, SharePoint, Teams e WhatsApp**, gerando retrabalho e demora no atendimento. 

O objetivo deste projeto é construir o **Portal do Patrocinador**, uma área online restrita e segura onde cada marca encontra tudo sobre sua parceria em um só lugar, desde o fechamento do contrato até o pós-evento.

---

## 🚨 O Problema (A Dor)

> [!WARNING]
> **Informação Espalhada:** Dados circulam por 4+ ferramentas diferentes.
> **Trabalho Manual:** O time gasta horas juntando dados de planilhas.
> **Sem Relatórios Automáticos:** Dificuldade em extrair históricos da parceria.
> **Perguntas Repetidas:** Patrocinadores dependem de e-mails para dúvidas simples.

---

## 💡 A Solução

<div align="center">
  <h3>Um portal online, restrito e personalizado.</h3>
</div>

O portal contará com **dois tipos de acesso**:
1. 🛡️ **Admin RBS:** Alimenta e gerencia o portal.
2. 🏢 **Admin Patrocinador:** Acesso para clientes e agências.

**O que o portal vai resolver:**
*   ✅ Centralizar documentos, status de entregas, mídia, cortesias e credenciamento.
*   ✅ Automatizar relatórios e indicadores de resultados parciais.
*   ✅ Disponibilizar um FAQ integrado e histórico organizado.
*   ✅ Dar autonomia total ao patrocinador com um menu baseado no plano comercial comprado (7 abas).

---

## 🛠️ Arquitetura e Tecnologias

O projeto é dividido em duas trilhas principais que se integram para formar a solução completa.

### ☕ Trilha Java (Back-end)
| Prioridade | Funcionalidade |
| :---: | :--- |
| 🔴 **Essencial** | Back-end do portal (API Rest) |
| 🔴 **Essencial** | Login individual e cadastro de e-mails liberados |
| 🔴 **Essencial** | Controle de permissões (Admin RBS vs. Admin Patrocinador) |
| 🔴 **Essencial** | Upload e download de arquivos |
| 🔴 **Essencial** | Histórico de atualizações e regras por nível de cota (Master, G, Subcota) |

### 🧠 Trilha IA & Dados
| Prioridade | Funcionalidade |
| :---: | :--- |
| 🟡 **Importante** | Organização (modelagem) dos dados dos patrocinadores |
| 🔴 **Essencial** | Extração de relatórios pelo portal e juntada de mídia/comprovações |
| 🟡 **Importante** | Automatização de alertas (prazos, atualizações, preenchimento) |
| 🟡 **Importante** | Integração com ferramentas da RBS (SharePoint e Outlook) |
| 🟢 **Desejável** | FAQ integrado com manual de operações |

### 🤝 Construído em Conjunto
*   🔴 **Essencial:** Banco de dados e Menu com as 7 abas do portal.
*   🟡 **Importante:** Integração entre as partes do sistema.
*   🟢 **Desejável:** Telas seguindo a identidade visual do Planeta Atlântida (cores, fontes, elementos e logo).

---

## 🏆 Critérios de Sucesso

Para considerarmos o projeto um sucesso, a entrega deve atender aos seguintes pilares:

<div align="center">

| 🟢 Funcionalidade | 🟡 Usabilidade | 🔵 Performance | 🟣 Impacto |
| :---: | :---: | :---: | :---: |
| O portal precisa funcionar de verdade: login, permissões, upload, download e histórico. | Clientes e agências precisam navegar sozinhos, seguindo o plano comercial. | Relatórios sem trabalho manual e dados centralizados no portal. | Redução de trocas de mensagens e histórico organizado para o time B2B. |

</div>

---

## 📚 Glossário Rápido (Contexto Planeta Atlântida)

<details>
<summary><b>Clique aqui para expandir e entender os termos do projeto</b> 👇</summary>

*   **Patrocinador:** Marca que paga para aparecer e fazer ações no festival.
*   **Ativação de Marca:** Ação que a marca faz no evento para interagir com o público.
*   **Cota de Patrocínio:** O "pacote" comprado (Master, Subcota G ou Subcota).
*   **Cortesias:** Ingressos gratuitos que a marca recebe (passaporte, sexta ou sábado).
*   **Plano Comercial:** Documento com tudo o que o patrocinador comprou e vai receber.
*   **Credenciamento:** Cadastro das pessoas que vão trabalhar no evento.
*   **B2B:** Relação da RBS com as marcas (Business to Business).
*   **Open Staff:** Sistema oficial de credenciamento usado pelo evento.
*   **Veiculação:** Publicação de anúncio ou conteúdo (TV, rádio, redes sociais).
*   **Planetários:** Nome dado ao público do Planeta Atlântida.

</details>

---

<div align="center">

### 🚀 Desenvolvido para o Desafio GC 2026
**Trilhas Java e IA & Dados**

*"O maior festival de música do Sul do Brasil merece a melhor gestão de parcerias."*

</div>
