## Purpose

Apresentar a identidade Planeta Atlântida no acesso visual do patrocinador, com carrossel controlável e formulário legível em notebook e celular.

## ADDED Requirements

### Requirement: Carrossel simplificado
O login SHALL apresentar três cenas oficiais PA27 e somente três indicadores clicáveis, sem controles separados de play/pause. SHALL alternar a cada 3 segundos em loop quando visível, sem preferência de movimento reduzido e sem foco ou hover no painel. Seleção manual SHALL trocar cena imediatamente, sem pausa permanente.

#### Scenario: Seleção e retorno ao loop
- **WHEN** o usuário seleciona a terceira barra e move foco e ponteiro para o formulário
- **THEN** a terceira cena aparece e após 3 segundos o carrossel retorna à primeira

#### Scenario: Preferência por movimento reduzido
- **WHEN** movimento reduzido está ativo
- **THEN** não há autoplay, zoom nem dissolução, mas as barras continuam operáveis por teclado

### Requirement: Apresentação responsiva PA27
O login SHALL manter logo e fotos oficiais, com camada de cor magenta/azul e contraste legível. SHALL apresentar a direção da última referência PA27 de 02/10/2026: divisão em tela cheia, fotografia à esquerda com faixas diagonais de cor nas bordas, marca e slogan em destaque; painel branco à direita, marca acima do formulário no desktop e título centralizado. SHALL caber sem rolagem em 1366×650, 1280×600 e 360×640 nos estados inicial e inválido, preservando rolagem natural em zoom ou espaço menor. A copy SHALL continuar orientada ao patrocinador; a referência visual não introduz autenticação social, compra de ingressos, cadastro ou recuperação de senha.

#### Scenario: Notebook e celular
- **WHEN** a tela é aberta nos tamanhos especificados e enviada com campos vazios
- **THEN** os campos, erros e ação permanecem acessíveis sem overflow horizontal ou vertical

### Requirement: Validação visual preservada
O login SHALL exigir e-mail válido e senha preenchida. Apenas um envio válido SHALL informar que autenticação ainda não está integrada, sem armazenar senha ou conceder acesso.

#### Scenario: Envio vazio
- **WHEN** o usuário envia sem preencher campos
- **THEN** mensagens de erro associadas aos campos aparecem e não há acesso autenticado
