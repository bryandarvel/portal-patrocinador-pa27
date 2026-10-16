package com.rbs.portal_patrocinador.service;

import com.rbs.portal_patrocinador.entity.LoginHistory;
import com.rbs.portal_patrocinador.entity.Usuario;
import com.rbs.portal_patrocinador.repository.LoginHistoryRepository;
import com.rbs.portal_patrocinador.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    // Injeções de dependência
    @Autowired private GeoLocationService geoLocationService;
    @Autowired private LoginHistoryRepository loginHistoryRepository;
    @Autowired private EmailService emailService;
    @Autowired private UsuarioRepository usuarioRepository;
    @Autowired private MfaService mfaService;
    @Autowired private TokenService tokenService;

    public String login(String email, String senha, String ipAddress) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        // 1. Validar senha (temporário — depois usaremos BCrypt)
        if (senha == null || !senha.equals(usuario.getSenha())) {
            throw new RuntimeException("Senha inválida");
        }

        // 2. Verificar se 2FA está ativo
        if (usuario.isMfaEnabled()) {
            return "MFA_REQUIRED";
        }

        // 3. Verificação de Distância de IP
        double[] coordsAtuais = geoLocationService.getCoordinates(ipAddress);
        Optional<LoginHistory> ultimoLogin = loginHistoryRepository.findTopByUsuarioOrderByTimestampDesc(usuario);

        if (ultimoLogin.isPresent()) {
            LoginHistory ultimo = ultimoLogin.get();
            double distancia = geoLocationService.calculateDistance(
                    ultimo.getLatitude(), ultimo.getLongitude(),
                    coordsAtuais[0], coordsAtuais[1]);

            // Se a distância for maior que 500km e o último login foi há menos de 2 horas
            if (distancia > 500 && ultimo.getTimestamp().isAfter(LocalDateTime.now().minusHours(2))) {
                String tokenSuspeito = UUID.randomUUID().toString();
                usuario.setTokenVerificacao(tokenSuspeito);
                usuarioRepository.save(usuario);

                // Comentado temporariamente para testes (e-mail ainda não configurado)
                // emailService.enviarEmailVerificacao(email, tokenSuspeito);
                return "SUSPICIOUS_LOGIN_EMAIL_SENT";
            }
        }

        // 4. Salva o histórico e gera o JWT real
        LoginHistory novoLogin = new LoginHistory();
        novoLogin.setUsuario(usuario);
        novoLogin.setIpAddress(ipAddress);
        novoLogin.setLatitude(coordsAtuais[0]);
        novoLogin.setLongitude(coordsAtuais[1]);
        novoLogin.setTimestamp(LocalDateTime.now());
        loginHistoryRepository.save(novoLogin);

        return tokenService.gerarToken(usuario);
    }

    @Transactional
    public Usuario cadastrar(Usuario usuario) {
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado!");
        }

        String token = UUID.randomUUID().toString();
        usuario.setTokenVerificacao(token);
        usuario.setAtivo(false);

        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        // 4. Envia o e-mail  ← COMENTE ESTA LINHA TEMPORARIAMENTE
        // emailService.enviarEmailVerificacao(usuario.getEmail(), token);

        return usuarioSalvo;
    }

    @Transactional
    public void verificarEmail(String token) {
        Usuario usuario = usuarioRepository.findByTokenVerificacao(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado."));

        usuario.setAtivo(true);
        usuario.setTokenVerificacao(null);
        usuarioRepository.save(usuario);
    }

    @Transactional
    public String confirmarLoginSuspeito(String token) {
        Usuario usuario = usuarioRepository.findByTokenVerificacao(token)
                .orElseThrow(() -> new RuntimeException("Token de confirmação inválido ou expirado."));

        usuario.setTokenVerificacao(null);
        usuarioRepository.save(usuario);

        return tokenService.gerarToken(usuario);
    }

    @Transactional
    public String validarMfa(String email, String codigo, String ipAddress) {
        Usuario usuario = usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado."));

        if (usuario.getMfaSecret() == null) {
            throw new RuntimeException("MFA não configurado para este usuário.");
        }

        if (!mfaService.verifyCode(usuario.getMfaSecret(), codigo)) {
            throw new RuntimeException("Código 2FA inválido.");
        }

        double[] coords = geoLocationService.getCoordinates(ipAddress);
        LoginHistory novoLogin = new LoginHistory();
        novoLogin.setUsuario(usuario);
        novoLogin.setIpAddress(ipAddress);
        novoLogin.setLatitude(coords[0]);
        novoLogin.setLongitude(coords[1]);
        novoLogin.setTimestamp(LocalDateTime.now());
        loginHistoryRepository.save(novoLogin);

        return tokenService.gerarToken(usuario);
    }
}