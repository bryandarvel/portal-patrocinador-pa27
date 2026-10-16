
package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.dto.CadastroRequest;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    // No AuthController.java
    @PostMapping("/cadastro")
    public ResponseEntity<?> cadastrar(@RequestBody CadastroRequest dados) {
        try {
            // Converte o DTO para a entidade Usuario
            Usuario usuario = new Usuario();
            usuario.setNome(dados.nome());
            usuario.setEmail(dados.email());
            usuario.setSenha(dados.senha());
            usuario.setRole(dados.role());

            authService.cadastrar(usuario);
            return ResponseEntity.ok(Map.of("mensagem", "Usuário cadastrado! Verifique seu e-mail."));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/verificar")
    public ResponseEntity<String> verificarEmail(@RequestParam String token) {
        try {
            authService.verificarEmail(token);
            return ResponseEntity.ok("E-mail verificado com sucesso! Sua conta está ativa.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}