from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

# classe recursiva para o balde de tinta
def flood_fill(matriz, x, y, cor_alvo, nova_cor):

    # condições de parada
    # para se tentar pintar fora da matriz
    if x < 0 or x >= len(matriz) or y < 0 or y >= len(matriz[0]):
        return
    # para se tentar pintar uma cor diferente da cor alvo ou a mesma cor que já foi pintada
    if matriz[x][y] != cor_alvo or matriz[x][y] == nova_cor:
        return

    # Pinta o pixel atual
    matriz[x][y] = nova_cor

    
    flood_fill(matriz, x - 1, y, cor_alvo, nova_cor)# cima
    flood_fill(matriz, x + 1, y, cor_alvo, nova_cor)# baixo
    flood_fill(matriz, x, y - 1, cor_alvo, nova_cor)# esquerda
    flood_fill(matriz, x, y + 1, cor_alvo, nova_cor)# direita

@app.route('/')
def inicio():
    return render_template('inicio.html')


@app.route('/selecionar_tamanho')
def selecionar_tamanho():
    return render_template('selecionar_tamanho.html')


@app.route('/editor')
def editor():
    tamanho = request.args.get('tamanho', default=16, type=int)

    # Valida o tamanho da matriz para garantir que seja 8, 16 ou 32
    if tamanho not in [8, 16, 32]:
        tamanho = 16

    #cria a matriz com zeros(cor brnaca) de acordo com o tamanho selecionado
    grid_inicial = [[0 for _ in range(tamanho)] for _ in range(tamanho)]
    return render_template('editor.html', grid=grid_inicial, tamanho=tamanho)

@app.route('/balde_tinta', methods=['POST'])
def balde_tinta():
    dados = request.get_json()
    x, y = dados['x'], dados['y']
    nova_cor = dados['nova_cor']
    matriz = dados['grid']

    cor_alvo = matriz[x][y]

    # Só executa a recursão se a nova cor for diferente da cor clicada
    if cor_alvo != nova_cor:
        flood_fill(matriz, x, y, cor_alvo, nova_cor)

    return jsonify({'grid': matriz})

if __name__ == '__main__':
    app.run(debug=True)