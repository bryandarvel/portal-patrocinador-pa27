# Inventário das telas e proposta de integração com o backend

> Registro histórico iniciado em 28/10/2026. Para a demonstração atual, use [README](../README.md), [arquitetura PA27](arquitetura-demo-pa27.md) e [matriz da Entrega 3](entrega-3-matriz.md). As referências abaixo a ausência de deploy, armazenamento apenas local ou planilhas sem processamento descrevem aquela data; a versão PA27 possui hospedagem Vercel/Render/Supabase e importação dos modelos DOCX/XLSX. Os resultados antigos não constituem homologação atual da RBS.

Inventário e implementação de 28/10/2026. O backend foi implementado e validado localmente após o usuário indicar o TAP/planos como fonte autoritativa e confirmar a consolidação automática dos dados do portal. As tabelas iniciais de proposta foram preservadas como contexto; o contrato atual está em [backend-api.md](backend-api.md) e o resultado verificável ao final deste documento.

## Objetivo e alcance

Conectar as telas existentes a autenticação, dados persistentes e operações reais. Inventariar navegação e ações, reutilizar os endpoints existentes e identificar contratos ausentes. Critério deste levantamento: cobrir as rotas Angular declaradas, as geradas por cliente e os fluxos de seus componentes e serviços de prévia.

Fontes: [rotas principais atuais](../frontend/src/app/app.routes.ts), componentes e serviços em `frontend/src/app/features/`, controllers e serviços em `backend/src/main/java/com/rbs/portal_patrocinador/`. O antigo arquivo `features/admin/client-areas/client-preview.routes.ts` citado no levantamento foi substituído; seu caminho é mantido aqui somente como referência histórica.

- [x] Inventariar telas e variações.
- [x] Levantar operações e endpoints existentes.
- [x] Propor rotas, restrições de acesso e lacunas.
- [x] Consolidar as regras a partir do TAP/planos indicados pelo usuário e confirmar o alcance do relatório automático.
- [x] Implementar e validar o backend localmente.
- [ ] Integrar as telas Angular às APIs e validar a experiência ponta a ponta.

## Telas existentes

São 43 URLs de telas, além do redirecionamento `/` para `/login`: 1 login, 10 prévias do patrocinador, 12 rotas administrativas explícitas e 20 administrativas geradas. Componentes repetidos por cliente não representam funcionalidades distintas. Modais não são URLs adicionais.

| Tela | Patrocinador, prefixo `/previa` | RBS, prefixo `/previa/rbs/{cliente}` |
| --- | --- | --- |
| Perfil e documentos comerciais | `/perfil` | `/perfil` |
| Aplicações de marca e MIV | `/aplicacoes-de-marca` | `/aplicacoes-de-marca` |
| Mídia e conteúdo | `/midia-e-conteudo` | `/midia-e-conteudo` |
| Cortesias | `/cortesias` | `/cortesias` |
| Credenciamento | `/credenciamento` | `/credenciamento` |
| Pesquisa da ativação | `/pesquisa-da-ativacao` | `/pesquisa-da-ativacao` |
| Contrato | `/contrato` | `/contrato` |
| Entregas da parceria | `/entregas` | `/entregas` |
| Detalhe de entrega: logo no telão | `/entregas/logo-no-telao` | `/entregas/logo-no-telao`, somente Amarelo |
| Dúvidas frequentes | `/duvidas-frequentes` | `/duvidas-frequentes` |
| Gestão de planilhas e relatório | Relatório final em modal no cabeçalho | `/relatorio-da-parceria` |

`{cliente}` atualmente é `amarelo`, `roxo` ou `verde`. As dez rotas administrativas sem detalhe de entrega existem para os três clientes; a de detalhe existe só para Amarelo. A lista/cadastro de patrocinadores fica em `/previa/rbs/patrocinadores`. O login fica em `/login`.

Roxo e Verde usam estados iniciais e componentes compartilhados: publicar documento por área, editar perfil, cadastrar credenciamento, ver contrato aguardando signatários e lista de entregas vazia. Não possuem todo o fluxo demonstrado no Amarelo.

Modais e ações que também precisam de integração: cadastro de patrocinador e acesso; edição de perfil/e-mail; visualizar/baixar documentos; upload e histórico; briefing; abrir/encerrar recebimento; publicar materiais/resultados; editar veiculações; editar cortesias e credenciais; aprovar/solicitar ajuste de contrato; publicar versão corrigida ou assinada; atribuir responsável; analisar/aprovar/solicitar ajuste de material; registrar execução e comprovação; manter FAQ; notificações; planilhas de origem e publicação do relatório final.

## APIs existentes

| Método e rota | Situação no código |
| --- | --- |
| `POST /api/auth/cadastro` | Cadastro com BCrypt e envio de verificação. Recebe papel no DTO; rever autorização antes de usar para provisionar administradores/acessos. |
| `GET /api/auth/verificar?token=...` | Verifica e ativa o usuário. |
| `POST /api/auth/login` | Valida senha BCrypt e pode gerar JWT ou solicitar MFA/confirmação de login suspeito. |
| `POST /api/auth/validar-mfa` | Valida código e emite JWT; precisa vincular a um desafio de login válido. |
| `GET /api/auth/confirmar-login-suspeito?token=...` | Confirma e emite JWT; envio do e-mail deste fluxo está comentado. |
| `POST /api/mfa/setup/{email}` | Configura segredo; vincular operação à identidade autenticada. |
| `POST /api/mfa/confirm/{email}` | Ativa MFA; vincular operação à identidade autenticada. |
| `GET /api/admin/painel` | Retorna mensagem, e-mail e papel; não fornece dados de patrocinadores ou entregas. |

Essas são oito operações, sete de autenticação/MFA e uma de painel. A existência dos handlers não comprova o fluxo integrado. O Angular não usa `HttpClient` nas fontes examinadas; o login só valida campos. As entidades persistidas atuais são `Usuario` e `LoginHistory`; não há vínculo de usuário com parceria modelado nelas.

## Proposta de rotas de negócio

Base `P = /api/parcerias/{parceriaId}`. A mesma rota de leitura atende RBS e patrocinador com autorização e projeção de campos no servidor. Escritas administrativas são exclusivas de RBS mesmo sem `/admin` no caminho. Identificadores são reais, não cores do protótipo. Patrocinador e parceria precisam ser relacionados no modelo; uma conta de acesso não substitui essa relação.

| Área | Rotas propostas | Operação e acesso |
| --- | --- | --- |
| Sessão | `GET /api/auth/me` | Identidade, papel e parcerias autorizadas. Reutilizar os handlers de login/MFA existentes após revisão do fluxo. |
| Lista e cadastro | `GET /api/parcerias?busca=...&pagina=...`; `POST /api/parcerias` | Listar apenas o escopo autorizado; RBS cadastra patrocinador, parceria, cota e acesso inicial em transação. Não permitir que o solicitante escolha um papel privilegiado. |
| Perfil | `GET P`; `PATCH P` | Ler dados e capacidades da parceria; editar nome/cota e demais campos administrativos pela RBS. |
| Acesso do patrocinador | `PATCH P/acesso` | RBS altera o e-mail autorizado, com política de confirmação e vínculo consistente com o usuário. Não retornar senha. |
| Documentos comerciais | `GET P/documentos`; `POST P/documentos` | Consultar e publicar arquivos comerciais reais; escrita RBS. |
| Arquivos | `GET P/arquivos/{arquivoId}` | Visualizar/baixar conteúdo autorizado. Controlar também arquivos históricos; planilhas internas são exclusivas RBS. |
| Aplicações de marca | `GET P/marca`; `POST P/marca/miv/versoes` | Carregar materiais/estado e enviar nova versão de MIV, preservando histórico. |
| Histórico MIV | `GET P/marca/miv/versoes` | Consultar versões e referências aos arquivos. |
| Recebimento MIV | `PATCH P/marca/recebimento` | RBS abre/encerra recebimento; servidor aplica a restrição no upload. |
| Publicações de marca | `POST P/marca/publicacoes` | RBS publica documentos da área, inclusive o estado demonstrado para Roxo/Verde. Leitura em `GET P/marca`. |
| Mídia | `GET P/midia`; `POST P/midia/versoes`; `GET P/midia/versoes` | Carregar área, enviar arquivo e consultar histórico. |
| Briefing | `PUT P/midia/briefing` | Salvar texto de briefing enquanto recebimento estiver aberto. |
| Gestão de mídia | `PATCH P/midia/recebimento`; `PATCH P/midia/veiculacoes`; `POST P/midia/publicacoes` | RBS abre/encerra envio, atualiza inserções e publica arquivo/link, post ou relatório de mídia. |
| Cortesias | `GET P/cortesias`; `POST P/cortesias`; `PATCH P/cortesias/{cortesiaId}` | Patrocinador consulta; RBS cadastra/edita quantidade, tipo e setor. Não há emissão nominal no protótipo. |
| Credenciamento | `GET P/credenciamento`; `PUT P/credenciamento` | Consultar quantidade, tipo, setor e URL externa do Open Staff; escrita RBS. Sem implementar outro sistema de credenciamento dentro do portal. |
| Pesquisa | `GET P/pesquisa`; `PUT P/pesquisa/perguntas` | Consultar área/perguntas/resultados; patrocinador envia as três perguntas, respeitando recebimento. |
| Gestão de pesquisa | `PATCH P/pesquisa/recebimento`; `POST P/pesquisa/resultados` | RBS abre/encerra envio e publica arquivo de resultados. |
| Contrato | `GET P/contrato`; `GET P/contrato/versoes`; `POST P/contrato/versoes` | Consultar estado, signatários e histórico; RBS publica primeira versão ou correção. |
| Decisão do contrato | `POST P/contrato/versoes/{versaoId}/decisoes` | Patrocinador aprova ou solicita ajustes com comentário; decisão vinculada à versão exata. |
| Contrato assinado | `POST P/contrato/assinado` | RBS publica arquivo assinado externamente, vinculado à versão aprovada. |
| Entregas | `GET P/entregas` | Lista, totais, responsáveis e próximos passos derivados dos dados reais. |
| Detalhe de entrega | `GET P/entregas/{entregaId}` | Material, execução, histórico e comprovação; suporta qualquer entrega do domínio definido. |
| Material da entrega | `POST P/entregas/{entregaId}/materiais/versoes`; `GET P/entregas/{entregaId}/materiais/versoes` | Upload e histórico separados do MIV da marca, com restrições de estado. |
| Análise de material | `POST P/entregas/{entregaId}/materiais/versoes/{versaoId}/avaliacoes` | RBS inicia análise, aprova ou solicita ajuste, com comentário e autoria reais. |
| Execução de entrega | `PATCH P/entregas/{entregaId}/execucao` | RBS inicia execução ou registra realização; validar a transição no servidor. |
| Responsável | `GET /api/admin/responsaveis`; `PATCH P/entregas/{entregaId}/responsavel` | RBS consulta opções reais e atribui responsável. |
| Comprovação | `POST P/entregas/{entregaId}/comprovacoes` | RBS publica descrição e eventuais anexos da realização. Leitura no detalhe. |
| FAQ | `GET P/faq?busca=...&categoria=...`; `POST P/faq`; `PATCH P/faq/{faqId}` | Ambos consultam; RBS cadastra e edita. Definir se conteúdo é compartilhado ou específico por parceria. |
| Notificações | `GET /api/notificacoes` | Listar avisos do usuário e seu escopo autorizado, com vínculo para a área/pendência. O protótipo não oferece ação de marcar como lida. |
| Planilhas de origem | `GET P/relatorio/planilhas`; `POST P/relatorio/planilhas` | RBS lista e envia arquivos reais; não expor ao patrocinador. |
| Relatório final | `GET P/relatorio`; `POST P/relatorio/publicacoes` | Ambos consultam relatório publicado; RBS publica PDF preparado externamente. Download pelo endpoint de arquivos. |

Uploads devem transportar conteúdo real, não apenas nome e tamanho. Os endpoints de domínio recebem arquivo e metadados juntos ou a referência autorizada de armazenamento definida na implementação. Download requer verificação de parceria e visibilidade do documento. Autor, data, versão, estado e contadores são derivados no backend. Evitar rotas extras para abrir/fechar modais ou confirmar mensagens visuais.

## Navegação autenticada proposta

- Manter `/login` e integrar sessão, redirecionamento por perfil e erros.
- Patrocinador: `/parcerias/:parceriaId/{area}`, preservando os dez caminhos funcionais atuais; detalhe em `/parcerias/:parceriaId/entregas/:entregaId`.
- RBS: `/rbs/patrocinadores` e `/rbs/parcerias/:parceriaId/{area}`, com as dez áreas administrativas e detalhe dinâmico de entrega.
- O relatório do patrocinador pode continuar em modal. Não precisa de página nova para funcionar.
- Acrescentar a tela `/verificar`, já referenciada pelo link de e-mail do backend e ausente do router Angular.
- Acrescentar etapas/componentes para desafio MFA e configuração de MFA caso esse fluxo faça parte da primeira entrega. Podem ser estados de tela sem uma URL nova.
- Preservar ou redirecionar as rotas de prévia conforme a decisão sobre manter demonstração separada. Guards e interceptor no Angular ajudam o fluxo; autorização continua obrigatória no backend.

## Lacunas e decisões anteriores à implementação dependente

1. Relação entre patrocinador, parceria, edição do evento e usuários; quantidade de acessos por parceria e quem provisiona o primeiro ADMIN_RBS. A conta atual não carrega vínculo de parceria.
2. Catálogo e regras de cotas, inclusive benefícios, entregas e capacidades. As cores não são regra de negócio. Não copiar restrições dos exemplos como contrato universal.
3. Origem das entregas: contrato/cota, importação ou cadastro manual. O botão atual “Organizar entrega” só atribui responsável; não existe formulário de criação de entregas. Após essa definição, pode ser necessário `POST P/entregas` ou integração de importação.
4. Coleta de signatários: há exibição e estado “aguardando dados”, mas não há formulário. Para coletar no portal, criar essa interface e `PUT P/contrato/signatarios`; confirmar os campos exigidos.
5. URL e condições de acesso reais do Open Staff e dos links externos comerciais, mídia e cortesias.
6. Escopo da FAQ, critérios de publicação e permissões dos dados/arquivos internos.
7. Política de acesso e sessão: conferir `ativo` no login, vínculo entre senha e desafio MFA, autorização das operações de MFA e criação de contas. O e-mail de login suspeito está comentado; não apresentar “e-mail enviado” sem envio real.
8. Geração automática de relatório: o usuário confirmou consolidação dos registros do portal. Está implementada em JSON e HTML baixável/imprimível. Interpretar planilhas externas e calcular novos indicadores continua fora deste contrato; o botão Angular ainda depende da integração.

Refresh, recuperação de senha, revogação remota, assinatura eletrônica, emissão de ingressos, cadastro nominal de equipe e automação de indicadores não foram acrescentados como requisitos, pois não correspondem às ações implementadas nessas telas. Encerrar uma sessão JWT no frontend pode inicialmente limpar o estado local; revogação no servidor exige política própria.

## Ordem sugerida e critérios de implementação

1. Identidade, provisionamento inicial e vínculo usuário/parceria; login real, `/me`, interceptor, guards e segregação de acesso.
2. Cadastro/lista/perfil e arquivos reais com persistência; publicar pela RBS e visualizar como patrocinador após recarregar.
3. Marca, mídia, pesquisa, cortesias e credenciamento, cobrindo leitura, escrita administrativa e limites de recebimento.
4. Contrato e entregas com versão, transições, responsáveis e autoria auditáveis.
5. FAQ, notificações, planilhas e publicação do relatório final.

Em cada etapa validar: ação autorizada com persistência após reload; entrada inválida; ausência de sessão; perfil insuficiente; acesso a outra parceria; falha de upload e operação concorrente sobre versão desatualizada quando aplicável. As decisões locais demonstrativas não provam regras homologadas de produto.

## Implementação solicitada e rodada de decisões

Pedido de 28/10/2026: implementar o backend das funcionalidades levantadas, com boas práticas e parametrização, consultando o usuário nas dúvidas. Reutilizar este documento como plano; OpenSpec não será usado. Escopo imediato: backend e seus contratos, persistência, configuração, testes e operação Docker. A conexão das telas Angular permanece uma etapa necessária do objetivo geral, com execução a registrar na mesma fonte.

Preparação técnica definida pelo escopo: preservar Java/Spring/PostgreSQL; separar configuração de ambiente de dados comerciais; retirar segredos do código; validar configuração; controlar acesso e visibilidade em cada operação; usar DTOs validados, erros consistentes, transações e migrações de banco; armazenar arquivos reais com limites configuráveis; preservar versões e autoria; documentar APIs e testar regras, autorização e acesso entre parcerias. Não criar regras específicas para Amarelo/Roxo/Verde. Escolhas de bibliotecas serão verificadas antes de introduzir dependências.

Configuração de ambiente: conexão do banco, chave e validade de token, URLs públicas, SMTP, diretório/limites de arquivos e bootstrap administrativo. Regras comerciais: cotas, benefícios e entregas ficam em cadastros do domínio, caso Q2 seja confirmada. Política de MFA depende de Q3.

As fontes atuais confirmam perfis RBS/patrocinador e acesso de clientes/agências, mas não resolvem as perguntas abaixo. `frontend/docs/checkpoint-clientes.md` descreve estados demonstrativos, incluindo contrato aguardando signatários e geração de relatório bloqueada; isso não define regras de produto.

| ID | Decisão a confirmar | Proposta recomendada, ainda não aceita |
| --- | --- | --- |
| Q1 | Relação empresa, edição, parceria e usuários/agências | Patrocinador representa a empresa; parceria liga empresa à edição e à cota; uma empresa pode ter várias parcerias, cada parceria vários usuários e uma agência apenas as parcerias concedidas explicitamente. |
| Q2 | Parametrização de cotas e origem das entregas | RBS mantém catálogo de cotas/benefícios e modelos de entrega; aplica-os à parceria, preservando o contratado mesmo se o catálogo mudar, com ajustes específicos e entregas extras pela RBS. |
| Q3 | Provisionamento e MFA | Sem cadastro público; primeiro administrador por configuração de implantação; RBS concede acesso por convite/ativação por e-mail; exigência de MFA configurável por perfil. |
| Q4 | Geração de relatório | Primeira versão recebe planilhas internas e permite publicar PDF preparado pela RBS. Geração automática exige agora ou em etapa posterior contrato explícito de entradas, métricas, cálculos e template. |
| Q5 | Coleta de signatários e assinatura | Patrocinador informa nome, e-mail e cargo de um ou mais signatários; RBS publica o documento assinado fora do portal, vinculado à versão aprovada. Campos adicionais dependem de necessidade contratual confirmada. |
| Q6 | Alcance da FAQ | FAQ comum por edição, administrada pela RBS e consultada pelos usuários autorizados dessa edição. Não duplicar perguntas por patrocinador sem necessidade confirmada. |

Status atualizado: o usuário indicou `docs/regras-negocio` como fonte autoritativa e confirmou a geração automática consolidando dados do próprio portal. As perguntas de fatos respondidas pelo TAP não precisam de nova aprovação. A tabela anterior registra propostas da entrevista; não prevalece sobre os documentos oficiais. Datas de 2026 não serão aplicadas automaticamente à edição de 2027. Não se assumem políticas comerciais ausentes dos documentos.

### Regras confirmadas nas fontes oficiais

- TAP p.3,5,7: login individual, acesso liberado pela RBS, dois perfis, isolamento por patrocinador, upload/download, histórico e regras por nível de cota. Relatório automático integra o escopo essencial.
- TAP p.6: perfil contém os e-mails autorizados e documentos comerciais; marca recebe MIV/logo e comprovações; mídia aceita arquivo/texto do patrocinador e publicações RBS que o cliente não edita; cortesias admitem destinação; credenciamento informa quantidade/setor e remete ao Open Staff; pesquisa admite até três perguntas conforme direito; patrocinador preenche signatários e RBS publica documento final assinado.
- Planos Master p.11-12, Subcota G p.8 e Subcota p.2: quantidades, públicos e direitos pertencem ao plano contratado. Master distingue credenciais da marca e da agência por setor. Não usar nome/cor do cliente como condição de negócio.
- Manual p.13,23: credenciamento e ações de marca têm condições operacionais. Seu conteúdo descreve a edição de 2026; prazos e limites não devem sobrescrever o plano da edição de 2027 sem confirmação de aplicabilidade.
- Decisão explícita do usuário: relatório gerado automaticamente consolidando dados, comprovações e resultados do portal. Não calcular indicadores a partir de planilhas externas sem contrato de dados; planilhas podem ser armazenadas como material interno.

### Contrato de implementação

Persistência PostgreSQL com migrações versionadas e preservação do banco atual. Configuração por ambiente e capacidades/limites comerciais por parceria. Módulos de negócio coesos com SQL parametrizado, DTOs validados, autorização compartilhada e transações. Contas continuam no mecanismo Spring Security/JPA existente, corrigindo seus fluxos; não criar outro mecanismo paralelo de identidade. A geração automática terá dados estruturados e versão imprimível/baixável; evidências serão acessíveis por referências autorizadas, nunca por URL pública de armazenamento.

Mudanças de cota não podem alterar silenciosamente os direitos já aplicados à parceria. Condições por edição, prazos, quantidades por setor/público e vínculos de acesso são dados. Não importar automaticamente preços, calendários ou direitos dos PDFs de exemplo para uma parceria real.

### Tarefas de implementação preparadas

- [x] Resolver os fatos da rodada anterior pelas fontes autoritativas e incorporar a decisão explícita do relatório.
- [x] Configuração por ambiente, tratamento de erros e evolução do schema sem apagar dados existentes.
- [x] Identidade, bootstrap, ativação, sessão e MFA com desafio vinculado ao login.
- [x] Parcerias, identificação de patrocinador/edição, múltiplos acessos explícitos, cotas e direitos quantitativos. Não foi introduzido um cadastro corporativo independente que o TAP não pede.
- [x] Perfil/documentos, arquivos e versionamento com autorização.
- [x] Marca, mídia, pesquisa, cortesias e credenciamento.
- [x] Contratos, decisões versionadas e signatários.
- [x] Entregas, responsáveis, avaliações, execução e comprovações.
- [x] FAQ por parceria, avisos de atualizações, planilhas internas e relatório automático.
- [x] Testes de domínio, integração PostgreSQL, fronteiras de autorização, OpenAPI e validação Docker.
- [x] Integrar as telas Angular às APIs e validar os fluxos ponta a ponta, mantendo a identidade visual existente e aplicando impeccable nessa superfície.

## Resultado da implementação local

Contratos finais, variáveis, compatibilidade e exemplos estão em [backend-api.md](backend-api.md). O Swagger expõe os DTOs executáveis; o inventário inicial acima permanece como contexto da proposta, não substitui os contratos implementados.

| Verificação em 28/10/2026 | Evidência |
| --- | --- |
| Compilação e suíte Java | `docker compose run --rm --no-deps backend sh ./mvnw -q test`: 15 testes, zero falhas/erros. AuthSecurityTests: 8; OperacaoServiceTest: 6; contexto: 1. |
| Migrações PostgreSQL | Flyway incorporou as tabelas locais existentes via baseline 0 e aplicou V1 a V6. Dados anteriores não foram removidos. |
| Integração HTTP/PostgreSQL | `python3 backend/scripts/check-portal-api.py`: 108 requisições verificadas, mais destinação simultânea; cria apenas dados sintéticos com prefixo Smoke. |
| Identidade | Login/ativação com SMTP local, token de ativação usado uma vez, convite RBS protegido, MFA real TOTP, desafio recusado como acesso, remoção do vínculo revogando acesso à parceria. |
| Segregação | Conta de outra parceria não consulta perfil, arquivos ou relatório. Patrocinador não lê planilhas internas nem escreve publicações RBS. |
| Regras e concorrência | Alterar cota preserva direitos aplicados; versões obsoletas recusadas; quantidades limitadas ao benefício; destinações simultâneas mantêm saldo; somatórios protegidos contra overflow. |
| Contratos e entregas | Ajuste, nova versão, recusa de decisão sobre versão antiga, aprovação, arquivo assinado, revisão de material, execução e comprovação. |
| Histórico/relatório | Versões anteriores de mídia e credenciamento consultáveis; relatório agrega registros e exclui arquivos internos; HTML escapa conteúdo recebido. |
| Operação | Compose válido; backend, PostgreSQL, frontend e Mailpit deixados ativos, portas publicadas em loopback. |

Revisão em dois eixos comparou o estado de trabalho, incluindo arquivos novos, com `115241d8a2e5dd30191b35f092eee72525962753` e com o TAP. Padrões: corrigidos os filtros SQL opcionais, parâmetros de data JDBC, snapshots de coleções e período das cortesias no relatório. Os tipos passaporte/sexta/sábado são o vocabulário explícito do TAP; quantidades, setores, público e datas são dados. Especificação: signatários/perguntas restritos ao patrocinador; benefícios quantitativos vinculados à cota e copiados para a parceria. Revisões estáticas foram complementadas pelos testes reais acima.

Limites da etapa de backend: naquele momento ainda não havia integração Angular, concluída na etapa seguinte. Não houve deploy, homologação com RBS/Open Staff/SMTP externo, importação automática dos PDFs ou processamento de planilhas externas. O relatório HTML relaciona registros e arquivos, mas não incorpora os bytes de mídias/documentos. Os números/datas dos planos de exemplo não foram convertidos em dados de produção. A configuração local de credenciais está no `.env` ignorado pelo Git. Nenhum commit ou push foi feito.

## Integração Angular solicitada

Pedido seguinte: conectar todas as telas às APIs existentes, preservando identidade PA27, foco/teclado e responsividade. Objetivo: substituir estados demonstrativos, temporizadores e arquivos fictícios por sessão autenticada, dados persistidos e operações verificáveis. Inclui ambos os perfis e todas as funcionalidades das variações antigas de cliente, usando IDs reais de parceria e entrega.

Rotas canônicas: `/login`, `/verificar`, `/conta`, `/parcerias`, `/parcerias/:parceriaId/{area}`, `/rbs/patrocinadores`, `/rbs/parcerias/:parceriaId/{area}`; detalhes usam `entregas/:entregaId`. As rotas antigas de prévia deixam de exibir dados fictícios e encaminham à seleção de parceria autorizada. Não mapear cores para contas reais.

Critérios de aceite: autenticar e restaurar sessão com consulta de identidade; aplicar perfis/capacidades na navegação; suportar ativação/MFA; ler/gravar dados reais em cada área; transmitir bytes dos arquivos e baixar com autorização; apresentar carregamento, erro, vazio e confirmação somente após resposta de sucesso; impedir envio duplicado; preservar entrada nas falhas; refletir 409 e revogação/401; persistir após recarga e validar operações dos dois perfis no navegador. Não inventar publicações, resultados, nomes de responsáveis ou dados de uma parceria inexistente.

- [x] Sessão, interceptor, guards, login/MFA, ativação, conta e contexto de parceria.
- [x] Listagem/cadastro, cotas/benefícios, perfil, documentos e gestão de acessos RBS.
- [x] Marca, mídia, briefing, versões, publicações, recebimento e pesquisa.
- [x] Cortesias/destinação, credenciamento/Open Staff e FAQ.
- [x] Contratos/signatários, decisões, versões, entregas/responsáveis/execução e comprovações.
- [x] Planilhas, relatório automático/complementar e notificações.
- [x] Build, checks existentes, revisão e E2E com persistência, permissões, teclado e visual desktop/mobile.

Implementação compartilhada: `core/portal-api.service.ts` (HTTP/arquivos/feedback), `core/session.service.ts` (estado, sessão e interceptor), `core/portal-context.service.ts` (parceria autorizada/rotas/capacidades), `shared/api-status.ts` (estado visível). As áreas mantêm seus componentes/estilos e substituem serviços de prévia por leitura/escrita HTTP; as variações Amarelo/Roxo/Verde convergem nas páginas canônicas com estado derivado dos dados.

### Validação da integração Angular em 28/10/2026

| Verificação | Resultado e limites |
| --- | --- |
| Build de produção | `docker compose exec -T frontend npm run build -- --progress=false`: passou. Pacote inicial em torno de 898 kB, abaixo do limite de erro de 1 MB. Permanecem avisos de 500 kB inicial e de estilos de login/lista/shell; limites não foram aumentados. |
| Proxy | `docker compose exec -T frontend npm run test:proxy`: 1 teste passou. |
| Identidade Java | A suíte Java foi repetida após incluir `mfaEnabled` em `/api/auth/me`: 15 testes passaram. |
| Autenticação e administração pelo navegador | `frontend/scripts/check-auth-integration.cjs`: passou com login real e inválido, restauração/logout, ativação pelo Mailpit, papel RBS/PAT, configuração e login TOTP, 401, cadastro de cota/benefício/parceria/convite, edição persistida de perfil, múltiplos acessos, direitos específicos e preservação do rascunho em 409. Também verifica recuperação de falha de conexão, ausência de GET de marca desabilitada e overflow do editor em 390 px. |
| Negócio pelo navegador | `frontend/scripts/check-portal-integration.cjs`: 99 verificações passaram. Percorre todas as páginas canônicas dos dois perfis, envia arquivos reais, publica contrato/assinado, avalia material, executa entrega/comprovação, destina cortesia, informa credenciamento, publica FAQ/pesquisa/relatório e baixa HTML. Reabre recebimento após limpar prazo antigo nas três áreas e confirma responsável na lista sem recarga. |
| Erros e isolamento | FAQ com POST de rede abortado mantém entrada e não mostra sucesso; 409 mantém o limite digitado; outro patrocinador é impedido de abrir/consultar relatório da parceria alheia; token não é emitido antes do MFA; sessão expirada volta ao login. Testes HTTP/PostgreSQL anteriores complementam as fronteiras do backend. |
| Visual e teclado | Chromium local em desktop e 390 × 844, com foco de teclado, ausência de overflow e imagens decodificadas. Capturas sintéticas inspecionadas em `/tmp/rbs-front-e2e/`: perfil, entrega, relatório, cortesias e editor de direitos. Identidade PA27 preservada. |
| Detector e revisão | Detector estático final sem achados após exceções pontuais de `broken-image` para bindings Angular conferidos no navegador, apenas no login e nos dois detalhes de entrega. Isso não equivale a auditoria completa de contraste/acessibilidade. `git diff --check` passou. |

Revisão local em dois eixos comparou as alterações, incluindo fontes novas, com `115241d8a2e5dd30191b35f092eee72525962753`. Padrões: corrigidos tratamento de falha transitória na rota, retenção da senha do convite, atualização de responsável e seleção inicial de área. Especificação: adicionados os controles de direitos específicos da parceria e prazos de recebimento; não se reaplica o catálogo silenciosamente ao trocar cota. A conferência seguinte corrigiu a consulta indevida de marca em perfil sem essa capacidade e a inicialização de limites recém-adicionados.

Os roteiros requerem Playwright/Chromium disponíveis, serviços Docker locais ativos e credenciais de bootstrap no `.env`, lidas sem impressão. Use `PLAYWRIGHT_MODULE` e, se necessário, `PLAYWRIGHT_CHROMIUM_EXECUTABLE` para apontar a instalação existente. Contas, arquivos e parcerias sintéticos `E2E` ficam no banco local, sem remover dados anteriores. As capturas são artefatos temporários da sessão. Os serviços permanecem ativos em `localhost:4200`, `:8080` e Mailpit `:8025`.

Limites finais: não houve deploy, commit/push, homologação com usuários RBS ou serviços externos. Open Staff é um link configurado e validado na UI; emissão/SSO pertencem ao serviço externo. Planilhas são armazenadas internamente; o relatório consolida registros do portal, conforme decisão do usuário. A revisão visual não reaprova os layouts históricos nem transforma os testes locais em homologação externa.

## Histórico do levantamento anterior à implementação

A contagem inicial encontrou 23 rotas literais e 20 geradas por `clientPreviewRoutes`, totalizando 43 demonstrações, sem consumo de `HttpClient`. Os oito handlers de autenticação/painel existentes naquela etapa não comprovavam o fluxo integrado. Esse levantamento fundamentou a implementação descrita acima; o router e os contratos atuais substituem aquele inventário inicial.
