# Arquitetura da demonstração PA27

Revisão documental de 07/11/2026. Consulte também a matriz da Entrega 3 e o registro de validação, que distinguem testes locais de testes públicos.

## Componentes

| Componente | Responsabilidade | Implementação |
| --- | --- | --- |
| Angular 22 / NG-ZORRO | Rotas, formulários, estados e apresentação por perfil/capacidade | `frontend/src/app`; acesso HTTP por `core/portal-api.service.ts` |
| Sessão do navegador | Login, token, restauração e redirecionamento | `core/session.service.ts`, interceptor e guards. Guards não substituem autorização no servidor. |
| Spring Boot 4.1.1 / Java 21 | Autorização, parcerias, cotas, operações, relatórios e transações | `backend/src/main/java/com/rbs/portal_patrocinador` |
| PostgreSQL / Flyway | Contas, vínculos, direitos, versões, auditoria, metadados e lotes | `backend/src/main/resources/db/migration`, V1–V8 |
| ArquivoStorage | Bytes dos anexos, por chave UUID | Disco/volume local ou bucket privado Supabase; ArquivoService verifica parceria e área antes do download |
| Apache POI | Leitura dos modelos DOCX/XLSX e exportação XLSX | `relatorio/RelatorioSetorialOffice.java` |
| Mailpit local | Captura de ativação das contas fictícias | Serviço Compose; não entrega mensagens externas |

## Caminho dos dados

Na nuvem, navegador → Vercel `/api` → Render/Spring → PostgreSQL Supabase. Uploads e downloads passam pelo Spring e pelo bucket privado; a chave secreta do Supabase permanece no backend. A API autentica JWT e consulta o vínculo da conta com a parceria. Arquivos internos e operações administrativas têm restrições adicionais. As permissões e os limites da demonstração são dados parametrizados, não uma matriz comercial oficial aprovada pela RBS.

No Docker, navegador → Angular `:4217` → proxy `/api` → serviço backend → serviço db e volume portal-files. O nome explícito `-p portal-pa27-demo` isola recursos da stack original. O Git transporta código; não transporta banco, anexos nem `.env`.

## Duas consolidações diferentes

O relatório dos registros do portal consulta entregas, comprovações, veiculações, perguntas, arquivos/resultados, cortesias e credenciamento atuais da parceria. Novos registros entram na consulta seguinte; JSON/HTML não dependem de copiar resultados no frontend.

Os relatórios setoriais importam modelos padronizados, com até 500 linhas e 1 MB. Lotes e linhas são persistidos com origem, hash e histórico. A revisão da mesma chave parceria/mês/veículo/formato substitui seus valores vigentes, mantendo a fonte anterior. Vendas apresenta contratado e entregue; Veiculação apresenta a métrica informada. Impacto ausente fica em branco. Isso não interpreta documentos livres nem mede atribuição de campanhas.

## Limites e operação

Vercel hospeda o Angular; Render Free executa o Java com heap de 192 MB; Supabase mantém banco e anexos privados. Retomada após inatividade e disponibilidade gratuita não equivalem a SLA. Novos convites por e-mail na nuvem dependem de serviço de envio; as contas demonstrativas existentes foram ativadas localmente e migradas. Open Staff é um link externo, sem emissão de credenciais pelo portal.

As instruções de instalação, as variáveis e o plano de contingência estão em `demo-pa27.md`. Senhas e chaves ficam em arquivos locais ignorados ou no painel do provedor, nunca nesta documentação.
