package com.rbs.portal_patrocinador.operacao;

import com.rbs.portal_patrocinador.parceria.HistoricoService;
import com.rbs.portal_patrocinador.parceria.PortalAccess;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.ResultSetExtractor;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.nio.file.Files;
import java.nio.file.Path;
import java.sql.ResultSet;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class OperacaoServiceTest {
    private JdbcTemplate jdbc;
    private PortalAccess access;
    private OperacaoService service;

    @BeforeEach
    void setUp() {
        jdbc = mock(JdbcTemplate.class);
        access = mock(PortalAccess.class);
        service = new OperacaoService(jdbc, access, mock(HistoricoService.class), mock(ArquivoService.class));
    }

    @Test
    void naoConsultaFaqQuandoParceriaNaoPertenceAoUsuario() {
        UUID parceria = UUID.randomUUID();
        doThrow(new ResponseStatusException(HttpStatus.NOT_FOUND)).when(access).requireArea(parceria, "perfil", false);

        assertThrows(ResponseStatusException.class, () -> service.faq(parceria, null, null));
        verifyNoInteractions(jdbc);
    }

    @Test
    void bloqueiaEnvioQuandoRecebimentoEstaFechado() throws Exception {
        UUID parceria = UUID.randomUUID();
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(parceria), eq("pesquisa"))).thenAnswer(call -> {
            ResultSet rs = mock(ResultSet.class);
            when(rs.next()).thenReturn(true);
            when(rs.getBoolean(1)).thenReturn(false);
            when(rs.getTimestamp("prazo")).thenReturn(null);
            return ((ResultSetExtractor<?>) call.getArgument(1)).extractData(rs);
        });

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.salvarPerguntas(parceria, List.of("Pergunta de teste?")));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(jdbc, never()).update(startsWith("insert into portal_pesquisa_versoes"), any(), any(), any(), any());
    }

    @Test
    void rejeitaDestinacaoQueUltrapassaSaldoComLockDaCortesia() {
        UUID parceria = UUID.randomUUID();
        UUID cortesia = UUID.randomUUID();
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(cortesia), eq(parceria))).thenAnswer(call -> {
            ResultSet rs = mock(ResultSet.class);
            when(rs.next()).thenReturn(true);
            when(rs.getInt(1)).thenReturn(4);
            return ((ResultSetExtractor<?>) call.getArgument(1)).extractData(rs);
        });
        when(jdbc.queryForObject(contains("sum(quantidade)"), eq(Integer.class), eq(cortesia))).thenReturn(3);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.destinar(parceria, cortesia, new OperacaoService.DestinacaoRequest(2, "Equipe")));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        assertEquals(HttpStatus.CONFLICT, assertThrows(ResponseStatusException.class,
                () -> service.destinar(parceria, cortesia, new OperacaoService.DestinacaoRequest(Integer.MAX_VALUE, "Equipe"))).getStatusCode());
        verify(jdbc, never()).update(startsWith("insert into portal_cortesias_destinacoes"), any(), any(), any(), any(), any());
    }

    @Test
    void rejeitaCortesiaAcimaDoBeneficioContratado() throws Exception {
        UUID parceria = UUID.randomUUID();
        UUID beneficio = UUID.randomUUID();
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(beneficio), eq(parceria))).thenAnswer(call -> {
            ResultSet rs = mock(ResultSet.class);
            when(rs.next()).thenReturn(true);
            when(rs.getString(1)).thenReturn("sexta");
            when(rs.getString(2)).thenReturn("Arena");
            when(rs.getString(3)).thenReturn("");
            when(rs.getInt(4)).thenReturn(5);
            return ((ResultSetExtractor<?>) call.getArgument(1)).extractData(rs);
        });
        when(jdbc.queryForObject(contains("sum(quantidade)"), eq(Integer.class), eq(beneficio), eq(java.time.LocalDate.parse("2026-01-30")))).thenReturn(4);

        ResponseStatusException error = assertThrows(ResponseStatusException.class, () -> service.criarCortesia(parceria,
                new OperacaoService.CortesiaRequest(2, "sexta", "Arena", null, null,
                        java.time.LocalDate.parse("2026-01-30"), null, beneficio)));

        assertEquals(HttpStatus.CONFLICT, error.getStatusCode());
        verify(jdbc, never()).update(startsWith("insert into portal_cortesias(id"), any(Object[].class));
    }

    @Test
    void rejeitaEnvioDePerguntasPorAdmin() {
        UUID parceria = UUID.randomUUID();
        when(access.isAdmin()).thenReturn(true);

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.salvarPerguntas(parceria, List.of("Pergunta?")));

        assertEquals(HttpStatus.FORBIDDEN, error.getStatusCode());
        verify(access).requireArea(parceria, "pesquisa", false);
        verifyNoInteractions(jdbc);
    }

    @Test
    void rejeitaArquivoAcimaDoLimiteAntesDeGravarNoDisco(@TempDir Path tempDir) {
        UUID parceria = UUID.randomUUID();
        MockMultipartFile arquivo = new MockMultipartFile("arquivo", "material.pdf", "application/pdf", new byte[5]);
        Path storage = tempDir.resolve("storage");
        ArquivoService service = new ArquivoService(jdbc, access,
                new ArquivoStorage("filesystem", storage.toString(), "", "", "portal-arquivos", 4), 4);
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(parceria), eq("midia"))).thenAnswer(call -> {
            ResultSet rs = mock(ResultSet.class);
            when(rs.next()).thenReturn(true);
            return ((ResultSetExtractor<?>) call.getArgument(1)).extractData(rs);
        });

        ResponseStatusException error = assertThrows(ResponseStatusException.class,
                () -> service.salvar(parceria, arquivo, "midia", "material", false));

        assertEquals(HttpStatus.PAYLOAD_TOO_LARGE, error.getStatusCode());
        verify(access).requireArea(parceria, "midia", false);
        verify(jdbc, never()).update(anyString(), any(Object[].class));
        assertFalse(Files.exists(storage));
    }

    private UUID areaComUpload() throws Exception {
        UUID parceria = UUID.randomUUID();
        when(jdbc.query(anyString(), any(ResultSetExtractor.class), eq(parceria), eq("midia"))).thenAnswer(call -> {
            ResultSet rs = mock(ResultSet.class);
            when(rs.next()).thenReturn(true);
            return ((ResultSetExtractor<?>) call.getArgument(1)).extractData(rs);
        });
        when(jdbc.queryForObject(anyString(), eq(Integer.class), eq(parceria), eq("midia"), eq("material"))).thenReturn(1);
        return parceria;
    }

    @Test
    void removeAnexoSeBancoFalharENaoDeixaTemporario() throws Exception {
        UUID parceria = areaComUpload();
        ArquivoStorage storage = mock(ArquivoStorage.class);
        ArquivoService files = new ArquivoService(jdbc, access, storage, 20);
        var temporary = org.mockito.ArgumentCaptor.forClass(Path.class);
        when(jdbc.update(startsWith("insert into portal_arquivos"), any(Object[].class))).thenThrow(new IllegalStateException("Falha simulada"));
        assertThrows(IllegalStateException.class, () -> files.salvar(parceria,
                new MockMultipartFile("arquivo", "exemplo.pdf", "application/pdf", new byte[]{1}), "midia", "material", false));
        verify(storage).salvar(anyString(), temporary.capture(), eq("application/pdf"));
        assertFalse(Files.exists(temporary.getValue()));
        verify(storage).apagar(anyString());
    }

    @Test
    void removeAnexoQuandoTransacaoExternaReverte() throws Exception {
        conferirFinalizacaoUpload(TransactionSynchronization.STATUS_ROLLED_BACK);
    }

    @Test
    void preservaAnexoQuandoTransacaoConfirma() throws Exception {
        conferirFinalizacaoUpload(TransactionSynchronization.STATUS_COMMITTED);
    }

    private void conferirFinalizacaoUpload(int status) throws Exception {
        UUID parceria = areaComUpload();
        ArquivoStorage storage = mock(ArquivoStorage.class);
        TransactionSynchronizationManager.initSynchronization();
        try {
            var file = new ArquivoService(jdbc, access, storage, 20).salvar(parceria,
                    new MockMultipartFile("arquivo", "exemplo.pdf", "application/pdf", new byte[]{1}), "midia", "material", false);
            for (var synchronization : TransactionSynchronizationManager.getSynchronizations()) synchronization.afterCompletion(status);
            verify(storage, status == TransactionSynchronization.STATUS_COMMITTED ? never() : times(1)).apagar(file.id().toString());
        } finally {
            TransactionSynchronizationManager.clearSynchronization();
        }
    }
}
