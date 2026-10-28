# Fontes do portal PA27

Famílias identificadas no frame `PAT · Login` (`11:432`) do Figma validado:
Barlow Condensed Bold para títulos e Roboto para textos e controles.

Os arquivos são servidos localmente pelo Angular. Não há chamada ao Google Fonts
durante o uso do portal nem dependência npm adicional.

| Arquivo | Conteúdo | Licença |
| --- | --- | --- |
| `barlow-condensed-latin-700.woff2` | Barlow Condensed, normal, peso 700, subconjunto Latin | `OFL-BarlowCondensed.txt` |
| `roboto-latin-variable.woff2` | Roboto, normal, pesos 400–700, subconjunto Latin | `OFL-Roboto.txt` |
| `montserrat-latin-800.woff2` | Montserrat ExtraBold, normal, peso 800, subconjunto Latin | `OFL-Montserrat.txt` |

Os subconjuntos incluem os caracteres acentuados usados nos textos em português
do login. As pilhas CSS mantêm fontes de reserva caso um caractere não exista
nesses arquivos ou o carregamento falhe.

## Origem

Obtidos em 23/10/2026 pela API oficial Google Fonts, usando um navegador compatível
com WOFF2:

<https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700&family=Roboto:wght@400..700&display=swap>

- Barlow Condensed: <https://fonts.gstatic.com/s/barlowcondensed/v13/HTxwL3I-JCGChYJ8VI-L6OO_au7B46r2z3bWuQ.woff2>
- Roboto: <https://fonts.gstatic.com/s/roboto/v51/KFO7CnqEu92Fr1ME7kSn66aGLdTylUAMa3yUBA.woff2>
- Licença Barlow Condensed: <https://github.com/google/fonts/blob/main/ofl/barlowcondensed/OFL.txt>
- Licença Roboto: <https://github.com/google/fonts/blob/main/ofl/roboto/OFL.txt>

As declarações `@font-face` e os tokens tipográficos ficam em `src/styles.less`;
os títulos são aplicados em `src/app/features/auth/login/login.css`.

Montserrat foi adicionada em 24/10/2026 para a marca do cabeçalho do perfil
(`9:154` no Figma). Fonte oficial, servida localmente:

- CSS: <https://fonts.googleapis.com/css2?family=Montserrat:wght@800&display=swap>
- WOFF2: <https://fonts.gstatic.com/s/montserrat/v31/JTUHjIg1_i6t8kCHKm4532VJOt5-QNFgpCvr73w5aXo.woff2>
- Licença: <https://github.com/google/fonts/blob/main/ofl/montserrat/OFL.txt>
