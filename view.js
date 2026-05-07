// view.js
let chartInstance = null;

database.ref('usuarios').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (!dados) return;

    const listaOrdenada = Object.values(dados).sort((a, b) => b.tempoLogado - a.tempoLogado);

    // 1. Atualizar Card do Vencedor
    const vencedor = listaOrdenada[0];
    document.getElementById('winner-name').innerText = vencedor.nome;
    document.getElementById('winner-time').innerText = vencedor.tempoLogado + " min";
    document.getElementById('winner-img').src = vencedor.foto;

    // Lógica de comparação para o vencedor
    const diff = vencedor.tempoLogado - (vencedor.tempoAnterior || 0);
    const corDiff = diff >= 0 ? 'text-success' : 'text-danger';
    const sinal = diff >= 0 ? '▲' : '▼';
    document.getElementById('winner-date').innerHTML = `
        <span class="${corDiff} fw-bold">${sinal} ${Math.abs(diff)} min</span> vs semana anterior
    `;

    // 2. Preparar dados para o Gráfico
    const nomes = listaOrdenada.map(u => u.nome);
    const temposAtuais = listaOrdenada.map(u => u.tempoLogado);
    const temposAnteriores = listaOrdenada.map(u => u.tempoAnterior || 0);
    const fotos = listaOrdenada.map(u => u.foto);

    renderizarGrafico(nomes, temposAtuais, temposAnteriores, fotos);
});

function renderizarGrafico(nomes, tempos, temposAnteriores, fotos) {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [
                {
                    label: 'Tempo Atual',
                    data: tempos,
                    backgroundColor: tempos.map((_, i) => i === 0 ? '#fbbf24' : '#6366f1'),
                    borderRadius: 8,
                    fotos: fotos,
                    order: 1
                },
                {
                    label: 'Semana Anterior',
                    data: temposAnteriores,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderWidth: 1,
                    borderRadius: 8,
                    order: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 40 } },
            plugins: { 
                legend: { 
                    display: true, 
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { size: 10 } } 
                } 
            },
            scales: {
                y: { grid: { display: false }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
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
                    const size = 30;
                    if (img.complete && img.naturalWidth !== 0) {
                        ctx.save();
                        ctx.beginPath();
                        ctx.arc(bar.x, bar.y - 20, size/2, 0, Math.PI * 2);
                        ctx.closePath();
                        ctx.clip();
                        ctx.drawImage(img, bar.x - size/2, bar.y - 20 - size/2, size, size);
                        ctx.restore();
                    }
                });
            }
        }]
    });
}