package com.rbs.portal_patrocinador.repository;

import com.rbs.portal_patrocinador.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    Optional<Usuario> findByTokenVerificacao(String token);


}