"""Acesso compartilhado à API local pelos scripts (smoke e carga de demonstração).

Configuração: variáveis de ambiente primeiro, depois o `.env` da raiz do projeto.
"""
import json
import os
import re
import time
import uuid
from pathlib import Path
from urllib.error import HTTPError
from urllib.parse import quote
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[2]


def _dotenv():
    path = ROOT / '.env'
    if not path.exists():
        return {}
    pairs = (line.split('=', 1) for line in path.read_text().splitlines() if '=' in line and not line.lstrip().startswith('#'))
    return {key.strip(): value.strip() for key, value in pairs}


ENV = {**_dotenv(), **os.environ}
BASE = f"http://127.0.0.1:{ENV.get('BACKEND_PORT') or '8080'}"
MAIL = f"http://127.0.0.1:{ENV.get('MAILPIT_PORT') or '8025'}"


class ApiError(Exception):
    def __init__(self, method, path, status, raw):
        super().__init__(f'{method} {path.split("?")[0]}: status {status}: {raw[:350]!r}')
        self.status = status


def request(method, path, body=None, token=None, files=None, fields=None, parts=None):
    """Chama a API e devolve JSON (ou texto). `files`: {campo: (nome, tipo, bytes)};
    `fields`: campos de formulário; `parts`: {campo: valor JSON} enviados como application/json.
    O nome do arquivo segue em UTF-8, como os navegadores enviam."""
    headers = {}
    data = None
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if files is not None or fields is not None or parts is not None:
        boundary = 'portal-' + uuid.uuid4().hex
        chunks = []
        for name, value in (fields or {}).items():
            chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\n\r\n{value}\r\n'.encode())
        for name, value in (parts or {}).items():
            chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"\r\nContent-Type: application/json\r\n\r\n'.encode()
                          + json.dumps(value).encode() + b'\r\n')
        for name, (filename, content_type, content) in (files or {}).items():
            chunks.append(f'--{boundary}\r\nContent-Disposition: form-data; name="{name}"; filename="{filename.replace(chr(34), chr(39))}"\r\n'
                          f'Content-Type: {content_type}\r\n\r\n'.encode() + content + b'\r\n')
        chunks.append(f'--{boundary}--\r\n'.encode())
        data = b''.join(chunks)
        headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary
    elif body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'
    url = path if path.startswith('http') else BASE + path
    try:
        with urlopen(Request(url, data=data, headers=headers, method=method), timeout=30) as response:
            status, raw = response.status, response.read()
    except HTTPError as error:
        status, raw = error.code, error.read()
    try:
        payload = json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        payload = raw.decode(errors='replace')
    return status, payload, raw


def activation_token(email, attempts=50):
    """Lê no Mailpit o token de ativação enviado para `email`."""
    for _ in range(attempts):
        _, found, _ = request('GET', MAIL + '/api/v1/search?query=' + quote(f'to:"{email}"'))
        for message in found.get('messages', []) if isinstance(found, dict) else []:
            _, detail, _ = request('GET', MAIL + '/api/v1/message/' + message['ID'])
            match = re.search(r'token=([a-zA-Z0-9-]+)', detail.get('Text', ''))
            if match:
                return match.group(1)
        time.sleep(0.2)
    raise AssertionError(f'E-mail de ativação para {email} não chegou ao Mailpit ({MAIL}).')
