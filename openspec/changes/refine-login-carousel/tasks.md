## 1. Reconciliação

- [x] 1.1 Inicializar OpenSpec com Codex e Claude e conferir config e integrações; CLI 1.12.0 criou schema spec-driven e diretórios .agents/.claude.
- [x] 1.2 Reconciliar pedido e docs anteriores, declarando que implementação antecedeu a nova política; registrado em proposal.md.

## 2. Implementação existente e validação pendente

- [x] 2.1 Simplificar controles, loop de 3s e acabamento; build Docker aprovado e fonte não contém mais pause/play nem pausa permanente.
- [x] 2.2 Validar seleção com teclado, retorno da terceira à primeira após 3s e ausência de controles extras no navegador.
- [x] 2.3 Validar documento nos tamanhos da spec e estado inválido; salvar capturas de desktop e celular.
- [x] 2.4 Registrar evidências e limites, atualizar referências de docs/login.md e validar change com OpenSpec strict.

## Evidências e limites: 02/10/2026

### Extensão pela referência PA27 em tela cheia

A última imagem substitui a moldura anterior como direção visual. Escopo: layout, faixas de cor, marca no painel direito e hierarquia; regras de carrossel e formulário não mudam. Reutilizar assets oficiais em vez de copiar a foto exata da imagem, que não foi fornecida separadamente. A versão oficial do logo disponível tem inscrição branca; preservá-la e usar sombra fina para leitura sobre branco. Não importar Google, cadastro ou links inexistentes. Risco principal: altura do bloco com logo adicional. Conclusão: build, três viewports sem overflow inicial/erro e capturas.

- [x] 4.1 Aplicar composição, faixas e hierarquia em HTML/CSS; verificar build.
- [x] 4.2 Validar desktop/celular e estados de erro, salvar capturas e medir ausência de overflow.
- [x] 4.3 Atualizar guia vigente e evidências; validar OpenSpec strict e whitespace.

Evidências da identidade em tela cheia: build Docker aprovado, inicial 865,78kB, login lazy 263,46kB; avisos de inicial acima de 500kB e CSS 5,20kB acima de 4kB preservados. Nenhuma dependência nova ou raster criado. Documento igual ao viewport nos estados inicial e inválido em 1366×650, 1280×600 e 360×640; captura final desktop em 1440×900 também sem overflow. Logo, faixas, formulário e mensagens visíveis. `.impeccable/review/desktop.jpg` e `mobile.jpg` atualizados; guia e sidecar descrevem direção vigente.

Correção encontrada na inspeção: foco na barra fazia o navegador rolar internamente o painel com `overflow: hidden`, produzindo logo recortado (`top: -12px` no celular), apesar de `scrollY: 0`. Alterado apenas o painel decorativo para `overflow: clip`; confirmação após seleção: scrollTop 0, logo top 12px no celular e 42px no desktop. Formulário não recebe recorte. Reproduzir clicando a primeira barra em 360×640 e verificando marca inteira e foco.

Detector retornou `[]`, OpenSpec strict e whitespace aprovados. TS do carrossel e validação preservados; loop e reduced motion não repetidos nesta rodada. Foto exata da referência e marca com inscrição preta não foram fornecidas separadamente: usados assets oficiais existentes, com inscrição branca preservada. Integrações da referência não foram adicionadas. Frontend existente reiniciado, HTTP 200 confirmado. Touch via container não produziu reload observável e não substituiu reinício. Aba temporária fechada e viewport restaurado após capturas.

### Extensão pela segunda referência visual

Escopo autorizado: mesma superfície de login, agora em card central arredondado com moldura branca e fundo externo fotográfico escuro. Reutilizar ativos, carrossel e formulário; alteração pequena e sequencial, sem delegação. Risco: margem externa causar overflow em notebook baixo e celular. Conclusão exige build e medições inicial/erro nas três resoluções.

- [x] 3.1 Adicionar shell e adaptar CSS conforme referência; conferir build Docker.
- [x] 3.2 Validar moldura, fotos e formulário em desktop/celular, medindo ausência de overflow nos três tamanhos e salvando capturas.
- [x] 3.3 Atualizar guia e registrar resultados/limites; validar OpenSpec strict e whitespace.

Evidências da moldura: HTML adiciona apenas um shell; CSS reutiliza foto existente no fundo e mantém altura mínima adaptável, sem altura fixa. Build Docker aprovado: inicial 865,78kB, login lazy 263,25kB. Avisos preservados: inicial acima de 500kB e CSS 5,20kB acima de 4kB, ambos abaixo dos limites de erro. Detector sem achados. No navegador, documento igual ao viewport nos estados inicial e inválido em 1366×650, 1280×600 e 360×640. Capturas atualizadas em `.impeccable/review/desktop.jpg` e `mobile.jpg`; foto, marca, barras e erros visíveis. Guia visual e sidecar atualizados. Carrossel/validação TS sem alterações; loop não foi retestado porque não mudou. HTTP 200 confirmado após reinício do frontend existente; aba temporária fechada e viewport restaurado. Sem novas dependências ou assets. Critérios além desses tamanhos, como zoom e teclado virtual, mantêm fluxo natural e não foram medidos nesta rodada.

Navegador real: exatamente três controles, nenhum play/pause; clique seleciona cena 2; Enter seleciona cena 3. Após mover foco e ponteiro ao e-mail e aguardar 3,2s, cena 1 ficou selecionada, confirmando loop e ausência de pausa permanente. Documento igual ao viewport nos estados inicial e inválido em 1366×650, 1280×600 e 360×640. Capturas `.impeccable/review/desktop.jpg` e `mobile.jpg`, esta última com erros. Formulário vazio exibe mensagens associadas aos dois campos.

Build Docker aprovado: inicial 865,78kB e login lazy 262,76kB. Avisos de inicial acima de 500kB e CSS 4,79kB acima de 4kB preservados, abaixo dos limites de erro. Detector retornou `[]`; `git diff --check` sem erros. OpenSpec strict aprovado. CSS não muda tokens globais ou outros consumidores. Sem dependências novas.

Movimento reduzido, aba oculta e descarte foram preservados e inspecionados no código; movimento reduzido havia sido medido na entrega anterior, sem repetição nesta rodada. Teste do proxy aprovado na entrega anterior e não repetido porque contrato não mudou. Frontend existente reiniciado para recarregar arquivos, HTTP 200 confirmado; backend e banco preservados. Aba temporária fechada e viewport restaurado.

Reprodução do risco alterado: selecionar terceira barra, clicar no campo e-mail, aguardar pouco mais de 3s; a primeira barra deve ficar ativa. Selecionar com Enter e conferir foco visível. Enviar vazio nos três viewports e comparar scrollWidth/scrollHeight com innerWidth/innerHeight. Não há suíte E2E instalada; estas verificações foram executadas no navegador da aplicação.
