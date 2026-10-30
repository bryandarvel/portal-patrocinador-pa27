# Design

## Context

Referência aprovada: imagem v2 da tela "Mídia e conteúdo" (Admin RBS, 1672×941). `PartnershipShell` já serve os dois perfis (`AdminPartnershipShell` o envolve). `partnership-ui.css` e `material-ui.css` entram em todas as telas; os cartões (`media-card`, `brand-card`, `profile-card`, `survey-card`, `staff-card`, `delivery-card`, `contract-card`) repetem a mesma regra em cada CSS. NG-ZORRO 22.1.1 instalado, usado só em botão, input, form e modal. Fontes Barlow Condensed e Roboto já hospedadas em `public/fonts`.

## Goals / Non-Goals

**Goals:** fidelidade à referência no desktop; uma definição por padrão visual; NG-ZORRO onde ele entrega o padrão sem custo de acessibilidade.

**Non-Goals:** mudar API, rotas, regras, textos de negócio ou o login; criar rotas `/v2` paralelas.

## Decisions

- **Tokens:** variáveis Less do NG-ZORRO (`@primary-color` azul `#0b6bf2`, `@border-radius-base`, `@font-family`) mais variáveis CSS em `:root`. Alternativa descartada: CSS-in-JS por componente, que duplicaria valores.
- **Ícones:** `nz-icon` com ícones outline registrados por `registerPortalIcons()` (`shared/portal-icons.ts`), chamado nos construtores dos layouts. Registrar em `app.config.ts` com `provideNzIcons` foi medido e descartado: levava o serviço de ícones ao bundle inicial do login (+76 kB brutos, +21 kB comprimidos). Lucide descartado por exigir dependência nova.
- **Navegação lateral:** `<nav>` com links nativos e `aria-current`, não `nz-menu`. O `nz-menu` usa `role="menu"`, que não descreve navegação entre páginas e muda a leitura por teclado.
- **Componentes NG-ZORRO usados:** `nz-icon`, `nz-tag` (cota), `nz-badge` (ponto do sino), `nz-avatar`, `nz-drawer` (menu mobile) e `nz-button` circular para a ajuda. `nz-float-button` foi descartado porque só aceita `href`, e a FAQ precisa de `routerLink`. A área de envio continua um `<button>` que abre o modal atual; `nz-upload` mudaria o fluxo de envio.
- **Compartilhamento:** `app-portal-header` (`shared/`) serve o layout da parceria e as telas avulsas; `.pa-card`, `app-card-heading` e `app-submission-status` ficam em `features/partnership/shared`. As regras duplicadas saem dos CSS das telas (incluindo o `admin-partnership-shell.css`, sem referência). Larguras fixas dos botões de texto saem para que ícone e texto definam a largura.
- **Ponto do sino:** consulta `/api/notificacoes` direto pelo `HttpClient`, em silêncio, porque `PortalApi.perform()` limparia a mensagem de erro exibida pela página. Indica que há notificações da parceria; não há estado de lida no backend.
- **Login:** mantém o magenta com regra local, porque o primário global muda.

## Risks / Trade-offs

- [Larguras fixas removidas mudam quebras de linha] → conferir cada tela em 1672px, 1280px e 390px.
- [Primário azul muda botões nos modais] → verificar modais de envio, relatório e notificações.
- [Credenciais do ambiente remoto] → verificação visual depende de acesso ao backend em `10.8.0.3` pelo túnel; sem ele, a tarefa fica pendente.

## Migration Plan

Commit em `dev-icaro`, implantação e teste na máquina remota por ssh, depois PR de `dev-icaro` para `dev`. Rollback: reverter o commit.
