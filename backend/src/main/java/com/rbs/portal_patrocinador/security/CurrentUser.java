package com.rbs.portal_patrocinador.security;

import com.rbs.portal_patrocinador.entity.Role;
import com.rbs.portal_patrocinador.entity.Usuario;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;

@Component
public class CurrentUser {
    public Usuario get() {
        Object principal = SecurityContextHolder.getContext().getAuthentication() == null ? null
                : SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof Usuario user) || !user.isAtivo())
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED);
        return user;
    }

    public UUID id() { return get().getId(); }
    public boolean isAdmin() { return get().getRole() == Role.ADMIN_RBS; }
    public void requireAdmin() {
        if (!isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
    }
}
