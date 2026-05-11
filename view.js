// view.js
let chartInstance = null;

// Monitoramento em tempo real do Firebase
database.ref('usuarios').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (!dados) return;

    // Converte objeto em array e ordena: Menor tempo primeiro (Melhor -> Pior)
    const listaOrdenada = Object.values(dados).sort((a, b) => a.tempoLogado - b.tempoLogado);

    // 1. ATUALIZAR CARD DO VENCEDOR (O que tem o menor tempo)
    const vencedor = listaOrdenada[0];
    if (vencedor) {
        document.getElementById('winner-name').innerText = vencedor.nome;
        document.getElementById('winner-time').innerText = vencedor.tempoLogado + " min";
        document.getElementById('winner-img').src = vencedor.foto;

        // Lógica de tendência: Se o tempo atual é menor que o anterior, ele melhorou (verde)
        const diff = vencedor.tempoLogado - (vencedor.tempoAnterior || 0);
        const corDiff = diff <= 0 ? 'text-success' : 'text-danger';
        const sinal = diff <= 0 ? '▼' : '▲';
        document.getElementById('winner-date').innerHTML = `
            <span class="${corDiff} fw-bold">${sinal} ${Math.abs(diff)} min</span> vs anterior
        `;
    }

    // 2. RENDERIZAR MINI LISTAS (TOP 3 MELHORES E PIORES)
    const melhores = listaOrdenada.slice(0, 3);
    const piores = [...listaOrdenada].reverse().slice(0, 3);

    renderizarMiniLista('top-melhores', melhores);
    renderizarMiniLista('top-piores', piores);

    // 3. PREPARAR DADOS PARA O GRÁFICO
    const nomes = listaOrdenada.map(u => u.nome);
    const temposAtuais = listaOrdenada.map(u => u.tempoLogado);
    const temposAnteriores = listaOrdenada.map(u => u.tempoAnterior || 0);
    const fotos = listaOrdenada.map(u => u.foto);

    renderizarGrafico(nomes, temposAtuais, temposAnteriores, fotos);
});

/**
 * Função para renderizar as listas de Top 3
 */
function renderizarMiniLista(containerId, lista) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    lista.forEach((aluno, index) => {
        const item = document.createElement('div');
        item.className = 'd-flex align-items-center justify-content-between mb-2 small p-2 rounded';
        item.style.background = 'rgba(255,255,255,0.03)';
        
        item.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${aluno.foto}" width="28" height="28" class="rounded-circle me-2" style="object-fit:cover; border: 1px solid rgba(255,255,255,0.2)">
                <span class="text-white fw-medium">${aluno.nome}</span>
            </div>
            <span class="fw-bold text-white-50">${aluno.tempoLogado} min</span>
        `;
        container.appendChild(item);
    });
}

/**
 * Função para renderizar o Gráfico Chart.js
 */
function renderizarGrafico(nomes, tempos, temposAnteriores, fotos) {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    
    // Destrói instância anterior para evitar sobreposição ao atualizar
    if (chartInstance) chartInstance.destroy();

    // Detecta se é mobile para ajustar fontes
    const isMobile = window.innerWidth < 768;

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                {
                    label: 'Tempo Atual (min)',
                    data: tempos,
                    backgroundColor: tempos.map((_, i) => i === 0 ? '#fbbf24' : '#6366f1'),
                    borderRadius: 8,
                    fotos: fotos,
                    order: 1
                },
                {
                    label: 'Anterior',
                    data: temposAnteriores,
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderRadius: 8,
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Fundamental para a responsividade CSS
            plugins: { 
                legend: { 
                    display: true, 
                    position: 'bottom',
                    labels: { 
                        color: '#94a3b8',
                        font: { size: isMobile ? 10 : 12 }
                    } 
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 23, 42, 0.9)',
                    titleFont: { size: 14 },
                    padding: 12,
                    cornerRadius: 10
                }
            },
            scales: {
                y: { 
                    beginAtZero: true,
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false }, 
                    ticks: { color: '#94a3b8', font: { size: isMobile ? 9 : 11 } } 
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: '#94a3b8', font: { size: isMobile ? 9 : 11 } } 
                }
            }
        },
        plugins: [{
            id: 'barAvatars',
            afterDraw: (chart) => {
                const { ctx } = chart;
                chart.getDatasetMeta(0).data.forEach((bar, index) => {
                    const url = chart.data.datasets[0].fotos[index];
                    const img = new Image();
                    img.src = url;
                    
                    const size = isMobile ? 24 : 32; // Avatar menor no mobile
                    
                    if (img.complete && img.naturalWidth !== 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(bar.x, bar.y - (size/1.5), size/2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, bar.x - size/2, bar.y - (size/1.5) - size/2, size, size);
                        ctx.restore();
                        
                        // Borda do avatar
                        ctx.strokeStyle = index === 0 ? '#fbbf24' : 'rgba(255,255,255,0.5)';
                        ctx.lineWidth = 2;
                        ctx.stroke();
                    }
                });
            }
        }]
    });
}

// Re-renderiza o gráfico ao mudar o tamanho da janela para manter a responsividade
window.addEventListener('resize', () => {
    if (chartInstance) {
        chartInstance.resize();
    }
});