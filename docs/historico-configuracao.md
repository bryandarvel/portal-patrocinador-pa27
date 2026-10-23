# Histórico de configuração da base

Este arquivo preserva os registros técnicos que estavam no README recebido no ZIP de 09/10/2026. As evidências de 01 e 02/10 abaixo foram registradas anteriormente pela equipe; não foram repetidas durante a reorganização da documentação.

Para o estado atual e a execução, consulte o [README](../README.md). Para colaboração e verificações, consulte o [CONTRIBUTING](../CONTRIBUTING.md). As afirmações de escopo e estado nas seções preservadas correspondem à época de cada tarefa.

A validação posterior, de 04/10, está em [Publicação e portabilidade para colaboradores](../openspec/changes/publish-collaborator-branch/results.md). Nesse registro, o frontend passou por instalação, teste de proxy e build; Docker/Spring/PostgreSQL não foram novamente executados. Alterações posteriores no backend do ZIP precisam de verificação própria.

## Escopo e tarefas da reorganização

Solicitação de 01/10/2026: mover a base Maven para backend/, manter Angular em frontend/ e separar as aplicações no Docker. Preservar versões, código, Spring Security, volume PostgreSQL e cache Maven. Preparação registrada antes das movimentações. Nenhuma tela ou funcionalidade de negócio será implementada nesta tarefa.

Critérios de aceite: teste Spring em backend/; build Angular aprovado; três serviços independentes no Compose; HTTP nas portas locais 8080 e 4200; proxy operando no host e no Docker; volumes anteriores preservados; comandos vigentes atualizados.

- [x] Mover a base Spring para backend/ e ajustar regras de Git.
- [x] Separar os serviços e adequar o proxy ao Docker.
- [x] Atualizar comandos e documentação de organização.
- [x] Validar Spring, build Angular, HTTP e proxy; registrar evidências e encerrar instâncias de validação.

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
