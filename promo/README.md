# Imagens de divulgação

`images/` tem as imagens prontas, cada uma em duas versões:

- vertical: 1080×1920
- horizontal: 1800×1200

| # | Imagem | Mostra |
|---|---|---|
| 1 | `menu` | O menu com busca, abas e o botão "+" |
| 2 | `sections` | As 12 seções extras, com amostras |
| 3 | `effects` | O efeito de cada checkbox no texto |
| 4 | `images` | Uma pasta de imagens próprias virando aba |
| 5 | `uncheck` | Desmarcar tudo e desfazer |

As checkboxes e o menu não são desenhos: as páginas usam o `styles.css` e o código do menu do próprio plugin (`src/style-picker.ts`). Por isso, depois de mudar estilos ou o menu, basta gerar de novo.

## Gerar de novo

Precisa das fontes Inter, Inter Display e JetBrains Mono instaladas e do Playwright com o Chromium:

```sh
npm install --no-save playwright
npx playwright install chromium
npm run build             # gera o styles.css
node promo/build.mjs      # todas as imagens
node promo/build.mjs menu # só uma
```

## Arquivos

- `slides.js`: o conteúdo e o layout de cada imagem. É aqui que se mudam textos e exemplos.
- `slides.css`: o visual das imagens (fundo, títulos, cards).
- `obsidian.css`: as cores e o CSS base do tema escuro do Obsidian.
- `harness.ts`: abre o menu real do plugin dentro da página e cria os escudos fictícios da imagem 4.
- `obsidian-stub.ts`: substitutos mínimos da API do Obsidian (ícones, botão de liga/desliga).
- `build.mjs`: compila o `harness.ts` e tira as fotos com o Playwright.
