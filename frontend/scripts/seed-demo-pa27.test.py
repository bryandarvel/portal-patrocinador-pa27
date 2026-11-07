"""Valida a identidade da carga PA27 sem acessar API ou modificar dados."""
import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('seed_demo', Path(__file__).with_name('seed-demo-pa27.py'))
seed = importlib.util.module_from_spec(spec)
spec.loader.exec_module(seed)


class PartnershipIdentityTest(unittest.TestCase):
    edition = '2027 — Demonstração PA27'

    def lookup(self, items, profiles, exact=None):
        def call(method, path, admin):
            self.assertEqual(method, 'GET')
            if '?busca=' in path:
                return {'itens': exact or []}
            if '?pagina=' in path:
                page = int(path.split('=')[-1])
                return {'itens': items[page * 50:(page + 1) * 50], 'total': len(items)}
            return {'acessos': [{'email': email} for email in profiles.get(path.split('/')[-1], [])]}
        return seed.existing_partnership(call, 'token-ficticio', 'Renner (demo)', 'renner.pa27@example.test', self.edition)

    def item(self, identifier, name='Loja Renner S.A.', edition=None):
        return {'id': identifier, 'nome': name, 'edicao': edition or self.edition}

    def test_preserva_parceria_renomeada_pela_rbs(self):
        item = self.item('renner')
        self.assertEqual(self.lookup([item], {'renner': ['renner.pa27@example.test']}), item)

    def test_nome_original_continua_sendo_reconhecido(self):
        item = self.item('renner', 'Renner (demo)')
        self.assertEqual(self.lookup([item], {}, [item]), item)

    def test_nao_reutiliza_conta_de_outra_edicao(self):
        self.assertIsNone(self.lookup([self.item('renner', edition='2026')], {'renner': ['renner.pa27@example.test']}))

    def test_ambiguidade_nao_cria_ou_escolhe_parceria(self):
        with self.assertRaises(SystemExit):
            self.lookup([self.item('a'), self.item('b')], {'a': ['renner.pa27@example.test'], 'b': ['renner.pa27@example.test']})

    def test_procura_apos_a_primeira_pagina(self):
        items = [self.item(str(index), 'Outra marca') for index in range(50)] + [self.item('renner')]
        self.assertEqual(self.lookup(items, {'renner': ['RENNER.PA27@example.test']})['id'], 'renner')


if __name__ == '__main__':
    unittest.main()
