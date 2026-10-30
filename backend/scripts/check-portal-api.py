"""Smoke de integração local: cria somente dados sintéticos identificados por execução."""
import concurrent.futures
import base64
import hashlib
import hmac
import json
import secrets
import time
import uuid
import struct
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from portal_api import BASE, ENV, MAIL, activation_token
AREAS = ['perfil', 'marca', 'midia', 'cortesias', 'credenciamento', 'pesquisa', 'contrato']
checks = 0


def request(method, path, body=None, token=None, expected=200, fields=None):
    global checks
    headers = {}
    data = None
    if token:
        headers['Authorization'] = 'Bearer ' + token
    if fields is not None:
        boundary = 'portal-' + uuid.uuid4().hex
        parts = []
        for name, value in fields.items():
            parts.append(('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"\r\n\r\n' + str(value) + '\r\n').encode())
        parts.append(('--' + boundary + '\r\nContent-Disposition: form-data; name="arquivo"; filename="sintetico.txt"\r\nContent-Type: text/plain\r\n\r\n').encode() + b'evidencia sintetica\r\n')
        parts.append(('--' + boundary + '--\r\n').encode())
        data = b''.join(parts)
        headers['Content-Type'] = 'multipart/form-data; boundary=' + boundary
    elif body is not None:
        data = json.dumps(body).encode()
        headers['Content-Type'] = 'application/json'
    url = path if path.startswith(MAIL) else BASE + path
    try:
        with urlopen(Request(url, data=data, headers=headers, method=method), timeout=20) as response:
            status, raw = response.status, response.read()
    except HTTPError as error:
        status, raw = error.code, error.read()
    assert status == expected, f'{method} {path.split("?")[0]}: esperado {expected}, recebido {status}: {raw[:350]!r}'
    checks += 1
    try:
        return json.loads(raw)
    except (ValueError, UnicodeDecodeError):
        return raw.decode(errors='replace')


def run():
    admin = request('POST', '/api/auth/login', {'email': ENV['PORTAL_BOOTSTRAP_EMAIL'], 'senha': ENV['PORTAL_BOOTSTRAP_PASSWORD']})['token']
    me = request('GET', '/api/auth/me', token=admin)
    request('GET', '/api/parcerias', expected=401)
    suffix = uuid.uuid4().hex[:10]
    password = secrets.token_urlsafe(18)
    accounts = []
    for index in range(2):
        email = f'smoke-{suffix}-{index}@example.test'
        request('POST', '/api/auth/cadastro', {'nome': 'Validação sintética', 'email': email, 'senha': password}, token=admin)
        request('POST', '/api/auth/login', {'email': email, 'senha': password}, expected=401)
        verification = activation_token(email)
        request('GET', '/api/auth/verificar?token=' + verification)
        request('GET', '/api/auth/verificar?token=' + verification, expected=400)
        token = request('POST', '/api/auth/login', {'email': email, 'senha': password})['token']
        accounts.append((request('GET', '/api/auth/me', token=token)['id'], token))

    uid, sponsor = accounts[0]
    other_uid, other = accounts[1]
    request('POST', '/api/auth/cadastro', {'nome': 'Inválido', 'email': 'invalid@example.test', 'senha': password}, token=sponsor, expected=403)
    request('POST', '/api/auth/cadastro', {'nome': 'Inválido', 'email': 'invalid@example.test', 'senha': password, 'role': 'ADMIN_RBS'}, token=admin, expected=400)
    request('POST', '/api/auth/validar-mfa', {'challenge': sponsor, 'codigo': '000000'}, expected=401)
    request('POST', '/api/admin/usuarios', {'nome': 'RBS sintético', 'email': f'rbs-{suffix}@example.test', 'senha': password, 'role': 'ADMIN_RBS'}, token=sponsor, expected=403)
    request('POST', '/api/admin/usuarios', {'nome': 'RBS sintético', 'email': f'rbs-{suffix}@example.test', 'senha': password, 'role': 'ADMIN_RBS'}, token=admin, expected=201)

    benefits = [{'natureza': 'CORTESIA', 'tipo': 'sexta', 'setor': 'Arena', 'publico': '', 'quantidade': 1}, {'natureza': 'CREDENCIAL', 'tipo': 'servico', 'setor': 'Arena', 'publico': 'marca', 'quantidade': 2}, {'natureza': 'CREDENCIAL', 'tipo': 'servico', 'setor': 'Arena', 'publico': 'agencia', 'quantidade': 5}]
    cota = request('POST', '/api/cotas', {'nome': 'Smoke ' + suffix, 'areas': AREAS, 'entregas': [{'area': 'marca', 'titulo': 'Entrega sintética', 'descricao': 'Validação de fluxo'}], 'versao': 0, 'beneficios': benefits}, token=admin, expected=201)['id']
    partner = request('POST', '/api/parcerias', {'nome': 'Smoke A ' + suffix, 'edicao': 'Teste isolado', 'cotaId': cota, 'usuarioIds': [uid]}, token=admin, expected=201)
    p1 = partner['id']
    courtesy_right = next(b['id'] for b in partner['beneficios'] if b['natureza'] == 'CORTESIA')
    credential_rights = {b['publico']: b['id'] for b in partner['beneficios'] if b['natureza'] == 'CREDENCIAL'}
    p2 = request('POST', '/api/parcerias', {'nome': 'Smoke B ' + suffix, 'edicao': 'Teste isolado', 'cotaId': cota, 'usuarioIds': [other_uid]}, token=admin, expected=201)['id']
    p = '/api/parcerias/' + p1
    request('GET', p, token=other, expected=404)
    assert p1 in request('GET', '/api/auth/me', token=sponsor)['parcerias']
    assert all(item['id'] != p2 for item in request('GET', '/api/parcerias', token=sponsor)['itens'])
    request('PATCH', '/api/cotas/' + cota, {'nome': 'Smoke ' + suffix, 'areas': ['perfil'], 'entregas': [], 'versao': 0}, token=admin)
    assert any(area['area'] == 'marca' and area['habilitada'] for area in request('GET', p, token=sponsor)['areas'])
    request('PATCH', p, {'nome': 'Smoke atualizado ' + suffix, 'versao': 0}, token=admin)
    request('PATCH', p, {'nome': 'Atualização obsoleta', 'versao': 0}, token=admin, expected=409)
    request('PUT', p + '/areas', {'areas': ['perfil']}, token=admin)
    request('GET', p + '/marca', token=sponsor, expected=403)
    request('PUT', p + '/areas', {'areas': AREAS}, token=admin)

    document = request('POST', p + '/documentos', token=admin, fields={})
    assert 'evidencia sintetica' in request('GET', p + '/arquivos/' + document['id'], token=sponsor)
    request('GET', p + '/arquivos/' + document['id'], token=other, expected=404)
    sheet = request('POST', p + '/relatorio/planilhas', token=admin, fields={})
    request('GET', p + '/arquivos/' + sheet['id'], token=sponsor, expected=403)
    request('GET', p + '/relatorio/planilhas', token=sponsor, expected=403)
    request('PATCH', p + '/marca/recebimento', {'aberto': False}, token=admin)
    request('POST', p + '/marca/miv/versoes', token=sponsor, fields={}, expected=409)
    request('PATCH', p + '/marca/recebimento', {'aberto': True, 'prazo': '2000-01-01T00:00:00Z'}, token=admin, expected=400)
    request('PATCH', p + '/marca/recebimento', {'aberto': True, 'prazo': '2099-01-01T00:00:00Z'}, token=admin)
    request('POST', p + '/marca/miv/versoes', token=sponsor, fields={})
    assert len(request('GET', p + '/marca/miv/versoes', token=sponsor)) == 1
    request('PUT', p + '/midia/briefing', {'texto': 'Briefing sintético'}, token=sponsor)
    broadcast = {'versao': 0, 'itens': [{'canal': 'Canal de teste', 'descricao': 'Publicação sintética', 'url': 'https://example.com', 'veiculadoEm': '2026-10-28T12:00:00Z'}]}
    request('PATCH', p + '/midia/veiculacoes', broadcast, token=admin)
    request('PATCH', p + '/midia/veiculacoes', broadcast, token=admin, expected=409)
    broadcast['versao'] = 1
    request('PATCH', p + '/midia/veiculacoes', broadcast, token=admin)
    assert any(h['versao'] == 1 and h['itens'] for h in request('GET', p + '/midia', token=sponsor)['veiculacoesHistorico'])
    request('POST', p + '/midia/publicacoes', {'titulo': 'Publicação sintética', 'texto': 'Conteúdo de teste'}, token=sponsor, expected=403)
    request('POST', p + '/midia/publicacoes', {'titulo': 'Publicação sintética', 'texto': 'Conteúdo de teste'}, token=admin)
    request('PUT', p + '/pesquisa/perguntas', {'perguntas': ['Pergunta 1', 'Pergunta 2', 'Pergunta 3']}, token=sponsor)
    request('PUT', p + '/pesquisa/perguntas', {'perguntas': ['A', 'B', 'C', 'D']}, token=sponsor, expected=400)
    request('POST', p + '/pesquisa/resultados', token=admin, fields={})
    accreditation = {'versao': 0, 'urlOpenStaff': 'https://example.com/open-staff', 'itens': [{'setor': 'Arena', 'tipo': 'servico', 'publico': 'marca', 'quantidade': 2, 'beneficioId': credential_rights['marca']}, {'setor': 'Arena', 'tipo': 'servico', 'publico': 'agencia', 'quantidade': 5, 'beneficioId': credential_rights['agencia']}]}
    request('PUT', p + '/credenciamento', accreditation, token=admin)
    request('PUT', p + '/credenciamento', accreditation, token=admin, expected=409)
    accreditation['versao'] = 1
    state = request('PUT', p + '/credenciamento', accreditation, token=admin)
    assert any(h['versao'] == 1 and h['itens'] for h in state['historico'])
    request('POST', p + '/faq', {'categoria': 'Materiais', 'pergunta': 'Como enviar?', 'resposta': 'Use a área de materiais.'}, token=admin)
    assert len(request('GET', p + '/faq', token=sponsor)) == 1
    assert len(request('GET', p + '/faq?busca=enviar', token=sponsor)) == 1
    request('POST', p + '/cortesias', {'quantidade': 2, 'tipo': 'sexta', 'setor': 'Arena', 'diaEvento': '2027-01-29', 'beneficioId': courtesy_right}, token=admin, expected=409)
    courtesy = request('POST', p + '/cortesias', {'quantidade': 1, 'tipo': 'sexta', 'setor': 'Arena', 'diaEvento': '2027-01-29', 'beneficioId': courtesy_right}, token=admin)

    def allocate(_):
        headers = {'Authorization': 'Bearer ' + sponsor, 'Content-Type': 'application/json'}
        req = Request(BASE + p + '/cortesias/' + courtesy['id'] + '/destinacoes', data=b'{"quantidade":1,"destinacao":"Teste concorrente"}', headers=headers, method='POST')
        try:
            with urlopen(req, timeout=20) as response:
                return response.status
        except HTTPError as error:
            return error.code
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
        statuses = sorted(pool.map(allocate, range(2)))
    assert statuses == [200, 409], f'Destinação concorrente excedeu o saldo: {statuses}'
    assert next(c for c in request('GET', p + '/cortesias', token=sponsor) if c['id'] == courtesy['id'])['destinadas'] == 1
    request('POST', p + '/cortesias/' + courtesy['id'] + '/destinacoes', {'quantidade': 2147483647, 'destinacao': 'Teste overflow'}, token=sponsor, expected=409)

    request('PUT', p + '/contrato/signatarios', {'signatarios': [{'nome': 'Representante sintético', 'email': 'signatario@example.test', 'cargo': 'Representante'}]}, token=sponsor)
    version = request('POST', p + '/contrato/versoes', token=admin, fields={}, expected=201)
    decision = p + '/contrato/versoes/' + version['id'] + '/decisoes'
    request('POST', decision, {'decisao': 'APROVADO', 'comentario': ''}, token=admin, expected=403)
    request('POST', decision, {'decisao': 'AJUSTES', 'comentario': ''}, token=sponsor, expected=400)
    request('POST', decision, {'decisao': 'AJUSTES', 'comentario': 'Revisar documento sintético'}, token=sponsor)
    version = request('POST', p + '/contrato/versoes', token=admin, fields={}, expected=201)
    request('POST', decision, {'decisao': 'APROVADO', 'comentario': ''}, token=sponsor, expected=409)
    decision = p + '/contrato/versoes/' + version['id'] + '/decisoes'
    request('POST', decision, {'decisao': 'APROVADO', 'comentario': ''}, token=sponsor)
    request('POST', decision, {'decisao': 'APROVADO', 'comentario': ''}, token=sponsor, expected=409)
    request('POST', p + '/contrato/assinado', token=admin, fields={'versaoId': version['id']})

    delivery = request('GET', p + '/entregas', token=sponsor)['itens'][0]['id']
    d = p + '/entregas/' + delivery
    request('PATCH', d + '/execucao', {'estado': 'REALIZADA', 'versao': 0}, token=admin, expected=409)
    state = request('POST', d + '/materiais/versoes', token=sponsor, fields={}, expected=201)
    material = state['materiais'][0]['id']
    evaluation = d + '/materiais/versoes/' + material + '/avaliacoes'
    request('POST', evaluation, {'acao': 'APROVAR', 'comentario': ''}, token=admin, expected=409)
    request('POST', evaluation, {'acao': 'ANALISAR', 'comentario': ''}, token=admin)
    request('POST', evaluation, {'acao': 'AJUSTAR', 'comentario': 'Enviar nova versão sintética'}, token=admin)
    state = request('POST', d + '/materiais/versoes', token=sponsor, fields={}, expected=201)
    request('POST', evaluation, {'acao': 'APROVAR', 'comentario': ''}, token=admin, expected=409)
    material = state['materiais'][0]['id']
    evaluation = d + '/materiais/versoes/' + material + '/avaliacoes'
    request('POST', evaluation, {'acao': 'ANALISAR', 'comentario': ''}, token=admin)
    state = request('POST', evaluation, {'acao': 'APROVAR', 'comentario': ''}, token=admin)
    state = request('PATCH', d + '/responsavel', {'usuarioId': me['id'], 'versao': state['versao']}, token=admin)
    state = request('PATCH', d + '/execucao', {'estado': 'EM_EXECUCAO', 'versao': state['versao']}, token=admin)
    request('PATCH', d + '/execucao', {'estado': 'REALIZADA', 'versao': state['versao']}, token=admin)
    request('POST', d + '/comprovacoes', token=admin, fields={'descricao': 'Comprovação sintética <script>invalido</script>'}, expected=201)
    report = request('GET', p + '/relatorio', token=sponsor)
    assert report['comprovacoes'] and report['veiculacoes'] and len(report['perguntas']) == 3
    assert sheet['id'] not in {file['id'] for file in report['arquivos']}
    html = request('GET', p + '/relatorio/exportar', token=sponsor)
    assert '&lt;script&gt;' in html and '<script>' not in html
    assert request('GET', p + '/historico', token=sponsor)
    request('GET', '/api/notificacoes', token=sponsor)
    request('GET', '/api/parcerias/' + p2 + '/relatorio', token=sponsor, expected=404)
    schema = request('GET', '/v3/api-docs')
    assert '/api/parcerias/{parceriaId}/relatorio' in schema['paths']
    email = f'smoke-{suffix}-0@example.test'
    request('POST', '/api/mfa/setup/' + f'smoke-{suffix}-1@example.test', token=sponsor, expected=403)
    setup = request('POST', '/api/mfa/setup/' + email, token=sponsor)
    def otp():
        key = base64.b32decode(setup['secret'] + '=' * (-len(setup['secret']) % 8))
        digest = hmac.new(key, struct.pack('>Q', int(time.time()) // 30), hashlib.sha1).digest()
        offset = digest[-1] & 15
        value = struct.unpack('>I', digest[offset:offset + 4])[0] & 0x7fffffff
        return f'{value % 1000000:06d}'
    request('POST', '/api/mfa/confirm/' + email, {'code': otp()}, token=sponsor)
    challenge = request('POST', '/api/auth/login', {'email': email, 'senha': password}, expected=202)['challenge']
    request('GET', '/api/auth/me', token=challenge, expected=401)
    mfa_token = request('POST', '/api/auth/validar-mfa', {'challenge': challenge, 'codigo': otp()})['token']
    assert request('GET', '/api/auth/me', token=mfa_token)['id'] == uid
    request('PATCH', p + '/acesso', {'usuarioIds': []}, token=admin)
    request('GET', p, token=mfa_token, expected=404)
    print(f'PASS: {checks} requisições verificadas, destinação concorrente, segregação, contratos, entregas e relatório automático.')
    print('Dados sintéticos criados com prefixo Smoke; nenhum registro anterior foi removido.')


if __name__ == '__main__':
    run()
