// model.js
const AlunoModel = {
    onDataChange: (callback) => {
        database.ref('usuarios').on('value', (snapshot) => {
            const dados = snapshot.val();
            if (!dados) {
                callback([]);
                return;
            }
            const lista = Object.entries(dados).map(([id, val]) => ({
                id,
                ...val,
                tendencia: val.tempoAnterior !== undefined ? (val.tempoLogado - val.tempoAnterior) : 0
            })).sort((a, b) => b.tempoLogado - a.tempoLogado);
            callback(lista);
        });
    },

    updateAluno: (nome, foto, tempo) => {
        const id = nome.toLowerCase().replace(/\s+/g, '-');
        const hoje = new Date().toLocaleDateString('pt-BR');
        
        // Busca o dado atual para salvar como "anterior" antes de atualizar
        return database.ref('usuarios/' + id).once('value').then(snapshot => {
            const dadosAntigos = snapshot.val();
            const tempoAtualVal = dadosAntigos ? dadosAntigos.tempoLogado : 0;

            return database.ref('usuarios/' + id).update({
                nome: nome,
                foto: foto,
                tempoLogado: tempo ? parseInt(tempo) : 0,
                tempoAnterior: tempoAtualVal, // O tempo de hoje vira o "anterior" da próxima vez
                ultimaAtualizacao: hoje
            });
        });
    },

    deleteAluno: (id) => {
        if(confirm("Tem a certeza que deseja excluir este aluno?")) {
            return database.ref('usuarios/' + id).remove();
        }
    }
};