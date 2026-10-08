package com.rbs.portal_patrocinador.repository;

import com.rbs.portal_patrocinador.entity.LoginHistory;
import com.rbs.portal_patrocinador.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface LoginHistoryRepository extends JpaRepository<LoginHistory, UUID> {
    Optional<LoginHistory> findTopByUsuarioOrderByTimestampDesc(Usuario usuario);
}