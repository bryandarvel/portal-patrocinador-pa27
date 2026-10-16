package com.rbs.portal_patrocinador.dto;

import com.rbs.portal_patrocinador.entity.Role;

public record CadastroRequest(
        String nome,
        String email,
        String senha,
        Role role
) {}