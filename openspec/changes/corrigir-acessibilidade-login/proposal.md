## Why
Os quatro apontamentos do Copilot no PR #1 foram confirmados: falta pausa persistente, tipografia mobile conflitante e duas referências documentais inacessíveis a colaboradores.

## What Changes
- Adicionar pausa persistente discreta, preservando autoplay de 3s, indicadores e identidade PA27.
- Alinhar DESIGN.md ao CSS e identificar evidência/política externa sem caminhos pessoais.
- Registrar que o contrato antigo sem play/pause foi substituído por esta correção autorizada.

## Capabilities
### New Capabilities
- `carousel-pause`: controle persistente da reprodução do carrossel.
### Modified Capabilities
Nenhuma spec consolidada existe em openspec/specs; esta capacidade complementa e substitui a regra conflitante do change refine-login-carousel.

## Impact
Login TS/HTML/CSS, DESIGN.md, docs/login.md e documentação OpenSpec. Sem dependências novas, autenticação, backend ou infraestrutura. Base origin/main após merge do PR #1.
