const SENHA_MESTRA = "1234";
const btnLogin = document.getElementById('btn-login-admin');
const painelAdmin = document.getElementById('painel-admin');

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

window.preencherFormulario = (nome, foto, tempo) => {
    document.getElementById('nome').value = nome;
    document.getElementById('foto').value = foto;
    document.getElementById('tempo-manual').value = tempo;
    window.scrollTo(0, 0);
};

window.excluirAluno = (id) => AlunoModel.deleteAluno(id);

btnLogin.onclick = () => {
    if(prompt("Senha:") === SENHA_MESTRA) {
        painelAdmin.classList.remove('d-none');
        btnLogin.classList.add('d-none');
    }
};

document.getElementById('btn-logout').onclick = () => {
    painelAdmin.classList.add('d-none');
    btnLogin.classList.remove('d-none');
};

database.ref('usuarios').on('value', (snapshot) => {
    const dados = snapshot.val();
    const container = document.getElementById('admin-list-container');
    if (!container || !dados) return;

    container.innerHTML = '<h4 class="h6 mb-3 text-white opacity-50">Lista de Alunos</h4>';
    Object.entries(dados).forEach(([id, aluno]) => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center mb-2 p-2 rounded';
        // Fundo escuro para destacar o texto branco
        div.style.background = 'rgba(255, 255, 255, 0.08)'; 
        div.innerHTML = `
            <div class="d-flex align-items-center">
                <img src="${aluno.foto}" width="25" height="25" class="rounded-circle me-2" style="object-fit:cover">
                <span class="small text-white">${aluno.nome}</span>
            </div>
            <div>
                <button class="btn btn-sm text-warning p-0 me-2" onclick="preencherFormulario('${aluno.nome}', '${aluno.foto}', ${aluno.tempoLogado})">✎</button>
                <button class="btn btn-sm text-danger p-0" onclick="excluirAluno('${id}')">✕</button>
            </div>`;
        container.appendChild(div);
    });
});