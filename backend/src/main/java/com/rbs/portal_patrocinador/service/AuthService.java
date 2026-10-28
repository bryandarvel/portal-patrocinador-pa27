package com.rbs.portal_patrocinador.service;

import com.rbs.portal_patrocinador.dto.CadastroRequest;
import com.rbs.portal_patrocinador.dto.ConviteUsuarioRequest;
import com.rbs.portal_patrocinador.entity.Role;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import com.rbs.portal_patrocinador.security.CurrentUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.time.Instant;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import java.util.UUID;

@Service
public class AuthService {
    private static final String INVALID_LOGIN = "Credenciais inválidas";
    private final UsuarioRepository usuarios;
    private final EmailService email;
    private final MfaService mfa;
    private final TokenService tokens;
    private final PasswordEncoder passwords;
    private final CurrentUser current;
    private final Duration verificationTtl;

    public AuthService(UsuarioRepository usuarios, EmailService email, MfaService mfa,
                       TokenService tokens, PasswordEncoder passwords, CurrentUser current,
                       @Value("${portal.verification-ttl}") Duration verificationTtl) {
        if (verificationTtl.isNegative() || verificationTtl.isZero()) throw new IllegalArgumentException("Prazo de verificação inválido");
        this.usuarios = usuarios;
        this.email = email;
        this.mfa = mfa;
        this.tokens = tokens;
        this.passwords = passwords;
        this.current = current;
        this.verificationTtl = verificationTtl;
    }

    @Transactional
    public void cadastrar(CadastroRequest request) {
        current.requireAdmin();
        if (request.role() != null && request.role() != Role.ADMIN_PATROCINADOR)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Papel inválido");
        criarUsuario(request.nome(), request.email(), request.senha(), Role.ADMIN_PATROCINADOR);
    }

    @Transactional
    public void convidar(ConviteUsuarioRequest request) {
        current.requireAdmin();
        criarUsuario(request.nome(), request.email(), request.senha(), request.role());
    }

    private void criarUsuario(String nome, String emailAddress, String senha, Role role) {
        if (role == null || nome == null || nome.isBlank() || emailAddress == null || emailAddress.isBlank()
                || senha == null || senha.length() < 12 || senha.getBytes(StandardCharsets.UTF_8).length > 72)
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Dados de convite inválidos");
        String normalizedEmail = emailAddress.trim().toLowerCase(Locale.ROOT);
        if (usuarios.findByEmail(normalizedEmail).isPresent())
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-mail já cadastrado");
        Usuario user = new Usuario();
        user.setNome(nome.trim());
        user.setEmail(normalizedEmail);
        user.setSenha(passwords.encode(senha));
        user.setRole(role);
        user.setAtivo(false);
        String verificationToken = UUID.randomUUID().toString();
        user.setTokenVerificacao(verificationToken);
        user.setTokenVerificacaoExpiresAt(Instant.now().plus(verificationTtl));
        usuarios.save(user);
        email.enviarEmailVerificacao(normalizedEmail, verificationToken);
    }

    @Transactional
    public void verificarEmail(String token) {
        Usuario user = usuarios.findByTokenVerificacao(token).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado"));
        if (user.getTokenVerificacaoExpiresAt() == null || !user.getTokenVerificacaoExpiresAt().isAfter(Instant.now()))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token inválido ou expirado");
        user.setAtivo(true);
        user.setTokenVerificacao(null);
        user.setTokenVerificacaoExpiresAt(null);
    }

    public LoginResult login(String email, String senha) {
        Usuario user = email == null ? null : usuarios.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null || !user.isAtivo() || senha == null || senha.getBytes(StandardCharsets.UTF_8).length > 72
                || !passwords.matches(senha, user.getSenha()))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, INVALID_LOGIN);
        if (user.isMfaEnabled()) return new LoginResult("MFA_REQUIRED", null, tokens.gerarDesafioMfa(user));
        return new LoginResult("AUTHENTICATED", tokens.gerarToken(user), null);
    }

    public String validarMfa(String challenge, String code) {
        UUID userId = challenge == null ? null : tokens.validarDesafioMfa(challenge);
        Usuario user = userId == null ? null : usuarios.findById(userId).orElse(null);
        if (user == null || !userId.equals(user.getId()) || !user.isAtivo() || !user.isMfaEnabled() || user.getMfaSecret() == null ||
                code == null || !mfa.verifyCode(user.getMfaSecret(), code))
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, INVALID_LOGIN);
        return tokens.gerarToken(user);
    }

    public record LoginResult(String status, String token, String challenge) {}
}
