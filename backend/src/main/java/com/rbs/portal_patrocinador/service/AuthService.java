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

    // 1. TODAS as injeções de dependência ficam aqui no topo, uma única vez cada.
    @Autowired private GeoLocationService geoLocationService;
    @Autowired private LoginHistoryRepository loginHistoryRepository;
    @Autowired private EmailService emailService;
    @Autowired private UsuarioRepository usuarioRepository;

    public String login(String email, String senha, String ipAddress) {
        Usuario usuario = usuarioRepository.findByEmail(email).orElseThrow();

        // 1. Validar senha (aqui você usaria o BCrypt)
        // if (!passwordEncoder.matches(senha, usuario.getSenha())) throw new RuntimeException("Senha inválida");

        // 2. Verificar se 2FA está ativo
        if (usuario.isMfaEnabled()) {
            return "MFA_REQUIRED"; // O frontend deve pedir o código de 6 dígitos
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
                // Login suspeito! Não gera o JWT final. Envia e-mail de confirmação.
                String tokenSuspeito = UUID.randomUUID().toString();
                usuario.setTokenVerificacao(tokenSuspeito); // Reutilizando o campo de token
                usuarioRepository.save(usuario);

                emailService.enviarEmailVerificacao(email, tokenSuspeito); // Adapte o texto do e-mail
                return "SUSPICIOUS_LOGIN_EMAIL_SENT";
            }
        }

        // 4. Se tudo estiver ok, salva o histórico e gera o JWT
        LoginHistory novoLogin = new LoginHistory();
        novoLogin.setUsuario(usuario);
        novoLogin.setIpAddress(ipAddress);
        novoLogin.setLatitude(coordsAtuais[0]);
        novoLogin.setLongitude(coordsAtuais[1]);
        novoLogin.setTimestamp(LocalDateTime.now());
        loginHistoryRepository.save(novoLogin);

        return "JWT_GERADO_AQUI"; // Retorne o token JWT real
    }

    @Transactional
    public Usuario cadastrar(Usuario usuario) {
        // 1. Verifica se e-mail já existe
        if (usuarioRepository.findByEmail(usuario.getEmail()).isPresent()) {
            throw new RuntimeException("E-mail já cadastrado!");
        }

        // 2. Gera o token único
        String token = UUID.randomUUID().toString();
        usuario.setTokenVerificacao(token);
        usuario.setAtivo(false);

        // 3. Salva o usuário no banco
        Usuario usuarioSalvo = usuarioRepository.save(usuario);

        // 4. Envia o e-mail
        emailService.enviarEmailVerificacao(usuario.getEmail(), token);

        return usuarioSalvo;
    }

    @Transactional
    public void verificarEmail(String token) {
        // 1. Busca o usuário pelo token
        Usuario usuario = usuarioRepository.findByTokenVerificacao(token)
                .orElseThrow(() -> new RuntimeException("Token inválido ou expirado."));

        // 2. Ativa a conta e limpa o token
        usuario.setAtivo(true);
        usuario.setTokenVerificacao(null);

        usuarioRepository.save(usuario);
    }
}