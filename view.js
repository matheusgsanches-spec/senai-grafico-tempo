let chartInstance = null;
const inputData = document.getElementById('filtro-data');
const hojeStr = new Date().toISOString().split('T')[0];

if (inputData) inputData.value = hojeStr;

function carregarDados(dataEscolhida) {
    database.ref('usuarios').once('value', (snapshot) => {
        const usuarios = snapshot.val();
        if (!usuarios) return;

        const listaDiaria = Object.values(usuarios).map(u => {
            let tempo = 0;
            if (dataEscolhida === hojeStr) {
                tempo = u.tempoLogado || 0;
            } else {
                tempo = (u.historico && u.historico[dataEscolhida]) ? u.historico[dataEscolhida].tempo : 0;
            }
            return { ...u, tempoLogado: tempo };
        })
        .filter(u => u.tempoLogado > 0)
        .sort((a, b) => a.tempoLogado - b.tempoLogado);

        renderizarDiario(listaDiaria, dataEscolhida, usuarios);
    });
}

function renderizarSemanal(usuarios) {
    const container = document.getElementById('top-semanal');
    if (!container) return;

    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

    const rankingSemanal = Object.values(usuarios).map(u => {
        if (!u.historico) return null;
        
        // Pega apenas os tempos dos últimos 7 dias
        const temposSemana = Object.entries(u.historico)
            .filter(([data]) => new Date(data) >= seteDiasAtras)
            .map(([_, reg]) => reg.tempo);

        if (temposSemana.length === 0) return null;

        const media = Math.round(temposSemana.reduce((a, b) => a + b, 0) / temposSemana.length);
        return { nome: u.nome, foto: u.foto, media: media };
    })
    .filter(item => item !== null)
    .sort((a, b) => a.media - b.media) // MENOR MÉDIA = 1º LUGAR
    .slice(0, 3);

    container.innerHTML = rankingSemanal.map((aluno, i) => `
        <div class="d-flex align-items-center justify-content-between mb-2 small p-2 rounded" style="background: rgba(99, 102, 241, 0.15)">
            <div class="d-flex align-items-center">
                <span class="me-2 fw-bold text-primary">#${i+1}</span>
                <img src="${aluno.foto}" width="28" height="28" class="rounded-circle me-2" style="object-fit:cover; border: 1px solid #6366f1">
                <span class="text-white fw-medium">${aluno.nome}</span>
            </div>
            <span class="fw-bold text-primary">${aluno.media} min</span>
        </div>
    `).join('') || '<div class="text-center opacity-50 small">Sem dados na semana</div>';
}

function renderizarDiario(lista, dataRef, todosUsuarios) {
    const vencedor = lista[0];
    const cardVencedor = document.getElementById('winner-card');
    
    if (vencedor) {
        document.getElementById('winner-name').innerText = vencedor.nome;
        document.getElementById('winner-time').innerText = vencedor.tempoLogado + " min";
        document.getElementById('winner-img').src = vencedor.foto;
        document.getElementById('winner-date').innerText = `Recorde em: ${dataRef}`;
        cardVencedor.style.display = 'block';
    } else {
        cardVencedor.style.display = 'none';
    }

    renderizarMiniLista('top-melhores', lista.slice(0, 3));
    renderizarMiniLista('top-piores', [...lista].reverse().slice(0, 3));
    renderizarSemanal(todosUsuarios);

    renderizarGrafico(lista.map(u => u.nome), lista.map(u => u.tempoLogado), lista.map(u => u.foto));
}

function renderizarMiniLista(id, lista) {
    const container = document.getElementById(id);
    if (!container) return;
    container.innerHTML = lista.map(aluno => `
        <div class="d-flex align-items-center justify-content-between mb-2 small p-2 rounded" style="background: rgba(255,255,255,0.03)">
            <div class="d-flex align-items-center">
                <img src="${aluno.foto}" width="28" height="28" class="rounded-circle me-2" style="object-fit:cover">
                <span class="text-white">${aluno.nome}</span>
            </div>
            <span class="fw-bold text-white-50">${aluno.tempoLogado} min</span>
        </div>
    `).join('');
}

function renderizarGrafico(nomes, tempos, fotos) {
    const ctx = document.getElementById('meuGrafico').getContext('2d');
    if (chartInstance) chartInstance.destroy();
    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nomes,
            datasets: [{
                data: tempos,
                backgroundColor: tempos.map((_, i) => i === 0 ? '#fbbf24' : '#6366f1'),
                borderRadius: 8,
                fotos: fotos
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
                x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
            }
        },
        plugins: [{
            id: 'avatars',
            afterDraw: (chart) => {
                const { ctx } = chart;
                chart.getDatasetMeta(0).data.forEach((bar, i) => {
                    const img = new Image();
                    img.src = chart.data.datasets[0].fotos[i];
                    if (img.complete) {
                        ctx.save(); ctx.beginPath();
                        ctx.arc(bar.x, bar.y - 20, 15, 0, Math.PI * 2);
                        ctx.clip();
                        ctx.drawImage(img, bar.x - 15, bar.y - 35, 30, 30);
                        ctx.restore();
                    }
                });
            }
        }]
    });
}

if (inputData) {
    inputData.addEventListener('change', (e) => carregarDados(e.target.value));
}

database.ref('usuarios').on('value', () => {
    carregarDados(inputData ? inputData.value : hojeStr);
});