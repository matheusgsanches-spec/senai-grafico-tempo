const AlunoModel = {
    updateAluno: (nome, foto, tempo) => {
        const id = nome.toLowerCase().replace(/\s+/g, '-');
        const hoje = new Date().toISOString().split('T')[0];

        return database.ref('usuarios/' + id).once('value').then(snapshot => {
            const dadosAtuais = snapshot.val();
            const tempoAnterior = dadosAtuais ? (dadosAtuais.tempoLogado || 0) : 0;

            const payload = {
                nome: nome,
                foto: foto,
                tempoLogado: tempo ? parseInt(tempo) : 0,
                tempoAnterior: tempoAnterior,
                ultimaAtualizacao: hoje
            };

            const updatePrincipal = database.ref('usuarios/' + id).update(payload);
            const updateHistorico = database.ref(`usuarios/${id}/historico/${hoje}`).set({
                tempo: tempo ? parseInt(tempo) : 0
            });

            return Promise.all([updatePrincipal, updateHistorico]);
        });
    },

    deleteAluno: (id) => {
        if (confirm("Deseja apagar este aluno e todo o seu histórico?")) {
            return database.ref('usuarios/' + id).remove();
        }
    }
};