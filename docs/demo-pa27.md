# Demonstração PA27

Use a branch `demo-pa27` do repositório `bryandarvel/portal-patrocinador-pa27`. A demonstração usa marcas reais como referência e dados operacionais fictícios. O projeto `portal-pa27-demo` usa banco e arquivos separados da stack anterior.

O Angular acessa a API do Spring Boot por `/api`. O PostgreSQL guarda as parcerias, permissões, histórico, metadados dos anexos e lotes importados. Um volume separado guarda os arquivos locais; na nuvem, um bucket privado do Supabase guarda os anexos. O backend verifica o vínculo com a parceria antes de servir dados ou arquivos. A RBS consulta o primeiro e o último acesso de cada conta vinculada no perfil da parceria. As datas passam a ser registradas a partir da migração V8, depois de um login concluído.

## Iniciar no Windows

Abra o PowerShell na raiz do novo clone. Se o `.env` ainda não existir, copie `.env.example` e preencha localmente as opções abaixo. Use um segredo JWT aleatório adequado ao formato indicado no README e duas senhas distintas. Preserve a configuração se já existir.

| Variável | Valor da demonstração local |
| --- | --- |
| `COMPOSE_PROJECT_NAME` | `portal-pa27-demo` |
| `FRONTEND_PORT` | `4217` |
| `BACKEND_PORT` | `8087` |
| `MAILPIT_PORT` | `8027` |
| `PORTAL_BOOTSTRAP_ENABLED` | `true` |
| `PORTAL_BOOTSTRAP_NAME` | `Equipe RBS Demonstração` |
| `PORTAL_BOOTSTRAP_EMAIL` | `rbs.pa27@example.test` |
| `PORTAL_BOOTSTRAP_PASSWORD` | Senha aleatória do Admin RBS |
| `PORTAL_SEED_PASSWORD` | Senha aleatória dos patrocinadores |
| `PORTAL_JWT_SECRET` | Segredo aleatório local |

```powershell
docker compose -p portal-pa27-demo up -d
docker compose -p portal-pa27-demo ps
```

Aguarde o login em http://localhost:4217/login e a API em http://127.0.0.1:8087/v3/api-docs. A primeira instalação pode levar alguns minutos. Na mesma pasta:

```powershell
python -X utf8 frontend/scripts/seed-demo-pa27.py --aplicar
python -X utf8 backend/scripts/check-relatorios-pa27.py
```

O segundo comando carrega exemplos de rádio e TV nas parcerias fictícias, valida os XLSX e publica uma cópia individual de vendas para a Renner. Use `--somente-verificar` para reler a carga sem criar importações. O seed preserva parcerias existentes e preenche os cenários complementares quando ausentes. Ele reconhece a parceria pelo nome ou pela conta fictícia vinculada à mesma edição, preservando nomes alterados pela RBS. Se a mesma conta estiver vinculada a mais de uma parceria dessa edição, a carga é interrompida para conferência. Se uma marca foi criada apenas em parte, identifique o registro faltante antes de repetir qualquer operação.

Entre em dois perfis separados do navegador. Use a conta RBS acima e `renner.pa27@example.test` ou `coca-cola.pa27@example.test` como patrocinador. Consulte as duas senhas geradas no seu `.env` local. As contas fictícias são ativadas pelo Mailpit em http://localhost:8027. Para parar e preservar os dados, use `docker compose -p portal-pa27-demo stop`.

## Cenários para apresentar

| Marca | Cota | Cenário |
| --- | --- | --- |
| Renner | Master | Material aprovado, entrega realizada e comprovação disponível. FAQ, pesquisa, minuta e relatório de rádio. |
| Coca-Cola | Master | Entrega Logo no telão principal pronta para envio ao vivo. Documento publicado. |
| Banrisul | Master | Histórico de duas versões de MIV e exemplo de relatório de TV. |
| Monster | Master | Material recebido, aguardando análise. |
| Mastercard | Subcota G | Briefing enviado, sem veiculação. |
| Absolut Sprite | Subcota G | Sem material. Um ambiente novo é semeado com recebimento de marca encerrado. |
| Aperol | Subcota M | Duas versões de material com ajustes solicitados. |
| Claro + JBL | Subcota M | Uma parceria, duas marcas, material conjunto sem publicação. |

Mostre a entrega da Coca-Cola no perfil patrocinador. Envie um PDF fictício. No Admin RBS, abra a mesma entrega e inicie a análise, aprove, registre a execução e adicione uma comprovação. Volte ao patrocinador para ver e baixar a comprovação. Para uma navegação curta, use a comprovação já registrada da Renner.

## Modelos e relatórios

No Admin RBS, abra Relatório e planilhas na parceria. Em Relatórios setoriais, baixe os modelos Word e Excel personalizados para o nome da parceria. A linha preenchida contém valores fictícios. O Word usa uma única tabela, e o Excel usa a aba Entregas.

A primeira linha deve conter Patrocinador, Mês, Veículo, Formato da entrega, Unidade, Contratado, Entregue, Tipo de impacto e Impacto, nessa ordem. Informe o mês como AAAA-MM. Os veículos são TV, Rádio, Digital e Jornal. Use números inteiros não negativos, até 500 linhas e 1 MB por modelo. Preencha tipo e valor de impacto juntos ou deixe ambos vazios. Os dois campos vazios saem em branco na exportação.

Uma correção usa o mesmo mês, veículo e formato. A versão nova substitui os valores dessa linha no relatório vigente. Os demais registros e as origens anteriores permanecem disponíveis. Reenviar o mesmo conteúdo binário retorna o lote original, mesmo que o arquivo seja renomeado. Para corrigir o próprio mês, veículo ou formato de uma linha já gravada, é necessário tratar a chave anterior separadamente. O fluxo atual corrige valores dentro da mesma chave.

A RBS pode exportar Vendas e Veiculação em XLSX de uma parceria ou de todas, com filtro mensal opcional. Cada linha inclui a origem, o lote e a linha do modelo. Arquivos fora do modelo, incluindo DOC, XLS e TXT, podem ser armazenados na seção Arquivos de origem. Os modelos importados ficam privados para a RBS. Para disponibilizar um XLSX ao patrocinador, publique o arquivo como relatório complementar na parceria correta. O relatório HTML continua disponível para os registros internos do portal.

## Publicação da demonstração

A combinação aprovada é Vercel Hobby para Angular, Render Free para Java e Supabase Free para PostgreSQL e anexos privados. Use apenas o repositório `bryandarvel/portal-patrocinador-pa27`, branch `demo-pa27`. O produto original não participa desta publicação.

Estado verificado em 07/11/2026: banco e anexos migrados para o projeto Supabase `bmiqtzpoabfxzyhitfea`; API publicada em https://portal-patrocinador-pa27-1.onrender.com, commit 5259613. O frontend na Vercel ainda aguarda publicação e testes. Os passos de restauração abaixo servem para um destino novo e vazio; a migração deste projeto já foi concluída.

Render Free suspende o serviço após 15 minutos sem tráfego; a próxima inicialização pode levar cerca de um minuto. Seu disco é temporário, por isso o backend usa Supabase Storage. Supabase Free inclui 500 MB de banco e 1 GB de arquivos, com suspensão após uma semana sem atividade. Confira as franquias no painel; não ative planos pagos. Para a apresentação, abra o portal antes do ensaio e mantenha a contingência local disponível.

### 1. Supabase e cópia dos dados

Crie um projeto Free exclusivo e um bucket privado `portal-arquivos`, com limite de 20 MB por arquivo. O backend usa a chave secreta exclusivamente no servidor e recusa um bucket público. A autenticação continua no Spring; não é necessário cadastrar as contas no Supabase Auth.

Copie `.env.cloud.example` para `.env.cloud` somente se esse arquivo ainda não existir. Preencha `PGHOST`, `PGPORT=5432`, `PGDATABASE=postgres`, `PGUSER`, `PGPASSWORD`, `PGSSLMODE=require`, `SUPABASE_URL`, `SUPABASE_SECRET_KEY` e `SUPABASE_STORAGE_BUCKET=portal-arquivos`. O host e o usuário vêm de Connect > Session pooler. A Secret key começa por `sb_secret_`; a Publishable key não atende a esse uso. Preserve senhas fora do Git e do chat.

Faça o backup quando ninguém estiver gravando no portal local:

```powershell
New-Item -ItemType Directory -Force backups
docker compose -p portal-pa27-demo exec -T db pg_dump -U portal -d portal -Fc -f /tmp/pa27.dump
docker compose -p portal-pa27-demo cp db:/tmp/pa27.dump backups/pa27.dump
docker compose -p portal-pa27-demo exec -T backend tar -czf /tmp/pa27-arquivos.tgz -C /data/arquivos .
docker compose -p portal-pa27-demo cp backend:/tmp/pa27-arquivos.tgz backups/pa27-arquivos.tgz
```

Os backups também ficam ignorados pelo Git. O script usa Python padrão e o cliente PostgreSQL em Docker, sem instalar bibliotecas. Primeiro inspecione sem gravar:

```powershell
python -X utf8 backend/scripts/migrate-supabase-pa27.py --conferir-conexao
python -X utf8 backend/scripts/migrate-supabase-pa27.py --arquivos backups/pa27-arquivos.tgz --banco backups/pa27.dump
```

No projeto novo confirmado, copie os anexos e depois o banco:

```powershell
python -X utf8 backend/scripts/migrate-supabase-pa27.py --arquivos backups/pa27-arquivos.tgz --aplicar
python -X utf8 backend/scripts/migrate-supabase-pa27.py --banco backups/pa27.dump --aplicar --verificar
python -X utf8 backend/scripts/migrate-supabase-pa27.py --preparar-render
```

Os arquivos mantêm a mesma chave UUID. A cópia confere SHA-256 e não sobrescreve conteúdo diferente. Reexecutar a cópia de anexos preserva os já existentes. O banco é restaurado em uma transação e exige schema public vazio; não repita a restauração em um banco já preenchido. A mesma transação habilita RLS e revoga acesso às tabelas para anon/authenticated. O backend conecta como dono das tabelas e continua verificando perfis e parceria. O script não modifica os schemas auth/storage do Supabase.

O arquivo `.env.render` gerado também é ignorado pelo Git e nunca é sobrescrito. Ele contém as variáveis do backend, um segredo JWT próprio e a origem temporária local do frontend. Não compartilhe seu conteúdo.

### 2. Render

Após revisar os arquivos e enviar o novo commit para `demo-pa27`, no painel Render use New > Web Service e conecte o repositório pessoal. A criação e a publicação são feitas por Bryan.

| Campo | Valor |
| --- | --- |
| Branch | `demo-pa27` |
| Language/runtime | Docker |
| Root Directory | `backend` |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context | `.` |
| Instance Type | Free |
| Auto-Deploy | Off, para controlar o checkpoint |
| Health Check Path | `/api/health` |

Em Environment, use Add from .env e importe o conteúdo de `.env.render`. O `render.yaml` na raiz registra os mesmos parâmetros como alternativa Blueprint. Não adicione disco persistente ou banco Render.

O perfil cloud limita o pool PostgreSQL a quatro conexões e os threads do Tomcat a 20. O processo Java usa heap máximo de 192 MB. A porta é fornecida pelo Render em `PORT`.

Publique o Web Service e aguarde o health check responder `{"status":"UP"}` no domínio HTTPS mostrado pelo próprio Render. O health check consulta o banco e não exibe detalhes da conexão. Informe a URL pública da API para preparar o frontend; ela não é segredo.

### 3. Vercel

Na raiz do clone, substitua o endereço pelo domínio real do backend:

```powershell
node frontend/scripts/configure-vercel.mjs https://DOMINIO-REAL.onrender.com
```

O gerador valida a origem e cria `frontend/vercel.json` sem sobrescrever arquivo existente. Revise o arquivo, faça commit/push e importe o repositório como projeto Vercel separado, com raiz `frontend`, preset Angular, Node 24, instalação `npm ci`, build `npm run build` e saída `dist/portal-patrocinador/browser`. Configure `demo-pa27` como branch de produção. Não reutilize o projeto Vercel do produto anterior.

No painel atual, a branch de produção fica em Settings > Environments > Production > Branch Tracking. Em Deployments > Create Deployment, informe `demo-pa27` para publicar a referência desejada. Uma importação que assuma `main` precisa desse ajuste, pois o código da demonstração está na branch `demo-pa27`.

As rotas `/api` passam pelo backend externo e as demais rotas usam o fallback do Angular. Não há chave do Supabase nas variáveis do frontend. Após obter a URL final da Vercel, ajuste `PORTAL_FRONTEND_URL` no Render e publique essa configuração.

### 4. Conferir a publicação

Entre como RBS e como patrocinador em perfis separados. Verifique as oito marcas, a recarga de uma rota interna, os históricos e o download de uma comprovação já migrada. Faça um upload fictício autorizado, registre a execução, publique a comprovação e confira no patrocinador. Baixe os modelos e os dois XLSX. Após um reinício e um novo deploy, confira novamente o mesmo arquivo e os dados persistidos.

As contas fictícias e as senhas do ambiente local foram preservadas pelo backup. Com `PORTAL_MAIL_ENABLED=false`, os acessos já ativados funcionam; novos convites que dependem de e-mail ficam pendentes de um serviço de envio. Render Free bloqueia as portas SMTP usuais. O Mailpit local continua disponível para demonstrar ativação sem destinatários reais.

Fontes: [Render Free](https://render.com/docs/free), [configuração Render](https://render.com/docs/blueprint-spec), [Supabase Free](https://supabase.com/pricing), [conexão PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres), [chaves Supabase](https://supabase.com/docs/guides/getting-started/api-keys), [termos Vercel](https://vercel.com/legal/terms).
