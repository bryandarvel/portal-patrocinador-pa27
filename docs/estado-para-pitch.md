# Estado técnico para o pitch

Registro de 7 de novembro de 2026. A versão de trabalho está na branch demo-pa27 do repositório bryandarvel/portal-patrocinador-pa27. O prazo atualizado por Bryan é 7 de novembro às 3h, horário de Brasília.

## Necessidade documentada

O TAP descreve um portal restrito que centraliza as informações das parcerias, dá autonomia aos patrocinadores e reduz o trabalho manual da equipe B2B. A Entrega 3 pede as sete áreas funcionais, pós-evento integrado, relatório com fontes e dados ausentes tratados, histórico, isolamento de patrocinadores, validação e documentação.

## O que a demonstração local permite mostrar

O patrocinador envia um material. A RBS acompanha a análise, solicita ajustes ou aprova, registra a execução e disponibiliza a comprovação. O patrocinador consulta a comprovação na mesma entrega.

Os dois perfis usam as APIs e o PostgreSQL. No ambiente local, os anexos ficam em volume separado. A configuração de nuvem usa PostgreSQL e Storage privado no Supabase. A API controla os acessos à parceria, às áreas habilitadas e aos arquivos internos. A conta patrocinadora de outra parceria recebe uma resposta de acesso negado ao tentar obter os dados alheios.

A RBS importa tabelas padronizadas DOCX ou XLSX de rádio, TV, digital e jornal e gera dois arquivos Excel. Vendas compara quantidade contratada e entregue. Veiculação apresenta o tipo e a quantidade de impacto informados na fonte. Há filtro mensal, exportação individual ou consolidada, lotes de importação e identificação do arquivo de origem. A publicação individual permite entregar o Excel ao patrocinador.

O registro de primeiro e último acesso é exibido à RBS no perfil da parceria a partir da migração V8. Login concluído atualiza as datas.

## Dados fictícios

As oito parcerias são Renner, Coca-Cola, Banrisul, Monster, Mastercard, Absolut Sprite, Aperol e Claro + JBL. A última ocupa um único card. Os nomes e as imagens das marcas são referências públicas. As quantidades, os estados, as contas e os resultados operacionais foram preparados para a demonstração.

O exemplo de rádio da Renner registra 10 inserções contratadas e 9 entregues após uma revisão. Os 100 mil acessos são um valor fictício de entrada. O exemplo de TV do Banrisul deixa o impacto sem preenchimento e a exportação preserva essa ausência.

## Evidências obtidas localmente

- 104 verificações de API, incluindo concorrência, isolamento, contrato, entrega e comprovação.
- 99 verificações de integração no Chrome, incluindo a jornada completa e a consulta do relatório.
- Suíte de autenticação no navegador com ativação, login, restauração de sessão, MFA e expiração.
- 20 testes Java, incluindo validações dos modelos Word e Excel.
- 12 testes Node de proxy, nomes de downloads, datas e rótulos.
- Verificação dos dados importados e exportados, reenvio, revisão, publicação individual e permissões.
- Banco e arquivos consultados após reinício dos serviços locais.
- Imagem de produção construída pelo Dockerfile e executada em QA com as mesmas 104 verificações da API aprovadas.
- Modelos DOCX e XLSX baixados pelo navegador e abertos por bibliotecas independentes. A conferência visual no Microsoft Word ou Excel fica para o ensaio.
- Tela de relatórios conferida em 1440 e 900 pixels, com foco por teclado, erro de formato e reenvio de arquivo.
- Oito parcerias, 15 anexos e quatro lotes de importação migrados para Supabase. Os anexos foram conferidos por SHA-256 e as tabelas restauradas com RLS e acesso restrito ao backend.
- Imagem Java de produção conectada ao Supabase verificada com três perfis: isolamento, arquivos antigos, comprovação PDF, relatório publicado, exportações 10/9 e upload de um novo arquivo fictício. O novo arquivo permaneceu acessível após recriar o container, sem volume local de anexos.
- Oito testes Java de armazenamento e três de rollback/limpeza acrescentados; os 17 testes da área de operações e armazenamento passaram. A execução completa anterior tinha 28 testes aprovados; os três adicionais foram executados na seleção afetada.
- Sete testes Python da migração passaram. Restauração ensaiada em QA, incluindo recusa de segunda carga sobre banco preenchido, sem perder registros.
- Processo limitado a 512 MB executado com heap de 192 MB. Após os checks com duas exportações simultâneas, consumo observado de cerca de 435 MB, sem encerramento por falta de memória. É uma verificação pontual, não um teste de carga.

Esses são testes técnicos com contas fictícias. A validação deste lote pela RBS e por usuários reais precisa ser registrada separadamente.

## Jornada curta para apresentar

Use dois perfis de navegador. A Coca-Cola tem uma entrega de logo no telão preparada para receber material ao vivo. Mostre envio pelo patrocinador, acompanhamento pela RBS e comprovação. A Renner tem uma comprovação pronta para uma navegação mais curta.

Na RBS, abra Relatório e planilhas da Renner, mostre o histórico de origem e baixe os relatórios de vendas e veiculação. Compare os números do modelo com a exportação. Mostre que o impacto ausente do Banrisul continua vazio.

O guia de execução, as contas locais e as opções de publicação estão em demo-pa27.md. As senhas ficam no .env local.

## Limites para a fala

A importação suporta os modelos definidos para a demonstração, com até 500 linhas e 1 MB. Os formatos processados são DOCX e XLSX. A área de armazenamento mantém outros tipos permitidos pelo backend.

Uma revisão substitui os valores da mesma combinação de parceria, mês, veículo e formato. A alteração da própria chave requer tratamento da linha anterior. As origens históricas são preservadas. A interpretação automática de documentos livres requer exemplos e regras adicionais da RBS.

Os impactos são recebidos da fonte. O sistema não mede a atribuição de acessos a uma campanha. Métricas diferentes não são somadas em um total.

Banco e anexos da demonstração já estão no Supabase. A publicação da API no Render Free e do frontend na Vercel ainda depende do envio do novo commit e da execução dos passos de hospedagem por Bryan. A aplicação foi testada em container local conectado ao Supabase; isso não comprova um deploy público no Render ou na Vercel. Render Free suspende após inatividade e pode demorar para voltar. A versão local em Docker é a contingência preparada.

Os acessos restaurados estão ativados. Convites novos por e-mail na nuvem ficam pendentes de um serviço de envio; a demonstração local mantém Mailpit. O portal não deve ser apresentado como uso operacional da RBS.

O custo de implantação e operação do piloto deve ser estimado na conversa do pitch com preços verificados e premissas explícitas. Não há medição de economia de horas ou retorno financeiro deste lote.
