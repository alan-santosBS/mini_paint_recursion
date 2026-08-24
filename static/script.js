document.addEventListener('DOMContentLoaded', () => {
    const canvasGrid = document.getElementById('canvas-grid');
    const tamanho = parseInt(canvasGrid.dataset.tamanho);
    let estadoGrid = JSON.parse(canvasGrid.dataset.grid);

    let ferramentaAtiva = 'lapis'; // 'lapis' ou 'balde'
    let corSelecionada = 1;        // ID da cor inicial (1 = Preto)
    let estaDesenhando = false;    // Controle do clique e arraste

    // Elements dos Botões
    const btnLapis = document.getElementById('btn-lapis');
    const btnBalde = document.getElementById('btn-balde');
    const btnLimpar = document.getElementById('btn-limpar');
    const opcoesCor = document.querySelectorAll('.cor-opcao');

    // Cancela o modo de desenho se o usuário soltar o clique em qualquer lugar
    document.addEventListener('mouseup', () => {
        estaDesenhando = false;
    });

    // 1. Alternância de Ferramentas (Lápis/Balde)
    function selecionarFerramenta(ferramenta) {
        ferramentaAtiva = ferramenta;
        btnLapis?.classList.remove('ativo');
        btnBalde?.classList.remove('ativo');

        if (ferramenta === 'lapis') btnLapis?.classList.add('ativo');
        if (ferramenta === 'balde') btnBalde?.classList.add('ativo');
    }

    btnLapis?.addEventListener('click', () => selecionarFerramenta('lapis'));
    btnBalde?.addEventListener('click', () => selecionarFerramenta('balde'));

    // Botão Limpar (Zera a matriz inteira localmente)
    btnLimpar?.addEventListener('click', () => {
        for (let x = 0; x < tamanho; x++) {
            for (let y = 0; y < tamanho; y++) {
                estadoGrid[x][y] = 0;
                const pixel = document.getElementById(`pixel-${x}-${y}`);
                if (pixel) pixel.className = 'pixel cor-0';
            }
        }
    });

    // 2. Seleção de Cor na Paleta
    opcoesCor.forEach(opcao => {
        opcao.addEventListener('click', () => {
            opcoesCor.forEach(c => c.classList.remove('selecionada'));
            opcao.classList.add('selecionada');
            corSelecionada = parseInt(opcao.dataset.cor);
        });
    });

    // 3. Eventos de Clique e Arraste na Grade de Pixels
    canvasGrid.addEventListener('mousedown', (e) => {
        if (!e.target.classList.contains('pixel')) return;
        e.preventDefault(); // Evita a seleção de texto e arrasto nativo do navegador

        const x = parseInt(e.target.dataset.x);
        const y = parseInt(e.target.dataset.y);

        if (ferramentaAtiva === 'lapis') {
            estaDesenhando = true;
            pintarPixelUnico(x, y, corSelecionada);
        } else if (ferramentaAtiva === 'balde') {
            pintarComBalde(x, y);
        }
    });

    canvasGrid.addEventListener('mouseover', (e) => {
        if (!e.target.classList.contains('pixel')) return;

        // Pinta continuamente enquanto arrasta o mouse pressionado
        if (estaDesenhando && ferramentaAtiva === 'lapis') {
            const x = parseInt(e.target.dataset.x);
            const y = parseInt(e.target.dataset.y);
            pintarPixelUnico(x, y, corSelecionada);
        }
    });

    // Pinta um único quadrado (Lápis)
    function pintarPixelUnico(x, y, cor) {
        estadoGrid[x][y] = cor;
        const pixel = document.getElementById(`pixel-${x}-${y}`);
        if (pixel) pixel.className = `pixel cor-${cor}`;
    }

    // Envia a matriz para o Flask e atualiza a tela, função mensageiro(Balde de Tinta)
    async function pintarComBalde(x, y) {
        try {
            const resposta = await fetch('/balde_tinta', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    grid: estadoGrid,
                    x: x,
                    y: y,
                    nova_cor: corSelecionada
                })
            });

            const dados = await resposta.json();
            estadoGrid = dados.grid;
            redesenharCanvas();
        } catch (erro) {
            console.error('Erro na requisição do balde:', erro);
        }
    }

    // Atualiza todos os quadradinhos da tela após o retorno do Python (traduz a matriz numerica em imagem na tela)
    function redesenharCanvas() {
        for (let x = 0; x < tamanho; x++) {
            for (let y = 0; y < tamanho; y++) {
                const cor = estadoGrid[x][y];
                const pixel = document.getElementById(`pixel-${x}-${y}`);
                if (pixel) pixel.className = `pixel cor-${cor}`;
            }
        }
    }
});