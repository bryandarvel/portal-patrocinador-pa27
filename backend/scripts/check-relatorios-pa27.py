"""Exercita importação e exportação na demonstração PA27 local já semeada."""
import argparse
import io
import sys
import zipfile
import xml.etree.ElementTree as ET

from portal_api import ENV, request

XLSX = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
DOCX = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
S = '{http://schemas.openxmlformats.org/spreadsheetml/2006/main}'
W = '{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
EDITION = '2027 — Demonstração PA27'


def call(method, path, token=None, expected=200, **kwargs):
    status, payload, raw = request(method, path, token=token, **kwargs)
    assert status == expected, f'{method} {path}: esperado {expected}, recebido {status}'
    return payload if isinstance(payload, (dict, list)) else raw


def login(email, password):
    return call('POST', '/api/auth/login', body={'email': email, 'senha': password})['token']


def copy_with(data, part, update):
    with zipfile.ZipFile(io.BytesIO(data)) as original, io.BytesIO() as output:
        with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as updated:
            for entry in original.namelist():
                value = original.read(entry)
                updated.writestr(entry, update(value) if entry == part else value)
        return output.getvalue()


def worksheet(data):
    with zipfile.ZipFile(io.BytesIO(data)) as book:
        strings = [
            ''.join(item.itertext())
            for item in ET.fromstring(book.read('xl/sharedStrings.xml'))
        ]
        sheet = ET.fromstring(book.read('xl/worksheets/sheet1.xml'))
        rows = []
        for row in sheet.iter(S + 'row'):
            values = {}
            for cell in row.findall(S + 'c'):
                value = cell.findtext(S + 'v')
                if value is not None:
                    value = strings[int(value)] if cell.get('t') == 's' else float(value)
                    values[cell.get('r').rstrip('0123456789')] = value
            rows.append(values)
        return rows


def demo_word(content):
    tree = ET.fromstring(content)
    cells = tree.findall(f'.//{W}tbl/{W}tr')[-1].findall(W + 'tc')
    for index, value in {1: '2027-03', 2: 'TV', 3: 'Chamada de 15 segundos',
                         4: 'chamadas', 5: '4', 6: '3', 7: '', 8: ''}.items():
        cells[index].find(f'.//{W}t').text = value
    return ET.tostring(tree, encoding='utf-8', xml_declaration=True)


def demo_revision(content):
    root = ET.fromstring(content)
    root.find(f".//{S}c[@r='G2']/{S}v").text = '9'
    return ET.tostring(root, encoding='utf-8', xml_declaration=True)


def run(read_only):
    assert ENV.get('COMPOSE_PROJECT_NAME') == 'portal-pa27-demo' and ENV.get('BACKEND_PORT') == '8087', (
        'Use apenas o ambiente local isolado de demonstração PA27.'
    )
    admin = login(ENV['PORTAL_BOOTSTRAP_EMAIL'], ENV['PORTAL_BOOTSTRAP_PASSWORD'])
    sponsor = login('renner.pa27@example.test', ENV['PORTAL_SEED_PASSWORD'])
    partners = call('GET', '/api/parcerias', admin)['itens']
    ids = {item['nome']: item['id'] for item in partners if item['edicao'] == EDITION}
    renner = '/api/parcerias/' + ids['Renner (demo)']
    banrisul = '/api/parcerias/' + ids['Banrisul (demo)']
    absolut = '/api/parcerias/' + ids['Absolut Sprite (demo)']
    a, b = [path + '/relatorio/setorial' for path in (renner, banrisul)]

    if not read_only:
        def saved_source(partner, base, name):
            history = call('GET', base + '/importacoes', admin)
            match = next((item for item in history if item['arquivo'] == name), None)
            if match:
                return call('GET', f"{partner}/arquivos/{match['arquivoId']}", admin)

        excel = saved_source(renner, a, 'radio-fevereiro.xlsx') or call('GET', a + '/modelos/xlsx', admin)
        revision = saved_source(renner, a, 'radio-fevereiro-revisao.xlsx') or copy_with(
            excel, 'xl/worksheets/sheet1.xml', demo_revision
        )
        television = saved_source(banrisul, b, 'tv-marco.docx')
        if television:
            with zipfile.ZipFile(io.BytesIO(television)) as previous:
                valid_grid = ET.fromstring(previous.read('word/document.xml')).find(f'.//{W}tblGrid')
            if valid_grid is None:
                television = None
        if not television:
            word = call('GET', b + '/modelos/docx', admin)
            television = copy_with(word, 'word/document.xml', demo_word)

        def upload(base, name, mime, data, status=200):
            return call('POST', base + '/importacoes', admin, expected=status, files={'arquivo': (name, mime, data)})

        upload(a, 'invalido.xlsx', XLSX, b'arquivo invalido', 400)
        upload(b, 'patrocinador-incorreto.xlsx', XLSX, excel, 400)
        original = upload(a, 'radio-fevereiro.xlsx', XLSX, excel)
        upload(a, 'radio-fevereiro-revisao.xlsx', XLSX, revision)
        retry = upload(a, 'copia-radio.xlsx', XLSX, excel)
        assert retry['repetido'] and retry['importacao']['id'] == original['importacao']['id']
        upload(b, 'tv-marco.docx', DOCX, television)

    history = call('GET', a + '/importacoes', admin)
    assert history
    call('GET', a + '/importacoes', sponsor, 403)
    call('GET', a + '/exportacoes/vendas', sponsor, 403)
    call('GET', '/api/admin/relatorios/setoriais/vendas', sponsor, 403)
    call('GET', f"{renner}/arquivos/{history[0]['arquivoId']}", sponsor, 403)
    assert call('GET', f"{renner}/arquivos/{history[0]['arquivoId']}", admin).startswith(b'PK')

    sales_file = call('GET', a + '/exportacoes/vendas?mes=2027-02', admin)
    renner_sales = worksheet(sales_file)
    assert len(renner_sales) == 2
    row = renner_sales[1]
    assert (row['A'], row['B'], row['C'], row['F'], row['G']) == ('Renner (demo)', '2027-02', 'Rádio', 10, 9)
    assert len(worksheet(call('GET', a + '/exportacoes/vendas?mes=2027-03', admin))) == 1
    consolidated = worksheet(call('GET', '/api/admin/relatorios/setoriais/veiculacao', admin))[1:]
    radio = next(row for row in consolidated if row['A'] == 'Renner (demo)')
    tv = next(row for row in consolidated if row['A'] == 'Banrisul (demo)')
    assert (radio['E'], radio['F']) == ('Acessos', 100000)
    assert tv['B'] == '2027-03' and tv['C'] == 'TV' and 'E' not in tv and 'F' not in tv

    publication_name = 'Vendas Renner - fevereiro 2027 (demo).xlsx'
    report = call('GET', renner + '/relatorio', sponsor)
    publication = next((item for item in report['relatoriosPublicados'] if item['nome'] == publication_name), None)
    if not publication and not read_only:
        call('POST', renner + '/relatorio/publicacoes', admin, expected=201,
             files={'arquivo': (publication_name, XLSX, sales_file)})
        report = call('GET', renner + '/relatorio', sponsor)
        publication = next(item for item in report['relatoriosPublicados'] if item['nome'] == publication_name)
    assert publication, 'O relatório individual ainda não foi publicado.'
    published = call('GET', f"{renner}/arquivos/{publication['id']}", sponsor)
    assert worksheet(published) == renner_sales
    other = login('absolut-sprite.pa27@example.test', ENV['PORTAL_SEED_PASSWORD'])
    call('GET', f"{renner}/arquivos/{publication['id']}", other, 404)
    own_profile = call('GET', renner, sponsor)
    other_profile = call('GET', absolut, other)
    assert own_profile['cota'] != other_profile['cota'] and 'acessos' not in own_profile
    closed = call('GET', absolut + '/marca', other)
    assert not closed['recebimento']['aberto'] and not closed['versoes']
    access = next(item for item in call('GET', renner, admin)['acessos'] if item['email'] == 'renner.pa27@example.test')
    assert access['primeiro_acesso'] is not None and access['ultimo_acesso'] is not None
    login('renner.pa27@example.test', ENV['PORTAL_SEED_PASSWORD'])
    after = next(item for item in call('GET', renner, admin)['acessos'] if item['id'] == access['id'])
    assert after['primeiro_acesso'] == access['primeiro_acesso'] and after['ultimo_acesso'] > access['ultimo_acesso']
    print('PASS: Word, Excel, revisão, reenvio, origem, mês, impacto ausente, publicação e permissões.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--somente-verificar', action='store_true')
    try:
        run(parser.parse_args().somente_verificar)
    except (AssertionError, KeyError) as error:
        sys.exit(f'Falha na verificação de relatórios: {error}')
