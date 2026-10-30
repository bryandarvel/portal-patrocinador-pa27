# Proposal

## Why

O grupo aprovou uma referência visual v2 para o portal (tela "Mídia e conteúdo", recebida em 30/10/2026). O front atual repete a definição de cartões, botões e status em cada tela e usa pouco o NG-ZORRO. A v2 aplica essa referência a todas as telas a partir de tokens e componentes compartilhados.

## What Changes

- Layout autenticado: cabeçalho escuro com gradiente, marca e sino de notificações; barra lateral com voltar, identidade da parceria, áreas numeradas com ícone, relatório e conta com saída no rodapé; botão de ajuda flutuante que leva à FAQ.
- "Entregas da parceria" vira o item 08 da lista de áreas. FAQ, conta e saída deixam o cabeçalho. O relatório do patrocinador abre pela barra lateral, como o relatório RBS.
- **BREAKING (visual):** a ação principal passa de magenta para azul. O magenta fica nos destaques, e o login mantém o botão magenta já aprovado.
- Tokens globais (cores, cantos, espaços, tipografia) em `styles.less` e cartões, cabeçalhos de cartão, faixas de status, áreas de envio e botões compartilhados entre as telas, sem redefinições por página.
- Ícones de linha da biblioteca do NG-ZORRO substituem os glifos Unicode.
- Abaixo de 960px, a barra lateral vira um painel que abre por um botão no cabeçalho.
- O `DESIGN.md` da raiz passa a descrever o sistema inteiro (login e portal).

## Capabilities

### New Capabilities
- `portal-interface`: layout, navegação e padrões visuais compartilhados das telas autenticadas do portal.

### Modified Capabilities

## Impact

- Frontend: `src/styles.less`, `app.config.ts`, layout da parceria e da gestão RBS, CSS compartilhado e todas as telas em `features/partnership` e `features/admin`.
- Sem mudança de API, de rotas ou de regras de autorização. Sem dependência nova: os ícones vêm de `@ant-design/icons-angular`, já instalado com o NG-ZORRO.
- Docs: `DESIGN.md` e `frontend/docs/telas-portal.md`.
