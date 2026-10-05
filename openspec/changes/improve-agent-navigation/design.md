## Context
Ver proposal.md. A retrospectiva usada como evidência externa não está versionada nem disponível aos colaboradores; não é requisito para executar ou manter o projeto. As conclusões verificáveis estão em [results.md](results.md). Estado Git e baselines verificados antes da implementação; preservar mudanças alheias.

## Goals / Non-Goals
Objetivo observável: recuperar fontes vigentes a partir de uma entrada curta por problema. Arquivos autorizados: README.md e este change. Nenhuma mudança funcional, de dependência, infraestrutura, dado ou política global. Conteúdo em pt-BR, preservando cabeçalhos estruturais do OpenSpec.

## Decisions
Resumo de estado atual no início e tabela de navegação para frontend, backend, Docker, produto, design, login e OpenSpec. Corrigir inexistência de login, identificar antigas evidências da saudação como históricas, preservar registros anteriores e apontador docs/login.md.

Reusar documentos/contratos/testes e scripts existentes em vez de criar catálogo concorrente, duplicar comandos ou publicar versões fixas que o manifesto já informa. Registro documental usa skip_specs: true, sem inventar delta funcional. A política global OpenSpec do autor é orientação externa do seu ambiente, não uma dependência do projeto. Colaboradores usam as fontes versionadas: [README](../../../README.md) e [configuração OpenSpec](../../config.yaml). Não otimizar instruções globais, skills ou roteamento; portanto não promover mudança global nem inferir benchmark de economia.

## Acceptance criteria
README descreve rota /login e redirecionamento da raiz, login visual/validação sem autenticação real integrada. Links chegam a PRODUCT, DESIGN, docs/login e change ativo. Nenhuma afirmação atual de saudação padrão ou ausência de login Angular. Evidências antigas permanecem sinalizadas como históricas.

Todas as referências locais novas/rescritas devem existir ou ser explicitamente opcionais. Ler critérios antes de editar. Verificar diff/snapshot para preservar alterações anteriores. Validar este change com openspec validate improve-agent-navigation --strict --no-interactive. Guardar evidências e limites em results.md. Não alegar economia medida.

## Risks / Trade-offs
README já alterado antes desta tarefa: editar conteúdo atual, não substituir por HEAD. Não tocar frontend, Docker, imagens, backend ou configurações.

A documentação é entrada de descoberta, não substitui decisão normativa de ADR/spec nem prova estado vivo. Validar links e afirmações por código/documento, sem iniciar serviços para alterações documentais.
