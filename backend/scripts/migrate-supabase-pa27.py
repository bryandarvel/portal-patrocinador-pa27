"""Copia o cenário PA27 para um projeto Supabase novo, sem apagar dados.

Usa somente biblioteca padrão e o cliente PostgreSQL 17 em Docker.
Segredos são lidos de .env.cloud, ignorado pelo Git; nunca são impressos.
"""
import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import sys
import tarfile
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, build_opener, HTTPRedirectHandler
from uuid import UUID

ROOT = Path(__file__).resolve().parents[2]
MAX_BYTES = 20 * 1024 * 1024


def config():
    path = ROOT / ".env.cloud"
    ignored = subprocess.run(["git", "check-ignore", "--quiet", str(path)], cwd=ROOT).returncode
    if ignored != 0:
        raise ValueError(".env.cloud precisa estar ignorado pelo Git.")
    values = {}
    for line in path.read_text(encoding="utf-8-sig").splitlines():
        if line.strip() and not line.lstrip().startswith("#"):
            key, value = line.split("=", 1)
            values[key.strip()] = value.strip()
    return values


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None  # Nunca encaminhar a chave a outra origem.


def storage_request(values, path, method="GET", data=None):
    url = values.get("SUPABASE_URL", "").rstrip("/")
    parsed = urlparse(url)
    secret = values.get("SUPABASE_SECRET_KEY", "")
    if (parsed.scheme != "https" or not parsed.hostname or parsed.username or parsed.password
            or parsed.path or parsed.query or parsed.fragment
            or not (secret.startswith("sb_secret_") or secret.startswith("eyJ"))):
        raise ValueError("Preencha a origem HTTPS e a chave secreta em .env.cloud.")
    headers = {"apikey": secret, "Content-Type": "application/octet-stream", "x-upsert": "false"}
    if secret.startswith("eyJ"):
        headers["Authorization"] = "Bearer " + secret
    request = Request(url + "/storage/v1/" + path, data=data, headers=headers, method=method)
    try:
        with build_opener(NoRedirect()).open(request, timeout=60) as response:
            body = response.read(MAX_BYTES + 1)
            if len(body) > MAX_BYTES:
                raise ValueError("Resposta de armazenamento acima de 20 MB.")
            return body
    except HTTPError as error:
        body = error.read(4096)
        if method == "GET" and path.startswith("object/authenticated/"):
            # Algumas versões do Storage retornam HTTP 400 com statusCode 404.
            if error.code == 404:
                return None
            try:
                if error.code == 400 and str(json.loads(body).get("statusCode")) == "404":
                    return None
            except (ValueError, AttributeError):
                pass
        raise ValueError(f"Supabase Storage retornou HTTP {error.code}. Confira projeto, chave e bucket privado.") from None


def arquivos(values, archive, apply):
    bucket = values.get("SUPABASE_STORAGE_BUCKET", "portal-arquivos")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", bucket):
        raise ValueError("Nome do bucket inválido.")
    # Valida o arquivo inteiro antes de enviar qualquer objeto. Não extrai caminhos.
    objects = []
    with tarfile.open(archive, "r:gz") as tar:
        for member in tar.getmembers():
            if member.isdir():
                continue
            key = member.name.removeprefix("./")
            if not member.isfile() or str(UUID(key)) != key or not 0 < member.size <= MAX_BYTES:
                raise ValueError("O backup contém uma entrada inválida ou maior que 20 MB.")
            if key in {item[0] for item in objects}:
                raise ValueError("O backup contém chaves duplicadas.")
            with tar.extractfile(member) as source:
                objects.append((key, source.read(MAX_BYTES + 1)))
    print(f"Backup: {len(objects)} arquivos, {sum(len(data) for _, data in objects)} bytes.")
    if not apply:
        return
    info = json.loads(storage_request(values, "bucket/" + bucket))
    if info.get("public") is not False:
        raise ValueError("O bucket deve existir e ser privado. Nada foi enviado.")
    uploaded = preserved = 0
    for key, data in objects:
        remote = storage_request(values, f"object/authenticated/{bucket}/{key}")
        if remote is None:
            storage_request(values, f"object/{bucket}/{key}", "POST", data)
            uploaded += 1
            remote = storage_request(values, f"object/authenticated/{bucket}/{key}")
        else:
            preserved += 1
        if remote is None or hashlib.sha256(remote).digest() != hashlib.sha256(data).digest():
            raise ValueError(f"Conteúdo diferente para a chave {key}. O script não sobrescreve arquivos.")
    print(f"Arquivos verificados por SHA-256: {uploaded} enviados, {preserved} preservados.")


def docker_pg(values, command, input_bytes=None, mount=None):
    env = os.environ.copy()
    args = ["docker", "run", "--rm", "-i"]
    for key in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "PGSSLMODE"):
        if values is not None:
            if not values.get(key):
                raise ValueError(f"Preencha {key} em .env.cloud.")
            env[key] = values[key]
            args.extend(["--env", key])
    if values is not None:
        if values["PGSSLMODE"] not in ("require", "verify-full") or values["PGPORT"] != "5432":
            raise ValueError("Use SSL e Session pooler na porta 5432.")
        env["PGCONNECT_TIMEOUT"] = "15"
        args.extend(["--env", "PGCONNECT_TIMEOUT"])
    if mount is not None:
        args.extend(["--mount", f"type=bind,source={mount.resolve()},target=/backup.dump,readonly"])
    args.extend(["postgres:17-alpine", *command])
    result = subprocess.run(args, input=input_bytes, stdout=subprocess.PIPE, stderr=subprocess.PIPE, env=env)
    if result.returncode:
        # Não imprime SQL, nomes de contas ou detalhes de conexão vindos do processo.
        raise ValueError("Cliente PostgreSQL falhou. Confira Docker, conexão, senha, banco vazio e compatibilidade do backup. Nenhum detalhe secreto foi exibido.")
    return result.stdout


PRIVATE_SQL = """
DO $portal$
DECLARE item record; role_name text;
BEGIN
  FOR item IN SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', item.tablename);
  END LOOP;
  FOREACH role_name IN ARRAY ARRAY['anon', 'authenticated'] LOOP
    IF EXISTS (SELECT 1 FROM pg_catalog.pg_roles WHERE rolname = role_name) THEN
      EXECUTE format('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM %I', role_name);
      EXECUTE format('REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM %I', role_name);
      EXECUTE format('ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM %I', role_name);
    END IF;
  END LOOP;
END $portal$;
"""


def banco(values, dump, apply):
    # pg_restore apenas converte o backup em SQL; nenhuma conexão é feita nesta fase.
    sql = docker_pg(None, ["pg_restore", "--no-owner", "--no-privileges", "--schema=public", "--file=-", "/backup.dump"], mount=dump)
    text = sql.decode("utf-8")
    if "CREATE SCHEMA" in text or "CREATE DATABASE" in text:
        raise ValueError("Backup fora do formato esperado. Revise o schema antes de restaurar.")
    print("Backup PostgreSQL reconhecido: apenas o schema public, sem dono nem privilégios do ambiente local.")
    if not apply:
        return
    # O teste de banco vazio, a carga e a restrição da API ocorrem na mesma transação.
    guard = """BEGIN;
DO $portal$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_catalog.pg_tables WHERE schemaname = 'public') THEN
    RAISE EXCEPTION 'O schema public precisa estar vazio. Nada foi substituído.';
  END IF;
END $portal$;
"""
    body = (guard + text + "\n" + PRIVATE_SQL + "\nCOMMIT;\n").encode("utf-8")
    docker_pg(values, ["psql", "-X", "-q", "--set", "ON_ERROR_STOP=1"], body)
    print("Banco restaurado em transação única; tabelas privadas para o backend, com RLS habilitado.")


def verificar(values):
    sql = """SELECT json_build_object(
      'parcerias', (select count(*) from public.portal_parcerias),
      'arquivos', (select count(*) from public.portal_arquivos),
      'importacoes', (select count(*) from public.portal_relatorio_importacoes),
      'tabelas_sem_rls', (select count(*) from pg_catalog.pg_tables where schemaname='public' and not rowsecurity));"""
    data = json.loads(docker_pg(values, ["psql", "-X", "-A", "-t", "--set", "ON_ERROR_STOP=1"], sql.encode()))
    print("Conferência do banco: " + json.dumps(data, ensure_ascii=False))
    if data["parcerias"] != 8 or data["tabelas_sem_rls"]:
        raise ValueError("A base precisa conter as oito parcerias e todas as tabelas privadas.")


def conferir_conexao(values):
    bucket = values.get("SUPABASE_STORAGE_BUCKET", "portal-arquivos")
    if not re.fullmatch(r"[a-z0-9][a-z0-9-]{0,62}", bucket):
        raise ValueError("Nome do bucket inválido.")
    metadata = json.loads(storage_request(values, "bucket/" + bucket))
    if metadata.get("public") is not False:
        raise ValueError("O bucket precisa ser privado.")
    count = docker_pg(values, ["psql", "-X", "-A", "-t", "--set", "ON_ERROR_STOP=1"],
                      b"select count(*) from pg_catalog.pg_tables where schemaname='public';")
    print(f"Conexão PostgreSQL com SSL confirmada; {int(count)} tabelas no schema public.")
    print("Bucket privado confirmado. Nenhum dado foi gravado.")


def preparar_render(values):
    target = ROOT / ".env.render"
    if subprocess.run(["git", "check-ignore", "--quiet", str(target)], cwd=ROOT).returncode != 0:
        raise ValueError(".env.render precisa estar ignorado pelo Git.")
    for key in ("PGHOST", "PGPORT", "PGDATABASE", "PGUSER", "PGPASSWORD", "SUPABASE_URL", "SUPABASE_SECRET_KEY"):
        if not values.get(key) or any(char in values[key] for char in "\r\n"):
            raise ValueError(f"Preencha {key} em .env.cloud.")
    if not re.fullmatch(r"[a-z0-9.-]+", values["PGHOST"]) or values["PGPORT"] != "5432" or values["PGDATABASE"] != "postgres":
        raise ValueError("Confira host, porta 5432 e banco postgres do Session pooler.")
    env = {
        "SPRING_PROFILES_ACTIVE": "cloud",
        "JAVA_TOOL_OPTIONS": "-Xms64m -Xmx192m -XX:MaxMetaspaceSize=128m -XX:MaxDirectMemorySize=16m -XX:ReservedCodeCacheSize=32m -Xss512k",
        "PORTAL_DATABASE_URL": f"jdbc:postgresql://{values['PGHOST']}:5432/postgres?sslmode=require",
        "PORTAL_DATABASE_USER": values["PGUSER"],
        "PORTAL_DATABASE_PASSWORD": values["PGPASSWORD"],
        "PORTAL_JWT_SECRET": secrets.token_hex(32),
        "PORTAL_STORAGE_PROVIDER": "supabase",
        "SUPABASE_URL": values["SUPABASE_URL"],
        "SUPABASE_SECRET_KEY": values["SUPABASE_SECRET_KEY"],
        "SUPABASE_STORAGE_BUCKET": values.get("SUPABASE_STORAGE_BUCKET", "portal-arquivos"),
        "PORTAL_BOOTSTRAP_ENABLED": "false",
        "PORTAL_MAIL_ENABLED": "false",
        "PORTAL_FRONTEND_URL": "http://localhost:4217",
    }
    with target.open("x", encoding="utf-8", newline="\n") as output:
        output.write("# Importar somente no backend Render. Depois ajuste PORTAL_FRONTEND_URL para sua URL Vercel.\n")
        output.write("\n".join(f"{key}={value}" for key, value in env.items()) + "\n")
    print(".env.render criado e ignorado pelo Git. Importe seu conteúdo em Environment > Add from .env no Render.")
    print("A origem do frontend está temporariamente local; ajuste após obter a URL da Vercel.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--arquivos", type=Path, help="Backup pa27-arquivos.tgz")
    parser.add_argument("--banco", type=Path, help="Backup pa27.dump; exige destino vazio")
    parser.add_argument("--verificar", action="store_true", help="Consulta contagens e privacidade do banco remoto")
    parser.add_argument("--conferir-conexao", action="store_true", help="Testa banco e bucket sem gravar dados")
    parser.add_argument("--preparar-render", action="store_true", help="Gera .env.render local sem exibir segredos")
    parser.add_argument("--aplicar", action="store_true", help="Executa a cópia; sem esta opção apenas inspeciona backups")
    args = parser.parse_args()
    if not (args.arquivos or args.banco or args.verificar or args.conferir_conexao or args.preparar_render):
        parser.error("Informe --arquivos, --banco ou --verificar.")
    values = config() if args.aplicar or args.verificar or args.conferir_conexao or args.preparar_render else {}
    if args.preparar_render:
        preparar_render(values)
    if args.conferir_conexao:
        conferir_conexao(values)
    if args.arquivos:
        arquivos(values, args.arquivos, args.aplicar)
    if args.banco:
        banco(values, args.banco, args.aplicar)
    if args.verificar:
        verificar(values)
    if not args.aplicar and not args.verificar and not args.conferir_conexao and not args.preparar_render:
        print("Plano sem gravação. Use --aplicar somente para o projeto novo da demonstração.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, OSError, URLError, tarfile.TarError):
        # Não incluir traceback nem objetos de requisição que possam carregar segredos.
        error = sys.exception()
        if isinstance(error, ValueError):
            print("Falha: " + str(error), file=sys.stderr)
        else:
            print("Falha de leitura ou conexão. Confira arquivos, configuração e rede; segredos não são exibidos.", file=sys.stderr)
        sys.exit(1)
