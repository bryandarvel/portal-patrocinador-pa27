# Design

## Context

`backend/scripts/check-portal-api.py` já cria dados sintéticos pela API (Python padrão, ativação lendo o Mailpit). A API não tem exclusão de parceria. O Docker do projeto roda no servidor de testes (sem Docker no Mac). Portas 4200 e 8025 do servidor estão ocupadas por outro projeto.

## Decisions

- **Carga pela API**, não SQL nem runner Spring: passa pelas validações e autorizações reais e grava arquivos no volume. Arquivos (PDF, PNG, XLSX mínimos) são gerados pelo script.
- **Idempotência por nome**: cotas e parcerias de demonstração são localizadas pelo nome; se existirem, são puladas. Recomeçar do zero usa a limpeza.
- **Senha dos usuários de demonstração**: `PORTAL_SEED_PASSWORD` do ambiente ou `.env`; sem ela, a senha do bootstrap. Ambiente local apenas.
- **Configuração** lida de variáveis de ambiente com fallback no `.env` (`BACKEND_PORT`, `MAILPIT_PORT`, credenciais), para rodar também numa stack isolada.
- **Limpeza** via `docker compose exec`: `pg_dump` e `tar` dos arquivos em `backups/` (ignorado pelo Git), `TRUNCATE ... CASCADE` em todas as tabelas de `public` exceto `flyway_schema_history`, remoção dos arquivos e reinício do backend para o bootstrap recriar o admin.
- **Instruções** em `AGENTS.md` (Codex e outros) com `CLAUDE.md` importando-o: fonte única.

## Risks / Trade-offs

- [Execução interrompida deixa parceria parcial que a idempotência pula] → documentar: limpar e rodar de novo.
- [Limpeza destrói dados] → exige `--confirmar`, backup antes, e teste feito numa stack isolada (`COMPOSE_PROJECT_NAME` próprio), nunca na base em uso.
