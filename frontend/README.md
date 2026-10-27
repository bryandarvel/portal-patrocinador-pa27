# Frontend do Portal do Patrocinador

Angular 22 e NG-ZORRO. A raiz redireciona para `/login`, com identidade PA27, carrossel e validação visual. A autenticação ainda não está integrada.

## Prévia do perfil

`/previa/perfil` apresenta o frame `PAT · Amarelo · Perfil do cliente` (`9:154`)
com dados fictícios isolados em `PartnershipPreviewService`. A rota não representa
uma sessão autenticada e não recebe dados reais de patrocinadores.

Os modais de documentos, notificações e relatório reproduzem estados do Figma.
Não há arquivos para download, notificações reais ou publicação de relatórios.
Destinos de páginas ainda não construídas ficam indisponíveis nesta prévia;
“Sair” apenas retorna ao login. Não há login simulado ou alteração no formulário
de autenticação. A integração e a substituição desta rota serão etapas próprias.

## Prévia de aplicações de marca

`/previa/aplicacoes-de-marca` reproduz o frame `PAT · Amarelo · Aplicações de marca`
(`9:257`). Perfil e marca compartilham cabeçalho, navegação e diálogos de relatório
e notificações em `PartnershipShell`. Somente as páginas já construídas têm
links ativos. O detalhe da logo está acessível pelo cartão e por “Acompanhar
entrega”. O cabeçalho também oferece acesso à FAQ.

O MIV começa pendente. É possível selecionar um arquivo local, conferir seu nome,
simular o envio, substituí-lo e consultar o histórico. `PartnershipPreviewService`
guarda apenas nome, tamanho, versão e data em memória. O conteúdo não é lido,
transmitido nem persistido. Os registros permanecem ao navegar entre as
prévias e desaparecem ao recarregar a página. A indicação de 67% e a espera de um
segundo reproduzem o protótipo e não medem uma transferência real.

Cancelar ou fechar durante o envio interrompe a simulação sem alterar o histórico.
Arquivos vazios recebem mensagem de erro. Não foram definidos limites de tamanho
ou formatos permitidos: essas regras dependem do contrato a alinhar. O documento
exibe a prévia genérica do Figma; download e comprovação real não estão disponíveis.
Nomes e datas do histórico refletem a simulação local, sem copiar os exemplos de
2027 do Figma como registros reais. As mensagens de confirmação indicam a simulação.

Referências dos diálogos: envio `14:1039`, seleção `14:1051`, progresso `14:1069`,
substituição `14:1085`/`14:1097`/`14:1115`, confirmação `14:793`, cancelamento
`14:804` e histórico `15:1124`. O indicador `status-concluido.svg` veio do frame
`14:793`; o logo, as fontes e os tokens existentes são reutilizados.

## Prévia de mídia e conteúdo

`/previa/midia-e-conteudo` reproduz o frame `PAT · Amarelo · Mídia e conteúdo`
(`10:114`). Inclui materiais, publicações da RBS e tabela “Previsto × exibido”.
Arquivo inicial, publicações e quantidades são exemplos do protótipo, sem indicar
direitos da cota, entregas reais ou dados calculados de uma API.

`MediaPreviewService` mantém o histórico de arquivos e o último briefing em memória,
separados do MIV. A seleção lê somente nome e tamanho; não lê ou envia conteúdo.
Cada envio simulado acrescenta uma versão e atualiza o arquivo exibido. Cancelar,
fechar ou sair da página durante o progresso interrompe a operação. O briefing
recusa texto vazio ou só espaços e reabre com o último texto salvo localmente;
fechar sem enviar descarta as edições. Recarregar restaura os exemplos iniciais.
Não há limites de formatos/tamanhos inventados, download real ou URL de publicação.
O histórico identifica o registro inicial como exemplo e usa a data local apenas
nos novos registros. As confirmações deixam explícito que não houve envio à RBS.

Referências: envio `14:1131`, seleção `14:1143`, progresso `14:1161`, briefing
`14:1190`, confirmação do texto `14:782`, histórico `15:1133`, documento `14:760`
e publicação `14:833`. Uploads de marca e mídia reutilizam `material-ui.css`, sem
alterar o comportamento da tela de marca. Integração depende de etapa própria e
consulta prévia a Bryan sobre o andamento do backend.

## Prévia de cortesias

`/previa/cortesias` apresenta o frame `PAT · Amarelo · Cortesias` (`10:242`).
`TicketsPreviewService` fornece os exemplos de 50 passaportes para Camarote e
30 para VIP. São dois registros independentes de quantidade, tipo e setor;
não representam limites, saldos calculados ou direitos confirmados da cota.

O patrocinador apenas consulta. Os botões “Destinar” estão desabilitados conforme
o Figma, com orientação para consultar a RBS. Não há emissão, QR code, bilheteria,
cadastro de destinatários ou chamadas à API. A integração e as regras operacionais
dependem de etapa própria e consulta a Bryan sobre o andamento do backend.
Cabeçalho, identificação da parceria e navegação reutilizam `PartnershipShell`.

## Prévia de credenciamento

`/previa/credenciamento` reproduz `PAT · Amarelo · Credenciamento` (`10:332`).
`StaffPreviewService` isola o exemplo de 12 credenciais, tipo “Equipe de ativação”,
setor “Área de ativação”. Esses valores não confirmam direitos da parceria.

“Acessar Open Staff” abre o diálogo informativo `14:824`, conforme a reação do
protótipo. O diálogo informa que o endereço será fornecido pela RBS e permite
voltar ao portal. Não há URL externa configurada, autenticação no Open Staff,
integração técnica, envio de dados ou emissão de credenciais. O link real depende
do endereço que a RBS disponibilizar. A página usa a navegação compartilhada;
o diálogo reutiliza os estilos e o tratamento de acessibilidade existentes.

## Prévia de pesquisa da ativação

`/previa/pesquisa-da-ativacao` reproduz `PAT · Amarelo · Pesquisa da ativação`
(`10:421`) e a confirmação `14:1202`. O exemplo permite editar até três perguntas;
essa disponibilidade não define direitos para outras cotas ou parcerias.

O formulário aceita de uma a três perguntas, recusa envio totalmente vazio ou só
com espaços e remove espaços das extremidades ao salvar. `SurveyPreviewService`
mantém o último envio apenas em memória. Navegar entre prévias preserva os textos
enviados; edições não enviadas são descartadas ao sair da tela. Recarregar restaura
as perguntas demonstrativas do Figma. A confirmação informa a quantidade salva e
que nenhum texto foi enviado à RBS. Não há chamadas à API ou persistência real.

Os resultados permanecem indisponíveis, conforme o estado visível no frame.
Não há relatório fictício para download nem publicação de resultados pelo
patrocinador. A integração e os direitos reais dependem de etapa própria e
consulta prévia a Bryan sobre o andamento do backend.

## Prévia de contrato

`/previa/contrato` reproduz `PAT · Amarelo · Contrato` (`10:527`). O exemplo começa
com a versão 1 aguardando validação e os signatários já informados, como no frame.
O visualizador (`14:1494`) é demonstrativo e não contém um PDF real; download fica
desabilitado com orientação. O contrato final assinado permanece indisponível.

`ContractPreviewService` mantém uma decisão em memória vinculada à versão 1:
aprovação confirmada (`14:1539`) ou solicitação de ajustes com comentário obrigatório
(`14:1561`, `14:1573`, `14:1585`). Texto vazio ou só espaços não é aceito. Fechar ou
voltar antes de confirmar não registra decisão; comentários não enviados são
descartados. Os textos enviados são aparados nas extremidades e exibidos como texto.

A confirmação (`14:782`) explicita a simulação. A decisão atualiza estado e histórico
(`14:1510`); os botões de decisão desaparecem conforme as variáveis do protótipo.
O foco retorna ao documento quando o botão que abriu o diálogo deixa de existir.
O comentário aparece vinculado à versão (`10:622`). Registros iniciais são marcados
como exemplo, e decisões locais usam a data do navegador. Navegar preserva a decisão;
recarregar restaura o estado inicial para testar o outro fluxo.

Não há assinatura, transmissão à RBS, persistência real, publicação de outra versão
ou arquivo final. A nova versão depende da futura etapa administrativa. Integração
depende de etapa própria e consulta a Bryan sobre o andamento do backend.

## Prévia de entregas da parceria

`/previa/entregas` reproduz o painel `PAT · Amarelo · Entregas da parceria`
(`11:658`) e a prévia de relatório (`14:680`). `DeliveriesPreviewService` isola os
exemplos do protótipo: Logo no telão, Post carrossel e Pesquisa da ativação, com
um item em cada total. Esses números e estados não são regras de consolidação
nem confirmação de execução real. O relatório final continua indisponível.

Os atalhos abrem Mídia e conteúdo, Pesquisa da ativação e Aplicações de marca.
A pendência de MIV acompanha o envio simulado já existente; isso não equivale ao
envio de logo para uma entrega. “Acompanhar entrega” abre o detalhe da logo.
O material e o próximo passo do destaque acompanham o estado local desse detalhe.
Os totais permanecem no exemplo do Figma (1/1/1), inclusive após o primeiro envio.

O painel não faz chamadas HTTP nem altera entregas. A integração depende de uma
etapa própria e consulta prévia a Bryan sobre o andamento do backend.

## Prévia de Logo no telão

`/previa/entregas/logo-no-telao` reproduz o detalhe `11:781`. Os acessos partem
de Entregas da parceria e Aplicações de marca. O primeiro envio segue os diálogos
`14:1698`, `14:1710`, `14:1728` e `14:793`; cancelar usa `14:804`.

`LogoDeliveryPreviewService` mantém somente nome, tamanho, versão e data local.
Não lê, transmite nem guarda o conteúdo do arquivo. Arquivos vazios são recusados;
formatos e limites reais ainda dependem do contrato de integração. Escolher outro
arquivo descarta a seleção; fechar durante a transição de um segundo ou sair do
componente cancela o envio pendente. O estado muda para “Material recebido” somente
ao término da simulação, sem iniciar análise ou execução automaticamente.

O histórico (`14:722`) usa a data do navegador. O visualizador (`14:749`) mostra a
marca fictícia do Figma, identificada como exemplo, e mantém download desabilitado.
`DeliveryReport` reaproveita a prévia `14:680` no painel e no detalhe; o nome e o
estado do material acompanham o mesmo serviço. MIV e logo são registros independentes.
Navegar mantém o envio; recarregar reinicia a demonstração.

Depois do recebimento, o fluxo aguarda a RBS. A substituição no protótipo só aparece
mediante solicitação de correção; análise, correções, encerramento e comprovação
serão conectados na etapa administrativa. Não há controles de RBS na conta do
patrocinador nem geração automática de comprovação.

## Prévia de dúvidas frequentes

`/previa/duvidas-frequentes` reproduz o frame `11:946`, com quatro respostas
publicadas e acesso pelo cabeçalho de todas as áreas. `FaqPreviewService` isola
os textos demonstrativos do Figma; o item de cortesias, oculto no protótipo,
não é publicado automaticamente.

Digite no campo de busca e pressione Enter. A consulta pesquisa perguntas e
respostas sem diferenciar maiúsculas ou acentos; vários termos devem aparecer
no mesmo registro. Consulta vazia mostra todas as dúvidas. As categorias abrem
suas próprias listas, independentemente do texto digitado, conforme os modais
`14:1213`, `14:1221`, `14:1229` e `14:1237`. A busca sem correspondência oferece
orientação para tentar outra palavra. Fechar ou voltar preserva o texto digitado.

O conteúdo é somente leitura para o patrocinador. Não há cadastro, edição,
chatbot, chamadas HTTP ou integração com a futura gestão de FAQ pela RBS.

## Prévia administrativa de patrocinadores

`/previa/rbs/patrocinadores` reproduz `RBS · Patrocinadores` (`11:536`).
É uma rota demonstrativa, sem login ou autorização real de Admin RBS.
Busca por nome ou cota com Enter abre o modal `14:2024`; consulta vazia lista
todos os registros. Busca ignora caixa e acentos. Os exemplos iniciais são
Cliente Amarelo, Roxo e Verde. O MIV do Amarelo acompanha a prévia já existente.

O cadastro (`14:1962`) exige os quatro campos e e-mail válido. Não fixa cotas
nem política de senha que ainda dependem de integração. A simulação autorizada
adiciona nome, cota e e-mail em `SponsorsPreviewService`, somente em memória.
A senha não chega ao serviço e é limpa ao concluir ou fechar. O retorno
`14:1987` explicita “Acesso simulado”; “Ver acesso” reabre esses dados.
Fechar antes de concluir não adiciona linha. Recarregar restaura os três exemplos.
Não há conta real, envio de e-mail, persistência ou chamadas HTTP.

“Abrir parceria” do Cliente Amarelo, na lista e na busca, abre seu perfil RBS.
Roxo e Verde permanecem indisponíveis até as respectivas telas administrativas.
“Ver pendência” abre Aplicações de marca RBS. Não direcionam para telas de patrocinador.
O login comum e todas as telas aprovadas do patrocinador foram preservados.

## Prévia administrativa de perfil do cliente

`/previa/rbs/amarelo/perfil` reproduz o frame `10:656`. O formulário edita
nome, cota e e-mail, com validação de campos obrigatórios e formato de e-mail.
`RbsProfilePreviewService` mantém os valores em memória e atualiza a identidade
na navegação e a linha do Amarelo na lista. Recarregar restaura os exemplos.
O perfil demonstrativo do patrocinador permanece independente desta edição.

Gerenciar acesso (`14:2000`) simula somente a alteração do e-mail autorizado.
Salvar acesso preserva nome e cota ainda não salvos no formulário principal;
fechar sem salvar descarta a edição do modal. Nenhuma credencial, conta,
permissão ou sessão real é modificada. As confirmações seguem `14:2013` e `14:979`.

Documentos abrem o visualizador ilustrativo `14:957`, sem download real.
Disponibilizar documento (`14:1947`) usa o arquivo de exemplo pré-selecionado
do Figma: confirma a publicação apenas em memória, sem seleção, upload ou PDF.
Não adiciona documentos duplicados nem disponibiliza conteúdo ao patrocinador.

`AdminPartnershipShell` reutiliza os estilos da navegação aprovada, com identidade
RBS e retorno à lista. Perfil e Aplicações de marca têm navegação entre si.
As demais áreas, FAQ administrativo, publicação de relatório
e organização de planilhas aguardam seus próprios ciclos; seus controles ficam
indisponíveis. Esta etapa não contém chamadas HTTP nem integração real.

## Prévia administrativa de aplicações de marca

`/previa/rbs/amarelo/aplicacoes-de-marca` reproduz `10:768`, com o controle de
envio (`14:1842`/`14:1852`), MIV (`14:1288` a `14:1364`) e histórico (`15:1200`).
Encerrar ou reabrir exige confirmação; voltar ou fechar preserva o estado.
`PartnershipPreviewService` compartilha o MIV e o controle de envio na instância
da aplicação, durante a navegação Angular. Recarregar ou abrir outra aba cria
uma prévia independente, com envios abertos e sem arquivos.

O encerramento oculta envio/substituição de MIV e o envio de logo no detalhe
do patrocinador, conforme os vínculos do Figma. Esses métodos também conferem
o estado antes de registrar metadados. Isso é controle demonstrativo do frontend,
sem autorização, sessão ou bloqueio real no servidor.

A RBS pode simular envio e substituição de MIV enquanto aberto. Só nome, tamanho,
versão, data local e autoria permanecem em memória. O conteúdo não é lido nem
transmitido. Arquivo vazio é recusado; fechar durante a transição de um segundo
ou sair da tela cancela o registro pendente. Histórico diferencia Admin RBS
de Admin Patrocinador; o visualizador não contém arquivo ou download real.

O cartão da logo, Acompanhar entrega e Registrar na entrega aguardam o detalhe
administrativo de Logo no telão (`11:1167`), em um ciclo próprio. Não abrem a
perspectiva do patrocinador nem registram execução ou comprovação automaticamente.

Na pasta `frontend/`, com Node 24.15.0 (ou versão compatível indicada no README da raiz):

```sh
npm ci
npm start
```

Acesse http://localhost:4200/login e encerre com Ctrl+C. Não precisa instalar Angular CLI globalmente. Para validar:

```sh
npm run test:proxy
npm run build
```

O build fica em `dist/portal-patrocinador/browser`. Não há suíte de componentes ou E2E configurada; `test:proxy` usa o test runner nativo do Node.

O proxy `/api/**` aponta para `http://127.0.0.1:8080` no host. No Docker, `API_PROXY_TARGET` seleciona `http://backend:8080`. Ele preserva o caminho e funciona somente no servidor de desenvolvimento.

Para executar frontend, backend e PostgreSQL juntos, siga o [README da raiz](../README.md). Todos os assets necessários estão em `public/`; nenhum caminho pessoal ou PDF externo é usado em runtime.
