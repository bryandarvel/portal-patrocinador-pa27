# Execução local via Docker

Registro de 28/10/2026.

Este registro descreve a primeira inicialização. O ambiente foi posteriormente ampliado com as APIs, migrações, configuração `.env`, volume de arquivos e Mailpit; consulte a [operação atual do backend](backend-api.md) e a [validação da implementação](integracao-backend.md#resultado-da-implementação-local).

Objetivo: iniciar frontend, backend e PostgreSQL usando o Compose do repositório.
Escopo: substituir, apenas no Docker, o driver e o dialeto H2 pela configuração PostgreSQL. A configuração fora do Docker permanece a mesma.

Critérios de conclusão: PostgreSQL saudável, backend inicializado com conexão PostgreSQL e frontend respondendo em `/login`; verificar também o encaminhamento de `/api` pelo frontend.

- [x] Alinhar a configuração PostgreSQL no Compose.
- [x] Iniciar os três serviços e conferir logs e respostas HTTP.
- [x] Registrar resultados, limites e comandos de parada.

## Operação

Na raiz do repositório:

```sh
docker compose up -d
docker compose ps
docker compose logs --tail 50 backend frontend
```

Frontend: <http://localhost:4200/login>. Backend: <http://localhost:8080>.
As portas ficam restritas a `127.0.0.1`; o banco fica na rede interna do Docker.

Para parar preservando dados e caches:

```sh
docker compose stop
```

Para remover containers e rede preservando volumes:

```sh
docker compose down
```

## Validação

A primeira execução compilou com Java 21, mas o backend encerrou com `Driver org.h2.Driver claims to not accept jdbcUrl, jdbc:postgresql://db:5432/portal`. O Compose agora substitui explicitamente o driver e o dialeto H2. As declarações `source`/`target` 25 no POM não impediram a compilação nesta execução; não foi necessária troca de JDK.

Após a correção, em 28/10/2026:

| Verificação | Resultado |
| --- | --- |
| `docker compose config --quiet` | Configuração válida. |
| `docker compose ps` | Três serviços ativos, PostgreSQL saudável. |
| Logs do backend | Conexão `org.postgresql.jdbc.PgConnection`, banco 17.11, Tomcat na porta 8080 e aplicação inicializada. |
| `GET http://127.0.0.1:4200/login` | HTTP 200. |
| `GET http://127.0.0.1:8080/api/auth/verificar?token=docker-local-check` | HTTP 400, `Token inválido ou expirado.`, como esperado para o token sintético inexistente. |
| Mesma requisição via porta 4200 | Mesmo status e corpo; comparação dos corpos com `cmp` passou. |
| `docker compose exec -T frontend npm run test:proxy` | Um teste passou, sem falhas. |

Os serviços foram deixados ativos a pedido do usuário. Nenhum cadastro ou envio de e-mail foi executado. A prontidão local e o caso negativo da API não comprovam login, MFA ou envio de e-mail. Não houve validação visual em navegador nem execução da suíte completa.
