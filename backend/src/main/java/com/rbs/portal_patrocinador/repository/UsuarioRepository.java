package com.rbs.portal_patrocinador.repository;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.LockModeType;
import java.util.Optional;
import java.util.UUID;

public interface UsuarioRepository extends JpaRepository<Usuario, UUID> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByRole(Role role);
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Usuario> findByTokenVerificacao(String token);

    @Modifying
    @Transactional
    @Query(value = """
            update usuarios set
                primeiro_acesso = coalesce(primeiro_acesso, current_timestamp),
                ultimo_acesso = greatest(coalesce(ultimo_acesso, current_timestamp), current_timestamp)
            where id = :id
            """, nativeQuery = true)
    void registrarAcesso(UUID id);

}
