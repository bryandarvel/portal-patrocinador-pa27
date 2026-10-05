## Context

Veja proposal.md para motivação e procedência retrospectiva. Fonte anterior: `docs/login.md`; apresentação vigente em `DESIGN.md` e `.impeccable/design.json`. Código único em `frontend/src/app/features/auth/login/`, Angular e NG-ZORRO já instalados.

## Goals / Non-Goals

Preservar formulário, assets e layout sem dependências novas. Backend, autenticação e infraestrutura não mudam.

## Decisions

Reutilizar signals e lifecycle existentes: retirar pausa permanente e ícones de play/pause, intervalo de 3000ms, CSS de 500ms e zoom de 3s. Manter botões nativos transparentes para barras, em vez de spans interativos, preservando teclado e alvos de 44px. Hover/foco e documento oculto suspendem timer; reduced motion preserva alternativa estática. Cleanup existente cancela timer e listeners.

Direção vigente pela última referência PA27 de 02/10/2026: substituir moldura por divisão em tela cheia 57%/43%. Reutilizar fotos e marca oficial; duas faixas diagonais coloridas decorativas em CSS, nas bordas da foto, sem novas imagens ou animação extra. Formulário de até 440px, marca acima no desktop e tipografia forte centralizada. Copy permanece do patrocinador, sem importar promessa de ingressos ou ações não implementadas da referência. No celular, marca duplicada da área de acesso é ocultada e cabeçalho visual compacto mantém o logo. Em janelas baixas, logo e espaços são reduzidos. Carrossel de 3s e TS permanecem iguais. Alterações locais de HTML/CSS, sem outra abstração ou delegação.

## Risks / Trade-offs

Verificação da última referência encontrou scroll interno no painel decorativo com `overflow: hidden`: foco em indicador deslocava o logo, mesmo com página sem scroll. Usar `overflow: clip` neste painel evita rolagem programática de foco, mantendo recorte dos assets; não se aplica ao formulário.

Ritmo de 3s foi solicitado e pode ser rápido para leitura; foco/hover suspende troca e movimento reduzido elimina autoplay. Sem controle persistente de pausa por pedido explícito. Budgets existentes não serão alterados para ocultar avisos.

## Verification

Na raiz: `docker compose exec -T frontend npm run build` e `git diff --check`. Reutilizar containers existentes; se watcher não recarregar, reiniciar apenas frontend e aguardar HTTP 200. Verificar navegador e capturas nos tamanhos da spec. Referência operacional: `README.md`; detalhes e fontes visuais: `DESIGN.md` e `frontend/public/images/README.md`.
