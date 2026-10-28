package com.rbs.portal_patrocinador.operacao;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static com.rbs.portal_patrocinador.operacao.OperacaoService.*;

@RestController
@RequestMapping("/api/parcerias/{parceriaId}")
public class OperacaoController {
    private final OperacaoService operacoes;
    private final ArquivoService arquivos;

    public OperacaoController(OperacaoService operacoes, ArquivoService arquivos) {
        this.operacoes = operacoes;
        this.arquivos = arquivos;
    }

    @GetMapping("/marca")
    public MarcaView marca(@PathVariable UUID parceriaId) { return operacoes.marca(parceriaId); }
    @GetMapping("/marca/miv/versoes")
    public List<VersaoArquivo> miv(@PathVariable UUID parceriaId) { return operacoes.marca(parceriaId).versoes(); }
    @PostMapping(path="/marca/miv/versoes", consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public VersaoArquivo enviarMiv(@PathVariable UUID parceriaId,@RequestParam("arquivo") MultipartFile arquivo) { return operacoes.enviarMiv(parceriaId,arquivo); }
    @PatchMapping("/marca/recebimento")
    public Recebimento receberMarca(@PathVariable UUID parceriaId,@Valid @RequestBody RecebimentoRequest r) { return operacoes.receberMarca(parceriaId,r.aberto(),r.prazo()); }
    @PostMapping(path="/marca/publicacoes",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public Publicacao publicarMarca(@PathVariable UUID parceriaId,@Valid @RequestPart("dados") PublicacaoRequest dados,@RequestPart(value="arquivo",required=false) MultipartFile arquivo) { return operacoes.publicarMarca(parceriaId,dados,arquivo); }
    @PostMapping(path="/marca/publicacoes",consumes=MediaType.APPLICATION_JSON_VALUE)
    public Publicacao publicarMarcaSemArquivo(@PathVariable UUID parceriaId,@Valid @RequestBody PublicacaoRequest dados) { return operacoes.publicarMarca(parceriaId,dados,null); }

    @GetMapping("/midia")
    public MidiaView midia(@PathVariable UUID parceriaId) { return operacoes.midia(parceriaId); }
    @GetMapping("/midia/versoes")
    public List<VersaoMidia> midiaVersoes(@PathVariable UUID parceriaId) { return operacoes.midia(parceriaId).versoes(); }
    @PostMapping(path="/midia/versoes",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public VersaoMidia enviarMidia(@PathVariable UUID parceriaId,@RequestParam(value="texto",required=false) String texto,@RequestParam(value="arquivo",required=false) MultipartFile arquivo) { return operacoes.enviarMidia(parceriaId,texto,arquivo); }
    @PutMapping("/midia/briefing")
    public Briefing briefing(@PathVariable UUID parceriaId,@Valid @RequestBody BriefingRequest r) { return operacoes.salvarBriefing(parceriaId,r.texto()); }
    @PatchMapping("/midia/recebimento")
    public Recebimento receberMidia(@PathVariable UUID parceriaId,@Valid @RequestBody RecebimentoRequest r) { return operacoes.receberMidia(parceriaId,r.aberto(),r.prazo()); }
    @PatchMapping("/midia/veiculacoes")
    public VeiculacoesView veiculacoes(@PathVariable UUID parceriaId,@Valid @RequestBody VeiculacoesRequest r) { return operacoes.atualizarVeiculacoes(parceriaId,r); }
    @PostMapping(path="/midia/publicacoes",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public Publicacao publicarMidia(@PathVariable UUID parceriaId,@Valid @RequestPart("dados") PublicacaoRequest dados,@RequestPart(value="arquivo",required=false) MultipartFile arquivo) { return operacoes.publicarMidia(parceriaId,dados,arquivo); }
    @PostMapping(path="/midia/publicacoes",consumes=MediaType.APPLICATION_JSON_VALUE)
    public Publicacao publicarMidiaSemArquivo(@PathVariable UUID parceriaId,@Valid @RequestBody PublicacaoRequest dados) { return operacoes.publicarMidia(parceriaId,dados,null); }

    @GetMapping("/cortesias")
    public List<CortesiaView> cortesias(@PathVariable UUID parceriaId) { return operacoes.cortesias(parceriaId); }
    @PostMapping("/cortesias")
    public CortesiaView criarCortesia(@PathVariable UUID parceriaId,@Valid @RequestBody CortesiaRequest r) { return operacoes.criarCortesia(parceriaId,r); }
    @PatchMapping("/cortesias/{cortesiaId}")
    public CortesiaView editarCortesia(@PathVariable UUID parceriaId,@PathVariable UUID cortesiaId,@Valid @RequestBody CortesiaRequest r) { return operacoes.editarCortesia(parceriaId,cortesiaId,r); }
    @PostMapping("/cortesias/{cortesiaId}/destinacoes")
    public Destinacao destinar(@PathVariable UUID parceriaId,@PathVariable UUID cortesiaId,@Valid @RequestBody DestinacaoRequest r) { return operacoes.destinar(parceriaId,cortesiaId,r); }

    @GetMapping("/credenciamento")
    public CredenciamentoView credenciamento(@PathVariable UUID parceriaId) { return operacoes.credenciamento(parceriaId); }
    @PutMapping("/credenciamento")
    public CredenciamentoView credenciamento(@PathVariable UUID parceriaId,@Valid @RequestBody CredenciamentoRequest r) { return operacoes.atualizarCredenciamento(parceriaId,r); }

    @GetMapping("/pesquisa")
    public PesquisaView pesquisa(@PathVariable UUID parceriaId) { return operacoes.pesquisa(parceriaId); }
    @PutMapping("/pesquisa/perguntas")
    public PesquisaVersao perguntas(@PathVariable UUID parceriaId,@Valid @RequestBody PesquisaRequest r) { return operacoes.salvarPerguntas(parceriaId,r.perguntas()); }
    @PatchMapping("/pesquisa/recebimento")
    public Recebimento receberPesquisa(@PathVariable UUID parceriaId,@Valid @RequestBody RecebimentoRequest r) { return operacoes.receberPesquisa(parceriaId,r.aberto(),r.prazo()); }
    @PostMapping(path="/pesquisa/resultados",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ArquivoView resultados(@PathVariable UUID parceriaId,@RequestParam("arquivo") MultipartFile arquivo) { return operacoes.publicarResultados(parceriaId,arquivo); }

    @GetMapping("/faq")
    public List<Faq> faq(@PathVariable UUID parceriaId,@RequestParam(required=false) String busca,@RequestParam(required=false) String categoria) { return operacoes.faq(parceriaId,busca,categoria); }
    @PostMapping("/faq")
    public Faq criarFaq(@PathVariable UUID parceriaId,@Valid @RequestBody FaqRequest r) { return operacoes.criarFaq(parceriaId,r); }
    @PatchMapping("/faq/{faqId}")
    public Faq editarFaq(@PathVariable UUID parceriaId,@PathVariable UUID faqId,@Valid @RequestBody FaqRequest r) { return operacoes.editarFaq(parceriaId,faqId,r); }

    @GetMapping("/relatorio/planilhas")
    public List<ArquivoView> planilhas(@PathVariable UUID parceriaId) { return operacoes.planilhas(parceriaId); }
    @PostMapping(path="/relatorio/planilhas",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ArquivoView planilha(@PathVariable UUID parceriaId,@RequestParam("arquivo") MultipartFile arquivo) { return operacoes.salvarPlanilha(parceriaId,arquivo); }

    @GetMapping("/documentos")
    public List<ArquivoView> documentos(@PathVariable UUID parceriaId) { return operacoes.documentos(parceriaId); }
    @PostMapping(path="/documentos",consumes=MediaType.MULTIPART_FORM_DATA_VALUE)
    public ArquivoView documento(@PathVariable UUID parceriaId,@RequestParam("arquivo") MultipartFile arquivo) { return operacoes.salvarDocumento(parceriaId,arquivo); }

    @GetMapping("/arquivos/{arquivoId}")
    public ResponseEntity<org.springframework.core.io.Resource> arquivo(@PathVariable UUID parceriaId,@PathVariable UUID arquivoId) {
        ArquivoService.Download d=arquivos.baixar(parceriaId,arquivoId);
        return ResponseEntity.ok().header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.attachment().filename(d.nome(),StandardCharsets.UTF_8).build().toString())
                .header("X-Content-Type-Options","nosniff").contentType(MediaType.APPLICATION_OCTET_STREAM).body(d.resource());
    }

    public record RecebimentoRequest(boolean aberto,Instant prazo){}
    public record BriefingRequest(@NotBlank @Size(max=10000) String texto){}
}
