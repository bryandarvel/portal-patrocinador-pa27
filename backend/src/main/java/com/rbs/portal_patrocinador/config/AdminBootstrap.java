package com.rbs.portal_patrocinador.config;

import com.rbs.portal_patrocinador.entity.Role;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Configuration
public class AdminBootstrap {
    @Bean
    ApplicationRunner bootstrapAdmin(UsuarioRepository users, PasswordEncoder passwords,
            @Value("${portal.bootstrap.enabled}") boolean enabled,
            @Value("${portal.bootstrap.name:}") String name,
            @Value("${portal.bootstrap.email:}") String email,
            @Value("${portal.bootstrap.password:}") String password) {
        return args -> {
            if (!enabled) return;
            if (name.isBlank() || email.isBlank() || password.length() < 12
                    || password.getBytes(StandardCharsets.UTF_8).length > 72)
                throw new IllegalStateException("Credenciais de bootstrap incompletas");
            String normalizedEmail = email.trim().toLowerCase(Locale.ROOT);
            var existing = users.findByEmail(normalizedEmail);
            if (existing.isPresent()) {
                if (existing.get().getRole() != Role.ADMIN_RBS)
                    throw new IllegalStateException("E-mail de bootstrap já pertence a outro perfil");
                return;
            }
            if (users.existsByRole(Role.ADMIN_RBS))
                throw new IllegalStateException("Bootstrap só pode criar o primeiro administrador");
            Usuario user = new Usuario();
            user.setNome(name.trim());
            user.setEmail(normalizedEmail);
            user.setSenha(passwords.encode(password));
            user.setRole(Role.ADMIN_RBS);
            user.setAtivo(true);
            users.save(user);
        };
    }
}
