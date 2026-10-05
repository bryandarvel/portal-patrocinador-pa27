## Why

O grupo solicitou indicadores mais limpos, rotação mais rápida e acabamento de cor no login PA27. O controle separado de play/pause e a pausa permanente após seleção atrapalham o loop desejado.

## What Changes

- Apenas três barras clicáveis, mantendo teclado, nomes e foco visível.
- Loop de 3s e dissolução de 500ms; seleção manual não pausa permanentemente.
- Camada magenta/azul nas fotos; última referência PA27 atualiza composição para divisão em tela cheia, faixas diagonais coloridas e marca/título centralizados no painel de acesso branco.
- Inicialização OpenSpec com Codex e Claude, conforme nova política recebida durante o trabalho.

## Capabilities

### New Capabilities
- `login-presentation`: registrar pela primeira vez no OpenSpec o comportamento vigente do login visual e seu carrossel.

### Modified Capabilities
Nenhuma spec anterior no OpenSpec.

## Impact

Componente `frontend/src/app/features/auth/login/`, `DESIGN.md` e seu sidecar. Sem dependências novas, backend ou autenticação. Reutiliza signals, campos NG-ZORRO e imagens oficiais já existentes.

## Planning provenance

OpenSpec não existia neste projeto. A nova política chegou após as alterações de implementação e build desta tarefa. O planejamento anterior foi persistido em `docs/login.md`, conforme instruções vigentes naquele momento. Esta reconciliação é retrospectiva para código já alterado; validação de navegador e encerramento permanecem pendentes. Não representa planejamento prévio em OpenSpec.
