package com.rbs.portal_patrocinador.operacao;

import com.rbs.portal_patrocinador.parceria.HistoricoService;
import com.rbs.portal_patrocinador.parceria.PortalAccess;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

import java.net.URI;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class OperacaoService {
    private final JdbcTemplate jdbc;
    private final PortalAccess access;
    private final HistoricoService historico;
    private final ArquivoService arquivos;

    public OperacaoService(JdbcTemplate jdbc, PortalAccess access, HistoricoService historico, ArquivoService arquivos) {
        this.jdbc = jdbc;
        this.access = access;
        this.historico = historico;
        this.arquivos = arquivos;
    }

    public MarcaView marca(UUID parceriaId) {
        access.requireArea(parceriaId, "marca", false);
        return new MarcaView(arquivos.listar(parceriaId, "marca", "miv"),
                jdbc.query("select id, arquivo_id, versao, criado_por, criado_em from portal_miv_versoes where parceria_id = ? order by versao desc",
                        (rs, n) -> new VersaoArquivo(rs.getObject("id", UUID.class), rs.getObject("arquivo_id", UUID.class), rs.getInt("versao"), rs.getObject("criado_por", UUID.class), instante(rs, "criado_em")), parceriaId),
                publicacoes(parceriaId, "marca"), recebimento(parceriaId, "marca"));
    }

    @Transactional
    public VersaoArquivo enviarMiv(UUID parceriaId, MultipartFile arquivo) {
        validarRecebimento(parceriaId, "marca");
        ArquivoView salvo = arquivos.salvar(parceriaId, arquivo, "marca", "miv", false);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into portal_miv_versoes(id, parceria_id, arquivo_id, versao, criado_por) values (?, ?, ?, ?, ?)", id, parceriaId, salvo.id(), salvo.versao(), access.userId());
        historico.registrar(parceriaId, "marca", "miv_enviado", "Nova versão de material de marca enviada.");
        return new VersaoArquivo(id, salvo.id(), salvo.versao(), access.userId(), Instant.now());
    }

    @Transactional
    public Recebimento receberMarca(UUID parceriaId, boolean aberto, Instant prazo) {
        access.require(parceriaId, true);
        return alterarRecebimento(parceriaId, "marca", aberto, prazo);
    }

    @Transactional
    public Publicacao publicarMarca(UUID parceriaId, PublicacaoRequest request, MultipartFile arquivo) {
        access.requireArea(parceriaId, "marca", true);
        return publicar(parceriaId, "marca", "marca_publicacao", request, arquivo);
    }

    public MidiaView midia(UUID parceriaId) {
        access.requireArea(parceriaId, "midia", false);
        Briefing briefing = jdbc.query("select texto, versao, atualizado_por, atualizado_em from portal_midia_briefing where parceria_id = ?",
                rs -> rs.next() ? new Briefing(rs.getString(1), rs.getInt(2), rs.getObject(3, UUID.class), instante(rs, "atualizado_em")) : null, parceriaId);
        return new MidiaView(arquivos.listar(parceriaId, "midia", "material"),
                jdbc.query("select id, arquivo_id, texto, versao, criado_por, criado_em from portal_midia_versoes where parceria_id = ? order by versao desc",
                        (rs, n) -> new VersaoMidia(rs.getObject("id", UUID.class), rs.getObject("arquivo_id", UUID.class), rs.getString("texto"), rs.getInt("versao"), rs.getObject("criado_por", UUID.class), instante(rs, "criado_em")), parceriaId),
                briefing,
                veiculacoes(parceriaId),
                revisoesVeiculacoes(parceriaId),
                jdbc.query("select versao from portal_midia_veiculacoes_revisoes where parceria_id=?", rs -> rs.next() ? rs.getInt(1) : 0, parceriaId),
                publicacoes(parceriaId, "midia"), recebimento(parceriaId, "midia"));
    }

    @Transactional
    public VersaoMidia enviarMidia(UUID parceriaId, String texto, MultipartFile arquivo) {
        validarRecebimento(parceriaId, "midia");
        if ((arquivo == null || arquivo.isEmpty()) && (texto == null || texto.isBlank())) throw bad("Informe um arquivo ou texto.");
        ArquivoView salvo = arquivo == null || arquivo.isEmpty() ? null : arquivos.salvar(parceriaId, arquivo, "midia", "material", false);
        int versao = jdbc.queryForObject("select coalesce(max(versao), 0) + 1 from portal_midia_versoes where parceria_id = ?", Integer.class, parceriaId);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into portal_midia_versoes(id, parceria_id, arquivo_id, texto, versao, criado_por) values (?, ?, ?, ?, ?, ?)", id, parceriaId, salvo == null ? null : salvo.id(), texto == null || texto.isBlank() ? null : texto.trim(), versao, access.userId());
        historico.registrar(parceriaId, "midia", "material_enviado", "Novo material de mídia enviado.");
        return new VersaoMidia(id, salvo == null ? null : salvo.id(), texto, versao, access.userId(), Instant.now());
    }

    @Transactional
    public Briefing salvarBriefing(UUID parceriaId, String texto) {
        validarRecebimento(parceriaId, "midia");
        int versao = jdbc.queryForObject("select coalesce(max(versao), 0) + 1 from portal_midia_briefing where parceria_id = ?", Integer.class, parceriaId);
        jdbc.update("insert into portal_midia_briefing(parceria_id, texto, versao, atualizado_por, atualizado_em) values (?, ?, ?, ?, now()) on conflict(parceria_id) do update set texto=excluded.texto, versao=portal_midia_briefing.versao+1, atualizado_por=excluded.atualizado_por, atualizado_em=now()", parceriaId, texto.trim(), Math.max(1, versao), access.userId());
        historico.registrar(parceriaId, "midia", "briefing_atualizado", "Briefing de mídia atualizado.");
        return jdbc.queryForObject("select texto, versao, atualizado_por, atualizado_em from portal_midia_briefing where parceria_id = ?", (rs, n) -> new Briefing(rs.getString(1), rs.getInt(2), rs.getObject(3, UUID.class), instante(rs, "atualizado_em")), parceriaId);
    }

    @Transactional
    public Recebimento receberMidia(UUID parceriaId, boolean aberto, Instant prazo) {
        access.require(parceriaId, true);
        return alterarRecebimento(parceriaId, "midia", aberto, prazo);
    }

    @Transactional
    public VeiculacoesView atualizarVeiculacoes(UUID parceriaId, VeiculacoesRequest request) {
        access.requireArea(parceriaId, "midia", true);
        jdbc.update("insert into portal_midia_veiculacoes_revisoes(parceria_id,versao,atualizado_por) values(?,0,?) on conflict(parceria_id) do nothing", parceriaId, access.userId());
        Integer atual = jdbc.query("select versao from portal_midia_veiculacoes_revisoes where parceria_id=? for update", rs -> rs.next() ? rs.getInt(1) : null, parceriaId);
        if (atual == null) throw notFound("Coleção de veiculações não encontrada.");
        if (!atual.equals(request.versao())) throw new ResponseStatusException(HttpStatus.CONFLICT, "As veiculações foram alteradas por outra operação.");
        salvarHistoricoVeiculacoes(parceriaId, atual);
        jdbc.update("delete from portal_midia_veiculacoes where parceria_id = ?", parceriaId);
        for (VeiculacaoRequest item : request.itens()) jdbc.update("insert into portal_midia_veiculacoes(id, parceria_id, canal, descricao, url, veiculado_em, criado_por) values (?, ?, ?, ?, ?, ?, ?)", UUID.randomUUID(), parceriaId, item.canal().trim(), item.descricao().trim(), seguroUrl(item.url()), sqlTimestamp(item.veiculadoEm()), access.userId());
        jdbc.update("update portal_midia_veiculacoes_revisoes set versao=versao+1,atualizado_por=?,atualizado_em=now() where parceria_id=?", access.userId(), parceriaId);
        historico.registrar(parceriaId, "midia", "veiculacoes_atualizadas", "Veiculações de mídia atualizadas.");
        return new VeiculacoesView(atual + 1, veiculacoes(parceriaId));
    }

    @Transactional
    public Publicacao publicarMidia(UUID parceriaId, PublicacaoRequest request, MultipartFile arquivo) {
        access.requireArea(parceriaId, "midia", true);
        return publicar(parceriaId, "midia", "midia_publicacao", request, arquivo);
    }

    public List<CortesiaView> cortesias(UUID parceriaId) {
        access.requireArea(parceriaId, "cortesias", false);
        return jdbc.query("select c.id,c.quantidade,c.tipo,c.setor,c.periodo_inicio,c.periodo_fim,c.dia_evento,c.versao,c.beneficio_id,coalesce(sum(d.quantidade),0) as destinadas from portal_cortesias c left join portal_cortesias_destinacoes d on d.cortesia_id=c.id where c.parceria_id=? group by c.id order by c.setor,c.tipo", (rs, n) -> new CortesiaView(rs.getObject("id", UUID.class), rs.getInt("quantidade"), rs.getString("tipo"), rs.getString("setor"), localDate(rs,"periodo_inicio"), localDate(rs,"periodo_fim"), localDate(rs,"dia_evento"), rs.getInt("versao"), rs.getInt("destinadas"), rs.getObject("beneficio_id",UUID.class), destinacoes(rs.getObject("id", UUID.class))), parceriaId);
    }

    @Transactional
    public CortesiaView criarCortesia(UUID parceriaId, CortesiaRequest r) {
        access.requireArea(parceriaId, "cortesias", true);
        validarCortesia(r);
        validarDireitoCortesia(parceriaId,r,null);
        UUID id = UUID.randomUUID();
        jdbc.update("insert into portal_cortesias(id,parceria_id,quantidade,tipo,setor,periodo_inicio,periodo_fim,dia_evento,beneficio_id,criado_por) values(?,?,?,?,?,?,?,?,?,?)", id,parceriaId,r.quantidade(),r.tipo(),r.setor().trim(),r.periodoInicio(),r.periodoFim(),r.diaEvento(),r.beneficioId(),access.userId());
        historico.registrar(parceriaId,"cortesias","cortesia_criada","Quantidade de cortesias atualizada.");
        return cortesias(parceriaId).stream().filter(c -> c.id().equals(id)).findFirst().orElseThrow();
    }

    @Transactional
    public CortesiaView editarCortesia(UUID parceriaId, UUID id, CortesiaRequest r) {
        access.requireArea(parceriaId, "cortesias", true);
        validarCortesia(r);
        if(r.versao()==null) throw bad("Informe a versão atual da cortesia.");
        validarDireitoCortesia(parceriaId,r,id);
        int changed = jdbc.update("update portal_cortesias set quantidade=?,tipo=?,setor=?,periodo_inicio=?,periodo_fim=?,dia_evento=?,beneficio_id=?,versao=versao+1 where id=? and parceria_id=? and versao=?", r.quantidade(),r.tipo(),r.setor().trim(),r.periodoInicio(),r.periodoFim(),r.diaEvento(),r.beneficioId(),id,parceriaId,r.versao());
        if (changed == 0) {
            Integer exists = jdbc.query("select versao from portal_cortesias where id=? and parceria_id=?", rs -> rs.next() ? rs.getInt(1) : null, id, parceriaId);
            if (exists == null) throw notFound("Cortesia não encontrada.");
            throw new ResponseStatusException(HttpStatus.CONFLICT,"A cortesia foi atualizada por outra operação.");
        }
        int allocated = jdbc.queryForObject("select coalesce(sum(quantidade),0) from portal_cortesias_destinacoes where cortesia_id=?", Integer.class, id);
        if (allocated > r.quantidade()) throw bad("A nova quantidade é menor que o total já destinado.");
        historico.registrar(parceriaId,"cortesias","cortesia_atualizada","Quantidade de cortesias atualizada.");
        return cortesias(parceriaId).stream().filter(c -> c.id().equals(id)).findFirst().orElseThrow();
    }

    @Transactional
    public Destinacao destinar(UUID parceriaId, UUID cortesiaId, DestinacaoRequest r) {
        access.requireArea(parceriaId, "cortesias", false);
        Integer limite = jdbc.query("select quantidade from portal_cortesias where id=? and parceria_id=? for update", rs -> rs.next() ? rs.getInt(1) : null, cortesiaId, parceriaId);
        if (limite == null) throw notFound("Cortesia não encontrada.");
        Integer usado = jdbc.queryForObject("select coalesce(sum(quantidade),0) from portal_cortesias_destinacoes where cortesia_id=?", Integer.class, cortesiaId);
        if ((long) r.quantidade() + usado > limite) throw new ResponseStatusException(HttpStatus.CONFLICT,"A destinação excede a quantidade disponível.");
        UUID id = UUID.randomUUID();
        jdbc.update("insert into portal_cortesias_destinacoes(id,cortesia_id,quantidade,destinacao,criado_por) values(?,?,?,?,?)", id,cortesiaId,r.quantidade(),r.destinacao().trim(),access.userId());
        historico.registrar(parceriaId,"cortesias","cortesia_destinada","Uma quantidade de cortesias foi destinada.");
        return new Destinacao(id,r.quantidade(),r.destinacao().trim(),access.userId(),Instant.now());
    }

    public CredenciamentoView credenciamento(UUID parceriaId) {
        access.requireArea(parceriaId,"credenciamento",false);
        String url=jdbc.query("select url from portal_credenciamento_links where parceria_id=?", rs -> rs.next()?rs.getString(1):null, parceriaId);
        Integer versao=jdbc.query("select versao from portal_credenciamento_revisoes where parceria_id=?",rs->rs.next()?rs.getInt(1):0,parceriaId);
        return new CredenciamentoView(url,versao,jdbc.query("select setor,tipo,publico,quantidade,beneficio_id from portal_credenciamento where parceria_id=? order by setor,tipo,publico",(rs,n)->new Credencial(rs.getString(1),rs.getString(2),rs.getString(3),rs.getInt(4),rs.getObject(5,UUID.class)),parceriaId),historicoCredenciamento(parceriaId));
    }

    @Transactional
    public CredenciamentoView atualizarCredenciamento(UUID parceriaId, CredenciamentoRequest r) {
        access.requireArea(parceriaId,"credenciamento",true);
        String url=seguroUrl(r.urlOpenStaff());
        validarDireitosCredenciamento(parceriaId,r.itens());
        jdbc.update("insert into portal_credenciamento_revisoes(parceria_id,versao,atualizado_por) values(?,0,?) on conflict(parceria_id) do nothing",parceriaId,access.userId());
        Integer atual=jdbc.query("select versao from portal_credenciamento_revisoes where parceria_id=? for update",rs->rs.next()?rs.getInt(1):null,parceriaId);
        if(atual==null) throw notFound("Coleção de credenciamento não encontrada.");
        if(!atual.equals(r.versao())) throw new ResponseStatusException(HttpStatus.CONFLICT,"O credenciamento foi atualizado por outra operação.");
        salvarHistoricoCredenciamento(parceriaId,atual);
        jdbc.update("delete from portal_credenciamento where parceria_id=?",parceriaId);
        for(Credencial c:r.itens()) jdbc.update("insert into portal_credenciamento(parceria_id,setor,tipo,publico,quantidade,criado_por,beneficio_id) values(?,?,?,?,?,?,?)",parceriaId,c.setor().trim(),c.tipo().trim(),c.publico().trim(),c.quantidade(),access.userId(),c.beneficioId());
        jdbc.update("insert into portal_credenciamento_links(parceria_id,url,atualizado_por) values(?,?,?) on conflict(parceria_id) do update set url=excluded.url,atualizado_por=excluded.atualizado_por,atualizado_em=now()",parceriaId,url,access.userId());
        jdbc.update("update portal_credenciamento_revisoes set versao=versao+1,atualizado_por=?,atualizado_em=now() where parceria_id=?",access.userId(),parceriaId);
        historico.registrar(parceriaId,"credenciamento","credenciamento_atualizado","Tabela de credenciamento atualizada.");
        return credenciamento(parceriaId);
    }

    public PesquisaView pesquisa(UUID parceriaId) {
        access.requireArea(parceriaId,"pesquisa",false);
        return new PesquisaView(recebimento(parceriaId,"pesquisa"),jdbc.query("select v.id,v.versao,v.criado_por,v.criado_em from portal_pesquisa_versoes v where v.parceria_id=? order by v.versao desc",(rs,n)->new PesquisaVersao(rs.getObject(1,UUID.class),rs.getInt(2),rs.getObject(3,UUID.class),instante(rs,"criado_em"),jdbc.query("select pergunta from portal_pesquisa_perguntas where versao_id=? order by ordem",(q,k)->q.getString(1),rs.getObject(1,UUID.class))),parceriaId),arquivos.listar(parceriaId,"pesquisa","resultados"));
    }

    @Transactional
    public PesquisaVersao salvarPerguntas(UUID parceriaId, List<String> perguntas) {
        access.requireArea(parceriaId,"pesquisa",false);
        if(access.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN,"Somente o patrocinador pode enviar perguntas.");
        validarRecebimento(parceriaId,"pesquisa");
        if(perguntas==null||perguntas.isEmpty()||perguntas.size()>3) throw bad("Informe de uma a três perguntas.");
        int versao=jdbc.queryForObject("select coalesce(max(versao),0)+1 from portal_pesquisa_versoes where parceria_id=?",Integer.class,parceriaId);
        UUID id=UUID.randomUUID();
        jdbc.update("insert into portal_pesquisa_versoes(id,parceria_id,versao,criado_por) values(?,?,?,?)",id,parceriaId,versao,access.userId());
        for(int i=0;i<perguntas.size();i++) jdbc.update("insert into portal_pesquisa_perguntas(id,versao_id,ordem,pergunta) values(?,?,?,?)",UUID.randomUUID(),id,i+1,perguntas.get(i).trim());
        historico.registrar(parceriaId,"pesquisa","perguntas_enviadas","Perguntas de pesquisa atualizadas.");
        return new PesquisaVersao(id,versao,access.userId(),Instant.now(),perguntas);
    }

    @Transactional
    public Recebimento receberPesquisa(UUID parceriaId,boolean aberto,Instant prazo){
        access.require(parceriaId,true);
        return alterarRecebimento(parceriaId,"pesquisa",aberto,prazo);
    }

    @Transactional
    public ArquivoView publicarResultados(UUID parceriaId,MultipartFile arquivo){
        access.requireArea(parceriaId,"pesquisa",true);
        ArquivoView salvo=arquivos.salvar(parceriaId,arquivo,"pesquisa","resultados",false);
        historico.registrar(parceriaId,"pesquisa","resultados_publicados","Resultados da pesquisa publicados.");
        return salvo;
    }

    public List<Faq> faq(UUID parceriaId,String busca,String categoria){
        access.requireArea(parceriaId,"perfil",false);
        return jdbc.query("select id,categoria,pergunta,resposta,versao,atualizado_por,atualizado_em from portal_faq where parceria_id=? and (cast(? as text) is null or categoria=?) and (cast(? as text) is null or lower(pergunta) like lower(?) or lower(resposta) like lower(?)) order by categoria,pergunta",(rs,n)->new Faq(rs.getObject("id",UUID.class),rs.getString("categoria"),rs.getString("pergunta"),rs.getString("resposta"),rs.getInt("versao"),rs.getObject("atualizado_por",UUID.class),instante(rs,"atualizado_em")),parceriaId,categoria,categoria,blankNull(busca),like(busca),like(busca));
    }

    @Transactional
    public Faq criarFaq(UUID parceriaId,FaqRequest r){
        access.requireArea(parceriaId,"perfil",true);
        UUID id=UUID.randomUUID();
        jdbc.update("insert into portal_faq(id,parceria_id,categoria,pergunta,resposta,atualizado_por) values(?,?,?,?,?,?)",id,parceriaId,r.categoria().trim(),r.pergunta().trim(),r.resposta().trim(),access.userId());
        historico.registrar(parceriaId,"perfil","faq_criado","FAQ atualizada.");
        return faq(parceriaId,null,null).stream().filter(x->x.id().equals(id)).findFirst().orElseThrow();
    }

    @Transactional
    public Faq editarFaq(UUID parceriaId,UUID id,FaqRequest r){
        access.requireArea(parceriaId,"perfil",true);
        if(r.versao()==null) throw bad("Informe a versão atual da FAQ.");
        int changed=jdbc.update("update portal_faq set categoria=?,pergunta=?,resposta=?,versao=versao+1,atualizado_por=?,atualizado_em=now() where id=? and parceria_id=? and versao=?",r.categoria().trim(),r.pergunta().trim(),r.resposta().trim(),access.userId(),id,parceriaId,r.versao());
        if(changed==0){ Integer exists=jdbc.query("select versao from portal_faq where id=? and parceria_id=?",rs->rs.next()?rs.getInt(1):null,id,parceriaId); if(exists==null) throw notFound("FAQ não encontrada."); throw new ResponseStatusException(HttpStatus.CONFLICT,"A FAQ foi atualizada por outra operação."); }
        historico.registrar(parceriaId,"perfil","faq_atualizado","FAQ atualizada.");
        return faq(parceriaId,null,null).stream().filter(x->x.id().equals(id)).findFirst().orElseThrow();
    }

    public List<ArquivoView> planilhas(UUID parceriaId){ access.requireArea(parceriaId,"perfil",true); return arquivos.listar(parceriaId,"perfil","planilha"); }
    @Transactional public ArquivoView salvarPlanilha(UUID parceriaId,MultipartFile arquivo){ access.requireArea(parceriaId,"perfil",true); ArquivoView v=arquivos.salvar(parceriaId,arquivo,"perfil","planilha",true); historico.registrar(parceriaId,"perfil","planilha_enviada","Planilha de origem armazenada."); return v; }
    public List<ArquivoView> documentos(UUID parceriaId){ access.requireArea(parceriaId,"perfil",false); return arquivos.listar(parceriaId,"perfil","documento_comercial"); }
    @Transactional public ArquivoView salvarDocumento(UUID parceriaId,MultipartFile arquivo){ access.requireArea(parceriaId,"perfil",true); ArquivoView v=arquivos.salvar(parceriaId,arquivo,"perfil","documento_comercial",false); historico.registrar(parceriaId,"perfil","documento_publicado","Documento comercial publicado pela RBS."); return v; }

    private Publicacao publicar(UUID parceriaId,String area,String tipo,PublicacaoRequest r,MultipartFile arquivo){
        String url=seguroUrl(r.url());
        ArquivoView salvo=arquivo==null||arquivo.isEmpty()?null:arquivos.salvar(parceriaId,arquivo,area,tipo,false);
        if(salvo==null&&url==null&&(r.texto()==null||r.texto().isBlank())) throw bad("Informe arquivo, link ou texto.");
        UUID id=UUID.randomUUID();
        jdbc.update("insert into portal_operacao_publicacoes(id,parceria_id,area,tipo,arquivo_id,url,titulo,texto,criado_por) values(?,?,?,?,?,?,?,?,?)",id,parceriaId,area,tipo,salvo==null?null:salvo.id(),url,r.titulo().trim(),r.texto(),access.userId());
        historico.registrar(parceriaId,area,"publicacao_criada","Novo conteúdo publicado pela RBS.");
        return new Publicacao(id,tipo,salvo==null?null:salvo.id(),url,r.titulo().trim(),r.texto(),access.userId(),Instant.now());
    }

    private List<Publicacao> publicacoes(UUID parceriaId,String area){ return jdbc.query("select id,tipo,arquivo_id,url,titulo,texto,criado_por,criado_em from portal_operacao_publicacoes where parceria_id=? and area=? order by criado_em desc",(rs,n)->new Publicacao(rs.getObject("id",UUID.class),rs.getString("tipo"),rs.getObject("arquivo_id",UUID.class),rs.getString("url"),rs.getString("titulo"),rs.getString("texto"),rs.getObject("criado_por",UUID.class),instante(rs,"criado_em")),parceriaId,area); }
    private List<Veiculacao> veiculacoes(UUID parceriaId){ return jdbc.query("select id,canal,descricao,url,veiculado_em,criado_por,criado_em from portal_midia_veiculacoes where parceria_id=? order by criado_em desc",(rs,n)->new Veiculacao(rs.getObject("id",UUID.class),rs.getString("canal"),rs.getString("descricao"),rs.getString("url"),instanteNullable(rs,"veiculado_em"),rs.getObject("criado_por",UUID.class),instante(rs,"criado_em")),parceriaId); }
    private void salvarHistoricoVeiculacoes(UUID parceriaId,int versao){
        List<Veiculacao> atuais=veiculacoes(parceriaId);
        UUID autor=access.userId();
        if(atuais.isEmpty()){
            jdbc.update("insert into portal_midia_veiculacoes_historico(parceria_id,versao,ordem,snapshot_por) values(?,?,0,?)",parceriaId,versao,autor);
            return;
        }
        for(int i=0;i<atuais.size();i++){
            Veiculacao v=atuais.get(i);
            jdbc.update("insert into portal_midia_veiculacoes_historico(parceria_id,versao,ordem,item_id,canal,descricao,url,veiculado_em,item_criado_por,item_criado_em,snapshot_por) values(?,?,?,?,?,?,?,?,?,?,?)",parceriaId,versao,i,v.id(),v.canal(),v.descricao(),v.url(),sqlTimestamp(v.veiculadoEm()),v.criadoPor(),sqlTimestamp(v.criadoEm()),autor);
        }
    }
    private List<VeiculacoesHistorico> revisoesVeiculacoes(UUID parceriaId){
        List<HistoricoVeiculacaoItem> rows=jdbc.query("select versao,ordem,item_id,canal,descricao,url,veiculado_em,item_criado_por,item_criado_em,snapshot_por,snapshot_em from portal_midia_veiculacoes_historico where parceria_id=? order by versao desc,ordem",(rs,n)->new HistoricoVeiculacaoItem(rs.getInt("versao"),rs.getObject("item_id",UUID.class),rs.getString("canal"),rs.getString("descricao"),rs.getString("url"),instanteNullable(rs,"veiculado_em"),rs.getObject("item_criado_por",UUID.class),instanteNullable(rs,"item_criado_em"),rs.getObject("snapshot_por",UUID.class),instante(rs,"snapshot_em")),parceriaId);
        Map<Integer,List<Veiculacao>> itens=new LinkedHashMap<>();
        Map<Integer,UUID> autores=new LinkedHashMap<>();
        Map<Integer,Instant> datas=new LinkedHashMap<>();
        for(HistoricoVeiculacaoItem row:rows){
            itens.computeIfAbsent(row.versao(),k->new ArrayList<>());
            autores.putIfAbsent(row.versao(),row.snapshotPor()); datas.putIfAbsent(row.versao(),row.snapshotEm());
            if(row.id()!=null) itens.get(row.versao()).add(new Veiculacao(row.id(),row.canal(),row.descricao(),row.url(),row.veiculadoEm(),row.criadoPor(),row.criadoEm()));
        }
        return itens.entrySet().stream().map(e->new VeiculacoesHistorico(e.getKey(),e.getValue(),autores.get(e.getKey()),datas.get(e.getKey()))).toList();
    }
    private void salvarHistoricoCredenciamento(UUID parceriaId,int versao){
        List<Credencial> itens=jdbc.query("select setor,tipo,publico,quantidade,beneficio_id from portal_credenciamento where parceria_id=? order by setor,tipo,publico",(rs,n)->new Credencial(rs.getString(1),rs.getString(2),rs.getString(3),rs.getInt(4),rs.getObject(5,UUID.class)),parceriaId);
        String url=jdbc.query("select url from portal_credenciamento_links where parceria_id=?",rs->rs.next()?rs.getString(1):null,parceriaId);
        UUID autor=access.userId();
        if(itens.isEmpty()){
            jdbc.update("insert into portal_credenciamento_historico(parceria_id,versao,ordem,url_open_staff,snapshot_por) values(?,?,0,?,?)",parceriaId,versao,url,autor);
            return;
        }
        for(int i=0;i<itens.size();i++){
            Credencial c=itens.get(i);
            jdbc.update("insert into portal_credenciamento_historico(parceria_id,versao,ordem,setor,tipo,publico,beneficio_id,quantidade,url_open_staff,snapshot_por) values(?,?,?,?,?,?,?,?,?,?)",parceriaId,versao,i,c.setor(),c.tipo(),c.publico(),c.beneficioId(),c.quantidade(),url,autor);
        }
    }
    private List<CredenciamentoHistorico> historicoCredenciamento(UUID parceriaId){
        List<HistoricoCredencialItem> rows=jdbc.query("select versao,ordem,setor,tipo,publico,beneficio_id,quantidade,url_open_staff,snapshot_por,snapshot_em from portal_credenciamento_historico where parceria_id=? order by versao desc,ordem",(rs,n)->new HistoricoCredencialItem(rs.getInt("versao"),rs.getString("setor"),rs.getString("tipo"),rs.getString("publico"),rs.getObject("beneficio_id",UUID.class),rs.getObject("quantidade",Integer.class),rs.getString("url_open_staff"),rs.getObject("snapshot_por",UUID.class),instante(rs,"snapshot_em")),parceriaId);
        Map<Integer,List<Credencial>> itens=new LinkedHashMap<>(); Map<Integer,String> urls=new LinkedHashMap<>(); Map<Integer,UUID> autores=new LinkedHashMap<>(); Map<Integer,Instant> datas=new LinkedHashMap<>();
        for(HistoricoCredencialItem row:rows){
            itens.computeIfAbsent(row.versao(),k->new ArrayList<>()); urls.putIfAbsent(row.versao(),row.url()); autores.putIfAbsent(row.versao(),row.snapshotPor()); datas.putIfAbsent(row.versao(),row.snapshotEm());
            if(row.setor()!=null) itens.get(row.versao()).add(new Credencial(row.setor(),row.tipo(),row.publico(),row.quantidade(),row.beneficioId()));
        }
        return itens.entrySet().stream().map(e->new CredenciamentoHistorico(e.getKey(),urls.get(e.getKey()),e.getValue(),autores.get(e.getKey()),datas.get(e.getKey()))).toList();
    }
    private List<Destinacao> destinacoes(UUID id){ return jdbc.query("select id,quantidade,destinacao,criado_por,criado_em from portal_cortesias_destinacoes where cortesia_id=? order by criado_em",(rs,n)->new Destinacao(rs.getObject(1,UUID.class),rs.getInt(2),rs.getString(3),rs.getObject(4,UUID.class),instante(rs,"criado_em")),id); }
    private Recebimento recebimento(UUID parceriaId,String area){ return jdbc.query("select recebimento_aberto,prazo from portal_areas where parceria_id=? and area=?",rs->rs.next()?new Recebimento(rs.getBoolean(1),instanteNullable(rs,"prazo")):new Recebimento(false,null),parceriaId,area); }
    private Recebimento alterarRecebimento(UUID parceriaId,String area,boolean aberto,Instant prazo){
        if(aberto&&prazo!=null&&!prazo.isAfter(Instant.now())) throw bad("O prazo deve estar no futuro ao abrir o recebimento.");
        int changed=jdbc.update("update portal_areas set recebimento_aberto=?,prazo=? where parceria_id=? and area=?",aberto,sqlTimestamp(prazo),parceriaId,area);
        if(changed==0) throw notFound("Área não configurada para esta parceria.");
        historico.registrar(parceriaId,area,"recebimento_alterado",aberto?"Recebimento aberto pela RBS.":"Recebimento encerrado pela RBS.");
        return new Recebimento(aberto,prazo);
    }
    private void validarRecebimento(UUID parceriaId,String area){
        access.requireArea(parceriaId,area,false);
        Recebimento state=jdbc.query("select recebimento_aberto,prazo from portal_areas where parceria_id=? and area=? for update",rs->rs.next()?new Recebimento(rs.getBoolean(1),instanteNullable(rs,"prazo")):null,parceriaId,area);
        if(state==null) throw notFound("Área não configurada para esta parceria.");
        if(!state.aberto()||(state.prazo()!=null&&state.prazo().isBefore(Instant.now()))) throw new ResponseStatusException(HttpStatus.CONFLICT,"O recebimento está encerrado.");
    }
    private static String seguroUrl(String value){
        if(value==null||value.isBlank()) return null;
        try { URI uri=URI.create(value.trim()); if(!("https".equalsIgnoreCase(uri.getScheme())||"http".equalsIgnoreCase(uri.getScheme()))||uri.getHost()==null||uri.getUserInfo()!=null) throw new IllegalArgumentException(); return uri.toASCIIString(); }
        catch(IllegalArgumentException e){ throw bad("A URL deve usar HTTP ou HTTPS válido."); }
    }
    private static void validarCortesia(CortesiaRequest r){
        if(!List.of("passaporte","sexta","sabado").contains(r.tipo())) throw bad("Tipo de cortesia inválido.");
        if(r.periodoInicio()!=null&&r.periodoFim()!=null&&r.periodoInicio().isAfter(r.periodoFim())) throw bad("Período de cortesia inválido.");
        if("passaporte".equals(r.tipo())&&(r.periodoInicio()==null||r.periodoFim()==null||r.diaEvento()!=null)) throw bad("Passaporte exige período e não pode ter dia único.");
        if(!"passaporte".equals(r.tipo())&&(r.diaEvento()==null||r.periodoInicio()!=null||r.periodoFim()!=null)) throw bad("Cortesia diária exige um dia do evento.");
    }
    private void validarDireitoCortesia(UUID parceriaId,CortesiaRequest r,UUID ignorarId){
        Direito beneficio=jdbc.query("select tipo,setor,publico,quantidade from portal_beneficios where id=? and parceria_id=? and natureza='CORTESIA' for update",rs->rs.next()?new Direito(rs.getString(1),rs.getString(2),rs.getString(3),rs.getInt(4)):null,r.beneficioId(),parceriaId);
        if(beneficio==null) throw notFound("Direito de cortesia não encontrado.");
        if(!beneficio.tipo().equals(r.tipo())||!beneficio.setor().equals(r.setor().trim())||!beneficio.publico().isEmpty()) throw bad("A cortesia não corresponde ao direito contratado.");
        Integer utilizado=ignorarId==null
                ? jdbc.queryForObject("select coalesce(sum(quantidade),0) from portal_cortesias where beneficio_id=? and dia_evento is not distinct from ?",Integer.class,r.beneficioId(),r.diaEvento())
                : jdbc.queryForObject("select coalesce(sum(quantidade),0) from portal_cortesias where beneficio_id=? and dia_evento is not distinct from ? and id<>?",Integer.class,r.beneficioId(),r.diaEvento(),ignorarId);
        if((long) utilizado+r.quantidade()>beneficio.quantidade()) throw new ResponseStatusException(HttpStatus.CONFLICT,"A quantidade excede o direito contratado para este dia.");
    }
    private void validarDireitosCredenciamento(UUID parceriaId,List<Credencial> itens){
        HashSet<UUID> utilizados=new HashSet<>();
        if(itens.stream().anyMatch(c->c.beneficioId()==null)||itens.stream().anyMatch(c->!utilizados.add(c.beneficioId()))) throw bad("Cada linha deve referenciar um direito de credenciamento distinto.");
        for(Credencial c:itens.stream().sorted(java.util.Comparator.comparing(Credencial::beneficioId)).toList()){
            Direito direito=jdbc.query("select tipo,setor,publico,quantidade from portal_beneficios where id=? and parceria_id=? and natureza='CREDENCIAL' for update",rs->rs.next()?new Direito(rs.getString(1),rs.getString(2),rs.getString(3),rs.getInt(4)):null,c.beneficioId(),parceriaId);
            if(direito==null) throw notFound("Direito de credenciamento não encontrado.");
            if(!direito.tipo().equals(c.tipo().trim())||!direito.setor().equals(c.setor().trim())||!direito.publico().equals(c.publico().trim())) throw bad("O credenciamento não corresponde ao direito contratado.");
            if(c.quantidade()>direito.quantidade()) throw new ResponseStatusException(HttpStatus.CONFLICT,"A quantidade excede o direito de credenciamento.");
        }
    }
    private static String blankNull(String s){ return s==null||s.isBlank()?null:s.trim(); }
    private static String like(String s){ return s==null||s.isBlank()?null:"%"+s.trim()+"%"; }
    private static Instant instante(ResultSet rs,String c)throws SQLException { return rs.getTimestamp(c).toInstant(); }
    private static Instant instanteNullable(ResultSet rs,String c)throws SQLException { var t=rs.getTimestamp(c); return t==null?null:t.toInstant(); }
    private static LocalDate localDate(ResultSet rs,String c)throws SQLException { var d=rs.getDate(c); return d==null?null:d.toLocalDate(); }
    private static Timestamp sqlTimestamp(Instant value){ return value==null?null:Timestamp.from(value); }
    private static ResponseStatusException bad(String message){ return new ResponseStatusException(HttpStatus.BAD_REQUEST,message); }
    private static ResponseStatusException notFound(String message){ return new ResponseStatusException(HttpStatus.NOT_FOUND,message); }

    public record Recebimento(boolean aberto,Instant prazo){}
    public record MarcaView(List<ArquivoView> arquivos,List<VersaoArquivo> versoes,List<Publicacao> publicacoes,Recebimento recebimento){}
    public record VersaoArquivo(UUID id,UUID arquivoId,int versao,UUID criadoPor,Instant criadoEm){}
    public record Publicacao(UUID id,String tipo,UUID arquivoId,String url,String titulo,String texto,UUID criadoPor,Instant criadoEm){}
    public record PublicacaoRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=255) String titulo,@jakarta.validation.constraints.Size(max=5000) String texto,@jakarta.validation.constraints.Size(max=2048) String url){}
    public record Briefing(String texto,int versao,UUID atualizadoPor,Instant atualizadoEm){}
    public record VersaoMidia(UUID id,UUID arquivoId,String texto,int versao,UUID criadoPor,Instant criadoEm){}
    public record Veiculacao(UUID id,String canal,String descricao,String url,Instant veiculadoEm,UUID criadoPor,Instant criadoEm){}
    public record VeiculacaoRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120) String canal,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=3000) String descricao,@jakarta.validation.constraints.Size(max=2048) String url,Instant veiculadoEm){}
    public record VeiculacoesRequest(@jakarta.validation.constraints.NotNull @jakarta.validation.constraints.Min(0) Integer versao,@jakarta.validation.constraints.NotNull List<@jakarta.validation.Valid VeiculacaoRequest> itens){}
    public record VeiculacoesView(int versao,List<Veiculacao> itens){}
    public record VeiculacoesHistorico(int versao,List<Veiculacao> itens,UUID snapshotPor,Instant snapshotEm){}
    public record MidiaView(List<ArquivoView> arquivos,List<VersaoMidia> versoes,Briefing briefing,List<Veiculacao> veiculacoes,List<VeiculacoesHistorico> veiculacoesHistorico,int veiculacoesVersao,List<Publicacao> publicacoes,Recebimento recebimento){}
    public record CortesiaRequest(@jakarta.validation.constraints.Min(0) int quantidade,@jakarta.validation.constraints.NotBlank String tipo,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120) String setor,LocalDate periodoInicio,LocalDate periodoFim,LocalDate diaEvento,@jakarta.validation.constraints.Min(1) Integer versao,@jakarta.validation.constraints.NotNull UUID beneficioId){}
    public record DestinacaoRequest(@jakarta.validation.constraints.Min(1) int quantidade,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=500) String destinacao){}
    public record Destinacao(UUID id,int quantidade,String destinacao,UUID criadoPor,Instant criadoEm){}
    public record CortesiaView(UUID id,int quantidade,String tipo,String setor,LocalDate periodoInicio,LocalDate periodoFim,LocalDate diaEvento,int versao,int destinadas,UUID beneficioId,List<Destinacao> destinacoes){}
    public record Credencial(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120) String setor,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120) String tipo,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120) String publico,@jakarta.validation.constraints.Min(0) int quantidade,@jakarta.validation.constraints.NotNull UUID beneficioId){}
    public record CredenciamentoRequest(@jakarta.validation.constraints.NotNull @jakarta.validation.constraints.Min(0) Integer versao,@jakarta.validation.constraints.NotNull List<@jakarta.validation.Valid Credencial> itens,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=2048) String urlOpenStaff){}
    public record CredenciamentoView(String urlOpenStaff,int versao,List<Credencial> itens,List<CredenciamentoHistorico> historico){}
    public record CredenciamentoHistorico(int versao,String urlOpenStaff,List<Credencial> itens,UUID snapshotPor,Instant snapshotEm){}
    public record PesquisaRequest(@jakarta.validation.constraints.NotNull @jakarta.validation.constraints.Size(min=1,max=3) List<@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=1000) String> perguntas){}
    public record PesquisaVersao(UUID id,int versao,UUID criadoPor,Instant criadoEm,List<String> perguntas){}
    public record PesquisaView(Recebimento recebimento,List<PesquisaVersao> versoes,List<ArquivoView> resultados){}
    public record FaqRequest(@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=120) String categoria,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=500) String pergunta,@jakarta.validation.constraints.NotBlank @jakarta.validation.constraints.Size(max=10000) String resposta,@jakarta.validation.constraints.Min(1) Integer versao){}
    public record Faq(UUID id,String categoria,String pergunta,String resposta,int versao,UUID atualizadoPor,Instant atualizadoEm){}
    private record HistoricoVeiculacaoItem(int versao,UUID id,String canal,String descricao,String url,Instant veiculadoEm,UUID criadoPor,Instant criadoEm,UUID snapshotPor,Instant snapshotEm){}
    private record HistoricoCredencialItem(int versao,String setor,String tipo,String publico,UUID beneficioId,Integer quantidade,String url,UUID snapshotPor,Instant snapshotEm){}
    private record Direito(String tipo,String setor,String publico,int quantidade){}
}
