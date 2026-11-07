"""Planeja ou popula as oito parcerias PA27 pela API local já existente.

Sem argumentos, imprime o plano sem acessar a API ou ler a configuração local.
Use --aplicar somente com o Compose local e o Mailpit em execução.
"""

import argparse
import json
import runpy
import sys
from pathlib import Path
from urllib.parse import quote


FRONTEND = Path(__file__).resolve().parents[1]
BRANDS = json.loads(
    (FRONTEND / 'src/app/shared/demo-pa27-brands.json').read_text(encoding='utf-8')
)
OPEN_STAFF = 'https://app.openstaff.com.br/login'
AREAS = ['perfil', 'marca', 'midia', 'cortesias', 'credenciamento']

# Modalidade (tipo no contrato atual), setor e quantidade fictícia.
CREDENTIALS = {
    'renner': [('passaporte', 'Arena', 12), ('sexta', 'Camarote', 4)],
    'coca-cola': [('sabado', 'Premium', 8)],
    'banrisul': [('passaporte', 'Rooftop', 6)],
    'monster': [('sexta', 'Arena', 8)],
    'mastercard': [('passaporte', 'Terraço', 5)],
    'absolut-sprite': [('sabado', 'Camarote', 4)],
    'aperol': [('passaporte', 'Rooftop', 4)],
    'claro-jbl': [('sexta', 'Premium', 6), ('sabado', 'Premium', 6)],
}

SCENARIOS = {
    'renner': 'material de exemplo aprovado e comprovação fictícia',
    'coca-cola': 'envio aberto, entrega pronta para demonstrar e documento de exemplo',
    'banrisul': 'envio de exemplo e histórico de MIV',
    'monster': 'material recebido, aguardando análise',
    'mastercard': 'briefing enviado, sem veiculação',
    'absolut-sprite': 'sem material enviado e recebimento de marca encerrado',
    'aperol': 'duas versões e ajuste solicitado',
    'claro-jbl': 'material conjunto enviado, sem publicação',
}

# Publicações públicas do perfil @planetaatlantida, conferidas pelo navegador.
REFERENCES = {
    'renner': {
        'titulo': 'Referência externa · pontos de venda Renner',
        'texto': 'Anúncio dos pontos de venda presenciais para o Planeta Atlântida 2027.',
        'url': 'https://www.instagram.com/p/DfRz-lLoGvT/',
    },
    'coca-cola': {
        'titulo': 'Referência externa · Coca-Cola na edição 2026',
        'texto': 'Vídeo do Planeta Atlântida 2026 com a Coca-Cola. Material de edição anterior.',
        'url': 'https://www.instagram.com/reel/DUKZxpFgEgV/',
    },
    'banrisul': {
        'titulo': 'Referência externa · pré-venda Banrisul',
        'texto': 'Anúncio da pré-venda Banrisul para o Planeta Atlântida 2027.',
        'url': 'https://www.instagram.com/p/DfCfdYgoP0v/',
    },
}


def populate_media(seed, admin, sponsor, admin_id, path, brand):
    call, pdf, file = seed['call'], seed['pdf'], seed['arquivo']
    key, name = brand['key'], brand['name']
    if key == 'absolut-sprite':
        return

    def material(label):
        title = f'Demonstração PA27 - {name} - {label}'
        return file(title + '.pdf', pdf(title), seed['PDF'])

    if key == 'mastercard':
        call('PUT', path + '/midia/briefing', sponsor, body={
            'texto': 'Demonstração: planejar uma peça para os canais digitais do evento.',
        })
        return
    if key == 'coca-cola':
        return
    if key == 'banrisul':
        for version in (1, 2):
            call('POST', path + '/marca/miv/versoes', sponsor,
                 files=material(f'Exemplo de MIV v{version}'))
        return
    if key == 'claro-jbl':
        call('POST', path + '/midia/versoes', sponsor,
             files=material('Proposta de material conjunto'))
        return

    delivery = call('POST', path + '/entregas', admin, body={
        'area': 'midia',
        'titulo': 'Peça digital da ativação',
        'descricao': 'Entrega de demonstração para acompanhar o fluxo de revisão de materiais.',
    })
    delivery_path = path + '/entregas/' + delivery['id']

    def upload(version):
        state = call('POST', delivery_path + '/materiais/versoes', sponsor,
                     files=material(f'Peça digital v{version}'))
        return delivery_path + '/materiais/versoes/' + state['materiais'][0]['id'] + '/avaliacoes'

    def review(review_path, action, comment=''):
        return call('POST', review_path, admin, body={'acao': action, 'comentario': comment})

    review_path = upload(1)
    if key == 'monster':
        return

    review(review_path, 'ANALISAR')
    if key == 'aperol':
        review(review_path, 'AJUSTAR', 'Demonstração: aumentar a margem ao redor da marca.')
        review_path = upload(2)
        review(review_path, 'ANALISAR')
        review(review_path, 'AJUSTAR', 'Demonstração: conferir a legibilidade do texto.')
        return

    state = review(review_path, 'APROVAR')
    state = call('PATCH', delivery_path + '/responsavel', admin, body={
        'usuarioId': admin_id, 'versao': state['versao'],
    })
    for execution in ('EM_EXECUCAO', 'REALIZADA'):
        state = call('PATCH', delivery_path + '/execucao', admin, body={
            'estado': execution, 'versao': state['versao'],
        })
    call('POST', delivery_path + '/comprovacoes', admin,
         fields={'descricao': 'Registro fictício para demonstrar a consulta de comprovações.'},
         files=material('Comprovação fictícia'))


def complete_scenarios(seed, admin, path, key):
    call = seed['call']
    if key == 'coca-cola':
        title = 'Logo no telão principal'
        deliveries = call('GET', path + '/entregas', admin)['itens']
        if not any(item['titulo'] == title for item in deliveries):
            call('POST', path + '/entregas', admin, body={
                'area': 'marca', 'titulo': title,
                'descricao': 'Envie um material fictício para apresentar o fluxo de aprovação e comprovação.',
            })
        return
    if key != 'renner':
        return

    profile = call('GET', path, admin)
    enabled = [area['area'] for area in profile['areas'] if area['habilitada']]
    missing = [area for area in ('pesquisa', 'contrato') if area not in enabled]
    if missing:
        call('PUT', path + '/areas', admin, body={'areas': enabled + missing})

    faqs = [
        ('Materiais', 'Onde envio o manual de identidade visual?',
         'Acesse Aplicações de marca. O histórico mantém as versões enviadas à RBS.'),
        ('Entregas', 'Onde encontro a comprovação de uma entrega?',
         'Abra Entregas da parceria e selecione a entrega realizada. Se a RBS já publicou a comprovação, ela aparece no detalhe.'),
        ('Credenciamento', 'Onde faço o credenciamento da minha equipe?',
         'Consulte as credenciais da parceria no portal e use o link da área de Credenciamento para abrir o Open Staff.'),
    ]
    existing = {item['pergunta'] for item in call('GET', path + '/faq', admin)}
    for category, question, answer in faqs:
        if question not in existing:
            call('POST', path + '/faq', admin, body={'categoria': category, 'pergunta': question, 'resposta': answer})

    sponsor_email = 'renner.pa27@example.test'
    sponsor = seed['login'](sponsor_email)
    research = call('GET', path + '/pesquisa', admin)
    if not research['versoes']:
        if not research['recebimento']['aberto']:
            call('PATCH', path + '/pesquisa/recebimento', admin, body={'aberto': True, 'prazo': None})
        call('PUT', path + '/pesquisa/perguntas', sponsor, body={'perguntas': [
            'Em qual área do festival você encontrou a ativação?',
            'Como você avaliaria a experiência na ativação?',
        ]})
    contract = call('GET', path + '/contrato', admin)
    if not contract['versoes']:
        if not contract['signatarios']:
            call('PUT', path + '/contrato/signatarios', sponsor, body={'signatarios': [
                {'nome': 'Contato Renner (demo)', 'email': sponsor_email, 'cargo': 'Representante'},
            ]})
        title = 'Minuta de demonstração PA27'
        call('POST', path + '/contrato/versoes', admin,
             files=seed['arquivo'](title + '.pdf', seed['pdf'](title), seed['PDF']))


def existing_partnership(call, admin, name, email, edition):
    """Reutiliza a parceria mesmo que a RBS tenha editado seu nome de exibição."""
    matches = call('GET', '/api/parcerias?busca=' + quote(name), admin)['itens']
    exact = [item for item in matches if item['nome'] == name and item['edicao'] == edition]
    if len(exact) > 1:
        raise SystemExit(f'{name}: mais de uma parceria corresponde ao cenário. Nenhum registro foi criado.')
    if exact:
        return exact[0]
    matches = []
    page = 0
    while True:
        result = call('GET', '/api/parcerias?pagina=' + str(page), admin)
        for item in result['itens']:
            if item['edicao'] != edition:
                continue
            profile = call('GET', '/api/parcerias/' + item['id'], admin)
            if any(access['email'].strip().lower() == email.lower() for access in profile['acessos']):
                matches.append(item)
        page += 1
        if not result['itens'] or page * 50 >= result['total']:
            break
    if len(matches) > 1:
        raise SystemExit(f'{name}: a conta está vinculada a mais de uma parceria desta edição. Confira os acessos antes de repetir a carga.')
    return matches[0] if matches else None


def apply():
    backend_scripts = FRONTEND.parent / 'backend/scripts'
    sys.dont_write_bytecode = True
    sys.path.insert(0, str(backend_scripts))
    seed = runpy.run_path(str(backend_scripts / 'seed-portal.py'))
    from portal_api import MAIL

    call, env = seed['call'], seed['ENV']
    if not env.get('PORTAL_BOOTSTRAP_EMAIL') or not env.get('PORTAL_BOOTSTRAP_PASSWORD'):
        raise SystemExit('Configure o bootstrap local conforme o README do projeto.')
    password = seed['PASSWORD']
    if not (12 <= len(password) <= 128 and len(password.encode('utf-8')) <= 72):
        raise SystemExit('Configure PORTAL_SEED_PASSWORD com 12 a 128 caracteres e até 72 bytes.')

    if seed['request']('GET', MAIL + '/api/v1/info')[0] != 200:
        raise SystemExit('Mailpit indisponível. Confira os serviços locais antes de executar a carga.')
    session = call('POST', '/api/auth/login', None, body={
        'email': env['PORTAL_BOOTSTRAP_EMAIL'], 'senha': env['PORTAL_BOOTSTRAP_PASSWORD'],
    })
    admin = session.get('token')
    if not admin:
        raise SystemExit('O login local do bootstrap não retornou uma sessão para a carga.')
    demo_admin_email = 'rbs.pa27@example.test'
    if env['PORTAL_BOOTSTRAP_EMAIL'].strip().lower() == demo_admin_email:
        admin_id = call('GET', '/api/auth/me', admin)['id']
    else:
        admin_id, _ = seed['usuario'](admin, 'Equipe RBS PA27 (demo)', demo_admin_email, 'ADMIN_RBS')

    for brand in BRANDS['brands']:
        name, key = brand['name'] + ' (demo)', brand['key']
        existing = existing_partnership(call, admin, name, f'{key}.pa27@example.test', BRANDS['edition'])
        if existing:
            complete_scenarios(seed, admin, '/api/parcerias/' + existing['id'], key)
            print(f'= {name}: já existe. Confira se a carga anterior foi concluída.')
            continue
        try:
            email = f'{key}.pa27@example.test'
            user_id, sponsor = seed['usuario'](admin, f'Contato PA27 {brand["name"]} (demo)',
                                               email, 'ADMIN_PATROCINADOR')
            quota_id = seed['cota_id'](admin, {
                'cota': brand['quota'] + ' (demo PA27)',
                'areas': AREAS, 'entregas': [], 'beneficios': [],
            })
            partnership = call('POST', '/api/parcerias', admin, body={
                'nome': name, 'edicao': BRANDS['edition'], 'cotaId': quota_id,
                'usuarioIds': [user_id],
            })
            path = '/api/parcerias/' + partnership['id']
            items = []
            for kind, sector, quantity in CREDENTIALS[key]:
                benefit = {'tipo': kind, 'setor': sector, 'publico': 'Equipe da marca',
                           'quantidade': quantity}
                updated = call('POST', path + '/beneficios', admin,
                               body={'natureza': 'CREDENCIAL', **benefit})
                right = next(item for item in updated['beneficios']
                             if item['natureza'] == 'CREDENCIAL'
                             and all(item[field] == value for field, value in benefit.items()))
                items.append({**benefit, 'beneficioId': right['id']})
            call('PUT', path + '/credenciamento', admin, body={
                'versao': 0, 'itens': items, 'urlOpenStaff': OPEN_STAFF,
            })
            for area in ('marca', 'midia'):
                opened = not (key == 'absolut-sprite' and area == 'marca')
                call('PATCH', path + f'/{area}/recebimento', admin, body={'aberto': opened, 'prazo': None})
            if key == 'renner':
                benefit = {'tipo': 'passaporte', 'setor': 'Arena', 'publico': '', 'quantidade': 12}
                updated = call('POST', path + '/beneficios', admin,
                               body={'natureza': 'CORTESIA', **benefit})
                right = next(item for item in updated['beneficios'] if item['natureza'] == 'CORTESIA')
                courtesy = call('POST', path + '/cortesias', admin, body={
                    **{field: benefit[field] for field in ('tipo', 'setor', 'quantidade')},
                    'beneficioId': right['id'], 'periodoInicio': '2027-02-05',
                    'periodoFim': '2027-02-06',
                })
                call('POST', path + '/cortesias/' + courtesy['id'] + '/destinacoes', sponsor,
                     body={'quantidade': 3, 'destinacao': 'Convidados de demonstração'})
            if key == 'coca-cola':
                title = 'Documento de demonstração PA27'
                call('POST', path + '/documentos', admin,
                     files=seed['arquivo'](title + '.pdf', seed['pdf'](title), seed['PDF']))
            populate_media(seed, admin, sponsor, admin_id, path, brand)
            if reference := REFERENCES.get(key):
                call('POST', path + '/midia/publicacoes', admin, body=reference)
            complete_scenarios(seed, admin, path, key)
            print(f'+ {name}: {partnership["id"]} · {email}')
        except (seed['ApiError'], OSError, AssertionError, StopIteration) as error:
            detail = f'HTTP {error.status}' if isinstance(error, seed['ApiError']) else type(error).__name__
            raise SystemExit(
                f'{name}: carga interrompida ({detail}). Pode haver dados parciais para esta marca. '
                'Os registros existentes serão preservados em uma nova execução.'
            ) from None


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--aplicar', action='store_true', help='Criar dados pela API local e ativar pelo Mailpit.')
    if parser.parse_args().aplicar:
        apply()
    else:
        print(f'{BRANDS["edition"]} · plano sem gravação')
        for brand in BRANDS['brands']:
            credentials = ', '.join(
                f'{kind} / {sector}: {quantity}' for kind, sector, quantity in CREDENTIALS[brand['key']]
            )
            print(f'{brand["name"]} · {brand["quota"]} · {credentials} · {SCENARIOS[brand["key"]]}')
