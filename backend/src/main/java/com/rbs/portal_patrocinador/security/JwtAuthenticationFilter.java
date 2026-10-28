package com.rbs.portal_patrocinador.security;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import com.rbs.portal_patrocinador.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final TokenService tokens;
    private final UsuarioRepository users;

    public JwtAuthenticationFilter(TokenService tokens, UsuarioRepository users) {
        this.tokens = tokens;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header != null && header.startsWith("Bearer ")) {
            UUID id = tokens.validarToken(header.substring(7));
            Usuario user = id == null ? null : users.findById(id).orElse(null);
            if (user != null && user.isAtivo() && SecurityContextHolder.getContext().getAuthentication() == null) {
                var authority = new SimpleGrantedAuthority("ROLE_" + user.getRole().name());
                SecurityContextHolder.getContext().setAuthentication(
                        new UsernamePasswordAuthenticationToken(user, null, List.of(authority)));
            }
        }
        chain.doFilter(request, response);
    }
}
