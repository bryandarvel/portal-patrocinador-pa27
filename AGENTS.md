# Instruções para agentes

Portal do Patrocinador (Angular 22 + NG-ZORRO em `frontend/`, Spring Boot em `backend/`). Produto em `PRODUCT.md`, vocabulário em `GLOSSARY.md`, fluxo de colaboração em `CONTRIBUTING.md`.

## Dados

- Todo dado exibido no frontend vem da API do backend. Telas e serviços carregam estado só por `PortalApi`; para ver uma tela preenchida, popule a base.
- Base de demonstração: `python3 backend/scripts/seed-portal.py` cria dados pela API, sem duplicar. Para recomeçar: `backend/scripts/reset-portal.sh --confirmar` (salva backup em `backups/` antes de apagar).
- Dados de demonstração usam nomes marcados `(demo)` e e-mails `@example.test`.

## Reuso

- Antes de criar componente, estilo ou método, procure o existente e estenda-o. Componentes globais: `frontend/src/app/shared/` e `frontend/src/app/features/partnership/shared/`; tokens e padrões visuais em `DESIGN.md`.
- Variação real entre telas ou perfis entra como parâmetro (input, argumento, configuração) de um componente ou método compartilhado; cada comportamento tem uma única implementação.

## Git e PR

- Commit e push só quando o usuário pedir.
- Pull request: criar, atualizar a descrição ou mesclar somente com permissão explícita do usuário para aquele PR. Ao concluir uma entrega, informe que está pronta e pergunte se pode abrir o PR.
