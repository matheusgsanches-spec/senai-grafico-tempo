// controller.js
const SENHA_MESTRA = "1234";
const btnLogin = document.getElementById('btn-login-admin');
const painelAdmin = document.getElementById('painel-admin');
const btnLogout = document.getElementById('btn-logout');

// Renderiza a lista simplificada dentro do painel admin
function renderizarListaAdmin(dados) {
    const listContainer = document.getElementById('admin-list-container');
    if (!listContainer) return;

    listContainer.innerHTML = '<h4 class="h6 mb-3 text-uppercase opacity-50 small fw-bold text-white">Gestão de Alunos</h4>';

    Object.entries(dados).forEach(([id, aluno]) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-2 p-2';
        div.style.background = 'rgba(255,255,255,0.05)';
        div.style.borderRadius = '8px';
        
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${aluno.foto}" width="25" height="25" class="rounded-circle me-2" style="object-fit:cover">
                <span class="small text-white">${aluno.nome}</span>
            </div>
            <div>
                <button class="btn btn-sm text-warning p-0 me-2" onclick="preencherFormulario('${aluno.nome}', '${aluno.foto}', ${aluno.tempoLogado})">✎</button>
                <button class="btn btn-sm text-danger p-0" onclick="excluirAluno('${id}')">✕</button>
            </div>
        `;
        listContainer.appendChild(div);
    });
}

// Funções globais vinculadas ao Model
window.excluirAluno = (id) => AlunoModel.deleteAluno(id);

window.preencherFormulario = (nome, foto, tempo) => {
    document.getElementById('nome').value = nome;
    document.getElementById('foto').value = foto;
    document.getElementById('tempo-manual').value = tempo;
    window.scrollTo(0, 0);
};

// Monitoramento para o admin
database.ref('usuarios').on('value', (snapshot) => {
    const dados = snapshot.val();
    if (dados) renderizarListaAdmin(dados);
});

// Eventos de Login/Logout
btnLogin.onclick = () => {
    const s = prompt("Senha:");
    if(s === SENHA_MESTRA) {
        painelAdmin.classList.remove('d-none');
        btnLogin.classList.add('d-none');
    }
};

btnLogout.onclick = () => {
    painelAdmin.classList.add('d-none');
    btnLogin.classList.remove('d-none');
};

// Submissão do formulário usando o Model
document.getElementById('form-admin').onsubmit = (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome').value;
    const foto = document.getElementById('foto').value;
    const tempo = document.getElementById('tempo-manual').value;

    AlunoModel.updateAluno(nome, foto, tempo).then(() => {
        alert("Ranking atualizado!");
        e.target.reset();
    });
};