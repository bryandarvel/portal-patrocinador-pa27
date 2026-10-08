package com.rbs.portal_patrocinador.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "usuarios")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String nome;

    @Column(unique = true, nullable = false)
    private String email;

    private String senha;

    // Campo que diz se o e-mail foi confirmado
    private boolean ativo = false;

    // Token temporário para verificação
    private String tokenVerificacao;

    // Na classe Usuario.java
    private boolean mfaEnabled = false;

    @Column(length = 100)
    private String mfaSecret; // O segredo compartilhado com o app autenticador


}