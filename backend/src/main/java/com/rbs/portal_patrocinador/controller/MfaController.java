package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import com.rbs.portal_patrocinador.service.MfaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/mfa")
public class MfaController {

    @Autowired private MfaService mfaService;
    @Autowired private UsuarioRepository usuarioRepository;

    @PostMapping("/setup/{email}")
    public ResponseEntity<?> setupMfa(@PathVariable String email) throws Exception {
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();

        // Gera um novo segredo e salva no usuário (mas ainda não ativa o 2FA)
        String secret = mfaService.generateSecret();
        usuario.setMfaSecret(secret);
        usuarioRepository.save(usuario);

        // Retorna a imagem do QR Code em Base64 para o frontend exibir
        String qrCodeUri = mfaService.getQrCodeImageUri(secret, email);
        return ResponseEntity.ok(Map.of("qrCode", qrCodeUri, "secret", secret));
    }

    @PostMapping("/confirm/{email}")
    public ResponseEntity<?> confirmMfa(@PathVariable String email, @RequestBody Map<String, String> body) {
        String code = body.get("code");
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();

        if (mfaService.verifyCode(usuario.getMfaSecret(), code)) {
            usuario.setMfaEnabled(true);
            usuarioRepository.save(usuario);
            return ResponseEntity.ok("2FA ativado com sucesso!");
        }
        return ResponseEntity.badRequest().body("Código inválido.");
    }
}