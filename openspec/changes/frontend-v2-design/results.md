# Resultados

Data: 30/10/2026. Branch: `dev-icaro` (criada a partir de `dev` em `c6a5f2a`).

## O que mudou

- Layout v2 em todas as telas autenticadas, nos dois perfis: `app-portal-header` (novo, `frontend/src/app/shared/portal-header.ts`), `PartnershipShell` refeito (barra lateral com ícones, Entregas como 08, relatório na lateral, conta e Sair no rodapé, ajuda flutuante, painel `nz-drawer` abaixo de 960px).
- Padrões compartilhados: `app-card-heading`, `app-submission-status` (substitui 6 cópias da faixa de envio), `.pa-card` (substitui 8 bases de cartão repetidas), `.pill`/`.primary-button` (substituem `dark-button` e `brand-button`), `registerPortalIcons()`.
- Tokens v2 em `frontend/src/styles.less`: primário azul `#0b6bf2`, tons, raios e sombra de cartão. Glifos Unicode trocados por `nz-icon`. 57 larguras fixas de botões de texto e 15 correções `padding-top: 11px !important` removidas.
- Removido `admin/shared/admin-partnership-shell.css`, sem referência em nenhum componente.
- `DESIGN.md` e `.impeccable/design.json` reescritos como sistema único; `frontend/docs/telas-portal.md` e `docs/historico-configuracao.md` apontam para a decisão vigente.

## Verificação

| Verificação | Resultado |
| --- | --- |
| `npm run build` (frontend) | Aprovado. Inicial 900,80 kB contra 899,91 kB na `dev`; os mesmos 4 avisos de orçamento da `dev`. |
| `npm run test:proxy` | 1/1 aprovado. |
| `openspec validate frontend-v2-design --strict --no-interactive` | Válido. |
| `git diff --check` | Sem problemas. |
| Capturas Playwright (Chromium 1208, API sintética via `page.route`, sem backend) | Mídia em 1672×941 conferida contra a referência; 21 telas nos dois perfis em 1440×900 e telas avulsas; 390×844 para mídia e patrocinadores. Sem rolagem horizontal em nenhuma. |
| Ícones | Todos os `nz-icon` com SVG nas telas conferidas; nenhuma requisição a `/assets/`. |
| Teclado | Ordem: pular conteúdo, sino, voltar, áreas; foco visível de 2px em todos. Mobile: menu abre com foco no painel, Esc fecha e devolve o foco ao botão, navegar fecha o painel. |
| Contraste | Texto auxiliar 5,89:1 no fundo; número ativo 6,03:1 no marinho; botão azul 4,77:1; ícone azul no quadrado 4,17:1 (não textual, mínimo 3:1). |

## Limites

- Verificação visual feita com dados sintéticos. Fluxos reais (envio, aprovação, notificações com dados do backend) ainda precisam ser testados na máquina remota.
- O ponto do sino indica que há notificações da parceria; o backend não tem estado de lida.
- O login herda os tokens globais: o fundo do painel do formulário ficou levemente azulado e o texto, um pouco mais escuro. Botão e layout não mudaram.

## Envio

`f681161` enviado para `origin/dev-icaro` em 30/10/2026 (avanço rápido a partir de `2a562b1`). Pendentes, conforme `tasks.md` (Workflow follow-up): implantação e teste na máquina remota por ssh e PR de `dev-icaro` para `dev`.

## Implantação no servidor remoto

30/10/2026: `docker compose up` falhou porque 4200 e 8025 já estavam ocupadas no servidor por outro projeto (`fusion-new`). O `compose.yaml` passou a aceitar `FRONTEND_PORT` e `MAILPIT_PORT` (padrões 4200 e 8025, documentados em `.env.example` e no README); no servidor, o `.env` usa 4300 e 8125, portas já encaminhadas pelo túnel ssh.
