"""Testes sem rede, Docker ou credenciais para a cópia dos anexos."""
import importlib.util
import io
from pathlib import Path
import tarfile
import tempfile
import unittest
from unittest.mock import patch
from uuid import uuid4

spec = importlib.util.spec_from_file_location("migration", Path(__file__).with_name("migrate-supabase-pa27.py"))
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


class MigrationTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.archive = Path(self.temp.name) / "arquivos.tgz"
        self.key = str(uuid4())
        self.values = {"SUPABASE_STORAGE_BUCKET": "portal-arquivos"}

    def archive_with(self, key=None):
        with tarfile.open(self.archive, "w:gz") as tar:
            item = tarfile.TarInfo("./" + (key or self.key))
            item.size = 5
            tar.addfile(item, io.BytesIO(b"anexo"))

    def test_plano_nao_acessa_rede(self):
        self.archive_with()
        with patch.object(migration, "storage_request") as request:
            migration.arquivos(self.values, self.archive, False)
            request.assert_not_called()

    def test_rejeita_caminho_fora_do_backup_antes_de_enviar(self):
        self.archive_with("../arquivo")
        with patch.object(migration, "storage_request") as request:
            with self.assertRaises(ValueError):
                migration.arquivos(self.values, self.archive, True)
            request.assert_not_called()

    def test_recusa_bucket_publico(self):
        self.archive_with()
        with patch.object(migration, "storage_request", return_value=b'{"public":true}') as request:
            with self.assertRaisesRegex(ValueError, "privado"):
                migration.arquivos(self.values, self.archive, True)
            self.assertEqual(request.call_count, 1)

    def test_reexecucao_preserva_arquivo_existente(self):
        self.archive_with()
        with patch.object(migration, "storage_request", side_effect=[b'{"public":false}', b"anexo"]) as request:
            migration.arquivos(self.values, self.archive, True)
            self.assertTrue(all(len(call.args) == 2 for call in request.call_args_list))

    def test_colisao_nao_sobrescreve_arquivo(self):
        self.archive_with()
        with patch.object(migration, "storage_request", side_effect=[b'{"public":false}', b"outro"]) as request:
            with self.assertRaisesRegex(ValueError, "não sobrescreve"):
                migration.arquivos(self.values, self.archive, True)
            self.assertEqual(request.call_count, 2)

    def test_confere_bytes_depois_de_enviar(self):
        self.archive_with()
        with patch.object(migration, "storage_request", side_effect=[b'{"public":false}', None, b"{}", b"anexo"]) as request:
            migration.arquivos(self.values, self.archive, True)
            self.assertEqual(request.call_args_list[2].args[2:], ("POST", b"anexo"))

    def test_detecta_copia_corrompida(self):
        self.archive_with()
        with patch.object(migration, "storage_request", side_effect=[b'{"public":false}', None, b"{}", b"outro"]):
            with self.assertRaisesRegex(ValueError, "Conteúdo diferente"):
                migration.arquivos(self.values, self.archive, True)


if __name__ == "__main__":
    unittest.main()
