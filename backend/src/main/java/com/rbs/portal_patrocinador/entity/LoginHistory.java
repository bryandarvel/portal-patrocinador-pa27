package com.rbs.portal_patrocinador.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Getter @Setter @NoArgsConstructor
public class LoginHistory {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    private Usuario usuario;

    private String ipAddress;
    private Double latitude;
    private Double longitude;
    private LocalDateTime timestamp;
}