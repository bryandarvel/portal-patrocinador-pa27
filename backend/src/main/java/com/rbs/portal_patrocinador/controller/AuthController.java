package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.dto.CadastroRequest;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.security.CurrentUser;
import com.rbs.portal_patrocinador.service.AuthService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService auth;
    private final CurrentUser current;
    private final JdbcTemplate jdbc;

    public AuthController(AuthService auth, CurrentUser current, JdbcTemplate jdbc) {
        this.auth = auth;
        this.current = current;
        this.jdbc = jdbc;
    }

    @PostMapping("/cadastro")
    public Map<String, String> cadastrar(@Valid @RequestBody CadastroRequest request) {
        auth.cadastrar(request);
        return Map.of("mensagem", "Convite enviado para ativação");
    }

    @GetMapping("/verificar")
    public Map<String, String> verificar(@RequestParam String token) {
        auth.verificarEmail(token);
        return Map.of("mensagem", "Conta ativada");
    }

    @PostMapping("/login")
    public ResponseEntity<AuthService.LoginResult> login(@Valid @RequestBody LoginRequest request) {
        AuthService.LoginResult result = auth.login(request.email(), request.senha());
        return ResponseEntity.status("MFA_REQUIRED".equals(result.status()) ? 202 : 200).body(result);
    }

    @PostMapping("/validar-mfa")
    public Map<String, String> validarMfa(@Valid @RequestBody MfaRequest request) {
        return Map.of("token", auth.validarMfa(request.challenge(), request.codigo()));
    }

    @GetMapping("/me")
    public Me me() {
        Usuario user = current.get();
        List<UUID> partnerships = current.isAdmin()
                ? jdbc.queryForList("select id from portal_parcerias", UUID.class)
                : jdbc.queryForList("select parceria_id from portal_acessos where usuario_id = ?", UUID.class, user.getId());
        return new Me(user.getId(), user.getNome(), user.getEmail(), user.getRole().name(), partnerships, user.isMfaEnabled());
    }

    public record LoginRequest(@NotBlank String email, @NotBlank String senha) {}
    public record MfaRequest(@NotBlank String challenge, @NotBlank String codigo) {}
    public record Me(UUID id, String nome, String email, String role, List<UUID> parcerias, boolean mfaEnabled) {}
}
