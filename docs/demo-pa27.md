# Demonstração PA27

Use a branch `demo-pa27` do repositório `bryandarvel/portal-patrocinador-pa27`. A demonstração usa marcas reais como referência e dados operacionais fictícios. O projeto `portal-pa27-demo` usa banco e arquivos separados da stack anterior.

O Angular acessa a API do Spring Boot por `/api`. O PostgreSQL guarda as parcerias, permissões, histórico, metadados dos anexos e lotes importados. Um volume separado guarda os arquivos. O backend verifica o vínculo com a parceria antes de servir dados ou arquivos. A RBS consulta o primeiro e o último acesso de cada conta vinculada no perfil da parceria. As datas passam a ser registradas a partir da migração V8, depois de um login concluído.

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

O segundo comando carrega exemplos de rádio e TV nas parcerias fictícias, valida os XLSX e publica uma cópia individual de vendas para a Renner. Use `--somente-verificar` para reler a carga sem criar importações. O seed preserva parcerias existentes e preenche os cenários complementares quando ausentes. Se uma marca foi criada apenas em parte, identifique o registro faltante antes de repetir qualquer operação.

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

A conta Railway precisa ter créditos suficientes para dois serviços e volumes. A documentação oferece US$ 5 no trial para novos usuários por até 30 dias e US$ 1 mensal no Free. Confira no painel se os créditos se aplicam à conta e quanto dura a demonstração planejada. A Railway limita volumes Free/Trial a 0,5 GB e pode remover volumes após a expiração. A Vercel permite Hobby para uso pessoal ou não comercial. Use a alternativa local se a elegibilidade ou os créditos impedirem a publicação sem pagamento.

1. Após revisar, commitar e enviar para `demo-pa27`, crie um projeto Railway exclusivo para a demonstração. Adicione PostgreSQL 17 com volume. Se for copiar os dados locais, restaure o backup antes do primeiro start do backend. Mantenha o banco na rede privada.
2. Adicione o backend do novo repositório, branch `demo-pa27`, raiz `/backend`. Railway detecta o Dockerfile. Monte um volume em `/data/arquivos`. Gere um domínio HTTPS para o backend. O processo usa `PORT` quando Railway o injeta e 8080 no Docker local.
3. Configure `PORTAL_DATABASE_URL` com `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}`, `PORTAL_DATABASE_USER` com `${{Postgres.PGUSER}}` e `PORTAL_DATABASE_PASSWORD` com `${{Postgres.PGPASSWORD}}`. Ajuste Postgres ao nome exato do serviço. Gere um `PORTAL_JWT_SECRET` exclusivo. Use `PORTAL_STORAGE_DIRECTORY=/data/arquivos`, `PORTAL_MAIL_ENABLED=false` e a origem da Vercel em `PORTAL_FRONTEND_URL`. Com o backup completo, mantenha bootstrap desligado. O e-mail local por Mailpit serve apenas ao ambiente local.
4. Na raiz do clone, rode `node frontend/scripts/configure-vercel.mjs https://DOMINIO-DA-API`. Revise e publique o `frontend/vercel.json` gerado. Ele mantém `/api` na mesma origem para o navegador e encaminha o restante para os arquivos estáticos ou o Angular.
5. Importe o repositório na Vercel como projeto separado. Defina raiz `frontend`, branch de produção `demo-pa27` e Node 24. Após publicar, teste login, recarga de uma rota interna, upload pequeno, comprovação e XLSX nos dois perfis. Repita após novo deploy com os mesmos volumes.

Com `PORTAL_MAIL_ENABLED=false`, os acessos de demonstração restaurados continuam utilizáveis. Novos convites que exigem ativação por e-mail precisam de um serviço de envio configurado. O Mailpit local permite demonstrar esse fluxo sem envio a destinatários reais.

### Copiar os dados fictícios e os anexos

Faça a cópia quando ninguém estiver escrevendo no portal local. Execute na raiz do novo clone. Os backups contêm contas fictícias com hashes de senhas e devem ficar fora do Git.

```powershell
New-Item -ItemType Directory -Force backups
docker compose -p portal-pa27-demo exec -T db pg_dump -U portal -d portal -Fc -f /tmp/pa27.dump
docker compose -p portal-pa27-demo cp db:/tmp/pa27.dump backups/pa27.dump
docker compose -p portal-pa27-demo exec -T backend tar -czf /tmp/pa27-arquivos.tgz -C /data/arquivos .
docker compose -p portal-pa27-demo cp backend:/tmp/pa27-arquivos.tgz backups/pa27-arquivos.tgz
```

Use Railway SSH com sua chave registrada e SCP por SFTP. Na Railway, identifique o ID da instância de cada serviço no projeto da demonstração. Use OpenSSH 9 ou superior.

```powershell
scp backups/pa27.dump ID-DA-INSTANCIA-POSTGRES@ssh.railway.com:/tmp/pa27.dump
scp backups/pa27-arquivos.tgz ID-DA-INSTANCIA-BACKEND@ssh.railway.com:/tmp/pa27-arquivos.tgz
```

No shell SSH do Postgres, em um banco vazio e antes de iniciar o backend:

```sh
pg_restore --exit-on-error --single-transaction --no-owner --no-privileges --dbname="$PGDATABASE" /tmp/pa27.dump
```

No shell SSH do backend, após montar o volume:

```sh
tar -xzf /tmp/pa27-arquivos.tgz -C /data/arquivos
```

Confirme o download de um arquivo conhecido antes de compartilhar o endereço. Os passos de nuvem dependem dos projetos e créditos disponíveis na sua conta.

Fontes: [Railway Trial](https://docs.railway.com/pricing/free-trial), [volumes Railway](https://docs.railway.com/volumes/reference), [Railway SSH e SCP](https://docs.railway.com/cli/ssh), [termos da Vercel](https://vercel.com/legal/terms).
