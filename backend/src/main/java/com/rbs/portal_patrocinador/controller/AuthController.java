
package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.dto.CadastroRequest;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
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

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> dados, HttpServletRequest request) {
        String email = dados.get("email");
        String senha = dados.get("senha");
        String ipAddress = extrairIp(request);

        try {
            String resultado = authService.login(email, senha, ipAddress);

            if ("MFA_REQUIRED".equals(resultado)) {
                return ResponseEntity.status(401).body(Map.of(
                        "status", "MFA_REQUIRED",
                        "mensagem", "Código de autenticação de dois fatores necessário."
                ));
            }
            if ("SUSPICIOUS_LOGIN_EMAIL_SENT".equals(resultado)) {
                return ResponseEntity.status(401).body(Map.of(
                        "status", "SUSPICIOUS_LOGIN",
                        "mensagem", "Login suspeito detectado. Verifique seu e-mail."
                ));
            }

            return ResponseEntity.ok(Map.of("token", resultado));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("erro", e.getMessage()));
        }
    }

    @PostMapping("/validar-mfa")
    public ResponseEntity<?> validarMfa(@RequestBody Map<String, String> dados, HttpServletRequest request) {
        String email = dados.get("email");
        String codigo = dados.get("codigo");
        String ipAddress = extrairIp(request);

        try {
            String jwt = authService.validarMfa(email, codigo, ipAddress);
            return ResponseEntity.ok(Map.of("token", jwt));
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("erro", e.getMessage()));
        }
    }

    @GetMapping("/confirmar-login-suspeito")
    public ResponseEntity<?> confirmarLoginSuspeito(@RequestParam String token) {
        try {
            String jwt = authService.confirmarLoginSuspeito(token);
            return ResponseEntity.ok(Map.of("token", jwt));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("erro", e.getMessage()));
        }
    }

    private String extrairIp(HttpServletRequest request) {
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = request.getRemoteAddr();
        }
        return ip;
    }


}