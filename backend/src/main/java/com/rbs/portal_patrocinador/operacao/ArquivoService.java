package com.rbs.portal_patrocinador.operacao;

import com.rbs.portal_patrocinador.parceria.PortalAccess;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class ArquivoService {
    private static final Set<String> CONTENT_TYPES = Set.of(
            "application/pdf", "image/jpeg", "image/png", "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint", "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "text/plain", "application/zip", "audio/mpeg", "audio/mp4", "video/mp4", "video/quicktime"
    );

    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final Path directory;
    private final long maxBytes;

    public ArquivoService(JdbcTemplate jdbc, PortalAccess access,
                          @Value("${portal.storage.directory:/data/arquivos}") String directory,
                          @Value("${portal.storage.max-bytes:20971520}") long maxBytes) {
        this.jdbc = jdbc;
        this.access = access;
        this.directory = Paths.get(directory).toAbsolutePath().normalize();
        this.maxBytes = maxBytes;
    }

    @Transactional
    public ArquivoView salvar(UUID parceriaId, MultipartFile arquivo, String area, String tipo, boolean interno) {
        access.requireArea(parceriaId, area, false);
        Boolean areaExiste = jdbc.query("select recebimento_aberto from portal_areas where parceria_id = ? and area = ? for update",
                rs -> rs.next() ? Boolean.TRUE : null, parceriaId, area);
        if (areaExiste == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Área não configurada para esta parceria.");
        if (arquivo == null || arquivo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio.");
        if (maxBytes <= 0 || arquivo.getSize() > maxBytes) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo excede o limite permitido.");
        String contentType = arquivo.getContentType() == null ? "" : arquivo.getContentType().toLowerCase(Locale.ROOT).split(";", 2)[0].trim();
        if (!CONTENT_TYPES.contains(contentType)) throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Tipo de arquivo não permitido.");
        String nome = limparNome(arquivo.getOriginalFilename());
        UUID id = UUID.randomUUID();
        Path destino = directory.resolve(id.toString()).normalize();
        if (!destino.startsWith(directory)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo inválido.");
        long tamanho;
        try {
            Files.createDirectories(directory);
            try (InputStream in = arquivo.getInputStream(); var out = Files.newOutputStream(destino)) {
                byte[] buffer = new byte[8192];
                long total = 0;
                int lidos;
                while ((lidos = in.read(buffer)) != -1) {
                    total += lidos;
                    if (total > maxBytes) throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Arquivo excede o limite permitido.");
                    out.write(buffer, 0, lidos);
                }
                tamanho = total;
            }
            if (tamanho == 0) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio.");
            Integer versao = jdbc.queryForObject("select coalesce(max(versao), 0) + 1 from portal_arquivos where parceria_id = ? and area = ? and tipo = ?", Integer.class, parceriaId, area, tipo);
            jdbc.update("insert into portal_arquivos(id, parceria_id, area, tipo, interno, nome, tamanho, content_type, storage_key, versao, criado_por) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    id, parceriaId, area, tipo, interno, nome, tamanho, contentType, id.toString(), versao, access.userId());
            if (TransactionSynchronizationManager.isSynchronizationActive()) {
                TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
                    @Override public void afterCompletion(int status) {
                        if (status != STATUS_COMMITTED) apagar(destino);
                    }
                });
            }
            return new ArquivoView(id, nome, tamanho, contentType, versao, Instant.now());
        } catch (ResponseStatusException e) {
            apagar(destino);
            throw e;
        } catch (IOException e) {
            apagar(destino);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falha ao armazenar arquivo.");
        } catch (RuntimeException e) {
            apagar(destino);
            throw e;
        }
    }

    public List<ArquivoView> listar(UUID parceriaId, String area, String tipo) {
        access.requireArea(parceriaId, area, false);
        return jdbc.query("select id, nome, tamanho, content_type, versao, criado_em from portal_arquivos where parceria_id = ? and area = ? and tipo = ? and (? or not interno) order by versao desc",
                (rs, row) -> view(rs), parceriaId, area, tipo, access.isAdmin());
    }

    public Download baixar(UUID parceriaId, UUID arquivoId) {
        access.require(parceriaId, false);
        Metadata m = jdbc.query("select area, interno, nome, content_type, storage_key from portal_arquivos where id = ? and parceria_id = ?",
                rs -> rs.next() ? new Metadata(rs.getString(1), rs.getBoolean(2), rs.getString(3), rs.getString(4), rs.getString(5)) : null,
                arquivoId, parceriaId);
        if (m == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
        access.requireArea(parceriaId, m.area, m.interno);
        Path path = directory.resolve(m.storageKey).normalize();
        try {
            if (!path.startsWith(directory) || !Files.isRegularFile(path)) throw new IOException("missing");
            return new Download(m.nome, new UrlResource(path.toUri()));
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Arquivo não encontrado.");
        }
    }

    private static ArquivoView view(ResultSet rs) throws SQLException {
        return new ArquivoView(rs.getObject("id", UUID.class), rs.getString("nome"), rs.getLong("tamanho"),
                rs.getString("content_type"), rs.getInt("versao"), rs.getTimestamp("criado_em").toInstant());
    }

    private static String limparNome(String original) {
        String nome = original == null ? "arquivo" : original.replace('\\', '/');
        nome = nome.substring(nome.lastIndexOf('/') + 1).replaceAll("[\\p{Cntrl}]", "").trim();
        if (nome.isBlank()) return "arquivo";
        return nome.length() > 255 ? nome.substring(nome.length() - 255) : nome;
    }

    private static void apagar(Path path) {
        try { Files.deleteIfExists(path); } catch (IOException ignored) { }
    }

    private record Metadata(String area, boolean interno, String nome, String contentType, String storageKey) {}
    public record Download(String nome, Resource resource) {}
}
