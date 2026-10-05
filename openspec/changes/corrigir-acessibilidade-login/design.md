## Context
O timer depende de hover, foco, visibilidade e movimento reduzido; não existe estado de pausa escolhido pelo usuário. A navegação para o formulário reinicia a reprodução. Fontes: login.ts, login.html, login.css, DESIGN.md e revisão do PR #1.

## Goals / Non-Goals
Corrigir apenas os quatro achados. Preservar fotos, marca, layout e validação; não implementar autenticação.

## Decisions
Reutilizar o timer e cleanup existentes, adicionando um signal de pausa. Botão nativo de 44px com ícones NG-ZORRO já disponíveis, nome acessível dinâmico e foco visível. Pausa também interrompe zoom. O usuário pode trocar cenas enquanto pausado; sair para o formulário não retoma. Movimento reduzido mantém autoplay desligado mesmo ao solicitar retomada.

Atualizar os dois valores mobile no DESIGN e a descrição dos controles. Evidência externa da retrospectiva não será copiada automaticamente, pois seu conteúdo não foi autorizado para publicação; declarar sua indisponibilidade. Política global pertence ao ambiente do autor, não é pré-requisito do colaborador; fontes de projeto são README e openspec/config.yaml.

## Risks / Trade-offs
Novo controle adiciona largura no cabeçalho mobile: validar 360x640 e notebook. O contrato anterior exigia ausência de pausa; esta autorização e nova spec prevalecem. Execução sequencial pelo agente raiz, sem subtarefa independente que justifique delegação.

## Verification
Build, proxy, OpenSpec strict, whitespace e navegador: autoplay, pausa persistente por mais de 3s com foco no formulário, retomada, teclado, movimento reduzido e overflow desktop/mobile. Revisão delimitada dos quatro achados; não ampliar para revisão completa do projeto.
