package com.rbs.portal_patrocinador.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@Service
public class EmailService {
    private final JavaMailSender mail;
    private final boolean enabled;
    private final String frontendUrl;

    public EmailService(JavaMailSender mail, @Value("${portal.mail.enabled}") boolean enabled,
                        @Value("${portal.frontend-url}") String frontendUrl) {
        this.mail = mail;
        this.enabled = enabled;
        this.frontendUrl = frontendUrl;
    }

    public void enviarEmailVerificacao(String recipient, String token) {
        if (!enabled) throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Envio de e-mail indisponível");
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(recipient);
        message.setSubject("Portal do Patrocinador: ativação de acesso");
        message.setText("Ative seu acesso: " + frontendUrl + "/verificar?token="
                + URLEncoder.encode(token, StandardCharsets.UTF_8));
        mail.send(message);
    }
}
