---
name: Portal do Patrocinador
description: Identidade PA27 aplicada a um portal claro, de operação, para patrocinadores e equipe RBS.
colors:
  primary: "#0b6bf2"
  primary-hover: "#0a60da"
  magenta: "#e2047d"
  magenta-on-dark: "#ff5aa8"
  pa-blue: "#009ee5"
  pa-green: "#06a883"
  pa-yellow: "#ffde03"
  pa-pink: "#ff8bda"
  text: "#101828"
  text-secondary: "#556070"
  surface: "#ffffff"
  paper: "#f4f6fa"
  nav: "#f7f8fb"
  border: "#e2e6ee"
  border-strong: "#c9d1dd"
  dark: "#0f1a2e"
  header-base: "#0a1326"
  success: "#077a52"
  success-soft: "#e3f6ee"
  error: "#a62b30"
  error-soft: "#fff0ee"
  tone-blue-soft: "#e8f0fe"
  tone-pink-soft: "#fde8f2"
typography:
  display:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "70px"
    fontWeight: 700
    lineHeight: 1.03
    letterSpacing: "0.02em"
  card-title:
    fontFamily: "'Barlow Condensed', 'Arial Narrow', sans-serif"
    fontSize: "32px"
    fontWeight: 700
    lineHeight: 1.125
  brand:
    fontFamily: "Roboto, -apple-system, 'Segoe UI', Arial, sans-serif"
    fontSize: "25px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.01em"
  body:
    fontFamily: "Roboto, -apple-system, 'Segoe UI', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.47
  label:
    fontFamily: "Roboto, -apple-system, 'Segoe UI', Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  trail:
    fontFamily: "Roboto, -apple-system, 'Segoe UI', Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    letterSpacing: "0.08em"
rounded:
  control: "12px"
  card: "16px"
  nav-item: "10px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "20px"
  xl: "28px"
  content-x: "40px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 22px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 22px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.card}"
    padding: "28px"
  nav-item-active:
    backgroundColor: "{colors.dark}"
    textColor: "{colors.surface}"
    rounded: "{rounded.nav-item}"
    height: "52px"
  quota-tag:
    backgroundColor: "{colors.pa-yellow}"
    textColor: "{colors.text}"
    rounded: "{rounded.pill}"
  login-submit:
    backgroundColor: "{colors.text}"
    textColor: "{colors.surface}"
    rounded: "{rounded.pill}"
    height: "44px"
---

# Design System: Portal do Patrocinador

## Overview

**Creative North Star: "A energia do festival na moldura, a tarefa no centro."**

O portal é uma ferramenta de operação. Patrocinadores e equipe RBS entram para enviar materiais, acompanhar entregas e conferir documentos. A identidade Planeta Atlântida 2027 fica na moldura: cabeçalho marinho com luz azul e magenta, faixa de quatro cores sob o título e números magenta na navegação. O conteúdo fica em cartões brancos, claros e previsíveis.

A referência v2 aprovada em 30/10/2026 é a tela "Mídia e conteúdo" do Admin RBS; toda tela autenticada segue o mesmo layout. O login mantém a composição fotográfica própria, descrita em Components. Contrato da mudança: `openspec/changes/frontend-v2-design/`.

**Key Characteristics:**
- Um layout para os dois perfis: cabeçalho, barra lateral numerada e conteúdo.
- Ação principal azul; magenta só como destaque da identidade.
- Títulos condensados em caixa alta; texto em Roboto.
- Cartões brancos com quadrado de ícone colorido no cabeçalho.
- Ícones de linha do NG-ZORRO (Ant Design outline), nunca glifos Unicode.

## Colors

Os tokens vivem em `frontend/src/styles.less`: variáveis Less do NG-ZORRO (`@primary-color`, `@text-color`) e variáveis CSS em `:root` (`--color-*`, `--tone-*`, `--radius-*`, `--shadow-card`). Telas não declaram cores próprias para padrões compartilhados.

### Primary
- **Azul de ação** (`{colors.primary}`): botão primário, foco visível, links, upload ativo e quadrado de ícone azul.

### Secondary
- **Magenta PA27** (`{colors.magenta}`): quadrado de ícone rosa e faixa de cores. Sobre marinho, usa `{colors.magenta-on-dark}` (número e ícone da área ativa, subtítulo do cabeçalho).
- **Faixa PA27**: azul `{colors.pa-blue}`, verde `{colors.pa-green}`, magenta e amarelo `{colors.pa-yellow}`, nas proporções 608:335:203:132.
- **Amarelo PA27**: selo da cota.

### Neutral
- **Tinta** (`{colors.text}`) e **cinza de leitura** (`{colors.text-secondary}`, 5,9:1 sobre o fundo).
- **Papel** (`{colors.paper}`) no fundo do conteúdo; **nav** (`{colors.nav}`) na barra lateral; **branco** nos cartões.
- **Marinho** (`{colors.dark}`) no item ativo e no destaque de entregas.

### Estados
- **Sucesso** e **erro** com fundo suave próprio, usados na faixa de envio e em selos de estado.

**The Blue Action Rule.** Só a ação principal de cada bloco é azul cheia; as demais são pílulas brancas.

## Typography

**Display Font:** Barlow Condensed 700, hospedada em `public/fonts`.
**Body Font:** Roboto variável (400 a 700), hospedada em `public/fonts`.

### Hierarchy
- **Display** (70px/72px, caixa alta, +0.02em): título da página; 52px até 1199px e 40px até 959px.
- **Card title** (32px/36px): título do cartão, em caixa normal; 26px no mobile.
- **Brand** (25px, 700, caixa alta): "Portal do Patrocinador" no cabeçalho, com subtítulo magenta de 14px e +0.14em.
- **Trail** (13px, 500, caixa alta, +0.08em): trilha "Parceria / nome / edição" acima do título.
- **Body** (15px a 19px): 19px na introdução da página, 15px a 16px no restante.
- **Label** (15px, 500): botões e itens da navegação (16px).

## Layout

- **Desktop:** cabeçalho de 92px; barra lateral de 316px (280px até 1199px); conteúdo com até 1360px, padding 32px 38px 120px 42px e intervalos de 28px.
- **Conteúdo da página:** trilha, título, introdução e faixa PA27; em seguida a faixa de status (quando a área recebe envio) e os cartões.
- **Grade da mídia:** 798fr/460fr com 20px de intervalo; uma coluna até 1199px.
- **Até 959px:** cabeçalho de 72px com botão de menu; a barra lateral vira painel `nz-drawer` de 320px pela esquerda, com foco preso e Esc; o conteúdo vira uma coluna sem rolagem horizontal.
- **Navegação:** áreas habilitadas numeradas de 01 a 07 e "Entregas da parceria" como 08; o número acompanha a área, mesmo quando outra está desabilitada.

## Elevation & Depth

Cartões e controles da barra lateral usam `--shadow-card` (`0 1px 2px #1018280a, 0 8px 24px #1018280a`) e borda de 1px. O botão primário tem sombra azul suave; o item ativo, sombra marinho. A única profundidade decorativa é o gradiente do cabeçalho.

## Shapes

- Cartões: 16px. Controles, quadrados de ícone, área de envio e cartões de documento: 12px (ícone de documento: 10px). Itens da navegação: 10px.
- Botões, selos e cota: pílula (999px). Botões de ícone do cabeçalho e o botão de ajuda: círculo.

## Components

Componentes compartilhados (use-os em vez de repetir HTML ou CSS):

- **`app-portal-header`** (`frontend/src/app/shared/portal-header.ts`): cabeçalho único. No layout da parceria, mostra menu e sino (`nz-badge` com ponto quando há notificações da parceria); nas telas avulsas (`/parcerias`, `/rbs/patrocinadores`, `/conta`, `/sem-acesso`), mostra a conta conectada e Sair.
- **`app-partnership-shell`**: barra lateral (voltar, identidade com `nz-tag` da cota, áreas com ícone, relatório, conta com `nz-avatar` e Sair), trilha, título, faixa PA27 e botão de ajuda flutuante (`nz-button` circular) que abre a FAQ.
- **`app-card-heading`** (`features/partnership/shared/card-heading.ts`): quadrado de ícone de 56px com tom `blue`, `pink`, `green` ou `yellow`, título de cartão e descrição opcional. `focusable` permite devolver o foco ao título.
- **`app-submission-status`** (`features/partnership/shared/submission-status.ts`): faixa "Envio de materiais aberto/encerrado" com ícone e espaço para a ação do Admin RBS.
- **Classes globais** (`partnership-ui.css`, `material-ui.css`): `.pa-card`, `.pill`, `.primary-button`, `.card-actions`, `.document-card`, `.upload-zone`, `.done-badge`.
- **Ícones:** `registerPortalIcons()` (`shared/portal-icons.ts`) registra os ícones outline no serviço global; é chamado nos layouts para não pesar no bundle do login. Ícone novo entra nessa lista.

### Buttons
- **Primary:** `.pill.primary-button`, azul, texto branco 15px/500, ícone opcional de 20px antes do texto. Hover escurece o azul; desabilitado fica cinza.
- **Secondary:** `.pill`, branco com borda; hover clareia o fundo e reforça a borda.
- **Foco:** contorno de 2px na cor de foco, deslocado 3px (branco sobre o cabeçalho).

### Login
Composição dividida em tela cheia: carrossel fotográfico PA27 à esquerda e formulário à direita, com botão "Entrar no portal" carvão (`login-submit`). Fotos e textos comerciais são materiais e redação do portal; não prometem métricas nem representam a edição futura. Detalhes do carrossel e da pausa estão em `docs/login.md` e `openspec/changes/corrigir-acessibilidade-login/`.

## Do's and Don'ts

### Do:
- **Do** usar `app-card-heading`, `app-submission-status` e `.pa-card` em toda seção nova.
- **Do** deixar a largura dos botões vir do conteúdo; sem `width` fixa.
- **Do** manter cada área com o mesmo ícone na navegação e no cabeçalho dos cartões relacionados.
- **Do** conferir contraste mínimo de 4,5:1 para texto e 3:1 para ícones.

### Don't:
- **Don't** usar magenta como cor de ação; ele é destaque da identidade.
- **Don't** redefinir borda, raio ou sombra de cartão no CSS da tela.
- **Don't** usar glifos (▤, ↑, →, ×) como ícone.
- **Don't** apresentar a fotografia do login como registro da edição de 2027.
