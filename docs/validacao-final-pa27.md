# Validação da demonstração PA27

Registro de 07/11/2026. Escopo: demonstração educacional com dados operacionais fictícios, oito marcas de referência e contas de teste. A validação operacional pela RBS e um piloto com usuários reais constituem etapas posteriores.

## Endereços e execução

- Portal: https://portal-patrocinador-pa27.vercel.app/login
- API: https://portal-patrocinador-pa27-1.onrender.com/api/health
- Branch: `demo-pa27`, no repositório `bryandarvel/portal-patrocinador-pa27`.
- Contingência: `docker compose -p portal-pa27-demo up -d`, na raiz do clone pessoal; portal local em http://localhost:4217/login.
- Acessos: `rbs.pa27@example.test` e `renner.pa27@example.test`. As senhas continuam no `.env` local; não são publicadas nesta documentação.

O projeto original, suas branches, serviços e volumes foram preservados. A demonstração usa stack e dados separados. O envio Git foi autorizado posteriormente por Bryan; não houve necessidade de PR ou merge para hospedar `demo-pa27`.

## Requisitos e evidências

| Requisito | Evidência obtida |
| --- | --- |
| Jornada material → análise RBS → execução → comprovação | Verificações locais de API e Chrome com os dois perfis. Na publicação, comprovação PDF existente consultada e baixada pelo patrocinador. |
| Login, sessão e isolamento | Suíte local de autenticação; três logins pela API pública, isolamento entre Renner e Absolut Sprite e bloqueio de arquivo interno ao patrocinador. |
| Sete áreas e fluxos existentes | 104 verificações de API e 99 de Chrome no ambiente de QA, incluindo contrato, entregas, relatórios e publicação. |
| Oito marcas e assets | Oito cards e nove logos carregados no Chrome público. Claro + JBL ocupa um card; Banrisul e Monster mantêm os fundos próprios. |
| Estados de demonstração | Matriz por marca em `demo-pa27.md`: vazio, envio encerrado, pendente, ajuste, aprovado, histórico e comprovação. |
| Seed reexecutável | Busca por nome ou conta vinculada; cinco testes cobrem renomeação, edição, ambiguidade e paginação. A consulta por conta também foi exercitada no contrato real da API, sem alterar registros. |
| Credenciamento | Dados fictícios para os cinco setores e modalidades no seed; Open Staff mantido como sistema externo. |
| Modelos DOCX/XLSX | Parser com cabeçalhos e nove campos definidos; validação de mês, números, marca, duplicatas e limite de entrada. Modelos baixados pela interface pública e abertos por bibliotecas independentes. |
| Dois Excel reais | Vendas e Veiculação gerados no backend, baixados via Vercel. Conferência independente de 10/9, impacto fictício 100000 e impacto ausente em branco. |
| Histórico e correção | Quatro lotes migrados; revisão substitui valores da mesma chave de negócio. Reenvio idêntico retorna o lote anterior sem duplicar. |
| Fonte e privacidade | Origem identificada por lote e linha; arquivo original acessível à RBS e negado ao patrocinador. Exportação individual publicada acessível somente à parceria correta. |
| Primeiro e último acesso | Migração V8 e registro no login concluído; conferência de primeiro acesso preservado e último acesso avançando; exibição no perfil RBS verificada no Chrome. |
| Persistência | Oito parcerias e 15 anexos migrados, com SHA-256 conferido. Arquivo adicional de verificação permaneceu após recriar container e após publicação/retorno da API no Render. |
| Armazenamento privado | Bucket privado verificado no início do backend; download servido após autorização do Spring; tabelas Supabase com RLS e leitura de contas negada a anon/authenticated. |
| Hospedagem separada | Angular na Vercel, Java no Render, PostgreSQL/Storage no Supabase; projetos da demonstração separados do produto anterior. |
| Proxy, HTTPS e rotas SPA | Login e rota interna retornaram HTML; health via Vercel respondeu 200/UP; operações autenticadas e downloads passaram pela mesma origem. |
| Interface publicada | Chrome: login dos dois perfis, logos, foco visível, arquivo inválido, reenvio, modelos, relatórios e comprovação. Área de relatórios conferida em 1440 e 900 pixels. |
| Qualidade | Relatórios Java atuais somam 31 testes sem falhas; sete testes Python da migração e cinco da identidade do seed passaram. Os 12 testes Node e o build Angular foram verificados no lote de integração. |
| Migração segura | Restauração em transação com destino vazio; ensaio QA recusou segunda carga sem perder dados; cópia de anexos preserva conteúdo existente e confere hashes. |
| Documentação e pitch | `demo-pa27.md` contém execução, acesso e sequência; `estado-para-pitch.md` distingue dados fictícios, verificado, limitações e evolução futura. |

Os testes locais de jornada completa e os testes públicos descritos são evidências distintas. Não se afirma que toda a suíte de QA foi repetida contra a hospedagem pública. As capturas e downloads desta execução estão na pasta local de trabalho `tmp/pa27-public-verified`, fora do repositório.

## Limites do ensaio

- Render Free pode suspender por inatividade. Houve timeout inicial e indisponibilidade durante o deploy; após a retomada os checks passaram. Abra a plataforma antes do ensaio e mantenha o Docker local como contingência.
- As contas de demonstração restauradas já estão ativadas. Convites novos por e-mail na nuvem dependem de serviço de envio; Mailpit atende ao fluxo de demonstração local.
- Importação processa os modelos padronizados DOCX/XLSX, até 500 linhas e 1 MB. Outros tipos permitidos podem ser armazenados, sem interpretação automática de documentos livres.
- O sistema não mede atribuição de campanha nem soma métricas de impacto incompatíveis. Ausência de impacto permanece vazia.
- Uma revisão corrige valores da mesma chave; corrigir mês/veículo/formato exige tratamento da chave anterior.
- A abertura por bibliotecas confirmou a estrutura e os dados. A conferência visual no Microsoft Office, teste de carga, auditoria completa de segurança e conformidade integral de acessibilidade não foram executados.

## Sequência curta para o ensaio

1. Abra a RBS e o patrocinador em perfis separados de navegador.
2. Na Renner, mostre o material aprovado e a comprovação existente. Para apresentar a jornada com envio ao vivo, use a entrega preparada da Coca-Cola.
3. Na RBS/Renner, abra Relatório e planilhas, apresente a origem e a revisão e baixe Vendas e Veiculação.
4. Compare 10 contratados com 9 entregues e explique que os 100 mil acessos são fictícios. Mostre o impacto de TV ausente do Banrisul preservado em branco.
5. No patrocinador, consulte a comprovação e o Excel individual publicado.
