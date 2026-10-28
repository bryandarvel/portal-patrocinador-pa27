# Origem dos materiais PA27

- `pa27-logo-figma.png`: asset oficial do cabeçalho do frame `11:1345` (FAQ Admin RBS), baixado sem edição do arquivo Figma `gcTHwwkH4AYZSCAg6PPtLJ`. Aplicado à FAQ e ao relatório administrativo; as demais telas conservam o logo já aprovado. O ponto verde da confirmação (`5:19`, `76:1776`) é idêntico ao `status-concluido.svg` existente (SHA-256 conferido).
- O relatório administrativo (`77:1831`, slot `77:1833`) reutiliza `pa27-logo-figma.png`: o `imageHash` no Figma é o mesmo do slot `11:1347` da FAQ. Os pontos verde e vermelho reutilizam os mesmos componentes `5:19` e `5:13` já salvos, sem novos assets.
- O perfil administrativo do Roxo (`16:1136`, slot `16:1138`) reutiliza o mesmo `pa27-logo-figma.png`, com `imageHash` idêntico ao slot da FAQ. Não adiciona novos assets.

- `status-disponivel.svg`: ellipse 6 × 6 do componente Figma `5:22`, usado no frame `14:933` para comprovação disponível.
- `status-concluido.svg` também atende à aprovação do material (`5:28`, estado `11:1272`): o asset oficial obtido do Figma é idêntico ao existente (SHA-256 conferido). O asset azul foi obtido do arquivo `gcTHwwkH4AYZSCAg6PPtLJ`, sem edição.

Uso exclusivo no Desafio GC conforme os materiais fornecidos pelo grupo.

- `pa27-festival.jpg`: fotografia extraída da página 7 de `Visual_PA27_padrão.pdf`, objeto de imagem 91. Redimensionada para até 1500 px, JPEG qualidade 85; origem também registrada no comentário JPEG.
- `pa27-logo.png`: marca extraída da página 7 do mesmo PDF, imagem 106 com máscara alfa 105. Redimensionada para até 420 px; origem registrada no campo PNG `Source`.
- `pa27-experiencia.jpg`: fotografia de ativações e público da página 6, imagem 57; até 1500 px, JPEG qualidade 85.
- `pa27-publico.jpg`: fotografia panorâmica de público da página 8, imagem 115; até 1500 px, JPEG qualidade 85. As duas novas imagens também têm origem embutida pelo `impeccable embed-prompt`.

O arquivo original `Visual_PA27_padrão.pdf` foi fornecido pelo grupo. Os assets extraídos estão versionados nesta pasta; o PDF não é necessário para executar o frontend. Não atribuir a fotografia à edição de 2027: ela integra a identidade visual fornecida para essa edição.
