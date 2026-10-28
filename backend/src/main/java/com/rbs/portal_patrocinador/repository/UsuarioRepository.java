package com.rbs.portal_patrocinador.repository;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByRole(Role role);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Usuario> findByTokenVerificacao(String token);


}
