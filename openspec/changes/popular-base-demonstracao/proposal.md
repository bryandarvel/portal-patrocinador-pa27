# Proposal

## Why

Testar o portal exige dados em todas as áreas, e hoje a base começa vazia. Além disso, o front ainda carrega prévias do Figma com dados fixos (clientes Roxo e Verde), sem rota, e o projeto não tem instruções de agente que impeçam a volta desse padrão ou o envio de PR sem permissão.

## What Changes

- Comando de carga `backend/scripts/seed-portal.py`: cria pela API três parcerias de demonstração (Master, Subcota G e Subcota) com todas as áreas preenchidas, usuários ativados e um segundo Admin RBS. Rodar de novo não duplica.
- Comando de limpeza `backend/scripts/reset-portal.sh`: salva backup (`pg_dump` e arquivos) em `backups/`, apaga dados e arquivos e preserva o schema; exige `--confirmar`.
- `compose.yaml` aceita `BACKEND_PORT` (padrão 8080); `check-portal-api.py` passa a ler as portas do ambiente.
- Remoção das prévias mortas do Figma no front.
- `AGENTS.md` (com `CLAUDE.md` apontando para ele): dados só do backend, componentes globais e métodos parametrizados, PR só com permissão explícita.

## Capabilities

### New Capabilities
- `dados-demonstracao`: carga e limpeza da base local de demonstração.

### Modified Capabilities

## Impact

Scripts em `backend/scripts/`, `compose.yaml`, `.env.example`, `.gitignore`, README, arquivos removidos em `frontend/src/app/features/admin/`, novos `AGENTS.md` e `CLAUDE.md`. Sem mudança de API, schema ou dependências.
