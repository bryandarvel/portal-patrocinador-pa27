package com.rbs.portal_patrocinador.operacao;

import java.time.Instant;
import java.util.UUID;

public record ArquivoView(UUID id, String nome, long tamanho, String contentType, int versao, Instant criadoEm) {}
