class CadastrosOuvidoria {
    constructor() {
        this.secretarias = [];
        this.temas = [];
        this.tabelaSecretarias = null;
        this.tabelaTemas = null;
        this.badgeResumo = null;
        this.chkSomenteAtivas = null;
        this.filtroSecretariaTema = null;
        this.modalSecretariaEl = null;
        this.modalTemaEl = null;
        this.mapearElementos();
        this.bindEvents();
        void this.carregarTudo();
    }
    mapearElementos() {
        this.tabelaSecretarias = document.getElementById('tabelaSecretarias');
        this.tabelaTemas = document.getElementById('tabelaTemas');
        this.badgeResumo = document.getElementById('badgeResumo');
        this.chkSomenteAtivas = document.getElementById('chkSomenteAtivas');
        this.filtroSecretariaTema = document.getElementById('filtroSecretariaTema');
        this.modalSecretariaEl = document.getElementById('modalSecretaria');
        this.modalTemaEl = document.getElementById('modalTema');
    }
    bindEvents() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        (_a = document.getElementById('btnNovaSecretaria')) === null || _a === void 0 ? void 0 : _a.addEventListener('click', () => this.abrirModalSecretaria(null));
        (_b = document.getElementById('btnSalvarSecretaria')) === null || _b === void 0 ? void 0 : _b.addEventListener('click', () => void this.salvarSecretaria());
        (_c = document.getElementById('btnNovoTema')) === null || _c === void 0 ? void 0 : _c.addEventListener('click', () => this.abrirModalTema(null));
        (_d = document.getElementById('btnSalvarTema')) === null || _d === void 0 ? void 0 : _d.addEventListener('click', () => void this.salvarTema());
        (_e = this.chkSomenteAtivas) === null || _e === void 0 ? void 0 : _e.addEventListener('change', () => this.renderizarSecretarias());
        (_f = this.filtroSecretariaTema) === null || _f === void 0 ? void 0 : _f.addEventListener('change', () => this.renderizarTemas());
        (_g = this.tabelaSecretarias) === null || _g === void 0 ? void 0 : _g.addEventListener('click', (e) => {
            const alvo = e.target;
            const editar = alvo.closest('.btn-editar-secretaria');
            if (editar) {
                this.abrirModalSecretaria(Number(editar.dataset.id));
                return;
            }
            const excluir = alvo.closest('.btn-excluir-secretaria');
            if (excluir) {
                void this.excluirSecretaria(Number(excluir.dataset.id));
            }
        });
        (_h = this.tabelaTemas) === null || _h === void 0 ? void 0 : _h.addEventListener('click', (e) => {
            const alvo = e.target;
            const editar = alvo.closest('.btn-editar-tema');
            if (editar) {
                this.abrirModalTema(Number(editar.dataset.id));
                return;
            }
            const excluir = alvo.closest('.btn-excluir-tema');
            if (excluir) {
                void this.excluirTema(Number(excluir.dataset.id));
            }
        });
    }
    escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
    exibirModal(elemento) {
        var _a;
        if (!elemento)
            return;
        const modal = (_a = bootstrap.Modal.getInstance(elemento)) !== null && _a !== void 0 ? _a : new bootstrap.Modal(elemento);
        modal.show();
    }
    fecharModal(elemento) {
        var _a;
        if (!elemento)
            return;
        (_a = bootstrap.Modal.getInstance(elemento)) === null || _a === void 0 ? void 0 : _a.hide();
    }
    // ---------------------------------------------------------- READ
    async carregarTudo() {
        try {
            const [resSec, resTemas] = await Promise.all([
                fetch('api/secretarias.php'),
                fetch('api/temas.php')
            ]);
            if (!resSec.ok || !resTemas.ok)
                throw new Error('Falha na comunicação com a API.');
            this.secretarias = await resSec.json();
            this.temas = await resTemas.json();
            this.preencherSelects();
            this.renderizarSecretarias();
            this.renderizarTemas();
            this.atualizarResumo();
        }
        catch (erro) {
            console.error('Erro ao carregar cadastros:', erro);
            if (this.tabelaSecretarias) {
                this.tabelaSecretarias.innerHTML =
                    '<tr><td colspan="3" class="text-center text-danger py-4">Não foi possível carregar os dados.</td></tr>';
            }
        }
    }
    atualizarResumo() {
        // .filter() para segmentar o que está ativo (inteligência de negócio no front)
        const ativas = this.secretarias.filter(s => Boolean(s.ativa));
        if (this.badgeResumo) {
            this.badgeResumo.textContent =
                `${ativas.length} secretarias ativas • ${this.temas.length} temas`;
        }
    }
    preencherSelects() {
        // .map() transformando o array bruto da API em <option>
        const options = this.secretarias
            .filter(s => Boolean(s.ativa))
            .map(s => `<option value="${s.id}">${this.escapeHtml(s.nome)}</option>`)
            .join('');
        const selectModal = document.getElementById('temaSecretaria');
        if (selectModal)
            selectModal.innerHTML = options;
        if (this.filtroSecretariaTema) {
            this.filtroSecretariaTema.innerHTML =
                `<option value="">Todas as secretarias</option>${options}`;
        }
    }
    renderizarSecretarias() {
        var _a;
        var _b;
        if (!this.tabelaSecretarias)
            return;
        const somenteAtivas = (_b = (_a = this.chkSomenteAtivas) === null || _a === void 0 ? void 0 : _a.checked) !== null && _b !== void 0 ? _b : false;
        const lista = somenteAtivas
            ? this.secretarias.filter(s => Boolean(s.ativa))
            : this.secretarias;
        if (lista.length === 0) {
            this.tabelaSecretarias.innerHTML =
                '<tr><td colspan="3" class="text-center text-muted py-4">Nenhuma secretaria cadastrada.</td></tr>';
            return;
        }
        this.tabelaSecretarias.innerHTML = lista.map(s => `
            <tr>
                <td>${this.escapeHtml(s.nome)}</td>
                <td>${s.ativa
            ? '<span class="badge bg-success">Ativa</span>'
            : '<span class="badge bg-secondary">Inativa</span>'}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-editar-secretaria" data-id="${s.id}">
                        <i class="bi bi-pencil-fill"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir-secretaria" data-id="${s.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    renderizarTemas() {
        var _a;
        var _b;
        if (!this.tabelaTemas)
            return;
        const filtro = (_b = (_a = this.filtroSecretariaTema) === null || _a === void 0 ? void 0 : _a.value) !== null && _b !== void 0 ? _b : '';
        const lista = filtro === ''
            ? this.temas
            : this.temas.filter(t => t.secretaria_id === Number(filtro));
        if (lista.length === 0) {
            this.tabelaTemas.innerHTML =
                '<tr><td colspan="3" class="text-center text-muted py-4">Nenhum tema cadastrado para este filtro.</td></tr>';
            return;
        }
        this.tabelaTemas.innerHTML = lista.map(t => `
            <tr>
                <td>${this.escapeHtml(t.nome)}</td>
                <td class="text-muted">${this.escapeHtml(this.nomeSecretaria(t.secretaria_id))}</td>
                <td class="text-end">
                    <button class="btn btn-sm btn-outline-primary btn-editar-tema" data-id="${t.id}">
                        <i class="bi bi-pencil-fill"></i> Editar
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir-tema" data-id="${t.id}">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                </td>
            </tr>
        `).join('');
    }
    nomeSecretaria(id) {
        const encontrada = this.secretarias.find(s => s.id === id);
        return encontrada ? encontrada.nome : 'Não informada';
    }
    // ---------------------------------------------------------- CREATE / UPDATE
    abrirModalSecretaria(id) {
        const inputId = document.getElementById('secretariaId');
        const inputNome = document.getElementById('secretariaNome');
        const inputAtiva = document.getElementById('secretariaAtiva');
        const titulo = document.getElementById('tituloModalSecretaria');
        const registro = id === null ? undefined : this.secretarias.find(s => s.id === id);
        if (inputId)
            inputId.value = registro ? String(registro.id) : '';
        if (inputNome)
            inputNome.value = registro ? registro.nome : '';
        if (inputAtiva)
            inputAtiva.checked = registro ? Boolean(registro.ativa) : true;
        if (titulo)
            titulo.textContent = registro ? 'Editar Secretaria' : 'Nova Secretaria';
        this.exibirModal(this.modalSecretariaEl);
    }
    async salvarSecretaria() {
        var _a, _b, _c;
        const inputId = document.getElementById('secretariaId');
        const inputNome = document.getElementById('secretariaNome');
        const inputAtiva = document.getElementById('secretariaAtiva');
        const nome = (_a = inputNome === null || inputNome === void 0 ? void 0 : inputNome.value.trim()) !== null && _a !== void 0 ? _a : '';
        if (nome === '') {
            alert('Informe o nome da secretaria.');
            return;
        }
        const id = Number((_b = inputId === null || inputId === void 0 ? void 0 : inputId.value) !== null && _b !== void 0 ? _b : '');
        const editando = Number.isInteger(id) && id > 0;
        try {
            const res = await fetch('api/secretarias.php', {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editando ? id : undefined,
                    nome,
                    ativa: (_c = inputAtiva === null || inputAtiva === void 0 ? void 0 : inputAtiva.checked) !== null && _c !== void 0 ? _c : true
                })
            });
            const data = await res.json();
            if (!res.ok || !data.sucesso)
                throw new Error(data.mensagem);
            alert(data.mensagem);
            this.fecharModal(this.modalSecretariaEl);
            await this.carregarTudo();
        }
        catch (erro) {
            console.error('Erro ao salvar secretaria:', erro);
            alert(erro instanceof Error ? erro.message : 'Falha ao salvar a secretaria.');
        }
    }
    abrirModalTema(id) {
        const inputId = document.getElementById('temaId');
        const inputNome = document.getElementById('temaNome');
        const selectSec = document.getElementById('temaSecretaria');
        const titulo = document.getElementById('tituloModalTema');
        const registro = id === null ? undefined : this.temas.find(t => t.id === id);
        if (inputId)
            inputId.value = registro ? String(registro.id) : '';
        if (inputNome)
            inputNome.value = registro ? registro.nome : '';
        if (selectSec && registro)
            selectSec.value = String(registro.secretaria_id);
        if (titulo)
            titulo.textContent = registro ? 'Editar Tema' : 'Novo Tema';
        this.exibirModal(this.modalTemaEl);
    }
    async salvarTema() {
        var _a, _b, _c;
        const inputId = document.getElementById('temaId');
        const inputNome = document.getElementById('temaNome');
        const selectSec = document.getElementById('temaSecretaria');
        const nome = (_a = inputNome === null || inputNome === void 0 ? void 0 : inputNome.value.trim()) !== null && _a !== void 0 ? _a : '';
        const secretariaId = Number((_b = selectSec === null || selectSec === void 0 ? void 0 : selectSec.value) !== null && _b !== void 0 ? _b : '');
        if (nome === '' || !secretariaId) {
            alert('Informe o nome do tema e a secretaria responsável.');
            return;
        }
        const id = Number((_c = inputId === null || inputId === void 0 ? void 0 : inputId.value) !== null && _c !== void 0 ? _c : '');
        const editando = Number.isInteger(id) && id > 0;
        try {
            const res = await fetch('api/temas.php', {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editando ? id : undefined,
                    nome,
                    secretaria_id: secretariaId
                })
            });
            const data = await res.json();
            if (!res.ok || !data.sucesso)
                throw new Error(data.mensagem);
            alert(data.mensagem);
            this.fecharModal(this.modalTemaEl);
            await this.carregarTudo();
        }
        catch (erro) {
            console.error('Erro ao salvar tema:', erro);
            alert(erro instanceof Error ? erro.message : 'Falha ao salvar o tema.');
        }
    }
    // ---------------------------------------------------------- DELETE
    async excluirSecretaria(id) {
        if (!confirm('Deseja realmente excluir esta secretaria?'))
            return;
        try {
            const res = await fetch(`api/secretarias.php?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.sucesso)
                throw new Error(data.mensagem);
            alert(data.mensagem);
            await this.carregarTudo();
        }
        catch (erro) {
            console.error('Erro ao excluir secretaria:', erro);
            alert(erro instanceof Error ? erro.message : 'Não foi possível excluir a secretaria.');
        }
    }
    async excluirTema(id) {
        if (!confirm('Deseja realmente excluir este tema?'))
            return;
        try {
            const res = await fetch(`api/temas.php?id=${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok || !data.sucesso)
                throw new Error(data.mensagem);
            alert(data.mensagem);
            await this.carregarTudo();
        }
        catch (erro) {
            console.error('Erro ao excluir tema:', erro);
            alert(erro instanceof Error ? erro.message : 'Não foi possível excluir o tema.');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new CadastrosOuvidoria();
});
export {};
