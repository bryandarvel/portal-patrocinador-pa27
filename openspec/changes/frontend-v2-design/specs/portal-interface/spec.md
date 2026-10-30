# Spec Delta

## Purpose

Define o layout, a navegação e os padrões visuais compartilhados das telas autenticadas do Portal do Patrocinador, nos perfis patrocinador e Admin RBS.

## ADDED Requirements

### Requirement: Layout autenticado único
As telas de uma parceria SHALL usar o mesmo layout nos dois perfis: cabeçalho com marca, edição e notificações; barra lateral com retorno, identidade e cota da parceria, áreas numeradas habilitadas, relatório e conta; e conteúdo com trilha, título, descrição e faixa de cores PA27.

#### Scenario: Patrocinador abre uma área
- **WHEN** um patrocinador autenticado abre uma área habilitada da parceria
- **THEN** a barra lateral destaca a área atual com `aria-current="page"` e mostra "Minhas parcerias", nome, cota, "Relatório da parceria" e a pessoa conectada com a ação Sair

#### Scenario: Admin RBS abre uma área
- **WHEN** um Admin RBS abre uma área da parceria
- **THEN** o retorno leva a "Patrocinadores" e a barra lateral mostra "Relatório e planilhas"

#### Scenario: Entregas na lista de áreas
- **WHEN** qualquer perfil vê a lista de áreas
- **THEN** "Entregas da parceria" aparece como o último item numerado, depois das áreas habilitadas

### Requirement: Ajuda e notificações acessíveis
O layout SHALL oferecer a FAQ por um botão flutuante com nome acessível e as notificações por um botão de sino com nome acessível, sem remover destinos existentes.

#### Scenario: Acesso à FAQ
- **WHEN** a pessoa ativa o botão de ajuda por mouse ou teclado
- **THEN** a FAQ da parceria abre

#### Scenario: Notificações
- **WHEN** a pessoa ativa o sino
- **THEN** abre a lista de notificações da parceria, como antes

### Requirement: Navegação em telas estreitas
Abaixo de 960px de largura, a barra lateral SHALL ficar recolhida e abrir em painel por um botão do cabeçalho; o conteúdo SHALL ocupar uma coluna sem rolagem horizontal.

#### Scenario: Celular
- **WHEN** a janela tem 390px de largura
- **THEN** o botão de menu abre a navegação completa, o foco entra no painel, Esc fecha e não há rolagem horizontal

### Requirement: Padrões visuais compartilhados
Cartões, cabeçalhos de cartão com ícone, faixas de status, áreas de envio e botões SHALL ter uma única definição compartilhada, usada por todas as telas, com foco visível e contraste mínimo WCAG AA.

#### Scenario: Mesma aparência entre telas
- **WHEN** duas telas exibem um cartão de seção
- **THEN** ambas usam o mesmo raio, borda, espaçamento e tipografia definidos nos tokens globais

#### Scenario: Ação principal
- **WHEN** uma tela autenticada mostra a ação principal
- **THEN** ela usa a cor primária azul do tema; o login mantém o botão magenta
