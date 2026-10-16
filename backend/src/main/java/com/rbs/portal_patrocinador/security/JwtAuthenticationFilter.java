package com.rbs.portal_patrocinador.security;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import com.rbs.portal_patrocinador.service.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired private TokenService tokenService;
    @Autowired private UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        System.out.println("🔵 FILTRO JWT EXECUTADO para: " + request.getRequestURI());

        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7);
            String email = tokenService.validarToken(token);
            System.out.println("🟡 Email extraído do token: " + email);

            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                Usuario usuario = usuarioRepository.findByEmail(email).orElse(null);

                if (usuario != null) {
                    var authority = new SimpleGrantedAuthority("ROLE_" + usuario.getRole().name());
                    var authentication = new UsernamePasswordAuthenticationToken(
                            usuario, null, List.of(authority));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    System.out.println("Usuário autenticado: " + email + " com role " + usuario.getRole().name());
                } else {
                    System.out.println("Usuário NÃO encontrado no banco: " + email);
                }
            }
        } else {
            System.out.println("Header Authorization ausente ou mal formatado.");
        }

        filterChain.doFilter(request, response);
    }
}