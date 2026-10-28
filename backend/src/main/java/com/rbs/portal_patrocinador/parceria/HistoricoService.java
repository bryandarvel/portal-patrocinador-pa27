package com.rbs.portal_patrocinador.parceria;

import java.util.UUID;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@Service
public class HistoricoService {
    private final JdbcTemplate jdbc;
    private final PortalAccess access;

    public HistoricoService(JdbcTemplate jdbc, PortalAccess access) {
        this.jdbc = jdbc;
        this.access = access;
    }

    @Transactional(propagation = Propagation.MANDATORY)
    public void registrar(UUID parceriaId, String area, String acao, String descricao) {
        jdbc.update("insert into portal_historico(id, parceria_id, usuario_id, area, acao, descricao) values (?, ?, ?, ?, ?, ?)",
                UUID.randomUUID(), parceriaId, access.userId(), area, acao, descricao);
    }
}
