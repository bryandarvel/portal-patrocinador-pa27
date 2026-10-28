# Frontend do Portal do Patrocinador

Integração atual: as telas consomem a API autenticada, persistem operações e transferem arquivos reais. Login, ativação e MFA estão conectados. Rotas e capacidades usam IDs de parceria, sem condições por cor. Consulte [telas e rotas atuais](docs/telas-portal.md) e [evidências de integração](../docs/integracao-backend.md#integração-angular-solicitada).

Os roteiros locais `scripts/check-auth-integration.cjs` e `scripts/check-portal-integration.cjs` requerem backend, frontend e Mailpit ativos, credenciais locais no `.env` da raiz, Playwright e Chromium disponíveis. Use `PLAYWRIGHT_MODULE` para selecionar o módulo instalado e `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para um executável fora do cache padrão. Os testes criam dados sintéticos e não limpam o banco existente.

## Histórico das prévias visuais

As seções abaixo registram a etapa demonstrativa anterior à integração. Seus caminhos `/previa/**` encaminham agora para a seleção autorizada; descrições de simulação não representam o comportamento atual.

> Estado atual das prévias Roxo/Verde e verificações do lote:
> [checkpoint dos clientes](docs/checkpoint-clientes.md). As seções abaixo também
> preservam o registro de ciclos anteriores; o checkpoint distingue código escrito
> de tela efetivamente conferida no navegador.

As 43 páginas principais do inventário estão pré-aprovadas por Bryan como
interfaces demonstrativas. Consulte [todos os links das telas](docs/telas-portal.md).
Pré-aprovação visual não representa integração real ou autorização de API.

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
desabilitado com orientação. O contrato final começa indisponível; a publicação
administrativa simulada é descrita adiante.

`ContractPreviewService` mantém uma decisão em memória vinculada à versão atual:
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

Não há assinatura, transmissão à RBS ou persistência real. Novas versões e arquivo
final podem ser simulados na perspectiva administrativa. Integração
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
mediante solicitação de correção; análise, correções e comprovação compartilham
agora o serviço da prévia administrativa descrita adiante. Não há controles de RBS na conta do
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

O conteúdo é somente leitura para o patrocinador. A gestão RBS abaixo compartilha
o serviço em memória na mesma instância Angular; outra aba ou recarga reinicia
os dados. Não há chatbot, chamadas HTTP ou publicação real.

## Prévia administrativa de dúvidas frequentes

`/previa/rbs/amarelo/duvidas-frequentes` reproduz o frame RBS `11:1345`, com
acesso pelo cabeçalho das áreas administrativas do Amarelo. Mantém as quatro
dúvidas iniciais, busca com Enter e categorias em modais de resultados (`14:1462`,
`14:1470`, `14:1478`, `14:1486`). A busca ignora caixa/acentos e exige todos os
termos no mesmo registro. Consulta vazia lista todas as dúvidas; categoria
independe da busca digitada. Não encontrar resultados oferece orientação.

Nova dúvida e Editar usam o formulário reativo de pergunta, resposta e categoria
(`76:2176`, `76:2198`, `76:2061`). Os três campos são obrigatórios, pergunta e
resposta não aceitam somente espaços, e Salvar fica desabilitado enquanto houver
campos inválidos. As categorias disponíveis nesta prévia são Materiais e Parceria,
sem gestão de novas categorias, exclusão ou limites de texto inventados.

Cancelar, fechar ou Escape descartam o rascunho. Ao editar a partir da busca ou
de uma categoria, o retorno preserva a consulta e atualiza os resultados, incluindo
mudanças de categoria; o foco retorna à ação de origem ou ao título se o item
deixou de corresponder. A confirmação segue `76:1776`. Salvar adiciona ou atualiza
o registro pelo ID em `FaqPreviewService`, mantendo as versões do formulário
separadas dos registros até a confirmação. Conteúdo é interpolado como texto.

A lista, a busca e as categorias do patrocinador usam o mesmo serviço somente
para leitura. Os dados ficam na instância da aplicação; não são persistidos no
navegador nem enviados a APIs. Recarregar restaura os quatro exemplos. A quinta
dúvida sobre cortesias só aparece se cadastrada, sem publicar o item oculto do
Figma automaticamente. Não há integração, autorização real ou alteração do backend.

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
Roxo agora abre seu perfil administrativo próprio; Verde aguarda seu ciclo.
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
RBS e retorno à lista. As sete áreas da parceria têm navegação entre si.
A FAQ administrativa já tem acesso pelo cabeçalho. O relatório da parceria e a
organização de planilhas possuem a simulação descrita abaixo. As prévias não
contêm chamadas HTTP nem integração real.

## Prévia administrativa do perfil Roxo

`/previa/rbs/roxo/perfil` reproduz o frame `16:1136`. A lista e os resultados de
busca abrem a parceria pelo ID estável `roxo`. A página segue a composição própria
do frame: dados em bloco de largura total, campos de até 680 px, identificação
Subcota G e documentos inicialmente vazios, sem acrescentar gerenciamento de acesso.

`RbsRoxoProfilePreviewService` mantém nome, cota, e-mail e publicação do exemplo
separados dos estados do Amarelo e do patrocinador. Salvar valida campos obrigatórios,
espaços em branco e formato de e-mail no formulário reativo; a confirmação (`16:1950`)
atualiza somente o perfil Roxo, sua identificação na navegação e a linha da lista.
Alterações não salvas permanecem apenas no formulário; a publicação não as confirma.

Disponibilizar material (`16:1239`) apresenta o exemplo `roxo_profile.pdf` do Figma.
Voltar ou Escape antes de salvar preserva a lista vazia. Confirmar disponibiliza
somente o registro ilustrativo, sem duplicar o card em confirmações repetidas; o
visualizador segue `16:1965`, sem PDF ou download. Não há seletor ou upload real.
Esse registro também atualiza a indicação de documentação do Roxo na lista.

`AdminPartnershipShell` recebe `sponsorId`, com padrão Amarelo preservado. No Roxo,
usa a identificação, a cor do selo e o perfil próprios. Notificações reproduzem o
estado sem pendências (`16:1955`), sem aproveitar a pendência de MIV do Amarelo.
O resumo de relatório do Roxo (`16:1970`) permite publicar o exemplo e acessar
as planilhas de origem. As sete áreas, entregas, FAQ e relatório estão disponíveis
para Roxo e Verde. Os componentes são reutilizados por ID da parceria, com
estados separados e sem inferir restrições de cota. O resultado das verificações
do lote está no [checkpoint dos clientes](docs/checkpoint-clientes.md).

Tudo fica somente em memória na instância Angular. Recarregar restaura o perfil
fictício e os documentos vazios. Não altera credenciais, permissões, cota contratual
ou dados reais, nem contém integração HTTP. O serviço existente do Amarelo foi
preservado, e a rota não representa autorização real ou sessão autenticada.

## Prévia administrativa de relatório da parceria

`/previa/rbs/amarelo/relatorio-da-parceria` reproduz `77:1831`, com retorno ao
perfil do Amarelo, seção de planilhas de origem e gestão do relatório final.
O cabeçalho das áreas RBS abre o diálogo `14:842`; “Organizar planilhas de origem”
leva à página. “Gerenciar relatório final” abre o mesmo diálogo.

Simulação autorizada em memória: “Selecionar planilhas” usa somente os metadados
dos dois exemplos do Figma, `midia_amarelo.xlsx` e `ativacoes_amarelo.xlsx`, sem
abrir seletor, ler ou transmitir arquivos do dispositivo. Conferir, escolher outros,
andamento e sucesso seguem `77:1951` a `77:1997`; os cards abrem os detalhes
administrativos de `77:2021`. Fechar durante o andamento cancela o temporizador
e não adiciona registros. Repetir a adição preserva os dois exemplos sem duplicar.
Esses nomes e a quantidade são dados demonstrativos, não limites do produto.

O link `/previa/rbs/amarelo/relatorio-da-parceria?exemplo=falha-planilhas` simula
falha apenas na primeira tentativa de adição (`77:2008`). O rascunho é preservado;
“Tentar novamente” retorna à conferência. A falha é um cenário de demonstração,
sem rede ou aleatoriedade. Recarregar reinicia o cenário.

“Gerar relatório” continua desabilitado antes e depois da adição. A página não
interpreta planilhas, calcula indicadores ou gera PDF. As fontes ficam isoladas
em `SourceSheetsPreviewService`, usado apenas pela página administrativa; não
são apresentadas no diálogo do patrocinador.

Disponibilizar relatório usa o exemplo `relatorio_cliente_amarelo.pdf` já
selecionado no Figma (`14:1902`). Somente “Publicar arquivo” altera o estado;
fechar antes descarta a intenção. A confirmação segue `14:979`. A publicação
repetida mantém o mesmo registro e data, sem inventar versões ou substituição.
Ela não depende das planilhas nem as modifica. `PartnershipReportPreviewService`
contém apenas o registro de publicação, sem PDF, arquivo binário ou chamada HTTP.

O componente `PartnershipReport` é reutilizado pelos cabeçalhos RBS e patrocinador.
Após a publicação simulada, oferece consulta e visualizador ilustrativo (`14:865`,
`14:668`); “Baixar relatório/arquivo” fica desabilitado e explica que não existe
arquivo real. O patrocinador conserva somente leitura, sem controles de publicação
ou organização de planilhas. Isso é apresentação da prévia, não autorização no
backend. A prévia de uma entrega (`DeliveryReport`) permanece separada do relatório
final. Os estados valem apenas para a mesma instância Angular; outra aba ou
recarga reinicia os dados. Integração e contratos ficam para alinhamento posterior.

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

O cartão da logo, Acompanhar entrega e Registrar na entrega abrem o detalhe
administrativo de Logo no telão (`11:1167`). A navegação não registra execução
ou comprovação automaticamente.

## Prévia administrativa de mídia e conteúdo

`/previa/rbs/amarelo/midia-e-conteudo` reproduz `10:902`, com diálogos de envio
(`14:1380`, `14:1392`, `14:1410`), briefing (`14:1439`), histórico (`15:1209`),
controle de envio (`14:1862`/`14:1872`), publicação (`14:1932`) e veiculações (`14:2066`).

`MediaPreviewService` compartilha metadados, briefing, estado de envio e quantidade
exibida de Stories na mesma instância da aplicação. Navegar entre as rotas Angular
preserva esses dados; recarregar ou abrir outra aba restaura os exemplos do Figma.
O controle de mídia é independente do controle de marca. Encerrar exige confirmação
e oculta envio de arquivos e briefing nas duas perspectivas, preservando histórico
e visualizadores. Os métodos também verificam o estado antes de registrar dados.

Adicionar material recebido guarda somente nome, tamanho, versão, data e autoria.
O conteúdo não é lido ou transmitido. Arquivos vazios são recusados; fechar durante
o progresso ou sair da tela cancela o registro pendente. O exemplo inicial é
identificado no histórico, sem transformar datas do protótipo em registros reais.

Atualizar veiculações edita somente Stories exibidos. O campo começa na quantidade
atual e exige um inteiro não negativo representável com segurança em JavaScript.
Não impõe o número previsto como limite nem altera os direitos da parceria.
Cancelar descarta o rascunho; salvar atualiza a tabela e a leitura do patrocinador.

Publicar arquivo ou link abre o PDF ilustrativo pré-selecionado do Figma. Confirmar
registra apenas um indicador de publicação simulada, sem duplicar cartões, gerar
relatório, criar link, upload ou download real. O modal do post não inventa URL.
Esta etapa não inclui chamadas HTTP nem autorização ou bloqueio real no backend.

## Prévia administrativa de cortesias

`/previa/rbs/amarelo/cortesias` reproduz o frame `10:1040` com os refinamentos
de inclusão (`76:1787`), edição individual (`76:1810`, `80:2037`, `80:2060`)
e confirmação (`76:1776`). Os formulários têm 720 px no desktop e se adaptam
à largura disponível. Cada card mantém quantidade, tipo de ingresso e setor.

`TicketsPreviewService` mantém uma lista reativa em memória, compartilhada com
a leitura do patrocinador na mesma instância da aplicação. Adicionar cria um
novo identificador local; editar preserva esse identificador e altera somente
o registro escolhido. As combinações não são deduplicadas ou consolidadas.
Navegar preserva os registros; recarregar ou abrir outra aba reinicia a prévia.

Adicionar abre campos vazios com exemplos como placeholders; editar carrega
os valores atuais, sem aplicar automaticamente os números de demonstração
do Figma. Campos são obrigatórios, textos de espaços são recusados e a quantidade
deve ser um inteiro não negativo representável com segurança em JavaScript.
Não há teto por cota nem catálogo fechado de tipos ou setores. Zero é aceito
na simulação; as regras reais dependerão da etapa de contrato e integração.

Cancelar, Escape ou fechar descartam o rascunho. Salvar exige dados válidos
e mostra a confirmação de alteração local. A consulta do patrocinador continua
somente leitura. A destinação segue indisponível; não há emissão, QR code,
bilheteria, exclusão, chamadas HTTP ou alteração no backend nesta etapa.

## Prévia administrativa de credenciamento

`/previa/rbs/amarelo/credenciamento` reproduz `10:1131`, com edição de quantidade
e setor (`14:2050`) e confirmação (`14:979`). O tipo permanece somente leitura,
como no frame. Não adiciona cadastros de pessoas, emissão ou integração Open Staff.

`StaffPreviewService` mantém os valores em um signal, compartilhado pela leitura
do patrocinador na mesma instância da aplicação. Navegar preserva a edição;
recarregar ou abrir outra aba restaura os exemplos (12 / Equipe de ativação /
Área de ativação). Os formulários começam nos valores atuais. Fechar ou Escape
descarta o rascunho; salvar atualiza apenas quantidade e setor.

Quantidade exige inteiro não negativo representável com segurança em JavaScript;
setor exige texto além de espaços e é salvo sem espaços nas extremidades.
Zero é aceito nesta simulação, sem definir limites por cota ou regras reais.
O modal tem 640 px no desktop e se adapta à largura disponível.
O endereço externo continua pendente; a tela RBS contém somente as orientações
e a ação de edição previstas no frame. Não há chamadas HTTP ou alterações no backend.

## Prévia administrativa de pesquisa da ativação

`/previa/rbs/amarelo/pesquisa-da-ativacao` reproduz `10:1222`: perguntas recebidas
somente leitura, controle de envio (`14:1882`, `14:1892`) e publicação ilustrativa
de resultados (`14:1917`). Confirmação e visualizador usam `14:979` e `14:957`.

`SurveyPreviewService` guarda perguntas, disponibilidade de envio e publicação
em memória. O controle é próprio da pesquisa, independente de Marca e Mídia.
Encerrar/reabrir exige confirmação e preserva as perguntas recebidas. Cancelar,
Escape ou fechar não altera o estado. Na perspectiva do patrocinador, encerrar
mantém os textos consultáveis, como somente leitura, e oculta o envio. O serviço
também recusa alterações enquanto fechado e conjuntos de perguntas vazias.

Publicar arquivo confirma o PDF de exemplo pré-selecionado no Figma e revela
um único card de resultados; repetir a ação não duplica o card. O visualizador
é ilustrativo e o download permanece indisponível, pois nenhum arquivo é lido,
enviado ou armazenado. Não foram criadas seleção de arquivos, URLs ou análise
de resultados. O direito a três perguntas é um exemplo do Cliente Amarelo,
sem inferir direitos de outras cotas. Navegar preserva os dados nesta instância;
recarregar ou abrir outra aba restaura os exemplos. Não há integração HTTP,
persistência real ou alterações no backend.

## Prévia administrativa de contrato

`/previa/rbs/amarelo/contrato` reproduz `10:1335`, com documento (`14:1607`),
histórico (`14:1623`), versão corrigida (`14:1667`), publicação do assinado
(`14:1682`) e consulta final (`14:1642`). A versão 1 começa disponibilizada e
aguardando validação, como no frame. Por isso a ação inicial de disponibilização
(`14:1652`) não aparece neste cenário. A RBS não aprova nem solicita ajustes em
nome do patrocinador, nem edita os signatários recebidos.

O serviço compartilha versão atual, decisões e histórico em memória. Uma solicitação
de ajustes habilita publicar a versão corrigida. Confirmar cria a próxima versão,
preserva comentário/decisão da anterior e aguarda nova decisão do patrocinador.
Cancelar não cria versão. A aprovação habilita publicar o arquivo assinado, cuja
base permanece vinculada à versão aprovada. Repetir a publicação é recusado pelo
serviço. A aprovação por si só não cria arquivo final nem equivale a assinatura.

Os diálogos mostram PDFs de exemplo pré-selecionados, sem seleção, leitura, upload,
download real ou assinatura digital. Datas iniciais são identificadas como exemplo;
registros simulados usam a data da sessão. Navegar preserva dados apenas nesta
instância; recarregar ou abrir outra aba restaura o cenário inicial. Não há seletor
de perfil ou cenários, chamadas HTTP, persistência real ou alteração no backend.
As transições dependentes da decisão do patrocinador podem ser verificadas no
serviço, sem criar ações administrativas para simular decisões de outro perfil.

## Prévia administrativa de entregas da parceria

`/previa/rbs/amarelo/entregas` reproduz `11:1040`, com resumo, totais ilustrativos,
links para áreas administrativas, pendência de MIV e prévia de relatório (`14:877`).
O cabeçalho e a navegação usam `AdminPartnershipShell`; os estilos do resumo e o
componente `DeliveryReport` são reutilizados. O relatório aceita o nome da parceria
como input, mantendo o valor padrão da consulta do patrocinador.

Organizar entrega (`14:1790`) abre com o responsável atual. Selecionar Ana ou Bruno
mostra a confirmação (`17:1668`/`17:1676`); somente Salvar responsável aplica a
escolha. Cancelar, Escape ou fechar descarta o rascunho. Os dois nomes são exemplos
do Figma, sem representar um cadastro de pessoas ou permissões reais.
`LogoDeliveryPreviewService` compartilha o responsável com o resumo e a prévia do
relatório na mesma instância. Navegar preserva a escolha; recarregar restaura Ana.

Os totais começam em 1/1/1 e acompanham somente as transições ilustrativas da logo
no Figma (0/2/1 durante execução e 0/1/2 após realização), sem matriz de direitos
ou mecanismo real de consolidação. A pendência do MIV acompanha a prévia
existente. Mídia, Pesquisa e Ver pendência levam somente à perspectiva RBS.
Acompanhar entrega abre Logo no telão administrativo. Não há envio de arquivos
ou geração/publicação real de relatório, HTTP ou alteração no backend.

## Prévia administrativa de Logo no telão

`/previa/rbs/amarelo/entregas/logo-no-telao` reproduz `11:1167`. Começa aguardando
o patrocinador, sem botão RBS para enviar a logo em seu lugar. Para testar a jornada
isoladamente, `?exemplo=material-recebido` inclui um único registro fictício do Figma
somente quando a sessão ainda está vazia. Ele é identificado como exemplo, sem
conteúdo ou tamanho real, e não substitui dados de uma sessão em andamento.

A sequência é recebimento → análise → aprovação ou ajuste → execução → realização
→ comprovação. O serviço recusa transições fora de ordem. Aprovação, ajuste e
realização têm confirmação (`14:1805`, `14:1813`, `14:1821`); cancelar não altera
o estado. A solicitação usa o texto ilustrativo fixo do Figma. Uma nova versão só
pode ser enviada pelo patrocinador após ajuste e com envio de marca aberto.
O histórico preserva versão, autoria/data de envio e decisão/comentário anteriores.

Registrar comprovação (`14:1829`) permite editar a descrição de exemplo e exige
texto além de espaços. Publicar registra descrição, responsável atual, data local
e versão do material, e bloqueia publicação duplicada. A consulta (`14:933`) e o
relatório mostram esse registro simulado, sem mídia, arquivo ou evidência real.
A realização da ação é separada da publicação de comprovação. Os downloads dos
visualizadores (`14:946`, `14:919`) permanecem indisponíveis.

O componente `DeliveryOrganizer` reaproveita o diálogo de responsável no resumo
e no detalhe; o `DeliveryReport` continua compartilhado. Os acessos por Entregas,
Aplicações de marca e Todas as entregas permanecem na perspectiva RBS. A consulta
do patrocinador acompanha o mesmo serviço na mesma instância Angular, sem seletor
de perfil nem sessão autenticada. Recarregar reinicia tudo; não há backend,
persistência, notificações enviadas ou execução real de qualquer ação.

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
