package com.rbs.portal_patrocinador;

import com.rbs.portal_patrocinador.dto.CadastroRequest;
import com.rbs.portal_patrocinador.dto.ConviteUsuarioRequest;
import com.rbs.portal_patrocinador.controller.MfaController;
import com.rbs.portal_patrocinador.entity.Role;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import com.rbs.portal_patrocinador.security.CurrentUser;
import com.rbs.portal_patrocinador.service.AuthService;
import com.rbs.portal_patrocinador.service.EmailService;
import com.rbs.portal_patrocinador.service.MfaService;
import com.rbs.portal_patrocinador.service.TokenService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

class AuthSecurityTests {
    private final UsuarioRepository users = mock(UsuarioRepository.class);
    private final EmailService email = mock(EmailService.class);
    private final MfaService mfa = mock(MfaService.class);
    private final TokenService tokens = new TokenService("12345678901234567890123456789012", Duration.ofHours(1), Duration.ofMinutes(5));
    private final BCryptPasswordEncoder passwords = new BCryptPasswordEncoder();
    private final CurrentUser current = new CurrentUser();
    private final AuthService auth = new AuthService(users, email, mfa, tokens, passwords, current, Duration.ofHours(24));

    @AfterEach void clear() { SecurityContextHolder.clearContext(); }

    private Usuario user(boolean active, boolean mfaEnabled) {
        Usuario user = new Usuario();
        user.setId(UUID.randomUUID());
        user.setEmail("user@example.test");
        user.setSenha(passwords.encode("correct-password"));
        user.setAtivo(active);
        user.setMfaEnabled(mfaEnabled);
        user.setMfaSecret("TESTSECRET");
        user.setRole(Role.ADMIN_PATROCINADOR);
        return user;
    }

    @Test void loginRejectsInactiveAndWrongPassword() {
        Usuario user = user(false, false);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        assertThrows(ResponseStatusException.class, () -> auth.login(user.getEmail(), "correct-password"));
        user.setAtivo(true);
        assertThrows(ResponseStatusException.class, () -> auth.login(user.getEmail(), "wrong-password"));
        assertNotNull(auth.login(user.getEmail(), "correct-password").token());
    }

    @Test void cadastroRejectsAdminRole() {
        authenticate(Role.ADMIN_RBS);
        assertThrows(ResponseStatusException.class, () ->
                auth.cadastrar(new CadastroRequest("Name", "user@example.test", "long-password", Role.ADMIN_RBS)));
        verify(users, never()).save(any());
    }

    @Test void adminCanInviteAnotherRbsUser() {
        authenticate(Role.ADMIN_RBS);
        when(users.findByEmail("other@example.test")).thenReturn(Optional.empty());
        auth.convidar(new ConviteUsuarioRequest("Other RBS", "other@example.test", "secure-password", Role.ADMIN_RBS));
        var saved = org.mockito.ArgumentCaptor.forClass(Usuario.class);
        verify(users).save(saved.capture());
        assertEquals(Role.ADMIN_RBS, saved.getValue().getRole());
        assertFalse(saved.getValue().isAtivo());
        assertTrue(passwords.matches("secure-password", saved.getValue().getSenha()));
        verify(email).enviarEmailVerificacao(eq("other@example.test"), anyString());
    }

    @Test void sponsorCannotInviteAnotherUser() {
        authenticate(Role.ADMIN_PATROCINADOR);
        assertThrows(ResponseStatusException.class, () ->
                auth.convidar(new ConviteUsuarioRequest("Other", "other@example.test", "secure-password", Role.ADMIN_RBS)));
        verify(users, never()).save(any());
    }

    @Test void bcryptByteLimitRejectsMultibyteInput() {
        authenticate(Role.ADMIN_RBS);
        String tooLong = "á".repeat(37);
        assertThrows(ResponseStatusException.class, () ->
                auth.convidar(new ConviteUsuarioRequest("Other", "other@example.test", tooLong, Role.ADMIN_RBS)));
        verify(users, never()).save(any());
        Usuario user = user(true, false);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        assertThrows(ResponseStatusException.class, () -> auth.login("user@example.test", tooLong));
    }

    private void authenticate(Role role) {
        Usuario actor = user(true, false);
        actor.setRole(role);
        SecurityContextHolder.getContext().setAuthentication(new UsernamePasswordAuthenticationToken(actor, null));
    }

    @Test void mfaNeedsChallengeForSameUser() {
        Usuario user = user(true, true);
        when(users.findByEmail(user.getEmail())).thenReturn(Optional.of(user));
        when(users.findById(user.getId())).thenReturn(Optional.of(user));
        when(mfa.verifyCode(anyString(), eq("123456"))).thenReturn(true);
        String challenge = auth.login(user.getEmail(), "correct-password").challenge();
        assertNull(tokens.validarToken(challenge));
        assertThrows(ResponseStatusException.class, () -> auth.validarMfa(null, "123456"));
        assertThrows(ResponseStatusException.class, () -> auth.validarMfa(tokens.gerarToken(user), "123456"));
        assertNotNull(auth.validarMfa(challenge, "123456"));
        Usuario another = user(true, true);
        when(users.findById(user.getId())).thenReturn(Optional.of(another));
        assertThrows(ResponseStatusException.class, () -> auth.validarMfa(challenge, "123456"));
    }

    @Test void currentUserRejectsSwitchingPrincipal() {
        Usuario user = user(true, false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null));
        CurrentUser current = new CurrentUser();
        assertEquals(user.getId(), current.id());
        assertThrows(ResponseStatusException.class, current::requireAdmin);
        user.setAtivo(false);
        assertThrows(ResponseStatusException.class, current::get);
    }

    @Test void mfaSetupRejectsAnotherAccount() {
        Usuario user = user(true, false);
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null));
        MfaController controller = new MfaController(mfa, users, new CurrentUser());
        assertThrows(ResponseStatusException.class, () -> controller.setup("another@example.test"));
        verify(users, never()).save(any());
    }
}
