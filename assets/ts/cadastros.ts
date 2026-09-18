import { Secretaria, Tema, ApiResponse } from './interfaces.js';

declare const bootstrap: {
    Modal: {
        new (element: HTMLElement): { show(): void; hide(): void };
        getInstance(element: HTMLElement): { show(): void; hide(): void } | null;
    };
};

class CadastrosOuvidoria {
    private secretarias: Secretaria[] = [];
    private temas: Tema[] = [];

    private tabelaSecretarias: HTMLElement | null = null;
    private tabelaTemas: HTMLElement | null = null;
    private badgeResumo: HTMLElement | null = null;
    private chkSomenteAtivas: HTMLInputElement | null = null;
    private filtroSecretariaTema: HTMLSelectElement | null = null;

    private modalSecretariaEl: HTMLElement | null = null;
    private modalTemaEl: HTMLElement | null = null;

    constructor() {
        this.mapearElementos();
        this.bindEvents();
        void this.carregarTudo();
    }

    private mapearElementos(): void {
        this.tabelaSecretarias = document.getElementById('tabelaSecretarias');
        this.tabelaTemas = document.getElementById('tabelaTemas');
        this.badgeResumo = document.getElementById('badgeResumo');
        this.chkSomenteAtivas = document.getElementById('chkSomenteAtivas') as HTMLInputElement | null;
        this.filtroSecretariaTema = document.getElementById('filtroSecretariaTema') as HTMLSelectElement | null;
        this.modalSecretariaEl = document.getElementById('modalSecretaria');
        this.modalTemaEl = document.getElementById('modalTema');
    }

    private bindEvents(): void {
        document.getElementById('btnNovaSecretaria')
            ?.addEventListener('click', () => this.abrirModalSecretaria(null));
        document.getElementById('btnSalvarSecretaria')
            ?.addEventListener('click', () => void this.salvarSecretaria());
        document.getElementById('btnNovoTema')
            ?.addEventListener('click', () => this.abrirModalTema(null));
        document.getElementById('btnSalvarTema')
            ?.addEventListener('click', () => void this.salvarTema());

        this.chkSomenteAtivas?.addEventListener('change', () => this.renderizarSecretarias());
        this.filtroSecretariaTema?.addEventListener('change', () => this.renderizarTemas());

        this.tabelaSecretarias?.addEventListener('click', (e: Event) => {
            const alvo = e.target as HTMLElement;
            const editar = alvo.closest('.btn-editar-secretaria') as HTMLElement | null;
            if (editar) { this.abrirModalSecretaria(Number(editar.dataset.id)); return; }
            const excluir = alvo.closest('.btn-excluir-secretaria') as HTMLElement | null;
            if (excluir) { void this.excluirSecretaria(Number(excluir.dataset.id)); }
        });

        this.tabelaTemas?.addEventListener('click', (e: Event) => {
            const alvo = e.target as HTMLElement;
            const editar = alvo.closest('.btn-editar-tema') as HTMLElement | null;
            if (editar) { this.abrirModalTema(Number(editar.dataset.id)); return; }
            const excluir = alvo.closest('.btn-excluir-tema') as HTMLElement | null;
            if (excluir) { void this.excluirTema(Number(excluir.dataset.id)); }
        });
    }

    private escapeHtml(texto: string): string {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    private exibirModal(elemento: HTMLElement | null): void {
        if (!elemento) return;
        const modal = bootstrap.Modal.getInstance(elemento) ?? new bootstrap.Modal(elemento);
        modal.show();
    }

    private fecharModal(elemento: HTMLElement | null): void {
        if (!elemento) return;
        bootstrap.Modal.getInstance(elemento)?.hide();
    }

    // ---------------------------------------------------------- READ
    private async carregarTudo(): Promise<void> {
        try {
            const [resSec, resTemas] = await Promise.all([
                fetch('api/secretarias.php'),
                fetch('api/temas.php')
            ]);

            if (!resSec.ok || !resTemas.ok) throw new Error('Falha na comunicação com a API.');

            this.secretarias = await resSec.json() as Secretaria[];
            this.temas = await resTemas.json() as Tema[];

            this.preencherSelects();
            this.renderizarSecretarias();
            this.renderizarTemas();
            this.atualizarResumo();
        } catch (erro) {
            console.error('Erro ao carregar cadastros:', erro);
            if (this.tabelaSecretarias) {
                this.tabelaSecretarias.innerHTML =
                    '<tr><td colspan="3" class="text-center text-danger py-4">Não foi possível carregar os dados.</td></tr>';
            }
        }
    }

    private atualizarResumo(): void {
        // .filter() para segmentar o que está ativo (inteligência de negócio no front)
        const ativas = this.secretarias.filter(s => Boolean(s.ativa));
        if (this.badgeResumo) {
            this.badgeResumo.textContent =
                `${ativas.length} secretarias ativas • ${this.temas.length} temas`;
        }
    }

    private preencherSelects(): void {
        // .map() transformando o array bruto da API em <option>
        const options = this.secretarias
            .filter(s => Boolean(s.ativa))
            .map(s => `<option value="${s.id}">${this.escapeHtml(s.nome)}</option>`)
            .join('');

        const selectModal = document.getElementById('temaSecretaria') as HTMLSelectElement | null;
        if (selectModal) selectModal.innerHTML = options;

        if (this.filtroSecretariaTema) {
            this.filtroSecretariaTema.innerHTML =
                `<option value="">Todas as secretarias</option>${options}`;
        }
    }

    private renderizarSecretarias(): void {
        if (!this.tabelaSecretarias) return;

        const somenteAtivas = this.chkSomenteAtivas?.checked ?? false;
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

    private renderizarTemas(): void {
        if (!this.tabelaTemas) return;

        const filtro = this.filtroSecretariaTema?.value ?? '';
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

    private nomeSecretaria(id: number): string {
        const encontrada = this.secretarias.find(s => s.id === id);
        return encontrada ? encontrada.nome : 'Não informada';
    }

    // ---------------------------------------------------------- CREATE / UPDATE
    private abrirModalSecretaria(id: number | null): void {
        const inputId = document.getElementById('secretariaId') as HTMLInputElement | null;
        const inputNome = document.getElementById('secretariaNome') as HTMLInputElement | null;
        const inputAtiva = document.getElementById('secretariaAtiva') as HTMLInputElement | null;
        const titulo = document.getElementById('tituloModalSecretaria');

        const registro = id === null ? undefined : this.secretarias.find(s => s.id === id);

        if (inputId) inputId.value = registro ? String(registro.id) : '';
        if (inputNome) inputNome.value = registro ? registro.nome : '';
        if (inputAtiva) inputAtiva.checked = registro ? Boolean(registro.ativa) : true;
        if (titulo) titulo.textContent = registro ? 'Editar Secretaria' : 'Nova Secretaria';

        this.exibirModal(this.modalSecretariaEl);
    }

    private async salvarSecretaria(): Promise<void> {
        const inputId = document.getElementById('secretariaId') as HTMLInputElement | null;
        const inputNome = document.getElementById('secretariaNome') as HTMLInputElement | null;
        const inputAtiva = document.getElementById('secretariaAtiva') as HTMLInputElement | null;

        const nome = inputNome?.value.trim() ?? '';
        if (nome === '') {
            alert('Informe o nome da secretaria.');
            return;
        }

        const id = Number(inputId?.value ?? '');
        const editando = Number.isInteger(id) && id > 0;

        try {
            const res = await fetch('api/secretarias.php', {
                method: editando ? 'PUT' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: editando ? id : undefined,
                    nome,
                    ativa: inputAtiva?.checked ?? true
                })
            });

            const data = await res.json() as ApiResponse<{ id: number }>;
            if (!res.ok || !data.sucesso) throw new Error(data.mensagem);

            alert(data.mensagem);
            this.fecharModal(this.modalSecretariaEl);
            await this.carregarTudo();
        } catch (erro) {
            console.error('Erro ao salvar secretaria:', erro);
            alert(erro instanceof Error ? erro.message : 'Falha ao salvar a secretaria.');
        }
    }

    private abrirModalTema(id: number | null): void {
        const inputId = document.getElementById('temaId') as HTMLInputElement | null;
        const inputNome = document.getElementById('temaNome') as HTMLInputElement | null;
        const selectSec = document.getElementById('temaSecretaria') as HTMLSelectElement | null;
        const titulo = document.getElementById('tituloModalTema');

        const registro = id === null ? undefined : this.temas.find(t => t.id === id);

        if (inputId) inputId.value = registro ? String(registro.id) : '';
        if (inputNome) inputNome.value = registro ? registro.nome : '';
        if (selectSec && registro) selectSec.value = String(registro.secretaria_id);
        if (titulo) titulo.textContent = registro ? 'Editar Tema' : 'Novo Tema';

        this.exibirModal(this.modalTemaEl);
    }

    private async salvarTema(): Promise<void> {
        const inputId = document.getElementById('temaId') as HTMLInputElement | null;
        const inputNome = document.getElementById('temaNome') as HTMLInputElement | null;
        const selectSec = document.getElementById('temaSecretaria') as HTMLSelectElement | null;

        const nome = inputNome?.value.trim() ?? '';
        const secretariaId = Number(selectSec?.value ?? '');

        if (nome === '' || !secretariaId) {
            alert('Informe o nome do tema e a secretaria responsável.');
            return;
        }

        const id = Number(inputId?.value ?? '');
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

            const data = await res.json() as ApiResponse<{ id: number }>;
            if (!res.ok || !data.sucesso) throw new Error(data.mensagem);

            alert(data.mensagem);
            this.fecharModal(this.modalTemaEl);
            await this.carregarTudo();
        } catch (erro) {
            console.error('Erro ao salvar tema:', erro);
            alert(erro instanceof Error ? erro.message : 'Falha ao salvar o tema.');
        }
    }

    // ---------------------------------------------------------- DELETE
    private async excluirSecretaria(id: number): Promise<void> {
        if (!confirm('Deseja realmente excluir esta secretaria?')) return;

        try {
            const res = await fetch(`api/secretarias.php?id=${id}`, { method: 'DELETE' });
            const data = await res.json() as ApiResponse<null>;
            if (!res.ok || !data.sucesso) throw new Error(data.mensagem);

            alert(data.mensagem);
            await this.carregarTudo();
        } catch (erro) {
            console.error('Erro ao excluir secretaria:', erro);
            alert(erro instanceof Error ? erro.message : 'Não foi possível excluir a secretaria.');
        }
    }

    private async excluirTema(id: number): Promise<void> {
        if (!confirm('Deseja realmente excluir este tema?')) return;

        try {
            const res = await fetch(`api/temas.php?id=${id}`, { method: 'DELETE' });
            const data = await res.json() as ApiResponse<null>;
            if (!res.ok || !data.sucesso) throw new Error(data.mensagem);

            alert(data.mensagem);
            await this.carregarTudo();
        } catch (erro) {
            console.error('Erro ao excluir tema:', erro);
            alert(erro instanceof Error ? erro.message : 'Não foi possível excluir o tema.');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CadastrosOuvidoria();
});
