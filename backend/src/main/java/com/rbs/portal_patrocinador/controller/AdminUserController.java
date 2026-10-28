package com.rbs.portal_patrocinador.controller;

import com.rbs.portal_patrocinador.dto.ConviteUsuarioRequest;
import com.rbs.portal_patrocinador.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/usuarios")
public class AdminUserController {
    private final AuthService auth;

    public AdminUserController(AuthService auth) { this.auth = auth; }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, String> convidar(@Valid @RequestBody ConviteUsuarioRequest request) {
        auth.convidar(request);
        return Map.of("mensagem", "Convite enviado para ativação");
    }
}
