package com.rbs.portal_patrocinador.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${api.verificacao.url}")
    private String urlBase;

    public void enviarEmailVerificacao(String destinatario, String token) {
        SimpleMailMessage mensagem = new SimpleMailMessage();
        mensagem.setTo(destinatario);
        mensagem.setSubject("Portal do Patrocinador - Confirme seu E-mail");

        String linkConfirmacao = urlBase + token;

        mensagem.setText("Olá!\n\n" +
                "Obrigado por se cadastrar no Portal do Patrocinador do Planeta Atlântida.\n" +
                "Para ativar sua conta, clique no link abaixo:\n\n" +
                linkConfirmacao + "\n\n" +
                "Se você não solicitou este cadastro, ignore este e-mail.");

        mailSender.send(mensagem);
    }
}