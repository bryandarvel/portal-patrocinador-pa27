package com.rbs.portal_patrocinador.relatorio;

import com.rbs.portal_patrocinador.operacao.ArquivoService;
import com.rbs.portal_patrocinador.parceria.PortalAccess;
import com.rbs.portal_patrocinador.security.CurrentUser;
import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HexFormat;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import org.springframework.http.CacheControl;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class RelatorioSetorialController {
    private static final String BASE = "/parcerias/{parceriaId}/relatorio/setorial";
    private static final int MAX_ARQUIVO = 1024 * 1024;
    private static final int MAX_EXPORTACAO = 10_000;
    private static final MediaType EXCEL = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    private static final MediaType WORD = MediaType.parseMediaType(
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final CurrentUser user;
    private final ArquivoService arquivos;

    public RelatorioSetorialController(JdbcTemplate jdbc, PortalAccess access, CurrentUser user,
                                      ArquivoService arquivos) {
        this.jdbc = jdbc;
        this.access = access;
        this.user = user;
        this.arquivos = arquivos;
    }

    public record Importacao(long id, UUID arquivoId, String arquivo, Instant importadoEm, int linhas) {}
    public record Resultado(Importacao importacao, boolean repetido) {}

    @PostMapping(BASE + "/importacoes")
    @Transactional
    public Resultado importar(@PathVariable UUID parceriaId, @RequestParam MultipartFile arquivo) throws IOException {
        access.require(parceriaId, true);
        if (arquivo.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivo vazio.");
        if (arquivo.getSize() > MAX_ARQUIVO) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "O modelo aceita arquivos de até 1 MB.");
        }
        String nome = arquivo.getOriginalFilename() == null ? "" : arquivo.getOriginalFilename().toLowerCase(Locale.ROOT);
        if (!nome.endsWith(".docx") && !nome.endsWith(".xlsx")) {
            throw new ResponseStatusException(HttpStatus.UNSUPPORTED_MEDIA_TYPE, "Use um modelo DOCX ou XLSX.");
        }

        byte[] bytes = arquivo.getBytes();
        String hash = sha256(bytes);
        String parceria = jdbc.queryForObject("select nome from portal_parcerias where id = ? for update",
                String.class, parceriaId);
        var repetido = historico(parceriaId, hash);
        if (!repetido.isEmpty()) return new Resultado(repetido.getFirst(), true);

        var linhas = RelatorioSetorialOffice.ler(bytes, nome.endsWith(".docx"), parceria);
        var salvo = arquivos.salvar(parceriaId, arquivo, "perfil", "relatorio-setorial-origem", true);
        var id = jdbc.queryForObject("""
                insert into portal_relatorio_importacoes(parceria_id, arquivo_id, hash)
                values (?, ?, ?) returning id
                """, Long.class, parceriaId, salvo.id(), hash);
        for (var linha : linhas) {
            jdbc.update("""
                    insert into portal_relatorio_linhas(importacao_id, linha, mes, veiculo, formato, chave_formato,
                        unidade, contratado, entregue, tipo_impacto, impacto)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, id, linha.numero(), linha.mes().atDay(1), linha.veiculo(), linha.formato(),
                    linha.chaveFormato(), linha.unidade(), linha.contratado(), linha.entregue(),
                    linha.tipoImpacto(), linha.impacto());
        }
        return new Resultado(historico(parceriaId, hash).getFirst(), false);
    }

    @GetMapping(BASE + "/importacoes")
    public List<Importacao> listar(@PathVariable UUID parceriaId) {
        access.require(parceriaId, true);
        return historico(parceriaId, null);
    }

    @GetMapping(BASE + "/modelos/{formato}")
    public ResponseEntity<byte[]> modelo(@PathVariable UUID parceriaId, @PathVariable String formato) throws IOException {
        access.require(parceriaId, true);
        if (!formato.equals("docx") && !formato.equals("xlsx")) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Modelo não encontrado.");
        }
        String parceria = jdbc.queryForObject("select nome from portal_parcerias where id = ?", String.class, parceriaId);
        boolean word = formato.equals("docx");
        return download("modelo-setorial-pa27." + formato, word ? WORD : EXCEL,
                RelatorioSetorialOffice.modelo(parceria, word));
    }

    @GetMapping(BASE + "/exportacoes/{tipo}")
    public ResponseEntity<byte[]> exportarParceria(@PathVariable UUID parceriaId, @PathVariable String tipo,
                                                   @RequestParam(required = false) String mes) throws IOException {
        access.require(parceriaId, true);
        return exportar(tipo, mes, parceriaId);
    }

    @GetMapping("/admin/relatorios/setoriais/{tipo}")
    public ResponseEntity<byte[]> exportarConsolidado(@PathVariable String tipo,
                                                      @RequestParam(required = false) String mes) throws IOException {
        user.requireAdmin();
        return exportar(tipo, mes, null);
    }

    private List<Importacao> historico(UUID parceriaId, String hash) {
        String sql = """
                select i.id, i.arquivo_id, a.nome, i.importado_em,
                    (select count(*) from portal_relatorio_linhas l where l.importacao_id = i.id) as linhas
                from portal_relatorio_importacoes i join portal_arquivos a on a.id = i.arquivo_id
                where i.parceria_id = ?
                """;
        Object[] args = hash == null ? new Object[]{parceriaId} : new Object[]{parceriaId, hash};
        return jdbc.query(sql + (hash == null ? "" : " and i.hash = ?") + " order by i.id desc",
                (rs, index) -> new Importacao(rs.getLong("id"), rs.getObject("arquivo_id", UUID.class),
                        rs.getString("nome"), rs.getTimestamp("importado_em").toInstant(), rs.getInt("linhas")), args);
    }

    private ResponseEntity<byte[]> exportar(String tipo, String mes, UUID parceriaId) throws IOException {
        boolean vendas = switch (tipo) {
            case "vendas" -> true;
            case "veiculacao" -> false;
            default -> throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Relatório não encontrado.");
        };
        List<Object> parametros = new ArrayList<>();
        String filtros = "";
        if (parceriaId != null) {
            filtros += " and i.parceria_id = ?";
            parametros.add(parceriaId);
        }
        if (mes != null) {
            filtros += " and l.mes = ?";
            parametros.add(RelatorioSetorialOffice.mes(mes, 0).atDay(1));
        }
        var linhas = jdbc.query("""
                select * from (
                    select p.nome as patrocinador, l.*, a.nome as origem,
                        row_number() over (partition by i.parceria_id, l.mes, l.veiculo, l.chave_formato
                            order by i.id desc) as ordem
                    from portal_relatorio_linhas l
                    join portal_relatorio_importacoes i on i.id = l.importacao_id
                    join portal_arquivos a on a.id = i.arquivo_id
                    join portal_parcerias p on p.id = i.parceria_id
                    where true
                """ + filtros + """
                ) vigente where ordem = 1
                order by patrocinador, mes, veiculo, formato limit ?
                """, (rs, index) -> {
                    List<Object> valores = new ArrayList<>(List.of(rs.getString("patrocinador"),
                            rs.getDate("mes").toLocalDate().toString().substring(0, 7), rs.getString("veiculo"),
                            rs.getString("formato")));
                    if (vendas) valores.addAll(List.of(rs.getString("unidade"), rs.getLong("contratado"), rs.getLong("entregue")));
                    else valores.addAll(Arrays.asList(rs.getString("tipo_impacto"), rs.getObject("impacto")));
                    valores.addAll(List.of(rs.getString("origem"), rs.getLong("importacao_id"), rs.getInt("linha")));
                    return valores;
                }, appendLimite(parametros));
        if (linhas.size() > MAX_EXPORTACAO) {
            throw new ResponseStatusException(HttpStatus.UNPROCESSABLE_CONTENT, "Selecione um mês ou uma parceria para reduzir a exportação.");
        }
        var cabecalho = new ArrayList<>(List.of("Patrocinador", "Mês", "Veículo", "Formato da entrega"));
        cabecalho.addAll(vendas ? List.of("Unidade", "Contratado", "Entregue") : List.of("Tipo de impacto", "Impacto"));
        cabecalho.addAll(List.of("Arquivo de origem", "Lote", "Linha de origem"));
        return download("relatorio-" + tipo + ".xlsx", EXCEL,
                RelatorioSetorialOffice.excel(vendas ? "Vendas" : "Veiculação", cabecalho, linhas));
    }

    private static Object[] appendLimite(List<Object> parametros) {
        parametros.add(MAX_EXPORTACAO + 1);
        return parametros.toArray();
    }

    private static ResponseEntity<byte[]> download(String nome, MediaType tipo, byte[] bytes) {
        return ResponseEntity.ok().contentType(tipo).cacheControl(CacheControl.noStore())
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + nome)
                .header("X-Content-Type-Options", "nosniff").body(bytes);
    }

    private static String sha256(byte[] bytes) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("SHA-256").digest(bytes));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
