"""Popula a base local com dados de demonstração, somente pela API.

Uso: python3 backend/scripts/seed-portal.py  (backend e Mailpit ativos; credenciais do bootstrap no .env)
Rodar de novo não duplica: cotas, usuários e parcerias de demonstração são localizados pelo nome ou e-mail.
Para recomeçar do zero, use backend/scripts/reset-portal.sh --confirmar.
"""
import io
import struct
import sys
import zipfile
import zlib
from urllib.parse import quote

from portal_api import BASE, ENV, ApiError, activation_token, request

PASSWORD = ENV.get('PORTAL_SEED_PASSWORD') or ENV.get('PORTAL_BOOTSTRAP_PASSWORD', '')
ALL_AREAS = ['perfil', 'marca', 'midia', 'cortesias', 'credenciamento', 'pesquisa', 'contrato']
RBS_USER = ('Equipe RBS Demonstração', 'rbs.demo@example.test')


def cortesia(tipo, setor, quantidade):
    return {'natureza': 'CORTESIA', 'tipo': tipo, 'setor': setor, 'publico': '', 'quantidade': quantidade}


def credencial(setor, publico, quantidade):
    return {'natureza': 'CREDENCIAL', 'tipo': 'servico', 'setor': setor, 'publico': publico, 'quantidade': quantidade}


# Nomes fictícios e marcados como demonstração (PRODUCT.md: não inventar patrocinadores reais).
# nivel: completo (todas as etapas), parcial (fluxos em andamento) ou minimo (envio encerrado, poucas áreas).
PARCERIAS = [
    {
        'nome': 'Marca Demonstração Atlântica (demo)', 'nivel': 'completo', 'areas': ALL_AREAS,
        'contato': ('Ana Demonstração', 'ana.atlantica@example.test'),
        'cota': 'Cota Master (demo)',
        'beneficios': [cortesia('passaporte', 'Camarote', 20), cortesia('sexta', 'Pista', 30), cortesia('sabado', 'Pista', 30),
                       credencial('Área de ativação', 'marca', 6), credencial('Área de ativação', 'agencia', 4)],
        'entregas': [('marca', 'Logo no telão principal', 'Aplicação da marca nos telões do palco principal nos intervalos.'),
                     ('midia', 'Post patrocinado no Instagram', 'Publicação no perfil oficial com marcação do patrocinador.'),
                     ('marca', 'Ativação de marca na Arena', 'Estande de ativação com experiência interativa para o público.')],
    },
    {
        'nome': 'Marca Demonstração Litoral (demo)', 'nivel': 'parcial', 'areas': ALL_AREAS,
        'contato': ('Bruno Demonstração', 'bruno.litoral@example.test'),
        'cota': 'Subcota G (demo)',
        'beneficios': [cortesia('sexta', 'Pista', 15), cortesia('sabado', 'Pista', 15), credencial('Área de ativação', 'marca', 3)],
        'entregas': [('marca', 'Logo nas pulseiras de acesso', 'Marca aplicada nas pulseiras do público geral.'),
                     ('midia', 'Vinheta na rádio', 'Vinheta de 15 segundos na programação do festival.')],
    },
    {
        'nome': 'Marca Demonstração Farol (demo)', 'nivel': 'minimo', 'areas': ['perfil', 'marca', 'cortesias', 'contrato'],
        'contato': ('Carla Demonstração', 'carla.farol@example.test'),
        'cota': 'Subcota (demo)',
        'beneficios': [cortesia('sabado', 'Pista', 8)],
        'entregas': [('marca', 'Logo no painel de patrocinadores', 'Marca no painel de patrocinadores da entrada.')],
    },
]

FAQ = [
    ('Materiais', 'Quais formatos de arquivo posso enviar?', 'PDF, imagens (PNG e JPEG), documentos do Office, ZIP, áudio e vídeo, até 20 MB por arquivo.'),
    ('Materiais', 'Posso substituir um material já enviado?', 'Sim. Enquanto o envio estiver aberto, cada novo arquivo vira uma nova versão e o histórico fica disponível.'),
    ('Cortesias', 'Como destino minhas cortesias?', 'Na área Cortesias, escolha o direito, informe a quantidade e para quem ela será destinada.'),
    ('Credenciamento', 'Onde cadastro a equipe que vai trabalhar no evento?', 'O cadastro é feito no sistema oficial Open Staff, pelo link disponível na área Credenciamento.'),
]


# Arquivos mínimos e válidos gerados em memória (nenhum binário versionado).
def pdf(titulo):
    text = titulo.encode('latin-1', 'replace').replace(b'(', b'[').replace(b')', b']')
    stream = b'BT /F1 18 Tf 72 760 Td (' + text + b') Tj ET'
    objects = [b'<< /Type /Catalog /Pages 2 0 R >>', b'<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
               b'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
               b'<< /Length %d >>\nstream\n' % len(stream) + stream + b'\nendstream',
               b'<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>']
    out, offsets = io.BytesIO(b'%PDF-1.4\n'), []
    out.seek(0, 2)
    for number, body in enumerate(objects, 1):
        offsets.append(out.tell())
        out.write(b'%d 0 obj\n' % number + body + b'\nendobj\n')
    xref = out.tell()
    out.write(b'xref\n0 %d\n0000000000 65535 f \n' % (len(objects) + 1) + b''.join(b'%010d 00000 n \n' % o for o in offsets))
    out.write(b'trailer\n<< /Size %d /Root 1 0 R >>\nstartxref\n%d\n%%%%EOF\n' % (len(objects) + 1, xref))
    return out.getvalue()


def png(width=320, height=180):
    rows = b''.join(b'\x00' + bytes(v for x in range(width) for v in (11 + x // 3, 40 + y // 2, 120 + x // 4)) for y in range(height))

    def chunk(kind, data):
        return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data) & 0xffffffff)
    return b'\x89PNG\r\n\x1a\n' + chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)) + chunk(b'IDAT', zlib.compress(rows)) + chunk(b'IEND', b'')


def xlsx(linhas):
    def cell(value):
        return f'<c t="inlineStr"><is><t>{value}</t></is></c>'
    sheet = ''.join(f'<row>{"".join(cell(v) for v in linha)}</row>' for linha in linhas)
    files = {
        '[Content_Types].xml': '<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>',
        '_rels/.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>',
        'xl/workbook.xml': '<?xml version="1.0" encoding="UTF-8"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>',
        'xl/_rels/workbook.xml.rels': '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/></Relationships>',
        'xl/worksheets/sheet1.xml': f'<?xml version="1.0" encoding="UTF-8"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>{sheet}</sheetData></worksheet>',
    }
    out = io.BytesIO()
    with zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED) as archive:
        for name, content in files.items():
            archive.writestr(name, content)
    return out.getvalue()


def arquivo(nome, conteudo, tipo):
    return {'arquivo': (nome, tipo, conteudo)}


PDF, PNG = 'application/pdf', 'image/png'
XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'


def call(method, path, token, **kwargs):
    status, payload, raw = request(method, path, token=token, **kwargs)
    if status >= 400:
        raise ApiError(method, path, status, raw)
    return payload


def login(email):
    status, payload, raw = request('POST', '/api/auth/login', {'email': email, 'senha': PASSWORD})
    if status != 200 or not payload.get('token'):
        raise ApiError('POST', '/api/auth/login (' + email + ')', status, raw)
    return payload['token']


def usuario(admin, nome, email, role):
    """Cria (se preciso), ativa pelo Mailpit e entra com o usuário de demonstração."""
    existentes = [u for u in call('GET', '/api/admin/usuarios?busca=' + quote(email), admin) if u['email'] == email]
    if not existentes:
        body = {'nome': nome, 'email': email, 'senha': PASSWORD, 'role': role}
        call('POST', '/api/admin/usuarios' if role == 'ADMIN_RBS' else '/api/auth/cadastro', admin, body=body)
    if not existentes or not existentes[0]['ativo']:
        call('GET', '/api/auth/verificar?token=' + activation_token(email), None)
    token = login(email)
    return call('GET', '/api/auth/me', token)['id'], token


def cota_id(admin, spec):
    for cota in call('GET', '/api/cotas', admin):
        if cota['nome'] == spec['cota']:
            return cota['id']
    entregas = [{'area': a, 'titulo': t, 'descricao': d} for a, t, d in spec['entregas']]
    body = {'nome': spec['cota'], 'areas': spec['areas'], 'entregas': entregas, 'versao': 0, 'beneficios': spec['beneficios']}
    return call('POST', '/api/cotas', admin, body=body)['id']


def popular(admin, rbs_id, spec):
    existentes = call('GET', '/api/parcerias?busca=' + quote(spec['nome']), admin)['itens']
    if any(p['nome'] == spec['nome'] for p in existentes):
        print(f'= {spec["nome"]}: já existe, mantida.')
        return
    completo, minimo = spec['nivel'] == 'completo', spec['nivel'] == 'minimo'
    contato_id, sponsor = usuario(admin, *spec['contato'], 'ADMIN_PATROCINADOR')
    parceria = call('POST', '/api/parcerias', admin, body={'nome': spec['nome'], 'edicao': '2027', 'cotaId': cota_id(admin, spec), 'usuarioIds': [contato_id]})
    p, areas, marca = '/api/parcerias/' + parceria['id'], spec['areas'], spec['nome'].replace(' (demo)', '')

    call('POST', p + '/documentos', admin, files=arquivo(f'Plano comercial {spec["cota"]}.pdf', pdf('Plano comercial ' + spec['cota']), PDF))
    if completo:
        call('POST', p + '/documentos', admin, files=arquivo('Proposta comercial assinada.pdf', pdf('Proposta comercial'), PDF))

    if 'marca' in areas:
        call('PATCH', p + '/marca/recebimento', admin, body={'aberto': not minimo, 'prazo': None if minimo else '2027-01-15T23:59:00Z'})
        if not minimo:
            for versao in range(2 if completo else 1):
                call('POST', p + '/marca/miv/versoes', sponsor, files=arquivo(f'MIV {marca} v{versao + 1}.pdf', pdf('Manual de identidade visual ' + marca), PDF))
        if completo:
            call('POST', p + '/marca/publicacoes', admin, body={'titulo': 'Aplicação no telão aprovada', 'texto': 'Arte final aplicada no telão principal.', 'url': 'https://example.com/demo/telao'})
            call('POST', p + '/marca/publicacoes', admin, parts={'dados': {'titulo': 'Mockup da ativação na Arena', 'texto': 'Prévia do estande para validação.', 'url': None}},
                 files=arquivo('Mockup ativação Arena.png', png(), PNG))

    if 'midia' in areas:
        call('PATCH', p + '/midia/recebimento', admin, body={'aberto': True, 'prazo': '2027-01-20T23:59:00Z'})
        call('POST', p + '/midia/versoes', sponsor, files=arquivo(f'Key visual {marca}.png', png(), PNG))
        call('PUT', p + '/midia/briefing', sponsor, body={'texto': f'Campanha {marca} no festival: tom jovem, foco em música e verão. Usar a assinatura "Só quem vai sente."'})
        if completo:
            call('POST', p + '/midia/versoes', sponsor, fields={'texto': 'Legenda: Vem viver o Planeta com a gente! #PA27'})
            itens = [{'canal': 'Instagram oficial', 'descricao': 'Post patrocinado no feed', 'url': 'https://example.com/demo/post', 'veiculadoEm': '2026-12-10T15:00:00Z'},
                     {'canal': 'Rádio Atlântida', 'descricao': 'Vinheta de 15 segundos', 'url': 'https://example.com/demo/radio', 'veiculadoEm': '2026-12-12T09:00:00Z'}]
            call('PATCH', p + '/midia/veiculacoes', admin, body={'versao': 0, 'itens': itens})
            call('POST', p + '/midia/publicacoes', admin, body={'titulo': 'Relatório de alcance de dezembro', 'texto': 'Alcance consolidado das veiculações do mês.', 'url': 'https://example.com/demo/alcance'})

    beneficios = parceria['beneficios']
    if 'cortesias' in areas:
        for b in (b for b in beneficios if b['natureza'] == 'CORTESIA'):
            datas = {'periodoInicio': '2027-02-05', 'periodoFim': '2027-02-06'} if b['tipo'] == 'passaporte' else {'diaEvento': '2027-02-05' if b['tipo'] == 'sexta' else '2027-02-06'}
            criada = call('POST', p + '/cortesias', admin, body={'quantidade': b['quantidade'], 'tipo': b['tipo'], 'setor': b['setor'], 'beneficioId': b['id'], **datas})
            if not minimo:
                call('POST', p + '/cortesias/' + criada['id'] + '/destinacoes', sponsor, body={'quantidade': max(1, b['quantidade'] // 3), 'destinacao': 'Clientes convidados'})

    if 'credenciamento' in areas:
        itens = [{k: b[k] for k in ('setor', 'tipo', 'publico', 'quantidade')} | {'beneficioId': b['id']} for b in beneficios if b['natureza'] == 'CREDENCIAL']
        call('PUT', p + '/credenciamento', admin, body={'versao': 0, 'urlOpenStaff': 'https://example.com/demo/open-staff', 'itens': itens})

    if 'pesquisa' in areas:
        call('PATCH', p + '/pesquisa/recebimento', admin, body={'aberto': True, 'prazo': '2027-01-25T23:59:00Z'})
        call('PUT', p + '/pesquisa/perguntas', sponsor, body={'perguntas': [f'Você lembra de ter visto a marca {marca} no festival?', 'Qual ativação da marca você visitou?', 'Que nota você dá para a experiência na ativação?']})
        if completo:
            call('POST', p + '/pesquisa/resultados', admin, files=arquivo('Resultados da pesquisa de ativação.pdf', pdf('Resultados da pesquisa'), PDF))

    if 'contrato' in areas:
        call('PUT', p + '/contrato/signatarios', sponsor, body={'signatarios': [{'nome': spec['contato'][0], 'email': spec['contato'][1], 'cargo': 'Diretora de marketing'}]})
        if not minimo:
            versao = call('POST', p + '/contrato/versoes', admin, files=arquivo('Contrato de patrocínio v1.pdf', pdf('Contrato de patrocinio v1'), PDF))
            if completo:
                call('POST', p + '/contrato/versoes/' + versao['id'] + '/decisoes', sponsor, body={'decisao': 'AJUSTES', 'comentario': 'Ajustar a cláusula de exposição de marca no palco.'})
                versao = call('POST', p + '/contrato/versoes', admin, files=arquivo('Contrato de patrocínio v2.pdf', pdf('Contrato de patrocinio v2'), PDF))
                call('POST', p + '/contrato/versoes/' + versao['id'] + '/decisoes', sponsor, body={'decisao': 'APROVADO', 'comentario': ''})
                call('POST', p + '/contrato/assinado', admin, fields={'versaoId': versao['id']}, files=arquivo('Contrato assinado.pdf', pdf('Contrato assinado'), PDF))

    entregas = call('GET', p + '/entregas', sponsor)['itens']
    if entregas and not minimo:
        d = p + '/entregas/' + entregas[0]['id']
        estado = call('POST', d + '/materiais/versoes', sponsor, files=arquivo('Arte final v1.png', png(), PNG))
        avaliar = d + '/materiais/versoes/' + estado['materiais'][0]['id'] + '/avaliacoes'
        estado = call('POST', avaliar, admin, body={'acao': 'ANALISAR', 'comentario': ''})
        if completo:
            call('POST', avaliar, admin, body={'acao': 'AJUSTAR', 'comentario': 'Aumentar a área de respiro do logo.'})
            estado = call('POST', d + '/materiais/versoes', sponsor, files=arquivo('Arte final v2.png', png(), PNG))
            avaliar = d + '/materiais/versoes/' + estado['materiais'][0]['id'] + '/avaliacoes'
            call('POST', avaliar, admin, body={'acao': 'ANALISAR', 'comentario': ''})
            estado = call('POST', avaliar, admin, body={'acao': 'APROVAR', 'comentario': ''})
            estado = call('PATCH', d + '/responsavel', admin, body={'usuarioId': rbs_id, 'versao': estado['versao']})
            estado = call('PATCH', d + '/execucao', admin, body={'estado': 'EM_EXECUCAO', 'versao': estado['versao']})
            call('PATCH', d + '/execucao', admin, body={'estado': 'REALIZADA', 'versao': estado['versao']})
            call('POST', d + '/comprovacoes', admin, fields={'descricao': 'Logo exibido nos telões durante os intervalos dos shows.'}, files=arquivo('Foto do telão.png', png(), PNG))
            if len(entregas) > 1:
                d = p + '/entregas/' + entregas[1]['id']
                estado = call('POST', d + '/materiais/versoes', sponsor, files=arquivo('Peça do post.png', png(), PNG))
                call('POST', d + '/materiais/versoes/' + estado['materiais'][0]['id'] + '/avaliacoes', admin, body={'acao': 'ANALISAR', 'comentario': ''})
                estado = call('GET', d, admin)
                call('PATCH', d + '/responsavel', admin, body={'usuarioId': rbs_id, 'versao': estado['versao']})

    for categoria, pergunta, resposta in FAQ[:1] if minimo else FAQ:
        call('POST', p + '/faq', admin, body={'categoria': categoria, 'pergunta': pergunta, 'resposta': resposta})

    if completo:
        call('POST', p + '/relatorio/planilhas', admin, files=arquivo('Planilha de veiculações.xlsx', xlsx([('Canal', 'Alcance'), ('Instagram oficial', '120000'), ('Rádio Atlântida', '85000')]), XLSX))
    print(f'+ {spec["nome"]}: criada ({spec["nivel"]}), contato {spec["contato"][1]}.')


def main():
    if len(PASSWORD) < 12:
        sys.exit('Defina PORTAL_SEED_PASSWORD ou PORTAL_BOOTSTRAP_PASSWORD (12+ caracteres) no .env.')
    admin = call('POST', '/api/auth/login', None, body={'email': ENV['PORTAL_BOOTSTRAP_EMAIL'], 'senha': ENV['PORTAL_BOOTSTRAP_PASSWORD']})['token']
    rbs_id, _ = usuario(admin, *RBS_USER, 'ADMIN_RBS')
    for spec in PARCERIAS:
        popular(admin, rbs_id, spec)
    origem = 'PORTAL_SEED_PASSWORD' if ENV.get('PORTAL_SEED_PASSWORD') else 'PORTAL_BOOTSTRAP_PASSWORD'
    print(f'Pronto em {BASE}. Usuários de demonstração ({RBS_USER[1]} e contatos acima) entram com a senha de {origem}.')


if __name__ == '__main__':
    try:
        main()
    except ApiError as error:
        sys.exit(f'Falhou: {error}\nA parceria em andamento pode ter ficado parcial; use reset-portal.sh --confirmar e rode de novo.')
