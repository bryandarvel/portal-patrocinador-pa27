# Telas do Portal do Patrocinador

## Rotas integradas ao backend

Em 28/10/2026, as áreas usam sessão, dados e arquivos reais. Os IDs vêm da API. RBS acessa `/rbs/parcerias/:parceriaId`; patrocinador acessa `/parcerias/:parceriaId`. O backend valida papel, vínculo e capacidade em cada operação.

| Tela | Caminho ou sufixo | Ações conectadas |
| --- | --- | --- |
| Login | `/login` | Senha, desafio MFA, identidade e redirecionamento por perfil |
| Ativação | `/verificar?token=...` | Ativar convite recebido por e-mail |
| Minha conta | `/conta` | Configurar/confirmar MFA e sair |
| Parcerias autorizadas | `/parcerias` | Listar, buscar, paginar e abrir |
| Gestão RBS | `/rbs/patrocinadores` | Listar, buscar, cadastrar parceria/contato, cotas, benefícios, modelos de entrega e convite RBS |
| Perfil | `/perfil` | Nome/cota, documentos comerciais, múltiplos acessos e convites |
| Marca | `/aplicacoes-de-marca` | MIV, versões, publicações, recebimento e entregas da área |
| Mídia | `/midia-e-conteudo` | Arquivos, briefing, versões, publicações e veiculações |
| Cortesias | `/cortesias` | Quantidades, períodos, limites e destinação |
| Credenciamento | `/credenciamento` | Quantidades por benefício/setor/público, versões e URL Open Staff |
| Pesquisa | `/pesquisa-da-ativacao` | Até três perguntas, recebimento e resultados |
| Contrato | `/contrato` | Signatários, versões, aprovação/ajustes e documento assinado externamente |
| Entregas | `/entregas` | Resumo, criação RBS, responsável e navegação por área |
| Detalhe da entrega | `/entregas/:entregaId` | Material/versionamento, análise, execução e comprovações |
| FAQ | `/duvidas-frequentes` | Busca/categoria, cadastro e edição RBS |
| Relatório RBS | `/relatorio-da-parceria` | Planilhas internas, consolidação automática e complemento |
| Relatório/notificações | Modais do cabeçalho | Relatório/HTML/arquivos autorizados e avisos reais da parceria |
| Acesso/indisponibilidade | `/sem-acesso` | Sem permissão ou tentativa de recarga após falha de conexão |

Escritas e dados internos seguem o papel e os contratos em [backend-api.md](../../docs/backend-api.md). A aparência PA27 permanece; as variações antigas convergem conforme os dados/capacidades. Não há um mapeamento de cores para contas de produção.

Desde 30/10/2026 as telas autenticadas seguem o layout v2 (cabeçalho, barra lateral numerada com Entregas como 08, ajuda flutuante e cartões com ícone). Padrões e tokens: [DESIGN.md](../../DESIGN.md); contrato e verificação: [frontend-v2-design](../../openspec/changes/frontend-v2-design/).

## Histórico da pré-aprovação visual

O inventário anterior registrava **43 páginas principais pré-aprovadas por Bryan** como interfaces demonstrativas, incluindo 19 versões do último lote. Os links históricos abaixo deixam de exibir exemplos e encaminham à seleção autorizada. Para uso atual, siga as rotas da tabela acima.

## Login comum (1)

- [Login](http://localhost:4200/login)

## Admin RBS — gestão (1)

- [Lista de patrocinadores](http://localhost:4200/previa/rbs/patrocinadores)

## Patrocinador — exemplo Amarelo (10)

- [Perfil do cliente](http://localhost:4200/previa/perfil)
- [Aplicações de marca](http://localhost:4200/previa/aplicacoes-de-marca)
- [Mídia e conteúdo](http://localhost:4200/previa/midia-e-conteudo)
- [Cortesias](http://localhost:4200/previa/cortesias)
- [Credenciamento](http://localhost:4200/previa/credenciamento)
- [Pesquisa da ativação](http://localhost:4200/previa/pesquisa-da-ativacao)
- [Contrato](http://localhost:4200/previa/contrato)
- [Entregas da parceria](http://localhost:4200/previa/entregas)
- [Logo no telão](http://localhost:4200/previa/entregas/logo-no-telao)
- [Dúvidas frequentes](http://localhost:4200/previa/duvidas-frequentes)

## Admin RBS — Cliente Amarelo (11)

- [Perfil do cliente](http://localhost:4200/previa/rbs/amarelo/perfil)
- [Aplicações de marca](http://localhost:4200/previa/rbs/amarelo/aplicacoes-de-marca)
- [Mídia e conteúdo](http://localhost:4200/previa/rbs/amarelo/midia-e-conteudo)
- [Cortesias](http://localhost:4200/previa/rbs/amarelo/cortesias)
- [Credenciamento](http://localhost:4200/previa/rbs/amarelo/credenciamento)
- [Pesquisa da ativação](http://localhost:4200/previa/rbs/amarelo/pesquisa-da-ativacao)
- [Contrato](http://localhost:4200/previa/rbs/amarelo/contrato)
- [Entregas da parceria](http://localhost:4200/previa/rbs/amarelo/entregas)
- [Logo no telão](http://localhost:4200/previa/rbs/amarelo/entregas/logo-no-telao)
- [Dúvidas frequentes](http://localhost:4200/previa/rbs/amarelo/duvidas-frequentes)
- [Relatório da parceria](http://localhost:4200/previa/rbs/amarelo/relatorio-da-parceria)

## Admin RBS — Cliente Roxo (10)

- [Perfil do cliente](http://localhost:4200/previa/rbs/roxo/perfil)
- [Aplicações de marca](http://localhost:4200/previa/rbs/roxo/aplicacoes-de-marca)
- [Mídia e conteúdo](http://localhost:4200/previa/rbs/roxo/midia-e-conteudo)
- [Cortesias](http://localhost:4200/previa/rbs/roxo/cortesias)
- [Credenciamento](http://localhost:4200/previa/rbs/roxo/credenciamento)
- [Pesquisa da ativação](http://localhost:4200/previa/rbs/roxo/pesquisa-da-ativacao)
- [Contrato](http://localhost:4200/previa/rbs/roxo/contrato)
- [Entregas da parceria](http://localhost:4200/previa/rbs/roxo/entregas)
- [Dúvidas frequentes](http://localhost:4200/previa/rbs/roxo/duvidas-frequentes)
- [Relatório da parceria](http://localhost:4200/previa/rbs/roxo/relatorio-da-parceria)

## Admin RBS — Cliente Verde (10)

- [Perfil do cliente](http://localhost:4200/previa/rbs/verde/perfil)
- [Aplicações de marca](http://localhost:4200/previa/rbs/verde/aplicacoes-de-marca)
- [Mídia e conteúdo](http://localhost:4200/previa/rbs/verde/midia-e-conteudo)
- [Cortesias](http://localhost:4200/previa/rbs/verde/cortesias)
- [Credenciamento](http://localhost:4200/previa/rbs/verde/credenciamento)
- [Pesquisa da ativação](http://localhost:4200/previa/rbs/verde/pesquisa-da-ativacao)
- [Contrato](http://localhost:4200/previa/rbs/verde/contrato)
- [Entregas da parceria](http://localhost:4200/previa/rbs/verde/entregas)
- [Dúvidas frequentes](http://localhost:4200/previa/rbs/verde/duvidas-frequentes)
- [Relatório da parceria](http://localhost:4200/previa/rbs/verde/relatorio-da-parceria)

O relatório do patrocinador abre pelo botão **Relatório da parceria** no cabeçalho, sem uma página adicional. Roxo e Verde começam sem entregas cadastradas e não possuem um frame próprio de Logo no telão neste inventário. Modais, mensagens e estados não foram contados como páginas extras.

Referências e evidências: [checkpoint dos clientes](checkpoint-clientes.md).
