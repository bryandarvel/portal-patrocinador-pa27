# Resultados

Data: 30/10/2026. Branch: `dev-icaro`. O trabalho começou em `feat/popular-base-demonstracao`; por decisão do usuário (30/10/2026), tudo segue na `dev-icaro` e a branch extra foi removida.

## O que mudou

- `backend/scripts/seed-portal.py`: carga de demonstração pela API (três parcerias, uma por cota, níveis completo, parcial e mínimo; contatos e segundo Admin RBS ativados pelo Mailpit; PDF, PNG e XLSX gerados em memória).
- `backend/scripts/reset-portal.sh`: `--confirmar` salva backup (dump só de dados e `tar` dos arquivos) e esvazia a base; `--restaurar <data>` volta a um backup com o backend parado.
- `backend/scripts/portal_api.py`: configuração (ambiente e `.env`), requisições e ativação compartilhadas; `check-portal-api.py` passou a usá-lo e a respeitar as portas configuradas.
- `compose.yaml`: `BACKEND_PORT` e `PORTAL_FRONTEND_URL` derivada de `FRONTEND_PORT` (links de ativação apontavam para 4200 fixo).
- Front: removidas as prévias do Figma sem rota (`admin/client-areas`, `roxo-profile`, `client-report-summary`, `client-preview.service`) e o `sponsorId` sem uso. Corrigido o resumo de entregas do admin, que perdeu o fundo branco no layout v2.
- `AGENTS.md` e `CLAUDE.md` com as regras do projeto; README com os comandos.

## Verificação

Stack isolada no servidor de testes (`COMPOSE_PROJECT_NAME=portal-teste`, portas 18080/18125/14300), removida ao final:

| Verificação | Resultado |
| --- | --- |
| Carga em base vazia | 3 parcerias, 3 cotas, 5 usuários ativos; parceria completa com dados em todas as áreas e no relatório. |
| Carga repetida | Nada duplicado ("já existe, mantida"). |
| Limpeza sem `--confirmar` | Recusa, código 1, nada alterado. |
| Limpeza confirmada | Backup criado; 0 parcerias, 0 arquivos, 6 migrações mantidas; admin do bootstrap recriado. |
| Restauração | 3 parcerias, 5 usuários e 21 arquivos de volta; backup inexistente recusado com código 1. |
| `check-portal-api.py` em portas não padrão | PASS, 104 requisições. |
| Telas v2 com login real (admin e patrocinadora) | Sem erros de página nem respostas 5xx, sem rolagem horizontal; nomes de arquivo em UTF-8. |
| `npm run build` | Aprovado, inicial 900,80 kB. |

## Incidente durante o teste

A primeira tentativa de stack isolada usou o mesmo projeto Compose do portal em uso, porque `compose.yaml` fixa `name: desafio-gc-rbs-local`. O backend do portal ficou cerca de dois minutos com a configuração da pasta de teste (outro segredo JWT, porta 18080) e o Mailpit foi recriado. Nenhum script de carga ou limpeza rodou nesse intervalo e o bootstrap não altera usuário existente; o backend foi restaurado a partir da pasta original. Prática registrada no README: cópias isoladas definem `COMPOSE_PROJECT_NAME`.

## Limites

- Nada foi rodado na base em uso do servidor; a carga ali depende de autorização do usuário.
- Fora do escopo, observado nas telas: estados de entrega e tipos de cortesia aparecem como código bruto (`REALIZADA`, `passaporte`), já assim na `dev`.

## Envio

`86b29c4` (correção do resumo de entregas, que ficou fora do PR #8 já mesclado) e `4979b09` (carga e limpeza) em `origin/dev-icaro`; PR `dev-icaro` → `dev` aberto com permissão do usuário. Regra de branch registrada no `AGENTS.md`.
