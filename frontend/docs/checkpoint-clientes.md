# Prévias Roxo e Verde — checkpoint e verificação do lote

Registro histórico da etapa visual, anterior à integração. O router atual não expõe as prévias por cor. As funcionalidades usam páginas canônicas e dados da parceria autorizada, conforme [telas-portal.md](telas-portal.md).

Situação em 28/10/2026. Bryan pediu concluir o lote das 19 versões restantes e,
posteriormente, antecipou um checkpoint de Git para depois de Aplicações de marca
do Roxo. Somente `frontend/` participa deste checkpoint.

## Estado do lote

O código das 19 versões já foi escrito e ligado à navegação. O perfil Roxo
existente é reaproveitado para o Verde. Isso resulta em 20 rotas para os dois
clientes, sem implementar cópias independentes de cada componente.

| Páginas | Roxo | Verde |
| --- | --- | --- |
| Perfil | Pré-aprovado no ciclo anterior | Pré-aprovado por Bryan |
| Aplicações de marca | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Mídia e conteúdo | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Cortesias | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Credenciamento | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Pesquisa da ativação | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Contrato | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Entregas | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| FAQ | Pré-aprovado por Bryan | Pré-aprovado por Bryan |
| Relatório | Pré-aprovado por Bryan | Pré-aprovado por Bryan |

Depois do checkpoint, as 18 versões restantes foram conferidas no navegador.
Em 28/10/2026, Bryan solicitou expressamente a pré-aprovação das 19 versões
entregues no lote. Com as 24 pré-aprovações anteriores, o inventário atual contém
43 páginas principais pré-aprovadas como interfaces demonstrativas.

Essa decisão registra a pré-aprovação do Bryan e não acrescenta evidências de
testes nem comprova integração real. Ajustes posteriores poderão ser solicitados
durante sua navegação. O inventário completo está em [Telas do portal](telas-portal.md).

## Referências e implementação

Arquivo Figma: `gcTHwwkH4AYZSCAg6PPtLJ`, página `3:4`. Frames principais consultados:

| Área | Roxo | Verde |
| --- | --- | --- |
| Perfil | `16:1136` | `16:2013` |
| Marca | `16:1253` | `16:2130` |
| Mídia | `16:1354` | `16:2231` |
| Cortesias | `16:1455` | `16:2332` |
| Credenciamento | `16:1595` | `16:2429` |
| Pesquisa | `16:1692` | `16:2526` |
| Contrato | `16:1793` | `16:2627` |
| Entregas | `16:1872` | `16:2706` |
| FAQ | `81:2061` | `81:2251` |
| Relatório | `77:2044` | `77:2255` |

`client-areas/client-preview.routes.ts` define as rotas; `shared/client-preview.service.ts`
mantém perfis, publicações e credenciamento separados por identificador. As rotas
de cortesias, FAQ e planilhas têm seus próprios serviços por parceria. O Amarelo
mantém as instâncias anteriores como padrão. Rotas novas não representam login,
permissão ou isolamento real de API.

Os componentes de marca, mídia e pesquisa compartilham a apresentação de
publicação de documento. Cortesias, FAQ e planilhas reutilizam os formulários
existentes. O perfil mantém seus arquivos `roxo-profile.*`, agora atendendo também
o Verde por dados da rota.

Os exemplos começam sem publicações, cortesias, credenciamento ou planilhas.
Contrato permanece bloqueado aguardando os signatários. Entregas permanece vazio.
Esses estados vêm do protótipo, sem deduzir limites ou direitos das cotas.

## Verificações executadas

- Build de produção no Docker: passou. Avisos de orçamento inicial (896,74 kB,
  limite de erro 1 MB), estilos do shell de patrocinador, lista e login permanecem.
- `node scripts/check-client-previews.mjs`: passou. Verifica 20 rotas únicas,
  edição e separação dos perfis, publicação por área, números inteiros não
  negativos, adicionar/editar cortesias, FAQ por categoria, planilhas sem
  duplicação e preservação do estado padrão do Amarelo.
- Aplicações de marca do Roxo: renderização em 1440 × 900 comparada ao frame
  `16:1253`; logo local carregado em 64 × 64, cartão com 1112 px e padding 24 px.
- Cancelar não publica; confirmar mostra um cartão; repetir não duplica; abrir
  exibe o diálogo previsto; navegar ao perfil e retornar preserva o material;
  recarregar restaura o estado vazio.
- Teclado: abrir e confirmar com Enter; Tab dentro do diálogo; Escape fecha e
  devolve o foco ao controle de origem; título recebe foco após a confirmação.
- Largura 390 px: página e modal sem rolagem horizontal de página.
- Console do navegador sem erros ao concluir o teste dessa tela.
- `git diff --check` passou após corrigir linhas vazias no fim dos templates.

## Conferência após o checkpoint

- As 18 páginas restantes foram abertas individualmente em 1440 × 900, comparadas
  aos frames correspondentes e registradas em capturas. O perfil Roxo já existia;
  a tela Marca Roxo foi conferida antes do checkpoint. A navegação, os títulos,
  os estados iniciais e os selos identificaram a parceria correta.
- O mesmo logo local corresponde ao hash `4d38bd4c2b6b5d7611e9a6276662de061df78b3d`
  nos 19 frames do lote. Nas páginas abertas, carregou no slot de 64 × 64.
- Publicação, cancelamento e visualização foram exercitados nas cinco áreas de
  materiais restantes (mídia/pesquisa Roxo e marca/mídia/pesquisa Verde).
- Perfil Verde: três campos inválidos bloquearam o envio; dados válidos e a
  publicação do documento atualizaram somente a linha Verde na lista.
- Cortesias Roxo: envio vazio exibiu três erros; valores negativos e fracionários
  foram recusados; dois registros foram adicionados e um foi editado. Navegar ao
  Verde mostrou a lista vazia; adicionar ali preservou os dois registros do Roxo
  ao retornar, sem recarregar a aplicação.
- Credenciamento dos dois clientes: campos obrigatórios, gravação e cancelamento
  de rascunho verificados. Cancelar preservou a quantidade anterior.
- FAQ: criação no Verde, edição no Roxo, busca sem resultados, filtro Materiais e
  bloqueio de campos vazios ou só de espaços. Ao alternar parceiros, a pergunta
  do Verde e a resposta do Roxo permaneceram separadas.
- Relatórios: publicação, cancelamento e visualizador; relatório e planilhas do
  Verde não apareceram no Roxo. A simulação de falha
  `?exemplo=falha-planilhas` não adicionou arquivos; nova tentativa adicionou os
  dois exemplos. Repetir a inclusão manteve somente dois registros. Detalhes
  mostraram os nomes do cliente correto. Geração automática permaneceu bloqueada.
- Todas as 18 páginas restantes foram conferidas com viewport CSS de 390 px,
  medida no DOM considerando o zoom do navegador, sem rolagem horizontal da página.
  Também passaram em 354 px. Formulários de planilhas, FAQ, cortesias e
  credenciamento couberam no modal de aproximadamente 359 px em viewport 390 px,
  sem excesso horizontal no corpo do diálogo.
- Ajustes encontrados na revisão: cor cinza do botão de contrato bloqueado,
  espaçamento do estado vazio de cortesias e remoção da reserva vazia de cartões
  em largura mobile. A nota de simulação usa a tipografia auxiliar existente.

## Integração e continuidade

Tudo permanece em memória. PDFs e planilhas são exemplos de metadados do Figma;
não há arquivos reais, upload, processamento, geração automática ou publicação
real. FAQ e cortesias não consultam APIs. Autenticação segue independente desta
etapa. Backend, Compose, dependências e lockfile não foram alterados.

O checkpoint contém também telas de ciclos anteriores ainda sem commit e a
estrutura já escrita do lote. Não é um commit isolado somente da tela Marca.
O commit `1413dac` foi criado por Bryan e confirmado na `dev-bryan` do GitHub por
consulta direta ao remoto. A conferência das 18 versões restantes foi retomada
após esse checkpoint. Posteriormente, Bryan autorizou a criação de um commit
local com os ajustes finais, a pré-aprovação do lote e os links das telas. O push
fica a cargo de Bryan, somente para `dev-bryan`, sem PR ou merge.
Antes de qualquer integração real, perguntar a Bryan como está o desenvolvimento
correspondente do backend do Ícaro.
