package com.rbs.portal_patrocinador.service;

import com.rbs.portal_patrocinador.entity.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Date;
import java.util.UUID;

@Service
public class TokenService {

    private final SecretKey key;
    private final Duration accessTtl;
    private final Duration challengeTtl;

    public TokenService(@Value("${portal.jwt.secret}") String secret,
                        @Value("${portal.jwt.access-ttl}") Duration accessTtl,
                        @Value("${portal.jwt.challenge-ttl}") Duration challengeTtl) {
        if (secret.getBytes(StandardCharsets.UTF_8).length < 32 || accessTtl.isNegative() || accessTtl.isZero()
                || challengeTtl.isNegative() || challengeTtl.isZero()) {
            throw new IllegalArgumentException("Configuração de token inválida");
        }
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTtl = accessTtl;
        this.challengeTtl = challengeTtl;
    }

    public String gerarToken(Usuario usuario) {
        return issue(usuario.getId(), "access", accessTtl);
    }

    public String gerarDesafioMfa(Usuario usuario) {
        return issue(usuario.getId(), "mfa", challengeTtl);
    }

    private String issue(UUID id, String purpose, Duration ttl) {
        Date now = new Date();
        return Jwts.builder().subject(id.toString()).claim("purpose", purpose)
                .issuedAt(now).expiration(new Date(now.getTime() + ttl.toMillis()))
                .signWith(key).compact();
    }

    public UUID validarToken(String token) {
        return validate(token, "access");
    }

    public UUID validarDesafioMfa(String token) {
        return validate(token, "mfa");
    }

    private UUID validate(String token, String purpose) {
        try {
            Claims claims = Jwts.parser().verifyWith(key).build().parseSignedClaims(token).getPayload();
            if (!purpose.equals(claims.get("purpose", String.class))) return null;
            return UUID.fromString(claims.getSubject());
        } catch (RuntimeException ex) {
            return null;
        }
    }
}
