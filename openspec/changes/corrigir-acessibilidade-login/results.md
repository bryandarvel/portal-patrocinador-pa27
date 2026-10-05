# Correções dos quatro apontamentos do Copilot

Validação em 05/10/2026, base `origin/main` após merge do PR #1. Pausa persistente adicionada com botão nativo, rótulos Pausar/Retomar e alvo de 44px. Reutiliza timer e cleanup, mantendo a preferência de movimento reduzido. A regra CSS da pausa foi tornada mais específica para interromper o zoom da cena ativa.

Tipografia mobile documentada alinhada ao CSS (`clamp(22px, 3.7svh, 30px)`). As duas referências locais foram substituídas por declaração de evidência externa indisponível e links existentes ao README e configuração OpenSpec. Não foram copiados documentos externos ou alteradas regras globais. A spec anterior foi sinalizada como substituída na regra de play/pause.

`npm run test:proxy`: 1/1 aprovado. `npm run build`: aprovado, bundle inicial 865,78 kB e CSS login 5,44 kB, com avisos já existentes de 500 kB/4 kB; limites de erro preservados. `openspec validate --all --strict --no-interactive`: 4/4 changes; `git diff --check`: aprovado.

Navegador via Playwright CLI: autoplay após 3,3s, pausa acionada por Enter e persistente após 3,5s com foco no formulário, animationPlayState paused, retomada após 3,3s, preferência de movimento reduzido sem troca, seleção manual durante pausa. Capturas em 1366x650 e 360x640 inspecionadas; mobile com formulário inválido sem overflow. Console sem erros ou avisos. Uma leitura imediata do estado após seleção falhou na primeira execução do roteiro; corrigida para aguardar o render Angular, sem alterar ou desativar a asserção de comportamento. Browser e servidor de validação encerrados (sessão pausa-login, processo Angular 38528 confirmado por comando/pai).

Revisão delimitada: os quatro achados foram resolvidos. Identidade e validação do formulário preservadas; nenhuma dependência, autenticação, backend ou infraestrutura alterada. Não foi executada suíte E2E do projeto, que não existe; foram verificações reais delimitadas no navegador. Branch `fix/corrigir-acessibilidade-login`, publicada com upstream e SHA remoto conferido. Registro final incorporado ao mesmo commit para manter histórico enxuto; main não foi reescrita.
