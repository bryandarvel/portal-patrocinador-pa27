package com.rbs.portal_patrocinador.relatorio;

import com.rbs.portal_patrocinador.operacao.ArquivoService;
import com.rbs.portal_patrocinador.parceria.HistoricoService;
import com.rbs.portal_patrocinador.parceria.PortalAccess;
import java.time.Instant;
import java.util.*;
import org.springframework.http.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/parcerias/{parceriaId}/relatorio")
public class RelatorioController {
    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final ArquivoService files;
    private final HistoricoService history;
    public RelatorioController(JdbcTemplate jdbc,PortalAccess access,ArquivoService files,HistoricoService history) {
        this.jdbc=jdbc; this.access=access; this.files=files; this.history=history;
    }

    @GetMapping
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public Map<String,Object> gerar(@PathVariable UUID parceriaId) {
        access.require(parceriaId,false);
        var result=new LinkedHashMap<String,Object>();
        result.put("geradoEm",Instant.now());
        result.put("parceria",jdbc.queryForMap("select p.id,p.nome,p.edicao,c.nome as cota from portal_parcerias p join portal_cotas c on c.id=p.cota_id where p.id=?",parceriaId));
        result.put("entregas",jdbc.queryForList("select e.id,e.area,e.titulo,e.descricao,e.execucao,u.nome as responsavel from portal_entregas e left join usuarios u on u.id=e.responsavel_id join portal_areas a on a.parceria_id=e.parceria_id and a.area=e.area where e.parceria_id=? and (? or a.habilitada) order by e.titulo",parceriaId,access.isAdmin()));
        result.put("comprovacoes",jdbc.queryForList("select e.id as entrega_id,e.titulo as entrega,c.descricao,c.arquivo_id,c.criado_em,u.nome as autor from portal_comprovacoes c join portal_entregas e on e.id=c.entrega_id join usuarios u on u.id=c.criado_por join portal_areas a on a.parceria_id=e.parceria_id and a.area=e.area where e.parceria_id=? and (? or a.habilitada) order by c.criado_em",parceriaId,access.isAdmin()));
        result.put("veiculacoes",permitido(parceriaId,"midia")?jdbc.queryForList("select canal,descricao,url,veiculado_em from portal_midia_veiculacoes where parceria_id=? order by veiculado_em",parceriaId):List.of());
        result.put("perguntas",permitido(parceriaId,"pesquisa")?jdbc.queryForList("select q.ordem,q.pergunta from portal_pesquisa_perguntas q join portal_pesquisa_versoes v on v.id=q.versao_id where v.parceria_id=? and v.versao=(select max(versao) from portal_pesquisa_versoes where parceria_id=?) order by q.ordem",parceriaId,parceriaId):List.of());
        result.put("arquivos",jdbc.queryForList("select f.id,f.area,f.tipo,f.nome,f.tamanho,f.versao,f.criado_em from portal_arquivos f join portal_areas a on a.parceria_id=f.parceria_id and a.area=f.area where f.parceria_id=? and f.interno=false and (? or a.habilitada) order by f.area,f.tipo,f.versao desc",parceriaId,access.isAdmin()));
        result.put("cortesias",permitido(parceriaId,"cortesias")?jdbc.queryForList("select c.quantidade,c.tipo,c.setor,c.dia_evento,c.periodo_inicio,c.periodo_fim,coalesce((select sum(d.quantidade) from portal_cortesias_destinacoes d where d.cortesia_id=c.id),0) as destinadas from portal_cortesias c where c.parceria_id=? order by c.setor,c.tipo",parceriaId):List.of());
        result.put("credenciamento",permitido(parceriaId,"credenciamento")?jdbc.queryForList("select setor,tipo,publico,quantidade from portal_credenciamento where parceria_id=? order by setor,publico",parceriaId):List.of());
        result.put("relatoriosPublicados",files.listar(parceriaId,"perfil","relatorio").stream().map(f->Map.of("id",f.id(),"nome",f.nome(),"versao",f.versao(),"criado_em",f.criadoEm())).toList());
        return result;
    }

    @GetMapping(value="/exportar",produces="text/html;charset=UTF-8")
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ResponseEntity<String> exportar(@PathVariable UUID parceriaId) {
        var report=gerar(parceriaId);
        StringBuilder html=new StringBuilder("<!doctype html><html lang=\"pt-BR\"><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width\"><title>Relatório da parceria</title><style>body{font:16px/1.5 system-ui,sans-serif;max-width:1000px;margin:40px auto;padding:0 24px;color:#222}h1,h2{line-height:1.2}table{border-collapse:collapse;width:100%;margin:16px 0 32px}td,th{border:1px solid #ccc;padding:8px;text-align:left;overflow-wrap:anywhere}th{background:#eee}@media print{body{margin:0}table{font-size:11px}tr{break-inside:avoid}}</style><h1>Relatório da parceria</h1><p>Consolidação automática dos registros do portal. Gerado em ");
        html.append(escape(report.get("geradoEm"))).append(".</p>");
        Map<String,String> labels=Map.of("parceria","Dados da parceria","entregas","Entregas","comprovacoes","Comprovações","veiculacoes","Veiculações","perguntas","Perguntas da pesquisa","arquivos","Arquivos e resultados publicados","cortesias","Cortesias","credenciamento","Credenciamento","relatoriosPublicados","Relatórios complementares publicados");
        for(String key:List.of("parceria","entregas","comprovacoes","veiculacoes","perguntas","cortesias","credenciamento","arquivos","relatoriosPublicados")) {
            html.append("<h2>").append(labels.get(key)).append("</h2>");
            Object value=report.get(key);
            if(value instanceof Map<?,?> map) renderRows(html,List.of(map));
            else if(value instanceof List<?> list) renderRows(html,list);
        }
        html.append("<p>Os arquivos relacionados permanecem disponíveis no portal conforme a permissão de acesso. Quantidades e resultados representam os registros cadastrados; ausência de dados não significa resultado zero.</p></html>");
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION,"attachment; filename=relatorio-parceria.html")
                .header("X-Content-Type-Options","nosniff").header(HttpHeaders.CACHE_CONTROL,"no-store")
                .header("Content-Security-Policy","default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'").body(html.toString());
    }

    @PostMapping("/publicacoes")
    @ResponseStatus(HttpStatus.CREATED)
    @Transactional
    public Object publicar(@PathVariable UUID parceriaId,@RequestParam MultipartFile arquivo) {
        access.require(parceriaId,true);
        var file=files.salvar(parceriaId,arquivo,"perfil","relatorio",false);
        history.registrar(parceriaId,"perfil","RELATORIO_PUBLICADO","Relatório complementar disponibilizado pela RBS.");
        return file;
    }

    private boolean permitido(UUID id,String area) {
        return access.isAdmin() || Boolean.TRUE.equals(jdbc.queryForObject("select habilitada from portal_areas where parceria_id=? and area=?",Boolean.class,id,area));
    }
    private static void renderRows(StringBuilder html,List<?> list) {
        if(list.isEmpty()) { html.append("<p>Nenhum registro disponível.</p>"); return; }
        html.append("<table><tbody>");
        for(Object value:list) {
            if(!(value instanceof Map<?,?> row)) continue;
            html.append("<tr><td><dl>");
            row.forEach((key,item)->html.append("<dt><strong>").append(escape(key)).append("</strong></dt><dd>").append(escape(item)).append("</dd>"));
            html.append("</dl></td></tr>");
        }
        html.append("</tbody></table>");
    }
    private static String escape(Object value) {
        return value==null?"Não informado":value.toString().replace("&","&amp;").replace("<","&lt;").replace(">","&gt;").replace("\"","&quot;").replace("'","&#39;");
    }
}
