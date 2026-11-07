package com.rbs.portal_patrocinador.operacao;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.annotation.Autowired;
import jakarta.annotation.PostConstruct;
import tools.jackson.databind.json.JsonMapper;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.UUID;

/** Armazena somente os bytes. A autorização da parceria continua em ArquivoService. */
@Component
public class ArquivoStorage {
    private final Path directory;
    private final URI endpoint;
    private final String secret;
    private final long maxBytes;
    private final HttpClient http;

    @Autowired
    public ArquivoStorage(@Value("${portal.storage.provider:filesystem}") String provider,
                          @Value("${portal.storage.directory:/data/arquivos}") String directory,
                          @Value("${portal.storage.supabase-url:}") String url,
                          @Value("${portal.storage.supabase-key:}") String secret,
                          @Value("${portal.storage.supabase-bucket:portal-arquivos}") String bucket,
                          @Value("${portal.storage.max-bytes:20971520}") long maxBytes) {
        this.directory = Path.of(directory).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
        this.secret = secret;
        this.http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build();
        if ("filesystem".equals(provider)) {
            endpoint = null;
        } else if ("supabase".equals(provider)) {
            URI origin = URI.create(url);
            if (!"https".equals(origin.getScheme()) || origin.getHost() == null || origin.getUserInfo() != null
                    || origin.getQuery() != null || origin.getFragment() != null
                    || (origin.getPath() != null && !origin.getPath().matches("/?"))
                    || !bucket.matches("[a-z0-9][a-z0-9-]{0,62}") || secret.isBlank()
                    || !(secret.startsWith("sb_secret_") || secret.startsWith("eyJ"))) {
                throw new IllegalArgumentException("Configure a origem HTTPS, chave secreta e bucket privado do Supabase.");
            }
            endpoint = URI.create(url.replaceAll("/$", "") + "/storage/v1/object/" + bucket + "/");
        } else {
            throw new IllegalArgumentException("Provedor de arquivos inválido: use filesystem ou supabase.");
        }
    }

    // Permite testar o protocolo sem rede externa nem credenciais de projeto.
    ArquivoStorage(Path directory, URI endpoint, String secret, long maxBytes, HttpClient http) {
        this.directory = directory;
        this.endpoint = endpoint;
        this.secret = secret;
        this.maxBytes = maxBytes;
        this.http = http;
    }

    @PostConstruct
    void verificarBucketPrivado() throws IOException {
        if (endpoint == null) return;
        URI bucket = URI.create(endpoint.toString().replace("/object/", "/bucket/").replaceAll("/$", ""));
        try (InputStream body = send(request(bucket).GET().build()).body()) {
            var metadata = JsonMapper.builder().build().readTree(body.readNBytes(65536));
            if (!metadata.has("public") || !metadata.get("public").isBoolean() || metadata.get("public").asBoolean()) {
                throw new IllegalStateException("O bucket de arquivos precisa ser privado.");
            }
        }
    }

    public void salvar(String key, Path source, String contentType) throws IOException {
        validarKey(key);
        if (endpoint == null) {
            Files.createDirectories(directory);
            Files.copy(source, directory.resolve(key));
        } else {
            HttpRequest request = request(endpoint.resolve(key)).header("Content-Type", contentType)
                    .header("x-upsert", "false").POST(HttpRequest.BodyPublishers.ofFile(source)).build();
            try (InputStream body = send(request).body()) { /* A resposta do provedor não é exposta ao cliente. */ }
        }
    }

    public Resource baixar(String key) throws IOException {
        validarKey(key);
        if (endpoint == null) {
            Path file = directory.resolve(key);
            if (!Files.isRegularFile(file)) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
            return new UrlResource(file.toUri());
        }
        URI download = URI.create(endpoint.toString().replace("/object/", "/object/authenticated/") + key);
        try (InputStream body = send(request(download).GET().build()).body()) {
            // O limite também protege o heap do serviço gratuito contra respostas inesperadas.
            byte[] bytes = body.readNBytes(Math.toIntExact(maxBytes + 1));
            if (bytes.length > maxBytes) throw new IOException("Resposta excede o limite de arquivo.");
            return new ByteArrayResource(bytes);
        }
    }

    public void apagar(String key) {
        validarKey(key);
        try {
            if (endpoint == null) Files.deleteIfExists(directory.resolve(key));
            else try (InputStream body = send(request(endpoint.resolve(key)).DELETE().build()).body()) { }
        } catch (IOException | ResponseStatusException ignored) {
            // Não substitui o erro original da transação; um órfão pode ser removido por manutenção.
            org.slf4j.LoggerFactory.getLogger(ArquivoStorage.class).warn("Não foi possível remover arquivo após falha de gravação.");
        }
    }

    private HttpRequest.Builder request(URI uri) {
        HttpRequest.Builder builder = HttpRequest.newBuilder(uri).timeout(Duration.ofSeconds(45))
                .header("apikey", secret);
        // As chaves novas não são JWT. service_role legado ainda exige Bearer.
        if (!secret.startsWith("sb_secret_")) builder.header("Authorization", "Bearer " + secret);
        return builder;
    }

    private HttpResponse<InputStream> send(HttpRequest request) throws IOException {
        try {
            HttpResponse<InputStream> response = http.send(request, HttpResponse.BodyHandlers.ofInputStream());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                response.body().close();
                if (response.statusCode() == 404) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Armazenamento indisponível. Tente novamente.");
            }
            return response;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Operação de armazenamento interrompida.");
        }
    }

    private static void validarKey(String key) {
        try {
            if (!UUID.fromString(key).toString().equals(key)) throw new IllegalArgumentException();
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
        }
    }
}
