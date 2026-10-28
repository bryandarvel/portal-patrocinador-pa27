package com.rbs.portal_patrocinador.entrega;

import com.rbs.portal_patrocinador.operacao.ArquivoService;
import com.rbs.portal_patrocinador.parceria.*;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.time.Instant;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/parcerias/{parceriaId}/entregas")
public class EntregaController {
    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final HistoricoService history;
    private final ArquivoService files;
    public EntregaController(JdbcTemplate jdbc,PortalAccess access,HistoricoService history,ArquivoService files) {
        this.jdbc=jdbc; this.access=access; this.history=history; this.files=files;
    }
    public record NovaEntrega(@NotBlank @Size(max=40) String area,@NotBlank @Size(max=200) String titulo,@NotNull @Size(max=2000) String descricao) {}
    public record Responsavel(@NotNull UUID usuarioId,@Min(0) long versao) {}
    public record Avaliacao(@NotBlank @Pattern(regexp="ANALISAR|APROVAR|AJUSTAR") String acao,@NotNull @Size(max=2000) String comentario) {}
    public record Execucao(@NotBlank @Pattern(regexp="EM_EXECUCAO|REALIZADA") String estado,@Min(0) long versao) {}

    @GetMapping
    public Map<String,Object> listar(@PathVariable UUID parceriaId) {
        access.require(parceriaId,false);
        var rows=jdbc.queryForList("select e.*,u.nome as responsavel from portal_entregas e left join usuarios u on u.id=e.responsavel_id join portal_areas a on a.parceria_id=e.parceria_id and a.area=e.area where e.parceria_id=? and (? or a.habilitada) order by e.criado_em,e.id",parceriaId,access.isAdmin());
        long realizadas=rows.stream().filter(e->"REALIZADA".equals(e.get("execucao"))).count();
        long curso=rows.stream().filter(e->"EM_EXECUCAO".equals(e.get("execucao"))).count();
        return Map.of("itens",rows,"totais",Map.of("pendentes",rows.size()-realizadas-curso,"emCurso",curso,"realizadas",realizadas));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> criar(@PathVariable UUID parceriaId,@Valid @RequestBody NovaEntrega input) {
        if(!ParceriaController.AREAS.contains(input.area())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Área inválida.");
        access.requireArea(parceriaId,input.area(),true);
        UUID id=UUID.randomUUID();
        jdbc.update("insert into portal_entregas(id,parceria_id,area,titulo,descricao) values (?,?,?,?,?)",id,parceriaId,input.area(),input.titulo().trim(),input.descricao().trim());
        history.registrar(parceriaId,input.area(),"ENTREGA_CRIADA","Entrega incluída nas condições da parceria.");
        return detalhe(parceriaId,id);
    }

    @GetMapping("/{entregaId}")
    public Map<String,Object> detalhe(@PathVariable UUID parceriaId,@PathVariable UUID entregaId) {
        var row=get(parceriaId,entregaId,false);
        var result=new LinkedHashMap<>(row);
        result.put("materiais",materiais(parceriaId,entregaId));
        result.put("comprovacoes",jdbc.queryForList("select c.id,c.descricao,c.material_id,c.arquivo_id,c.criado_em,u.nome as autor from portal_comprovacoes c join usuarios u on u.id=c.criado_por where c.entrega_id=? order by c.criado_em",entregaId));
        return result;
    }

    @GetMapping("/{entregaId}/materiais/versoes")
    public List<Map<String,Object>> materiais(@PathVariable UUID parceriaId,@PathVariable UUID entregaId) {
        get(parceriaId,entregaId,false);
        return jdbc.queryForList("select m.id,m.numero,m.arquivo_id,m.estado,m.correcao,m.avaliado_em,u.nome as avaliado_por from portal_entrega_materiais m left join usuarios u on u.id=m.avaliado_por where m.entrega_id=? order by m.numero desc",entregaId);
    }

    @PostMapping("/{entregaId}/materiais/versoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> upload(@PathVariable UUID parceriaId,@PathVariable UUID entregaId,@RequestParam MultipartFile arquivo) {
        var entrega=get(parceriaId,entregaId,true);
        String area=(String)entrega.get("area");
        var estado=jdbc.queryForMap("select recebimento_aberto,prazo from portal_areas where parceria_id=? and area=? for update",parceriaId,area);
        var prazo=(java.sql.Timestamp)estado.get("prazo");
        if(!Boolean.TRUE.equals(estado.get("recebimento_aberto")) || (prazo!=null && !prazo.toInstant().isAfter(Instant.now()))) conflict("O recebimento de materiais está encerrado.");
        var materiais=materiais(parceriaId,entregaId);
        if(!"PROGRAMADA".equals(entrega.get("execucao")) || (!materiais.isEmpty() && !"AJUSTES".equals(materiais.getFirst().get("estado")))) conflict("Esta entrega não aguarda um novo material.");
        var file=files.salvar(parceriaId,arquivo,area,"material_entrega_"+entregaId,false);
        UUID id=UUID.randomUUID();
        jdbc.update("insert into portal_entrega_materiais(id,entrega_id,numero,arquivo_id) values (?,?,?,?)",id,entregaId,materiais.size()+1,file.id());
        jdbc.update("update portal_entregas set versao=versao+1 where id=?",entregaId);
        history.registrar(parceriaId,area,"MATERIAL_RECEBIDO","Nova versão do material da entrega recebida.");
        return detalhe(parceriaId,entregaId);
    }

    @PostMapping("/{entregaId}/materiais/versoes/{versaoId}/avaliacoes")
    @Transactional
    public Map<String,Object> avaliar(@PathVariable UUID parceriaId,@PathVariable UUID entregaId,@PathVariable UUID versaoId,@Valid @RequestBody Avaliacao input) {
        access.require(parceriaId,true);
        var entrega=get(parceriaId,entregaId,true);
        var materiais=materiais(parceriaId,entregaId);
        if(materiais.isEmpty() || !versaoId.equals(materiais.getFirst().get("id"))) conflict("A versão atual do material mudou.");
        String atual=(String)materiais.getFirst().get("estado");
        String destino=switch(input.acao()) { case "ANALISAR" -> "EM_ANALISE"; case "APROVAR" -> "APROVADO"; default -> "AJUSTES"; };
        if(("ANALISAR".equals(input.acao()) && !"RECEBIDO".equals(atual)) || (!"ANALISAR".equals(input.acao()) && !"EM_ANALISE".equals(atual))) conflict("Transição de análise inválida.");
        if("AJUSTES".equals(destino) && input.comentario().isBlank()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Descreva o ajuste necessário.");
        jdbc.update("update portal_entrega_materiais set estado=?,correcao=?,avaliado_por=?,avaliado_em=current_timestamp where id=?",destino,input.comentario().trim(),access.userId(),versaoId);
        jdbc.update("update portal_entregas set versao=versao+1 where id=?",entregaId);
        history.registrar(parceriaId,(String)entrega.get("area"),"MATERIAL_AVALIADO","Avaliação da versão atual registrada.");
        return detalhe(parceriaId,entregaId);
    }

    @PatchMapping("/{entregaId}/responsavel")
    @Transactional
    public Map<String,Object> responsavel(@PathVariable UUID parceriaId,@PathVariable UUID entregaId,@Valid @RequestBody Responsavel input) {
        access.require(parceriaId,true); var entrega=get(parceriaId,entregaId,true);
        Integer valid=jdbc.queryForObject("select count(*) from usuarios where id=? and role='ADMIN_RBS' and ativo=true",Integer.class,input.usuarioId());
        if(valid==null || valid!=1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Responsável deve ser um usuário RBS ativo.");
        if(jdbc.update("update portal_entregas set responsavel_id=?,versao=versao+1 where id=? and versao=?",input.usuarioId(),entregaId,input.versao())!=1) conflict("Entrega alterada; recarregue antes de salvar.");
        history.registrar(parceriaId,(String)entrega.get("area"),"RESPONSAVEL_ATRIBUIDO","Responsável da entrega atualizado.");
        return detalhe(parceriaId,entregaId);
    }

    @PatchMapping("/{entregaId}/execucao")
    @Transactional
    public Map<String,Object> executar(@PathVariable UUID parceriaId,@PathVariable UUID entregaId,@Valid @RequestBody Execucao input) {
        access.require(parceriaId,true); var entrega=get(parceriaId,entregaId,true);
        String atual=(String)entrega.get("execucao");
        var material=materiais(parceriaId,entregaId);
        if(material.isEmpty() || !"APROVADO".equals(material.getFirst().get("estado"))) conflict("A execução exige um material aprovado.");
        if(("EM_EXECUCAO".equals(input.estado()) && !"PROGRAMADA".equals(atual)) || ("REALIZADA".equals(input.estado()) && !"EM_EXECUCAO".equals(atual))) conflict("Transição de execução inválida.");
        if(jdbc.update("update portal_entregas set execucao=?,versao=versao+1 where id=? and versao=?",input.estado(),entregaId,input.versao())!=1) conflict("Entrega alterada; recarregue antes de salvar.");
        history.registrar(parceriaId,(String)entrega.get("area"),"EXECUCAO_ATUALIZADA","Estado da execução atualizado.");
        return detalhe(parceriaId,entregaId);
    }

    @PostMapping("/{entregaId}/comprovacoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> comprovar(@PathVariable UUID parceriaId,@PathVariable UUID entregaId,@RequestParam String descricao,@RequestParam(required=false) MultipartFile arquivo) {
        access.require(parceriaId,true); var entrega=get(parceriaId,entregaId,true);
        if(descricao.isBlank() || descricao.length()>2000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe uma descrição de até 2000 caracteres.");
        if(!"REALIZADA".equals(entrega.get("execucao"))) conflict("Comprove uma entrega já realizada.");
        var materiais=materiais(parceriaId,entregaId);
        if(materiais.isEmpty()) conflict("Material da entrega não encontrado.");
        UUID arquivoId=arquivo==null?null:files.salvar(parceriaId,arquivo,(String)entrega.get("area"),"comprovacao_"+entregaId,false).id();
        jdbc.update("insert into portal_comprovacoes(id,entrega_id,material_id,descricao,arquivo_id,criado_por) values (?,?,?,?,?,?)",UUID.randomUUID(),entregaId,materiais.getFirst().get("id"),descricao.trim(),arquivoId,access.userId());
        history.registrar(parceriaId,(String)entrega.get("area"),"COMPROVACAO_PUBLICADA","Comprovação da entrega disponibilizada.");
        return detalhe(parceriaId,entregaId);
    }

    private Map<String,Object> get(UUID parceriaId,UUID entregaId,boolean lock) {
        access.require(parceriaId,false);
        var rows=jdbc.queryForList("select * from portal_entregas where id=? and parceria_id=?"+(lock?" for update":""),entregaId,parceriaId);
        if(rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Entrega não encontrada.");
        access.requireArea(parceriaId,(String)rows.getFirst().get("area"),false);
        return rows.getFirst();
    }
    private void conflict(String detail) { throw new ResponseStatusException(HttpStatus.CONFLICT,detail); }
}
