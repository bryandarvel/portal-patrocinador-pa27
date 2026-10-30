# Tasks

## 1. Comandos

- [x] 1.1 `BACKEND_PORT` no `compose.yaml` e portas lidas do ambiente no `check-portal-api.py`; verificar com `docker compose config` no servidor.
- [x] 1.2 `seed-portal.py`; verificar numa stack isolada que cria as três parcerias com todas as áreas e que a segunda execução não duplica.
- [x] 1.3 `reset-portal.sh`; verificar na stack isolada a recusa sem `--confirmar`, o backup, as tabelas vazias, os arquivos removidos e o admin recriado.

## 2. Frontend e instruções

- [x] 2.1 Remover prévias mortas do Figma; verificar com `npm run build` e busca por dados fixos.
- [x] 2.2 `AGENTS.md` e `CLAUDE.md` com as regras do projeto; README com os comandos.

## 3. Entrega

- [x] 3.1 Validar OpenSpec, build e proxy; registrar em `results.md`; commit na `dev-icaro` e envio. PR só com permissão do usuário.
