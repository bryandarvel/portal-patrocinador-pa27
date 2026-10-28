package com.rbs.portal_patrocinador.parceria;

import com.rbs.portal_patrocinador.security.CurrentUser;
import java.util.UUID;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

@Component
public class PortalAccess {
    private final JdbcTemplate jdbc;
    private final CurrentUser user;

    public PortalAccess(JdbcTemplate jdbc, CurrentUser user) {
        this.jdbc = jdbc;
        this.user = user;
    }

    public UUID userId() { return user.id(); }
    public boolean isAdmin() { return user.isAdmin(); }

    public void require(UUID parceriaId, boolean adminOnly) {
        if (adminOnly) user.requireAdmin();
        Integer count = isAdmin()
                ? jdbc.queryForObject("select count(*) from portal_parcerias where id = ?", Integer.class, parceriaId)
                : jdbc.queryForObject("select count(*) from portal_acessos where parceria_id = ? and usuario_id = ?", Integer.class, parceriaId, userId());
        if (count == null || count == 0) throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Parceria não encontrada.");
    }

    public void requireArea(UUID parceriaId, String area, boolean adminOnly) {
        require(parceriaId, adminOnly);
        if (!isAdmin() && !Boolean.TRUE.equals(jdbc.queryForObject(
                "select coalesce(bool_or(habilitada), false) from portal_areas where parceria_id = ? and area = ?",
                Boolean.class, parceriaId, area))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Área não disponível nesta parceria.");
        }
    }
}
