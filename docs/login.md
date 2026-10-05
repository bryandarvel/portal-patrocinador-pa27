# Login Planeta Atlântida 2027

Fonte vigente de requisitos e tarefas: `openspec/changes/refine-login-carousel/`. OpenSpec foi inicializado durante o refinamento de 02/10/2026 após chegada da nova política; este documento preserva as fontes e evidências anteriores. O proposal do change declara a reconciliação retrospectiva.

Pedido confirmado em 02/10/2026: tela visual e validação de campos, construída em código com imagens oficiais do PDF. Página `/login`, com redirecionamento da raiz. Escopo frontend; sem endpoints, autenticação simulada, armazenamento de senha ou alteração de infraestrutura.

## Critérios de aceite

- Desktop: imagem oficial à esquerda, formulário NG-ZORRO à direita; marca e paleta PA27 reconhecíveis.
- Mobile: área visual compacta acima do formulário, sem rolagem horizontal em 390 px.
- E-mail e senha obrigatórios, formato de e-mail validado, mensagens associadas aos campos, foco visível e operação por teclado. Senha pode ser mostrada por botão com nome acessível.
- Envio inválido destaca campos; somente um envio válido informa que autenticação ainda não está integrada, sem chamar rede ou navegar para uma área protegida. Editar os campos remove esse aviso.
- Build Docker e teste do proxy passam; validação real no navegador cobre campos, senha visível, aviso e dois tamanhos. Não alterar budgets para ocultar avisos.

## Tarefas

### Refinamento vigente: indicadores, ritmo e cor

Pedido de 02/10/2026: manter somente as três barras clicáveis, remover play/pause, alternar em loop a cada 3s e enriquecer a superfície com a identidade PA27. Este ajuste substitui o intervalo de 7s e a pausa permanente após seleção descritos na entrega anterior. Alterações locais em TS, HTML e CSS do login; nenhuma dependência nova. Trabalho sequencial e pequeno, sem delegação.

Desenho: barras permanecem botões nativos sem aparência de botão, com alvo de 44px, nomes e foco visível. Seleção muda cena imediatamente; quando foco e ponteiro saem do painel, rotação continua. Foco/hover e aba oculta suspendem rotação; movimento reduzido continua sem autoplay. Dissolução de 500ms, zoom de 3% acompanha os 3s. Fotos ganham camada magenta/azul junto ao sombreamento de leitura. Painel direito ganha fundo rosado suave e borda superior magenta no bloco de formulário, mantendo o contraste e o layout responsivo.

Critérios: zero controles de play/pause; três barras operam com clique e teclado; avanço automático e retorno da última à primeira em intervalos de 3s; sem pausa permanente ao selecionar. Documento sem overflow em 1366×650, 1280×600 e 360×640; erros e formulário preservados. Build passa sem ajustar orçamento; registrar capturas e limites.

- [x] Simplificar controles e ajustar intervalo/transição.
- [x] Aplicar cor e acabamento sem aumentar altura mínima.
- [x] Validar ciclo, teclado, layout e build; atualizar guia. Evidências e limites em `openspec/changes/refine-login-carousel/tasks.md`.

### Carrossel comercial solicitado em 02/10/2026

Objetivo: alternar fotografias oficiais no painel esquerdo, mantendo logo PA27, formulário e divisão atual. Referência enviada orienta transição e indicadores; não altera paleta nem adiciona cadastro. Implementação local no componente de login, sem dependências novas. Reutilizar estilos, signals Angular e controles nativos; manter a regra de altura já validada.

Desenho: três cenas dos materiais PA27, com textos originais sobre experiência e presença de marca. Momento focal é a dissolução de 700ms entre fotografias, a cada 7s, com aproximação discreta de 3%; apenas opacity/transform. Indicadores manuais e pausa acessíveis por teclado. Hover e foco no painel suspendem a rotação; documento oculto e preferência por movimento reduzido suspendem autoplay, e movimento reduzido elimina zoom/transição. Timer e listeners devem ser descartados ao sair da rota. No cabeçalho móvel, preservar slogan curto e navegação compacta. Cabeçalho mínimo passa de 88px para 116px para acomodar controles de 44px sem sobreposição.

Critérios: três fotos distintas carregam; rotação automática e seleção manual funcionam; pausa permanece até reativada; foco não muda ao trocar cena; controles têm nomes e foco visível. Movimento reduzido não gira automaticamente. Sem overflow em 1366×650, 1280×600 e 360×640. Formulário e validação preservados. Build passa sem alterar budgets; capturas e origem dos assets registradas.

- [x] Preparar duas fotos adicionais com origem no PDF.
- [x] Implementar cenas, transição, indicadores e suspensão acessível.
- [x] Validar no navegador, build e documentar resultado.

Evidências: fotos da página 6, objeto 57, e página 8, objeto 115, otimizadas a 1500px. Quatro rasters carregados no navegador; scanner de origem retorna 4 arquivos, 0 sem metadados. Seleção manual mudou foto, texto e indicador; Enter selecionou cena 3 e manteve foco no mesmo controle. Retomada com foco e ponteiro fora do painel produziu troca automática. Pausa manteve cena 2 por mais de 7s. Emulação `prefers-reduced-motion: reduce` manteve cena 2 por mais de 7s, com `animationName: none` e transição `0s`; emulação removida ao concluir. Timer é cancelado pelo cleanup do effect, listeners pelo DestroyRef; descarte ao navegar foi inspecionado no código, não medido no navegador.

Medições: documento 1366×650 no desktop e 360×640 no celular; envio inválido em 1280×600 mantém documento 1280×600. Capturas em `.impeccable/review/desktop.jpg` e `mobile.jpg`. Build aprovado, inicial 865,78kB e login lazy 263,61kB. Avisos preservados: inicial acima de 500kB e CSS de login 4,67kB acima de 4kB, ambos abaixo dos limites de erro. `npm run test:proxy` 1/1; `git diff --check` sem erros; detector retornou `[]`. Nenhuma dependência nova. Docker existente reutilizado; apenas frontend reiniciado para recarregar arquivos.

Verificação reproduzível: abrir `/login`; selecionar imagem 2 e verificar título e indicador; retomar, mover foco e ponteiro ao e-mail, aguardar mais de 7s e verificar mudança; pausar, sair do painel e verificar estabilidade após mais de 7s. Emular movimento reduzido e repetir espera, conferindo imagem estável e ausência de zoom. Em 360×640, selecionar imagem 3 com Enter e conferir foco e ausência de overflow. Formulário continua com validação visual, sem autenticação.

### Ajuste solicitado em 02/10/2026: altura e copy

Diagnóstico no navegador: em 1366×650, a página mede 729 px. `min-height: 620px` na imagem e espaçamento fixo do formulário causam crescimento da grade. Objetivo: layout guiado pela altura útil, sem rolagem em notebook, mantendo campos e erros acessíveis. Remover altura mínima fixa, compactar espaços em janelas baixas e reduzir área visual no celular. Não usar `overflow: hidden` para esconder conteúdo; zoom e teclado virtual preservam acesso mesmo se exigirem rolagem.

Critérios adicionais: medir `scrollHeight <= innerHeight` nos estados inicial e inválido em 1366×650 e 1280×600, e no inicial em 390×844 e 360×640; sem overflow horizontal. Conferir também aviso válido e telas grandes. Copy orientada ao patrocinador, baseada nos PDFs fornecidos e no site oficial, sem importar datas/lineup da edição 2026 para o portal 2027.

Direção de copy: preservar o slogan oficial “Só quem vai sente” e substituir a saudação genérica por “Seu lugar no Planeta.”. Apoio descreve materiais e entregas do patrocínio; ajuda mantém atendimento RBS. Remover o rodapé repetitivo para priorizar o formulário. Textos de apoio são redação do portal, não citações oficiais. Fontes: [História](https://planetaatlantida.com.br/historia), [Experiências](https://planetaatlantida.com.br/experiencias) e planos comerciais fornecidos pelo grupo, que tratam de conexão entre marcas e planetários. O site ainda usa identidade 2026 na home; o visual PA27 permanece autoridade para 2027.

- [x] Adaptar altura útil e espaçamentos.
- [x] Revisar copy com fontes oficiais e atualizar guia visual.
- [x] Validar medidas, estados e capturas no navegador; registrar limites.

- [x] Extrair e otimizar foto e logo oficiais, registrando origem.
- [x] Implementar login em `frontend/src/app/features/auth/login/` e rotas; reutilizar cores globais e módulos NG-ZORRO existentes.
- [x] Validar build, interação, responsividade e acessibilidade; revisão independente e registro do resultado.

## Direction contract

THESIS: entrada do patrocinador com a energia real do festival e um formulário simples e legível; a divisão clássica foi explicitamente escolhida pelo grupo.

OWN-WORLD: fotografia oficial de palco e fogos, logo original, magenta na ação principal; campos claros e texto escuro. Interface de operação com a fonte de sistema do NG-ZORRO.

STORY: reconhecer o evento, informar e-mail e senha, receber feedback claro. Não prometer login funcional enquanto não houver integração.

FIRST VIEWPORT: fotografia ocupa aproximadamente 54% da largura desktop, logo no alto e frase oficial em branco na parte inferior. Área direita branca, formulário de até 400 px centralizado, campos grandes e botão magenta de largura total. No celular a foto se torna um cabeçalho compacto.

FORM: divisão clássica esquerda/direita fixada pelo usuário; não há seed nem seleção de conceitos por ser um pedido precisamente especificado. Construção code-first confirmada.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Riscos e limites

Foto ilustrativa do festival extraída do material visual PA27, sem afirmar que documenta uma edição futura. Não adicionar recuperação de senha ou cadastro com destinos inexistentes. A paleta global permanece a fonte das cores.

## Evidências do ajuste de altura e copy: 02/10/2026

Removida a altura mínima de 620px do painel visual e o rodapé repetitivo. Espaçamento usa altura útil (`svh`); até 700px de altura, formulário fica compacto. Até 760px de largura, a imagem ocupa `clamp(88px, 17svh, 160px)`; combinando largura e altura compactas, ocupa 88px e o cabeçalho textual repetido é ocultado. Nenhum conteúdo do formulário tem overflow oculto.

Navegador real: largura e altura do documento iguais ao viewport nos estados inicial e inválido em 1366×650 e 1280×600; inicial em 360×640, 390×844 e 1440×900; aviso após envio válido em 1280×600 e 390×844. Sem rolagem horizontal ou vertical nessas medições. Capturas atualizadas: `.impeccable/review/desktop.jpg` (1366×650) e `mobile.jpg` (360×640). Em zoom, teclado virtual ou janelas menores, a rolagem natural permanece disponível para não cortar controles.

Build Docker aprovado: bundle inicial 865,64 kB e login lazy 258,78 kB; aviso de orçamento de 500 kB preservado. Detector `impeccable detect --json` retornou `[]`; `git diff --check` sem erros. Nenhuma nova dependência. CSS e HTML do login alterados; guia visual atualizado em `DESIGN.md` e `.impeccable/design.json`.

## Evidências da entrega inicial: 02/10/2026

`docker compose exec -T frontend npm run build` aprovado. Bundle inicial 865,64 kB, aviso de 500 kB mantido e abaixo do limite de erro de 1 MB; rota de login em chunk lazy de 258,28 kB. Teste `npm run test:proxy` aprovado, 1/1. `git diff --check` sem erros de whitespace. Detector de interface sem achados.

No navegador: raiz redireciona para `/login`; campos vazios e e-mail inválido exibem erros associados; mostrar/ocultar senha muda o tipo do input; Tab alcança senha e botão de visibilidade com foco visível; Enter envia. Capturas em `.impeccable/review/desktop.jpg` (1440×900) e `mobile.jpg` (390 px, estado de erro) mostram assets carregados e nenhuma rolagem horizontal. Console sem erros.

Revisão independente encontrou aviso prematuro após corrigir um envio inválido. Corrigido com estado de validação separado do estado de tentativa. Regressão reproduzível: enviar vazio, preencher valores válidos e conferir que o aviso permanece ausente; enviar com Enter e conferir que aparece; editar um campo e conferir que desaparece. Verificado no navegador: contagens 0, 1, 0. Revisor marcou o apontamento resolvido, disposição `ship`, no escopo dessa correção.

NG-ZORRO 22 usa `nz-input-wrapper` e a diretiva `nzInputSuffix`; `nz-input-group` de exemplos antigos não pertence à API instalada. Ícones locais são registrados com `provideNzIconsPatch([...])` no componente. O primeiro build revelou esses erros de API e o build final confirma a correção.

Reutilizados os containers existentes. O dev server precisou de reinício do serviço frontend para carregar as mudanças, pois não foram observados eventos do watcher neste ambiente. Backend e banco continuam ativos e preservados. Nenhum endpoint de autenticação, armazenamento de senha ou navegação autenticada foi implementado.

Guia visual final registrado em `DESIGN.md` e `.impeccable/design.json`; JSON validado pelo documentador. Origem dos dois rasters embutida e conferida: `impeccable embed-prompt --scan frontend/public/images` retornou 2 arquivos, 0 sem origem. Snippets de documentação não foram renderizados; a verificação visual cobre a tela Angular real.

## Correção vigente de acessibilidade

Em 05/10/2026, o controle discreto de pausa/retomada substitui a decisão anterior de retirar play/pause. A pausa permanece ao preencher o formulário e interrompe troca e zoom; indicadores continuam operáveis. Contrato e evidências: [corrigir-acessibilidade-login](../openspec/changes/corrigir-acessibilidade-login/).
