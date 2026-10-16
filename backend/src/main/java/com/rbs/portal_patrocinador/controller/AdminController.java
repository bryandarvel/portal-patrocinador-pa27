package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.entity.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @GetMapping("/painel")
    public ResponseEntity<?> painel(Authentication authentication) {
        Usuario usuario = (Usuario) authentication.getPrincipal();
        return ResponseEntity.ok(Map.of(
                "mensagem", "Bem-vindo ao painel do Admin RBS!",
                "usuario", usuario.getEmail(),
                "role", usuario.getRole().name()
        ));
    }
}