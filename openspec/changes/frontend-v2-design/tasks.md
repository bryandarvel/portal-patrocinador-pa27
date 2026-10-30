# Tasks

## 1. Fundação

- [x] 1.1 Tokens v2 em `styles.less` (primário azul, cantos, sombras, cores de tom) e login com magenta local; verificar com `npm run build` e login visualmente inalterado.
- [x] 1.2 Registrar ícones outline em `app.config.ts`; verificar que `nz-icon` renderiza SVG sem requisição de rede.
- [x] 1.3 Padrões compartilhados (`.pa-card`, `app-card-heading`, status, área de envio, botões arredondados) em `features/partnership/shared`; verificar com build.

## 2. Layout

- [x] 2.1 Refazer `PartnershipShell` conforme a referência (cabeçalho, barra lateral, rodapé de conta, ajuda flutuante, entregas como item 08, relatório na lateral); verificar os dois perfis em 1672×941.
- [x] 2.2 Menu em painel abaixo de 960px; verificar 390px sem rolagem horizontal, foco e Esc.

## 3. Telas

- [x] 3.1 Mídia e conteúdo (patrocinador e admin) fiel à referência; comparar captura com a imagem.
- [x] 3.2 Perfil, marca, cortesias, credenciamento, pesquisa, contrato, entregas, detalhe da entrega, FAQ e relatório RBS nos dois perfis, removendo CSS duplicado; build e captura de cada tela.
- [x] 3.3 Telas sem barra lateral (`/parcerias`, `/rbs/patrocinadores`, `/conta`, `/sem-acesso`) com cabeçalho e cartões v2; captura de cada uma.

## 4. Documentação e entrega

- [x] 4.1 Reescrever `DESIGN.md` como sistema único (login e portal) e linkar este change em `frontend/docs/telas-portal.md`.
- [x] 4.2 Validar `npm run build`, `npm run test:proxy`, `openspec validate frontend-v2-design --strict --no-interactive` e verificação de acessibilidade (teclado, foco, contraste); registrar em `results.md`.
- [ ] 4.3 Commit em `dev-icaro` e envio para `origin/dev-icaro`.

## Workflow follow-up

- Implantar por ssh na máquina remota, testar com o usuário e abrir PR de `dev-icaro` para `dev`.
