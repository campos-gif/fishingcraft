# FishingCraft — Costa Voxel

## Objetivo

Entregar uma melhoria visível do mundo e da orientação do jogador, mantendo o estilo de blocos, o funcionamento offline, os controles de toque e o progresso salvo. A tecnologia continua sendo canvas 2D com projeção 2.5D; não prometer 3D real nesta etapa.

## Plano para revisão

1. **Mundo:** projeção oblíqua coerente para terreno, objetos e barcos; faces iluminadas, laterais e sombras; areia/solo em camadas; folhas e telhados em blocos; espuma na costa e vida na água. Usar detalhes determinísticos e quantidade limitada de partículas.
2. **Composição:** cenário mais próximo, câmera centrada no jogador e profundidade ordenada pela posição no chão. Árvores que ocultam o jogador ficam translúcidas. Evitar objetos sobrepostos que escondam pesca e caminhos.
3. **Experiência:** objetivo contextual, inventário consultável e agrupado por espécie, valor total, indicação de retorno ao cais e feedback de captura. Não alterar preços, peixes disponíveis nem apagar o save v3.
4. **Interface:** HUD compacto com identidade Costa Voxel, minimapa da ilha/cais, botões confortáveis no celular, painel de pesca separado dos controles. Mostrar a versão e versionar os assets para identificar atualizações.
5. **Confiabilidade:** validar saves, interromper pesca de forma previsível, manter teclado/toque consistentes; verificar regressões de pesca, venda, compra, inventário e movimento.
6. **Entrega:** testes automatizados e inspeção visual em navegador; commit e push comuns; distinguir envio ao GitHub de implantação pública confirmada.

## Critérios de aceite

- Mudança evidente ao iniciar: blocos com profundidade, vegetação detalhada, cabana e água aprimoradas.
- Jogador identificável atrás da vegetação e controles legíveis em retrato e paisagem.
- Pesca com tensão, venda e upgrades continuam funcionando; recarregamento conserva os itens/moedas.
- Inventário apresenta nomes, quantidades e valores dos peixes reais da mochila.
- Nenhuma dependência externa, textura baixada ou instalação necessária para jogar.
- Plano revisado por agentes antes de iniciar implementação; resultados documentados abaixo.

## Evolução posterior

Depois desta entrega: mundo com regiões próprias, catálogo persistente de espécies, missões do vendedor e áudio opcional. Uma migração WebGL/3D real deve ter orçamento de desempenho e testes em aparelhos físicos antes de substituir o renderizador atual.

## Revisão

Plano aprovado após duas revisões independentes, realizadas antes da implementação:

- **Arte/desempenho:** unificar projeção de cenário/barco/linha; calcular culling pela inversa; ordenar objetos pelo contato no solo; transparência de copas que ocultam jogador; testar retrato/paisagem. Adotado. Meta de 30 fps deve ser medida em aparelho físico antes de afirmar suporte geral.
- **Experiência/estados:** normalizar saves nulos, níveis fracionários e peixes inválidos; chamar mochila de inventário, não coleção histórica; inventário interrompe pesca explicitamente; corrigir travessia do lago/cabana; exibir versão. Adotado.

Implementação dividida entre renderização (agente principal), interface responsiva (agente de arte) e integração/inventário/saves/testes (agente de experiência). Alterações serão revistas e testadas juntas antes do envio.

## Resultado da entrega 0.4

Implementados perspectiva oblíqua unificada, câmera suave, terreno em camadas, água/espuma/peixes decorativos, vegetação com transparência contextual, cabana com telhado escalonado, barco volumétrico, minimapa, inventário, objetivos, feedback de captura, colisões de lago/cabana e normalização do save. Revisão final não encontrou bloqueador; corrigidos texto do minimapa e foco do inventário.

Validação: dez testes automatizados de desafio e integração passaram. Prévia local 0.4 conferida em navegador; telas 390×844 e 844×390 inspecionadas, incluindo painel de recolhimento na horizontal. Não equivale a teste em Safari/iPhone físico nem a medição de FPS em aparelho móvel.
