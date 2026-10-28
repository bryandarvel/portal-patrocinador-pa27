package com.rbs.portal_patrocinador.parceria;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
public class ParceriaController {
    public static final Set<String> AREAS = Set.of("perfil", "marca", "midia", "cortesias", "credenciamento", "pesquisa", "contrato");
    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final HistoricoService history;

    public ParceriaController(JdbcTemplate jdbc, PortalAccess access, HistoricoService history) {
        this.jdbc = jdbc; this.access = access; this.history = history;
    }

    public record Modelo(@NotBlank @Size(max=40) String area, @NotBlank @Size(max=200) String titulo, @NotNull @Size(max=2000) String descricao) {}
    public record Beneficio(@NotBlank @Pattern(regexp="CORTESIA|CREDENCIAL") String natureza,@NotBlank @Size(max=120) String tipo,@NotBlank @Size(max=120) String setor,@NotNull @Size(max=120) String publico,@Min(0) int quantidade) {}
    public record CotaInput(@NotBlank @Size(max=120) String nome, @NotEmpty Set<@NotBlank String> areas, @NotNull @Size(max=100) List<@NotNull @Valid Modelo> entregas, @Min(0) long versao,@Size(max=1000) List<@NotNull @Valid Beneficio> beneficios) {
        public CotaInput { beneficios=beneficios==null?List.of():List.copyOf(beneficios); }
    }
    public record Limite(@Min(0) int quantidade,@Min(0) long versao) {}
    public record ParceriaInput(@NotBlank @Size(max=200) String nome, @NotBlank @Size(max=80) String edicao, @NotNull UUID cotaId, @NotNull @Size(max=100) Set<@NotNull UUID> usuarioIds) {}
    public record PerfilInput(@NotBlank @Size(max=200) String nome, @Min(0) long versao,UUID cotaId) {}
    public record Acessos(@NotNull @Size(max=100) Set<@NotNull UUID> usuarioIds) {}
    public record Capacidades(@NotEmpty Set<@NotBlank String> areas) {}

    @GetMapping("/api/cotas")
    public List<Map<String,Object>> cotas() {
        admin();
        return jdbc.queryForList("select id, nome, versao from portal_cotas order by nome").stream().map(cota -> {
            var result = new LinkedHashMap<>(cota);
            result.put("areas", jdbc.queryForList("select area from portal_cota_areas where cota_id = ? order by area", String.class, cota.get("id")));
            result.put("entregas", jdbc.queryForList("select area,titulo,descricao from portal_modelos_entrega where cota_id = ? order by titulo", cota.get("id")));
            result.put("beneficios",jdbc.queryForList("select natureza,tipo,setor,publico,quantidade from portal_cota_beneficios where cota_id=? order by natureza,setor,tipo",cota.get("id")));
            return (Map<String,Object>) result;
        }).toList();
    }

    @PostMapping("/api/cotas")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> criarCota(@Valid @RequestBody CotaInput input) {
        admin(); validateAreas(input.areas());
        UUID id = UUID.randomUUID();
        jdbc.update("insert into portal_cotas(id,nome) values (?,?)", id,input.nome().trim());
        salvarModelo(id,input);
        return Map.of("id",id,"versao",0);
    }

    @PatchMapping("/api/cotas/{id}")
    @Transactional
    public Map<String,Object> editarCota(@PathVariable UUID id,@Valid @RequestBody CotaInput input) {
        admin(); validateAreas(input.areas());
        if(jdbc.update("update portal_cotas set nome=?,versao=versao+1 where id=? and versao=?",input.nome().trim(),id,input.versao()) != 1) conflict();
        jdbc.update("delete from portal_cota_areas where cota_id=?",id);
        jdbc.update("delete from portal_modelos_entrega where cota_id=?",id);
        jdbc.update("delete from portal_cota_beneficios where cota_id=?",id);
        salvarModelo(id,input);
        return Map.of("id",id,"versao",input.versao()+1);
    }

    private void salvarModelo(UUID id,CotaInput input) {
        for(Beneficio beneficio:input.beneficios()) {
            String area="CORTESIA".equals(beneficio.natureza())?"cortesias":"credenciamento";
            if(!input.areas().contains(area)) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Benefício exige a área correspondente habilitada na cota.");
            if("CORTESIA".equals(beneficio.natureza()) && (beneficio.tipo().length()>20 || !beneficio.publico().isEmpty())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cortesia deve ter tipo de até 20 caracteres e público vazio.");
            jdbc.update("insert into portal_cota_beneficios(id,cota_id,natureza,tipo,setor,publico,quantidade) values (?,?,?,?,?,?,?)",UUID.randomUUID(),id,beneficio.natureza(),beneficio.tipo().trim(),beneficio.setor().trim(),beneficio.publico().trim(),beneficio.quantidade());
        }
        for(String area: input.areas()) jdbc.update("insert into portal_cota_areas(cota_id,area) values (?,?)",id,area);
        for(Modelo modelo:input.entregas()) {
            if(!input.areas().contains(modelo.area())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Entrega deve pertencer a uma área da cota.");
            jdbc.update("insert into portal_modelos_entrega(id,cota_id,area,titulo,descricao) values (?,?,?,?,?)",UUID.randomUUID(),id,modelo.area(),modelo.titulo().trim(),modelo.descricao().trim());
        }
    }

    @GetMapping("/api/parcerias")
    public Map<String,Object> listar(@RequestParam(defaultValue="") @Size(max=200) String busca,@RequestParam(defaultValue="0") int pagina) {
        if(pagina<0 || pagina>100000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Página inválida.");
        String where=" where lower(p.nome) like ? and (? or exists(select 1 from portal_acessos a where a.parceria_id=p.id and a.usuario_id=?))";
        Object[] args={"%"+busca.toLowerCase(Locale.ROOT)+"%",access.isAdmin(),access.userId()};
        Long total=jdbc.queryForObject("select count(*) from portal_parcerias p"+where,Long.class,args);
        var items=jdbc.queryForList("select p.id,p.nome,p.edicao,p.cota_id,c.nome as cota,p.versao from portal_parcerias p join portal_cotas c on c.id=p.cota_id"+where+" order by p.nome,p.id limit 50 offset ?",args[0],args[1],args[2],pagina*50);
        return Map.of("itens",items,"total",total==null?0:total,"pagina",pagina);
    }

    @PostMapping("/api/parcerias")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> criar(@Valid @RequestBody ParceriaInput input) {
        admin();
        var cotas=jdbc.queryForList("select id from portal_cotas where id=? for share",input.cotaId());
        if(cotas.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cota não encontrada.");
        UUID id=UUID.randomUUID();
        jdbc.update("insert into portal_parcerias(id,nome,edicao,cota_id) values (?,?,?,?)",id,input.nome().trim(),input.edicao().trim(),input.cotaId());
        for(String area:AREAS) jdbc.update("insert into portal_areas(parceria_id,area,habilitada) values (?,?,exists(select 1 from portal_cota_areas where cota_id=? and area=?))",id,area,input.cotaId(),area);
        for(var beneficio:jdbc.queryForList("select natureza,tipo,setor,publico,quantidade from portal_cota_beneficios where cota_id=?",input.cotaId()))
            jdbc.update("insert into portal_beneficios(id,parceria_id,natureza,tipo,setor,publico,quantidade) values (?,?,?,?,?,?,?)",UUID.randomUUID(),id,beneficio.get("natureza"),beneficio.get("tipo"),beneficio.get("setor"),beneficio.get("publico"),beneficio.get("quantidade"));
        vincular(id,input.usuarioIds());
        for(var modelo:jdbc.queryForList("select area,titulo,descricao from portal_modelos_entrega where cota_id=?",input.cotaId())) {
            jdbc.update("insert into portal_entregas(id,parceria_id,area,titulo,descricao) values (?,?,?,?,?)",UUID.randomUUID(),id,modelo.get("area"),modelo.get("titulo"),modelo.get("descricao"));
        }
        history.registrar(id,"perfil","PARCERIA_CRIADA","Parceria criada com os direitos e modelos da cota.");
        return perfil(id);
    }

    @GetMapping("/api/parcerias/{id}")
    public Map<String,Object> perfil(@PathVariable UUID id) {
        access.require(id,false);
        var result=new LinkedHashMap<>(jdbc.queryForMap("select p.id,p.nome,p.edicao,p.cota_id,c.nome as cota,p.versao,p.criado_em from portal_parcerias p join portal_cotas c on c.id=p.cota_id where p.id=?",id));
        result.put("areas",jdbc.queryForList("select area,habilitada,recebimento_aberto,prazo from portal_areas where parceria_id=? order by area",id));
        result.put("beneficios",jdbc.queryForList("select id,natureza,tipo,setor,publico,quantidade,versao from portal_beneficios where parceria_id=? order by natureza,setor,tipo",id));
        if(access.isAdmin()) result.put("acessos",jdbc.queryForList("select u.id,u.nome,u.email,u.ativo from usuarios u join portal_acessos a on a.usuario_id=u.id where a.parceria_id=? order by u.nome",id));
        return result;
    }

    @PatchMapping("/api/parcerias/{id}")
    @Transactional
    public Map<String,Object> editar(@PathVariable UUID id,@Valid @RequestBody PerfilInput input) {
        access.require(id,true);
        if(input.cotaId()!=null && jdbc.queryForObject("select count(*) from portal_cotas where id=?",Integer.class,input.cotaId())!=1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cota não encontrada.");
        if(jdbc.update("update portal_parcerias set nome=?,cota_id=coalesce(?,cota_id),versao=versao+1 where id=? and versao=?",input.nome().trim(),input.cotaId(),id,input.versao())!=1) conflict();
        history.registrar(id,"perfil","PERFIL_ATUALIZADO","Dados da parceria atualizados; direitos contratados preservados.");
        return perfil(id);
    }

    @PatchMapping("/api/parcerias/{id}/acesso")
    @Transactional
    public Map<String,Object> acessos(@PathVariable UUID id,@Valid @RequestBody Acessos input) {
        access.require(id,true);
        jdbc.queryForMap("select id from portal_parcerias where id=? for update",id);
        jdbc.update("delete from portal_acessos where parceria_id=?",id);
        vincular(id,input.usuarioIds());
        history.registrar(id,"perfil","ACESSOS_ATUALIZADOS","Concessões de acesso atualizadas.");
        return perfil(id);
    }

    @PutMapping("/api/parcerias/{id}/areas")
    @Transactional
    public Map<String,Object> areas(@PathVariable UUID id,@Valid @RequestBody Capacidades input) {
        access.require(id,true); validateAreas(input.areas());
        jdbc.queryForMap("select id from portal_parcerias where id=? for update",id);
        for(String area:AREAS) jdbc.update("update portal_areas set habilitada=? where parceria_id=? and area=?",input.areas().contains(area),id,area);
        history.registrar(id,"perfil","DIREITOS_ATUALIZADOS","Capacidades da parceria atualizadas pela RBS.");
        return perfil(id);
    }

    @GetMapping("/api/admin/usuarios")
    public List<Map<String,Object>> usuarios(@RequestParam(defaultValue="") String busca) {
        admin();
        return jdbc.queryForList("select id,nome,email,role,ativo from usuarios where lower(nome) like ? or lower(email) like ? order by nome limit 100","%"+busca.toLowerCase(Locale.ROOT)+"%","%"+busca.toLowerCase(Locale.ROOT)+"%");
    }

    @PatchMapping("/api/parcerias/{id}/beneficios/{beneficioId}")
    @Transactional
    public Map<String,Object> limite(@PathVariable UUID id,@PathVariable UUID beneficioId,@Valid @RequestBody Limite input) {
        access.require(id,true);
        var rows=jdbc.queryForList("select * from portal_beneficios where id=? and parceria_id=? for update",beneficioId,id);
        if(rows.isEmpty()) throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Direito da parceria não encontrado.");
        var row=rows.getFirst();
        long utilizado="CORTESIA".equals(row.get("natureza"))
                ? jdbc.queryForObject("select coalesce(max(total),0) from (select sum(quantidade) as total from portal_cortesias where beneficio_id=? group by dia_evento) q",Long.class,beneficioId)
                : jdbc.queryForObject("select coalesce(sum(quantidade),0) from portal_credenciamento where beneficio_id=?",Long.class,beneficioId);
        if(input.quantidade()<utilizado) throw new ResponseStatusException(HttpStatus.CONFLICT,"O novo limite é menor que a quantidade já disponibilizada.");
        if(jdbc.update("update portal_beneficios set quantidade=?,versao=versao+1 where id=? and versao=?",input.quantidade(),beneficioId,input.versao())!=1) conflict();
        history.registrar(id,"perfil","LIMITE_CONTRATUAL_ATUALIZADO","Quantidade contratada atualizada de "+row.get("quantidade")+" para "+input.quantidade()+".");
        return perfil(id);
    }

    @PostMapping("/api/parcerias/{id}/beneficios")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Map<String,Object> incluirBeneficio(@PathVariable UUID id,@Valid @RequestBody Beneficio input) {
        access.requireArea(id,"CORTESIA".equals(input.natureza())?"cortesias":"credenciamento",true);
        if("CORTESIA".equals(input.natureza()) && (input.tipo().length()>20 || !input.publico().isEmpty())) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Cortesia deve ter tipo de até 20 caracteres e público vazio.");
        jdbc.update("insert into portal_beneficios(id,parceria_id,natureza,tipo,setor,publico,quantidade) values (?,?,?,?,?,?,?)",UUID.randomUUID(),id,input.natureza(),input.tipo().trim(),input.setor().trim(),input.publico().trim(),input.quantidade());
        history.registrar(id,"perfil","DIREITO_CONTRATUAL_INCLUIDO","Direito adicional da parceria registrado pela RBS.");
        return perfil(id);
    }

    @GetMapping("/api/admin/responsaveis")
    public List<Map<String,Object>> responsaveis() {
        admin(); return jdbc.queryForList("select id,nome,email from usuarios where role='ADMIN_RBS' and ativo=true order by nome");
    }

    @GetMapping("/api/parcerias/{id}/historico")
    public List<Map<String,Object>> historico(@PathVariable UUID id) {
        access.require(id,false);
        return jdbc.queryForList("select h.id,h.area,h.acao,h.descricao,h.criado_em,u.nome as autor from portal_historico h join usuarios u on u.id=h.usuario_id where h.parceria_id=? order by h.criado_em desc,h.id limit 100",id);
    }

    @GetMapping("/api/notificacoes")
    public List<Map<String,Object>> notificacoes() {
        return jdbc.queryForList("select h.id,h.parceria_id,h.area,h.acao,h.descricao,h.criado_em from portal_historico h where (? or exists(select 1 from portal_acessos a where a.parceria_id=h.parceria_id and a.usuario_id=?)) order by h.criado_em desc,h.id limit 50",access.isAdmin(),access.userId());
    }

    private void vincular(UUID id,Set<UUID> usuarios) {
        for(UUID usuario:usuarios) {
            Integer valid=jdbc.queryForObject("select count(*) from usuarios where id=? and role='ADMIN_PATROCINADOR'",Integer.class,usuario);
            if(valid==null || valid!=1) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Acesso deve corresponder a uma conta de patrocinador cadastrada pela RBS.");
            jdbc.update("insert into portal_acessos(parceria_id,usuario_id) values (?,?)",id,usuario);
        }
    }

    private void admin() { if(!access.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Acesso exclusivo da RBS."); }
    private void validateAreas(Set<String> areas) {
        if(!AREAS.containsAll(areas) || !areas.contains("perfil")) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Áreas inválidas; perfil é obrigatório.");
    }
    private void conflict() { throw new ResponseStatusException(HttpStatus.CONFLICT,"Registro alterado ou inexistente. Recarregue antes de salvar."); }
}
