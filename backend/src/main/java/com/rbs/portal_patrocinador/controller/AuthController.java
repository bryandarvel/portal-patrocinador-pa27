package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/cadastro")
    public ResponseEntity<String> cadastrar(@RequestBody Usuario usuario) {
        try {
            authService.cadastrar(usuario);
            return ResponseEntity.ok("Usuário cadastrado! Verifique seu e-mail para ativar a conta.");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
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