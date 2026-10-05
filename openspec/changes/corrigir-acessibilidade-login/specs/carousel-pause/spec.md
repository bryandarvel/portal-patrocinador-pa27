## Purpose
Permitir que o patrocinador interrompa a reprodução do carrossel e preencha o formulário sem movimento automático persistente ao lado.

## ADDED Requirements
### Requirement: Pausa persistente acessível
O login SHALL oferecer controle de pausa e retomada operável por teclado e toque, com nome acessível que descreve a ação. A pausa SHALL interromper troca automática e zoom até retomada explícita, inclusive após mover foco para o formulário. Indicadores SHALL continuar funcionando durante a pausa. Autoplay SHALL permanecer em 3 segundos quando permitido; movimento reduzido SHALL desativá-lo independentemente do controle. Esta regra substitui a proibição de play/pause em refine-login-carousel.

#### Scenario: Preencher formulário com carrossel pausado
- **WHEN** o usuário pausa e move foco para o formulário
- **THEN** cena e zoom permanecem parados por mais de 3 segundos, e o controle oferece retomada

#### Scenario: Retomar reprodução
- **WHEN** o usuário solicita retomada e sai do painel sem movimento reduzido
- **THEN** a cena avança após 3 segundos

#### Scenario: Movimento reduzido e seleção manual
- **WHEN** movimento reduzido está ativo ou o carrossel está pausado e uma barra é selecionada
- **THEN** a cena escolhida aparece e não reinicia autoplay
