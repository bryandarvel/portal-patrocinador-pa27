#!/usr/bin/env bash
# Limpa ou restaura a base local do portal, mantendo schema e migrações. Requer a stack do compose.yaml ativa.
#   backend/scripts/reset-portal.sh --confirmar            salva backup em backups/ e apaga dados e arquivos
#   backend/scripts/reset-portal.sh --restaurar DATA       substitui a base pelo backup backups/*-DATA.*
set -euo pipefail
cd "$(dirname "$0")/../.."

esvaziar() {
  docker compose exec -T db psql -v ON_ERROR_STOP=1 -q -U portal -d portal <<'SQL'
DO $$
DECLARE tabelas text;
BEGIN
  SELECT string_agg(format('%I.%I', schemaname, tablename), ', ') INTO tabelas
  FROM pg_tables WHERE schemaname = 'public' AND tablename <> 'flyway_schema_history';
  IF tabelas IS NOT NULL THEN
    EXECUTE 'TRUNCATE ' || tabelas || ' RESTART IDENTITY CASCADE';
  END IF;
END $$;
SQL
  docker compose exec -T backend sh -c 'find /data/arquivos -mindepth 1 -delete'
}

case "${1:-}" in
  --confirmar)
    stamp=$(date +%Y%m%d-%H%M%S)
    mkdir -p backups
    docker compose exec -T db pg_dump -U portal -d portal --data-only --disable-triggers \
      --exclude-table=flyway_schema_history > "backups/portal-$stamp.sql"
    docker compose exec -T backend tar -C /data/arquivos -czf - . > "backups/arquivos-$stamp.tar.gz"
    esvaziar
    # O bootstrap recria o primeiro Admin RBS na inicialização, se estiver habilitado no .env.
    docker compose restart backend >/dev/null 2>&1
    echo "Base limpa. Backup: backups/portal-$stamp.sql e backups/arquivos-$stamp.tar.gz"
    if ! grep -qs '^PORTAL_BOOTSTRAP_ENABLED=true' .env; then
      echo "Aviso: PORTAL_BOOTSTRAP_ENABLED não está true no .env; nenhum Admin RBS será recriado."
    fi
    ;;
  --restaurar)
    stamp="${2:?Informe a data do backup, por exemplo: $0 --restaurar 20261030-200339}"
    [[ -f "backups/portal-$stamp.sql" && -f "backups/arquivos-$stamp.tar.gz" ]] || { echo "Backup $stamp não encontrado em backups/."; exit 1; }
    esvaziar
    # Backend parado: o bootstrap não recria o admin antes de os dados do backup voltarem.
    docker compose stop backend >/dev/null 2>&1
    docker compose exec -T db psql -v ON_ERROR_STOP=1 -q -U portal -d portal < "backups/portal-$stamp.sql" >/dev/null
    docker compose start backend >/dev/null 2>&1
    docker compose exec -T backend tar -C /data/arquivos -xzf - < "backups/arquivos-$stamp.tar.gz"
    echo "Base restaurada do backup $stamp."
    ;;
  *)
    echo "Este comando apaga todos os dados e arquivos do portal (schema e migrações são mantidos)."
    echo "Antes, salva um backup em backups/. Para continuar: $0 --confirmar"
    echo "Para voltar a um backup: $0 --restaurar AAAAMMDD-HHMMSS"
    exit 1
    ;;
esac
echo "O backend está reiniciando; aguarde a inicialização antes de usar o portal ou rodar seed-portal.py."
