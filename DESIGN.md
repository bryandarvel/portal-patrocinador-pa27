---
name: Portal do Patrocinador
description: Identidade PA27 aplicada a uma entrada clara e acessível ao portal.
colors:
  primary: "#e2047d"
  pink: "#ff8bda"
  blue: "#009ee5"
  green: "#06a883"
  orange: "#e84f15"
  light-orange: "#ff8617"
  yellow: "#ffde03"
  text: "#242424"
  text-secondary: "#595959"
  placeholder: "#686868"
  surface: "#ffffff"
  photo-base: "#071a23"
  error: "#b42318"
rounded:
  sm: "4px"
  md: "8px"
  badge: "6px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
  2xl: "48px"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(48px, 5.8vw, 84px)"
    fontWeight: 800
    lineHeight: 0.98
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "clamp(28px, 2.8vw, 44px)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.035em"
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 500
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    typography: "{typography.label}"
    rounded: "{rounded.md}"
    height: "50px"
    width: "100%"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    height: "48px"
    padding: "0 12px"
---

# Design System: Portal do Patrocinador

## Overview

**Creative North Star: "A energia do festival, com acesso simples."**

A identidade oficial Planeta Atlântida 2027 combina fotografia de palco e fogos com a marca original. A tela de entrada usa essa energia no painel visual e mantém o formulário claro, legível e direto. A tipografia segue a pilha de sistema usada pelo NG-ZORRO.

As imagens vêm do material PA27 fornecido para o desafio. A fotografia ilustra a identidade visual e não deve ser apresentada como registro de uma edição futura. Esta documentação descreve a superfície de login implementada; autenticação real ainda não está integrada.

**Key Characteristics:**
- Marca e fotografia oficiais PA27.
- Magenta na ação principal; campos claros e texto escuro.
- Composição dividida no desktop e cabeçalho compacto em telas estreitas.

## Colors

A paleta PA27 aparece na ação principal, na faixa inferior, na camada magenta/azul e nas faixas diagonais difusas das fotos. A última referência PA27 substitui a moldura: composição em tela cheia, painel visual imersivo à esquerda e acesso branco à direita. A marca original aparece acima do formulário no desktop, com sombra fina para a inscrição branca disponível no asset oficial. Copy permanece do Portal do Patrocinador.

### Primary
- **Magenta PA27** (`{colors.primary}`): ação principal e realces da identidade.

### Secondary
- **Rosa PA27** (`{colors.pink}`): cor complementar da paleta; a faixa da marca usa magenta, azul, verde e amarelo.

### Neutral
- **Branco** (`{colors.surface}`): painel do formulário e campos.
- **Carvão** (`{colors.text}`): títulos e texto principal.
- **Cinza de leitura** (`{colors.text-secondary}`): texto auxiliar.
- **Cinza de placeholder** (`{colors.placeholder}`): instrução dentro dos campos.
- **Azul-marinho fotográfico** (`{colors.photo-base}`): base escura sob a fotografia.
- **Vermelho de erro** (`{colors.error}`): mensagens de validação.

## Typography

**Display Font:** pilha de sistema NG-ZORRO (termina em `sans-serif`)
**Body Font:** mesma pilha de sistema
**Label/Mono Font:** não há fonte mono distinta.

**Character:** sans-serif de sistema, com títulos fortes e compactos e texto de apoio mais leve.

### Hierarchy
- **Display** (800, `clamp(48px, 5.8vw, 84px)`, line-height 0.98): frase sobre a fotografia; no mobile usa `clamp(22px, 3.7svh, 30px)`.
- **Headline** (800, `clamp(28px, 2.8vw, 44px)`, line-height 1.1): título centralizado do formulário, reduzido a 28px em janelas baixas.
- **Body** (400, 16px): introdução com line-height 1.5; apoio com 1.6. Em alturas até 700px, a introdução usa 14px.
- **Label** (500, 14px): rótulos e ação principal; o botão usa 15px e peso 600.

## Layout

No desktop, grid de 57%/43% com altura mínima de 100svh, sem moldura externa. Formulário de até 440px; logo, identificação magenta e título centralizados; campos e labels alinhados à esquerda. Logo do acesso escala pela altura útil e reduz a 72px em até 700px de altura. Em até 760px de largura, grid empilha, logo duplicado do acesso é ocultado e cabeçalho visual usa `clamp(116px, 17svh, 160px)`. Em até 700px de altura, espaços diminuem e cabeçalho visual ocupa 116px. Preserve rolagem natural quando zoom ou teclado virtual exigirem mais espaço.

Copy vigente: “Entre na sua conta” e “Entre para acompanhar materiais e entregas do seu patrocínio.”, com identificação “Portal do Patrocinador”. O slogan oficial e a identidade PA27 vêm dos materiais fornecidos; o tom considera também as páginas História e Experiências do site oficial. Textos de apoio são redação original do portal. Fontes e medidas anteriores estão em `docs/login.md`; contrato visual em `openspec/changes/refine-login-carousel/` e correção vigente da pausa em `openspec/changes/corrigir-acessibilidade-login/`.

## Elevation & Depth

Contraste entre fotografia escura e painel branco separa as áreas. Faixas de cor nas bordas usam blur estático contido no painel visual; formulário permanece sem sombra decorativa, com contornos simples nos campos.

## Shapes

Campos e ação principal têm cantos suavemente arredondados (8px); o controle de mostrar senha é mais contido (4px), e o selo da edição usa 6px. Os campos permanecem claros com contorno visível.

## Components

### Buttons
- **Primary:** botão magenta de largura total, altura 50px, texto branco em peso 600 e ícone de seta.
- **Hover / Focus:** hover e foco mudam o fundo para a cor magenta escurecida do tema; foco visível usa contorno de 2px com deslocamento de 3px.
- **Password toggle:** controle transparente de 36px, com ícone de olho e nome acessível que alterna entre mostrar e ocultar.

### Inputs / Fields
- **Style:** campo branco, altura mínima 48px, cantos de 8px e texto de 15px.
- **Focus:** contorno visível de 2px na cor primária, deslocado 3px.
- **Error:** borda de erro e mensagem curta associada ao campo.

### Signature Component
- **Painel do festival:** três fotos oficiais com camada escura e cores magenta/azul, marca fixa no alto, frase branca e faixa inferior com cores PA27. Três barras clicáveis e controle discreto de pausa/retomada, todos com alvos de 44px. No mobile, a frase fica à direita e a legenda desaparece; a frase usa `clamp(22px, 3.7svh, 30px)`.

## Motion

Carrossel local: dissolução de 500ms, cena a cada 3s, aproximação de 3% durante a cena. Seleção manual muda a cena; ao sair do painel, o loop continua somente se não estiver pausado pelo usuário. O controle de pausa interrompe troca e zoom até retomada explícita. Hover, foco no painel e aba oculta suspendem o timer. Movimento reduzido desativa autoplay, zoom e dissolução, mantendo seleção manual. Estado de formulário não depende do carrossel. Fotos e textos comerciais são materiais e redação do portal; não prometem métricas nem representam uma edição futura.

## Do's and Don'ts

### Do:
- **Do** preserve a marca e a paleta oficial PA27.
- **Do** manter contraste alto entre formulário branco, texto escuro e ação magenta.
- **Do** manter foco visível, rótulos e mensagens de erro próximos aos campos.
- **Do** tratar a foto como imagem ilustrativa do material PA27 fornecido.

### Don't:
- **Don't** apresentar a fotografia como registro da edição de 2027.
- **Don't** sugerir que o login já autentica ou concede acesso.
- **Don't** acrescentar cadastro ou recuperação de senha com destinos ainda inexistentes.
