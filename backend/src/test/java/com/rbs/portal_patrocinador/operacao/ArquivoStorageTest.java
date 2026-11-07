package com.rbs.portal_patrocinador.operacao;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.server.ResponseStatusException;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class ArquivoStorageTest {
    @TempDir Path temp;
    private final HttpClient http = mock(HttpClient.class);
    private final String key = UUID.randomUUID().toString();
    private final URI endpoint = URI.create("https://projeto.supabase.co/storage/v1/object/portal-arquivos/");

    @SuppressWarnings("unchecked")
    private void respond(int status, byte[] body) throws Exception {
        HttpResponse<InputStream> response = mock(HttpResponse.class);
        when(response.statusCode()).thenReturn(status);
        when(response.body()).thenReturn(new ByteArrayInputStream(body));
        when(http.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class))).thenReturn(response);
    }

    @Test void preservaChavesLocaisSemConversao() throws Exception {
        ArquivoStorage storage = new ArquivoStorage("filesystem", temp.resolve("arquivos").toString(), "", "", "portal-arquivos", 20);
        Path source = temp.resolve("fonte");
        Files.writeString(source, "comprovacao");
        storage.salvar(key, source, "application/pdf");
        assertEquals("comprovacao", storage.baixar(key).getContentAsString(java.nio.charset.StandardCharsets.UTF_8));
        assertThrows(java.nio.file.FileAlreadyExistsException.class, () -> storage.salvar(key, source, "application/pdf"));
        storage.apagar(key);
        assertEquals(404, assertThrows(ResponseStatusException.class, () -> storage.baixar(key)).getStatusCode().value());
    }

    @Test void bloqueiaCaminhoForaDoDiretorio() {
        ArquivoStorage storage = new ArquivoStorage("filesystem", temp.toString(), "", "", "portal-arquivos", 20);
        assertThrows(ResponseStatusException.class, () -> storage.baixar("../arquivo"));
    }

    @Test void enviaSemSobrescreverEUsaChaveNovaSomenteEmApikey() throws Exception {
        respond(200, new byte[0]);
        ArquivoStorage storage = new ArquivoStorage(temp, endpoint, "sb_secret_ficticia", 20, http);
        Path source = Files.writeString(temp.resolve("fonte"), "dados");
        storage.salvar(key, source, "application/pdf");
        var captor = org.mockito.ArgumentCaptor.forClass(HttpRequest.class);
        verify(http).send(captor.capture(), any(HttpResponse.BodyHandler.class));
        assertEquals(endpoint.resolve(key), captor.getValue().uri());
        assertEquals("POST", captor.getValue().method());
        assertEquals("false", captor.getValue().headers().firstValue("x-upsert").orElseThrow());
        assertEquals("sb_secret_ficticia", captor.getValue().headers().firstValue("apikey").orElseThrow());
        assertTrue(captor.getValue().headers().firstValue("Authorization").isEmpty());
    }

    @Test void baixaObjetoPrivadoSemExporUrlAoFrontend() throws Exception {
        respond(200, "anexo".getBytes());
        ArquivoStorage storage = new ArquivoStorage(temp, endpoint, "eyJ-ficticia", 20, http);
        assertEquals("anexo", storage.baixar(key).getContentAsString(java.nio.charset.StandardCharsets.UTF_8));
        var captor = org.mockito.ArgumentCaptor.forClass(HttpRequest.class);
        verify(http).send(captor.capture(), any(HttpResponse.BodyHandler.class));
        assertTrue(captor.getValue().uri().getPath().contains("/object/authenticated/portal-arquivos/"));
        assertEquals("Bearer eyJ-ficticia", captor.getValue().headers().firstValue("Authorization").orElseThrow());
    }

    @Test void rejeitaRespostaAcimaDoLimite() throws Exception {
        respond(200, new byte[21]);
        assertThrows(java.io.IOException.class, () -> new ArquivoStorage(temp, endpoint, "sb_secret_ficticia", 20, http).baixar(key));
    }

    @Test void naoExibeMensagemOuCredenciaisDoProvedor() throws Exception {
        respond(403, "mensagem confidencial do provedor".getBytes());
        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> new ArquivoStorage(temp, endpoint, "sb_secret_ficticia", 20, http).baixar(key));
        assertEquals(502, error.getStatusCode().value());
        assertFalse(error.getMessage().contains("confidencial"));
        assertFalse(error.getMessage().contains("sb_secret"));
    }

    @Test void rejeitaBucketPublico() throws Exception {
        respond(200, "{\"public\":true}".getBytes());
        assertThrows(IllegalStateException.class,
                () -> new ArquivoStorage(temp, endpoint, "sb_secret_ficticia", 20, http).verificarBucketPrivado());
    }

    @Test void aceitaBucketPrivado() throws Exception {
        respond(200, "{\"public\":false}".getBytes());
        new ArquivoStorage(temp, endpoint, "sb_secret_ficticia", 20, http).verificarBucketPrivado();
    }
}
