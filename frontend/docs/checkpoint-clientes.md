# Checkpoint frontend — Aplicações de marca do Roxo

Situação em 28/10/2026. Bryan pediu concluir o lote das 19 versões restantes e,
posteriormente, antecipou um checkpoint de Git para depois de Aplicações de marca
do Roxo. Somente `frontend/` participa deste checkpoint.

## Estado do lote

O código das 19 versões já foi escrito e ligado à navegação. O perfil Roxo
existente é reaproveitado para o Verde. Isso resulta em 20 rotas para os dois
clientes, sem implementar cópias independentes de cada componente.

| Páginas | Roxo | Verde |
| --- | --- | --- |
| Perfil | Aprovado no ciclo anterior; contexto compartilhado neste lote | Implementado; conferência no navegador pendente |
| Aplicações de marca | Verificado neste checkpoint | Implementado; conferência no navegador pendente |
| Mídia e conteúdo | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| Cortesias | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| Credenciamento | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| Pesquisa da ativação | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| Contrato | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| Entregas | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| FAQ | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |
| Relatório | Implementado; conferência no navegador pendente | Implementado; conferência no navegador pendente |

As 18 versões novas além de Aplicações de marca do Roxo ainda precisam de
conferência visual e de interação. Compilação e testes de estado não comprovam
fidelidade visual de todo o lote. A aprovação final pertence ao Bryan.

## Referências e implementação

Arquivo Figma: `gcTHwwkH4AYZSCAg6PPtLJ`, página `3:4`. Frames principais consultados:

| Área | Roxo | Verde |
| --- | --- | --- |
| Perfil | `16:1136` | `16:2013` |
| Marca | `16:1253` | `16:2130` |
| Mídia | `16:1354` | `16:2231` |
| Cortesias | `16:1455` | `16:2332` |
| Credenciamento | `16:1595` | `16:2429` |
| Pesquisa | `16:1692` | `16:2526` |
| Contrato | `16:1793` | `16:2627` |
| Entregas | `16:1872` | `16:2706` |
| FAQ | `81:2061` | `81:2251` |
| Relatório | `77:2044` | `77:2255` |

`client-areas/client-preview.routes.ts` define as rotas; `shared/client-preview.service.ts`
mantém perfis, publicações e credenciamento separados por identificador. As rotas
de cortesias, FAQ e planilhas têm seus próprios serviços por parceria. O Amarelo
mantém as instâncias anteriores como padrão. Rotas novas não representam login,
permissão ou isolamento real de API.

Os componentes de marca, mídia e pesquisa compartilham a apresentação de
publicação de documento. Cortesias, FAQ e planilhas reutilizam os formulários
existentes. O perfil mantém seus arquivos `roxo-profile.*`, agora atendendo também
o Verde por dados da rota.

Os exemplos começam sem publicações, cortesias, credenciamento ou planilhas.
Contrato permanece bloqueado aguardando os signatários. Entregas permanece vazio.
Esses estados vêm do protótipo, sem deduzir limites ou direitos das cotas.

## Verificações executadas

- Build de produção no Docker: passou. Avisos de orçamento inicial (896,74 kB,
  limite de erro 1 MB), estilos do shell de patrocinador, lista e login permanecem.
- `node scripts/check-client-previews.mjs`: passou. Verifica 20 rotas únicas,
  edição e separação dos perfis, publicação por área, números inteiros não
  negativos, adicionar/editar cortesias, FAQ por categoria, planilhas sem
  duplicação e preservação do estado padrão do Amarelo.
- Aplicações de marca do Roxo: renderização em 1440 × 900 comparada ao frame
  `16:1253`; logo local carregado em 64 × 64, cartão com 1112 px e padding 24 px.
- Cancelar não publica; confirmar mostra um cartão; repetir não duplica; abrir
  exibe o diálogo previsto; navegar ao perfil e retornar preserva o material;
  recarregar restaura o estado vazio.
- Teclado: abrir e confirmar com Enter; Tab dentro do diálogo; Escape fecha e
  devolve o foco ao controle de origem; título recebe foco após a confirmação.
- Largura 390 px: página e modal sem rolagem horizontal de página.
- Console do navegador sem erros ao concluir o teste dessa tela.
- `git diff --check` passou após corrigir linhas vazias no fim dos templates.

## Limites e próxima retomada

Tudo permanece em memória. PDFs e planilhas são exemplos de metadados do Figma;
não há arquivos reais, upload, processamento, geração automática ou publicação
real. FAQ e cortesias não consultam APIs. Autenticação segue independente desta
etapa. Backend, Compose, dependências e lockfile não foram alterados.

O checkpoint contém também telas de ciclos anteriores ainda sem commit e a
estrutura já escrita do lote. Não é um commit isolado somente da tela Marca.
Depois do commit e push executados por Bryan na `dev-bryan`, retomar a conferência
das 18 versões restantes e suas ações, sem exigir aprovação por página no lote.
Antes de qualquer integração real, perguntar a Bryan como está o desenvolvimento
correspondente do backend do Ícaro.
