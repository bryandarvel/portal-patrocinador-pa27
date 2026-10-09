package com.rbs.portal_patrocinador.service;

import com.rbs.portal_patrocinador.entity.Usuario;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class TokenService {

    // Em produção, isso deve vir de uma variável de ambiente ou application.properties
    private final String SECRET = "chave-super-secreta-para-o-desafio-gc-2026-rbs";
    private final SecretKey key = Keys.hmacShaKeyFor(SECRET.getBytes());

    public String gerarToken(Usuario usuario) {
        return Jwts.builder()
                .setSubject(usuario.getEmail())
                .claim("id", usuario.getId().toString())
                .claim("role", usuario.getRole().name()) // Supondo que você tem um Enum Role
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000)) // 24 horas
                .signWith(key)
                .compact();
    }
}