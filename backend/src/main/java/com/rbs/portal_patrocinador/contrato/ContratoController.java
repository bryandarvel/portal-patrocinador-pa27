package com.rbs.portal_patrocinador.contrato;

import com.rbs.portal_patrocinador.operacao.ArquivoService;
import com.rbs.portal_patrocinador.parceria.HistoricoService;
import com.rbs.portal_patrocinador.parceria.PortalAccess;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/parcerias/{parceriaId}/contrato")
public class ContratoController {
    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final HistoricoService history;
    private final ArquivoService files;

    public ContratoController(JdbcTemplate jdbc,PortalAccess access,HistoricoService history,ArquivoService files) {
        this.jdbc=jdbc; this.access=access; this.history=history; this.files=files;
    }

    public record Signatario(@NotBlank @Size(max=200) String nome,@NotBlank @Email @Size(max=255) String email,@NotBlank @Size(max=150) String cargo) {}
    public record Signatarios(@NotEmpty @Size(max=20) List<@NotNull @Valid Signatario> signatarios) {}
    public record Decisao(@NotBlank @Pattern(regexp="APROVADO|AJUSTES") String decisao,@NotNull @Size(max=2000) String comentario) {}

    @GetMapping
    public Map<String,Object> consultar(@PathVariable UUID parceriaId) {
        access.requireArea(parceriaId,"contrato",false);
        return Map.of("signatarios",jdbc.queryForList("select id,nome,email,cargo from portal_signatarios where parceria_id=? order by nome",parceriaId),
                "versoes",versoes(parceriaId),"assinado",jdbc.queryForList("select versao_id,arquivo_id,criado_em from portal_contrato_assinado where parceria_id=?",parceriaId));
    }

    @PutMapping("/signatarios")
    @Transactional
    public Map<String,Object> signatarios(@PathVariable UUID parceriaId,@Valid @RequestBody Signatarios input) {
        access.requireArea(parceriaId,"contrato",false); lock(parceriaId);
        if(access.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Os representantes devem ser informados pelo patrocinador.");
        if(!jdbc.queryForList("select id from portal_contrato_versoes where parceria_id=?",parceriaId).isEmpty())
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Signatários de contrato já publicado não podem ser alterados por este fluxo.");
        jdbc.update("delete from portal_signatarios where parceria_id=?",parceriaId);
        for(var item:input.signatarios()) jdbc.update("insert into portal_signatarios(id,parceria_id,nome,email,cargo) values (?,?,?,?,?)",UUID.randomUUID(),parceriaId,item.nome().trim(),item.email().trim().toLowerCase(Locale.ROOT),item.cargo().trim());
        history.registrar(parceriaId,"contrato","SIGNATARIOS_INFORMADOS","Representantes para assinatura informados.");
        return consultar(parceriaId);
    }

    @GetMapping("/versoes")
    public List<Map<String,Object>> versoes(@PathVariable UUID parceriaId) {
        access.requireArea(parceriaId,"contrato",false);
        return jdbc.queryForList("select v.id,v.numero,v.arquivo_id,v.signatarios,v.criado_em,d.decisao,d.comentario,d.criado_em as decidido_em from portal_contrato_versoes v left join portal_contrato_decisoes d on d.versao_id=v.id where v.parceria_id=? order by v.numero desc",parceriaId);
    }

    @PostMapping("/versoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> publicar(@PathVariable UUID parceriaId,@RequestParam MultipartFile arquivo) {
        access.requireArea(parceriaId,"contrato",true); lock(parceriaId);
        var signatarios=jdbc.queryForList("select nome,email,cargo from portal_signatarios where parceria_id=? order by nome",parceriaId);
        if(signatarios.isEmpty()) throw new ResponseStatusException(HttpStatus.CONFLICT,"Informe os signatários antes de publicar o contrato.");
        var anteriores=versoes(parceriaId);
        if(!anteriores.isEmpty() && !"AJUSTES".equals(anteriores.getFirst().get("decisao")))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Uma nova versão exige solicitação de ajuste na versão atual.");
        var file=files.salvar(parceriaId,arquivo,"contrato","contrato",false);
        UUID id=UUID.randomUUID();
        String snapshot=signatarios.stream().map(s->s.get("nome")+" | "+s.get("email")+" | "+s.get("cargo")).reduce((a,b)->a+"\n"+b).orElseThrow();
        jdbc.update("insert into portal_contrato_versoes(id,parceria_id,numero,arquivo_id,signatarios,criado_por) values (?,?,?,?,?,?)",id,parceriaId,anteriores.size()+1,file.id(),snapshot,access.userId());
        history.registrar(parceriaId,"contrato","CONTRATO_PUBLICADO","Versão do contrato disponibilizada para validação.");
        return Map.of("id",id,"numero",anteriores.size()+1,"arquivo",file);
    }

    @PostMapping("/versoes/{versaoId}/decisoes")
    @Transactional
    public Map<String,Object> decidir(@PathVariable UUID parceriaId,@PathVariable UUID versaoId,@Valid @RequestBody Decisao input) {
        access.requireArea(parceriaId,"contrato",false);
        if(access.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"A decisão deve ser registrada pelo patrocinador.");
        lock(parceriaId);
        var versions=versoes(parceriaId);
        if(versions.isEmpty() || !versaoId.equals(versions.getFirst().get("id"))) throw new ResponseStatusException(HttpStatus.CONFLICT,"A versão atual do contrato mudou.");
        if(versions.getFirst().get("decisao")!=null) throw new ResponseStatusException(HttpStatus.CONFLICT,"Esta versão já recebeu uma decisão.");
        if("AJUSTES".equals(input.decisao()) && input.comentario().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Descreva o ajuste solicitado.");
        jdbc.update("insert into portal_contrato_decisoes(id,versao_id,decisao,comentario,criado_por) values (?,?,?,?,?)",UUID.randomUUID(),versaoId,input.decisao(),input.comentario().trim(),access.userId());
        history.registrar(parceriaId,"contrato","DECISAO_CONTRATO","Decisão registrada na versão do contrato.");
        return consultar(parceriaId);
    }

    @PostMapping("/assinado")
    @Transactional
    public Map<String,Object> assinado(@PathVariable UUID parceriaId,@RequestParam UUID versaoId,@RequestParam MultipartFile arquivo) {
        access.requireArea(parceriaId,"contrato",true); lock(parceriaId);
        var versions=versoes(parceriaId);
        if(versions.isEmpty() || !versaoId.equals(versions.getFirst().get("id")) || !"APROVADO".equals(versions.getFirst().get("decisao")))
            throw new ResponseStatusException(HttpStatus.CONFLICT,"Publique o documento assinado da versão atual aprovada.");
        if(!jdbc.queryForList("select parceria_id from portal_contrato_assinado where parceria_id=?",parceriaId).isEmpty())
            throw new ResponseStatusException(HttpStatus.CONFLICT,"O contrato assinado já foi publicado.");
        var file=files.salvar(parceriaId,arquivo,"contrato","contrato_assinado",false);
        jdbc.update("insert into portal_contrato_assinado(parceria_id,versao_id,arquivo_id,criado_por) values (?,?,?,?)",parceriaId,versaoId,file.id(),access.userId());
        history.registrar(parceriaId,"contrato","CONTRATO_ASSINADO_PUBLICADO","Arquivo assinado externamente disponibilizado.");
        return consultar(parceriaId);
    }

    private void lock(UUID id) { jdbc.queryForMap("select id from portal_parcerias where id=? for update",id); }
}
