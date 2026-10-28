# Backend: contratos e operação local

Implementação de 28/10/2026 baseada no [TAP e planos](regras-negocio/README.md). Escopo e decisões em [integração](integracao-backend.md). As telas Angular dos dois perfis consomem estes contratos, com verificações locais HTTP e no navegador.

## Início e credenciais

Siga o [README](../README.md). `.env.example` lista os valores necessários; o `.env` local é ignorado pelo Git. A chave JWT precisa de ao menos 32 bytes. Senhas têm mínimo de 12 caracteres e máximo de 72 bytes UTF-8, limite do BCrypt.

O bootstrap cria o primeiro Admin RBS somente com habilitação e credenciais explícitas. O nome, e-mail e senha locais estão em `PORTAL_BOOTSTRAP_NAME`, `PORTAL_BOOTSTRAP_EMAIL` e `PORTAL_BOOTSTRAP_PASSWORD` no `.env`; não foram incluídos no código. Desabilitar o bootstrap após o provisionamento da implantação.

| Recurso | Endereço local |
| --- | --- |
| API | `http://localhost:8080` |
| Swagger | `http://localhost:8080/swagger-ui/index.html` |
| OpenAPI | `http://localhost:8080/v3/api-docs` |
| Caixa SMTP de testes | `http://localhost:8025` |

As portas publicadas ficam em loopback. SMTP do Compose é Mailpit interno, sem envio para caixas externas. Fora do Compose, configurar `PORTAL_DATABASE_URL/USER/PASSWORD`, `PORTAL_SMTP_HOST/PORT/USERNAME/PASSWORD/AUTH/STARTTLS`, `PORTAL_MAIL_ENABLED` e `PORTAL_FRONTEND_URL`.

Arquivos ficam no volume `portal-files`, diretório `PORTAL_STORAGE_DIRECTORY`. Limites: `PORTAL_UPLOAD_MAX_BYTES`, `PORTAL_UPLOAD_MAX_FILE_SIZE` e `PORTAL_UPLOAD_MAX_REQUEST_SIZE`. Os defaults são 20 MiB por arquivo e 22 MB por requisição. Downloads exigem token e vínculo com a parceria; o armazenamento não é servido como diretório público.

## Identidade e permissões

`POST /api/auth/login` recebe `{email,senha}`. Conta ativa sem MFA retorna `{status:"AUTHENTICATED",token,challenge:null}`. Com MFA retorna HTTP 202 e `{status:"MFA_REQUIRED",token:null,challenge}`. Enviar `{challenge,codigo}` para `POST /api/auth/validar-mfa`. Um desafio não é aceito como token de acesso.

Enviar `Authorization: Bearer <token>` nas operações protegidas. `GET /api/auth/me` retorna identidade, papel, `mfaEnabled` e IDs das parcerias autorizadas. Permissão de parceria é conferida no banco a cada requisição; remover um vínculo impede o acesso mesmo com JWT ainda válido. No Angular, o token fica em `sessionStorage` da aba, é enviado apenas a `/api/` e é removido ao sair ou receber 401.

RBS cadastra patrocinador em `POST /api/auth/cadastro`, com `{nome,email,senha}`. Para convidar outro membro RBS, usar `POST /api/admin/usuarios`, com os mesmos campos e `role:"ADMIN_RBS"`. Esse endpoint também aceita `ADMIN_PATROCINADOR`. Os dois fluxos exigem Admin RBS e ativam a conta apenas após verificação por e-mail. Falha de envio reverte a criação. A senha nunca é devolvida pela API.

`GET /api/auth/verificar?token=...` ativa o usuário; token tem validade e uso único. O caminho antigo de confirmação de login suspeito foi removido porque emitia sessão sem envio real de e-mail e não tinha consumidor Angular. Setup/confirm de MFA mantêm os caminhos existentes, mas só operam na própria conta autenticada.

## Cotas, direitos e parcerias

`GET/POST /api/cotas` e `PATCH /api/cotas/{id}` administram o catálogo. Exemplo com dados sintéticos:

```json
{
  "nome": "Pacote de demonstração",
  "areas": ["perfil", "marca", "cortesias", "credenciamento", "contrato"],
  "entregas": [{"area":"marca","titulo":"Aplicação contratada","descricao":"Descrição do plano"}],
  "beneficios": [
    {"natureza":"CORTESIA","tipo":"sexta","setor":"Arena","publico":"","quantidade":4},
    {"natureza":"CREDENCIAL","tipo":"servico","setor":"Arena","publico":"agencia","quantidade":5}
  ],
  "versao":0
}
```

Esses números não representam uma cota comercial. Áreas: `perfil`, `marca`, `midia`, `cortesias`, `credenciamento`, `pesquisa`, `contrato`. Perfil é obrigatório. Os três tipos de cortesia do TAP são `passaporte`, `sexta`, `sabado`; setor, público, datas e limites são dados.

`POST /api/parcerias` recebe `{nome,edicao,cotaId,usuarioIds}`. Os usuários devem ser contas de patrocinador já convidadas pela RBS, identificadas por `GET /api/admin/usuarios?busca=...`. Criação da parceria, vínculos, direitos e entregas do modelo ocorre em uma transação. Documentos comerciais são enviados depois pelo endpoint próprio.

O cadastro copia capacidades, benefícios e modelos de entrega para a parceria. Editar o catálogo não altera os contratos já aplicados. `GET /api/parcerias/{id}` retorna perfil, áreas e benefícios; RBS também recebe a lista de acessos. `PATCH /api/parcerias/{id}` recebe `{nome,versao,cotaId?}`; mudar a classificação preserva os direitos já contratados. Ajustar esses direitos é uma ação explícita.

- `PATCH /api/parcerias/{id}/acesso`: `{usuarioIds:[...]}` substitui as contas autorizadas, inclusive permitindo revogação. Não altera o e-mail de uma identidade compartilhada.
- `PUT /api/parcerias/{id}/areas`: `{areas:[...]}` define capacidades permitidas pela RBS.
- `POST /api/parcerias/{id}/beneficios`: registra direito adicional com natureza, tipo, setor, público e quantidade.
- `PATCH /api/parcerias/{id}/beneficios/{beneficioId}`: `{quantidade,versao}` altera limite com histórico; não reduz abaixo do já disponibilizado.
- `POST /api/parcerias/{id}/entregas`: inclui entrega contratual extra, com `{area,titulo,descricao}`.

Nenhuma regra depende de Amarelo/Roxo/Verde. Os calendários de 2026 presentes nos PDFs não são impostos à edição de 2027.

## Áreas e versionamento

O Swagger é o catálogo dos métodos/DTOs efetivamente disponíveis. Particularidades dos contratos:

- Uploads usam `multipart/form-data`, campo `arquivo`. Publicações de marca/mídia aceitam JSON para texto/link ou multipart com parte JSON `dados` e arquivo opcional.
- Conteúdo RBS é somente leitura para patrocinadores. Recebimento de marca, mídia e pesquisa é controlado por `{aberto,prazo}`; prazo é instante ISO 8601 e envios são rejeitados quando fechados/expirados.
- Cortesias referenciam `beneficioId`. `sexta`/`sabado` exigem `diaEvento`; passaporte exige `periodoInicio`/`periodoFim`. Quantidade é limitada pelo direito correspondente e dia; destinação não ultrapassa o saldo, inclusive com requisições simultâneas.
- Credenciais informam setor, tipo, público, quantidade e `beneficioId`. A URL do Open Staff é configuração da parceria; o portal não recria o sistema externo.
- `PATCH /midia/veiculacoes` recebe `{versao,itens}`. `GET /midia` retorna `veiculacoesVersao` e `veiculacoesHistorico`.
- `PUT /credenciamento` recebe `{versao,urlOpenStaff,itens}`. A consulta retorna versão e histórico. Versão desatualizada recebe 409; estados anteriores permanecem registrados.
- Pesquisa admite de uma a três perguntas quando habilitada, submetidas pelo patrocinador. Resultados são publicados pela RBS.
- Signatários são informados pelo patrocinador em `PUT /contrato/signatarios`, antes da primeira publicação. Decisão exige versão atual; nova versão exige pedido de ajuste. Arquivo assinado é publicado pela RBS e vinculado à versão aprovada.
- Materiais de entrega têm versões e avaliação. Fluxo: recebido, em análise, ajustes ou aprovado; após aprovação, execução em andamento e realizada. Comprovação só é publicada para entrega realizada. Avaliar versão antiga é rejeitado.
- `GET /historico` e `GET /api/notificacoes` respeitam o escopo do usuário. São registros/avisos das operações; não há integração externa de alertas por prazo nesta entrega.

## Relatório automático

`GET /api/parcerias/{id}/relatorio` consolida dados atuais em JSON com leitura consistente. `GET /api/parcerias/{id}/relatorio/exportar` gera HTML autônomo, baixável e imprimível. Não é necessário montar esse relatório manualmente.

Inclui perfil/edição/cota, entregas, responsáveis, veiculações, perguntas, resultados/arquivos publicados, cortesias, credenciamento e comprovações. Texto é escapado na exportação. Planilhas internas não são incluídas nem ficam acessíveis ao patrocinador. Mídias/documentos binários são relacionados por seus registros autorizados; seus bytes não são incorporados no HTML. Não são criados indicadores ausentes nem interpretadas planilhas externas. Publicação de documento complementar continua disponível em `POST /relatorio/publicacoes`.

## Verificação e evolução

O [smoke](../backend/scripts/check-portal-api.py) usa a biblioteca padrão Python, o `.env` local e as APIs em loopback. Cria dados sintéticos identificados com `Smoke`; não apaga registros anteriores. A suíte Java testa autenticação e limites. H2 verifica somente a inicialização do contexto; migrações e caminhos HTTP são verificados com PostgreSQL real do Compose.

Flyway valida migrações já aplicadas; não editar V1 a V6 depois da aplicação. O Compose habilita baseline explícito em versão 0 para incorporar o banco local anterior; fora dele o default é desabilitado. Evoluções usam novas migrações. Não executar Maven concorrente: parar `backend` antes de `docker compose run --rm --no-deps backend sh ./mvnw test`, retomando-o depois.

Dependências conferidas nas fontes primárias: [Flyway no Spring Boot](https://docs.spring.io/spring-boot/how-to/data-initialization.html), [compatibilidade Springdoc/Boot 4.1](https://springdoc.org/faq.html), [Mailpit Docker](https://mailpit.axllent.org/docs/install/docker/). Flyway versiona o schema; Springdoc foi alinhado ao Boot já presente; Mailpit substitui SMTP externo nos testes locais.
