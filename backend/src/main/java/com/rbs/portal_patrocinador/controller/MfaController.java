package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import com.rbs.portal_patrocinador.security.CurrentUser;
import com.rbs.portal_patrocinador.service.MfaService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;

@RestController
@RequestMapping("/api/mfa")
public class MfaController {
    private final MfaService mfa;
    private final UsuarioRepository users;
    private final CurrentUser current;

    public MfaController(MfaService mfa, UsuarioRepository users, CurrentUser current) {
        this.mfa = mfa;
        this.users = users;
        this.current = current;
    }

    @PostMapping("/setup/{email}")
    public Map<String, String> setup(@PathVariable String email) throws Exception {
        Usuario user = own(email);
        if (user.isMfaEnabled()) throw new ResponseStatusException(HttpStatus.CONFLICT, "MFA já configurado");
        String secret = mfa.generateSecret();
        user.setMfaSecret(secret);
        users.save(user);
        return Map.of("qrCode", mfa.getQrCodeImageUri(secret, user.getEmail()), "secret", secret);
    }

    @PostMapping("/confirm/{email}")
    public Map<String, String> confirm(@PathVariable String email, @RequestBody Map<String, String> body) {
        Usuario user = own(email);
        String code = body.get("code");
        if (user.getMfaSecret() == null || code == null || !mfa.verifyCode(user.getMfaSecret(), code))
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Código inválido");
        user.setMfaEnabled(true);
        users.save(user);
        return Map.of("mensagem", "MFA ativado");
    }

    private Usuario own(String email) {
        Usuario user = current.get();
        if (!user.getEmail().equalsIgnoreCase(email)) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        return user;
    }
}
