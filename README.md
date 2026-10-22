# FishingCraft

Jogo de pescaria em estilo de blocos, feito com HTML, CSS e JavaScript puro. O projeto não exige dependências nem compilação.

## Executar localmente

Abra `index.html` em um navegador moderno. Para testar com comportamento próximo ao GitHub Pages, use um servidor HTTP estático na pasta do projeto, por exemplo:

```sh
python3 -m http.server 8080
```

Depois acesse `http://localhost:8080`.

## Como jogar

- Desktop: setas ou WASD para mover; espaço para pescar; B para embarcar; E para falar com o vendedor.
- Celular: use os botões direcionais e os botões de ação na tela.
- Pesque perto do lago, da margem ou no barco. Venda os peixes ao Zé Pescador para comprar varas e barcos melhores.
- O progresso fica salvo no armazenamento local do navegador. Limpar os dados do site apaga o progresso daquele dispositivo.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente cada envio à branch `main` no GitHub Pages. Na primeira publicação, em **Settings → Pages**, selecione **GitHub Actions** como fonte de implantação. O endereço esperado é:

`https://campos-gif.github.io/fishingcraft/`

## Evolução futura

O jogo atual é um protótipo 2D em canvas. A lógica de estado (jogador, barco, pesca, inventário, loja e salvamento) está concentrada em `index.html`; ao migrar para 3D, mantenha essa separação e mova renderização, entrada e regras do jogo para módulos próprios.
