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
- Ao morder, aperte para fisgar. Segure o botão de pesca (ou Espaço) para recolher; solte quando o peixe puxar ou a tensão ficar alta. Complete o recolhimento antes de a linha romper. Varas melhores facilitam o desafio; peixes valiosos resistem mais.
- O progresso fica salvo no armazenamento local do navegador. Limpar os dados do site apaga o progresso daquele dispositivo.

## Publicação

O workflow `.github/workflows/deploy-pages.yml` publica automaticamente cada envio à branch `main` no GitHub Pages. Na primeira publicação, em **Settings → Pages**, selecione **GitHub Actions** como fonte de implantação. O endereço esperado é:

`https://campos-gif.github.io/fishingcraft/`

## Evolução futura

O jogo usa canvas 2D com aparência de blocos e profundidade simulada. `renderer.js` cuida do cenário e das animações; `visual.css`, da interface; `fishing.js`, do desafio de recolhimento. `index.html` integra movimento, inventário, loja e salvamento. Essa separação permite substituir o renderizador por 3D real futuramente sem reescrever a economia.

Execute os testes de pesca com `node --test tests/fishing.test.cjs`.
