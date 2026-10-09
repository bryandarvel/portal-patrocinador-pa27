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

    private boolean ativo = false;

    private String tokenVerificacao;

    private boolean mfaEnabled = false;

    private String mfaSecret;

    // NOVO CAMPO ADICIONADO AQUI
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;
}