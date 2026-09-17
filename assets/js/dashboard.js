class DashboardOuvidoria {
    constructor() {
        this.manifestacoes = [];
        // Elementos da Interface
        this.tabelaCorpo = null;
        this.totalRegistrosBadge = null;
        // Cards de Indicadores
        this.metricTotal = null;
        this.metricPendentes = null;
        this.metricTaxa = null;
        this.metricTopSecretaria = null;
        // Filtros
        this.filtroDataInicio = null;
        this.filtroDataFim = null;
        this.filtroSecretaria = null;
        this.btnFiltrar = null;
        // Modal de Resposta
        this.formResposta = null;
        this.modalRespostaEl = null;
        this.modalDescricaoMunicipe = null;
        this.respostaManifestacaoId = null;
        this.respostaTexto = null;
        this.init();
    }
    init() {
        this.mapearElementos();
        this.bindEvents();
        this.carregarDados();
    }
    mapearElementos() {
        this.tabelaCorpo = document.getElementById('tabelaManifestacoes');
        this.totalRegistrosBadge = document.getElementById('totalRegistros');
        this.metricTotal = document.getElementById('metricTotal');
        this.metricPendentes = document.getElementById('metricPendentes');
        this.metricTaxa = document.getElementById('metricTaxa');
        this.metricTopSecretaria = document.getElementById('metricTopSecretaria');
        this.filtroDataInicio = document.getElementById('filtroDataInicio');
        this.filtroDataFim = document.getElementById('filtroDataFim');
        this.filtroSecretaria = document.getElementById('filtroSecretaria');
        this.btnFiltrar = document.getElementById('btnFiltrar');
        this.formResposta = document.getElementById('formResposta');
        this.modalRespostaEl = document.getElementById('modalResposta');
        this.modalDescricaoMunicipe = document.getElementById('modalDescricaoMunicipe');
        this.respostaManifestacaoId = document.getElementById('respostaManifestacaoId');
        this.respostaTexto = document.getElementById('respostaTexto');
    }
    bindEvents() {
        if (this.btnFiltrar) {
            this.btnFiltrar.addEventListener('click', () => this.carregarDados());
        }
        if (this.formResposta) {
            this.formResposta.addEventListener('submit', (e) => this.salvarResposta(e));
        }
    }
    /**
     * Busca as manifestações na API via GET enviando os parâmetros de filtro
     */
    async carregarDados() {
        var _a, _b, _c;
        const secretaria = ((_a = this.filtroSecretaria) === null || _a === void 0 ? void 0 : _a.value) || '';
        const inicio = ((_b = this.filtroDataInicio) === null || _b === void 0 ? void 0 : _b.value) || '';
        const fim = ((_c = this.filtroDataFim) === null || _c === void 0 ? void 0 : _c.value) || '';
        const params = new URLSearchParams();
        if (secretaria)
            params.append('secretaria_id', secretaria);
        if (inicio)
            params.append('data_inicio', inicio);
        if (fim)
            params.append('data_fim', fim);
        try {
            const response = await fetch(`api/manifestacoes.php?${params.toString()}`);
            if (!response.ok)
                throw new Error('Falha ao carregar dados da API');
            this.manifestacoes = await response.json();
            this.atualizarMetricsComReduce();
            this.renderizarTabela();
        }
        catch (error) {
            console.error('Erro ao buscar manifestações:', error);
            if (this.tabelaCorpo) {
                this.tabelaCorpo.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Erro ao carregar os dados. Verifique a conexão.</td></tr>`;
            }
        }
    }
    /**
     * Calcula as métricas em uma única iteração utilizando .reduce()
     */
    atualizarMetricsComReduce() {
        const resumo = this.manifestacoes.reduce((acc, item) => {
            acc.total++;
            if (item.status === 'Pendente') {
                acc.pendentes++;
            }
            else if (item.status === 'Respondida') {
                acc.respondidas++;
            }
            // Contagem por secretaria para identificar a mais acionada
            const secNome = item.secretaria_nome || 'Não informada';
            acc.secretariasCount[secNome] = (acc.secretariasCount[secNome] || 0) + 1;
            return acc;
        }, {
            total: 0,
            pendentes: 0,
            respondidas: 0,
            secretariasCount: {}
        });
        // Identifica a secretaria com maior número de chamados
        let topSecretaria = '-';
        let maxCount = 0;
        for (const [sec, count] of Object.entries(resumo.secretariasCount)) {
            if (count > maxCount) {
                maxCount = count;
                topSecretaria = sec;
            }
        }
        // Taxa de resolução (%)
        const taxaResolucao = resumo.total > 0
            ? ((resumo.respondidas / resumo.total) * 100).toFixed(1)
            : '0';
        // Atualização dos elementos no DOM
        if (this.metricTotal)
            this.metricTotal.textContent = resumo.total.toString();
        if (this.metricPendentes)
            this.metricPendentes.textContent = resumo.pendentes.toString();
        if (this.metricTaxa)
            this.metricTaxa.textContent = `${taxaResolucao}%`;
        if (this.metricTopSecretaria)
            this.metricTopSecretaria.textContent = topSecretaria;
        if (this.totalRegistrosBadge)
            this.totalRegistrosBadge.textContent = `${resumo.total} Registros Encontrados`;
    }
    /**
     * Renderiza as linhas da tabela utilizando .map()
     */
    renderizarTabela() {
        if (!this.tabelaCorpo)
            return;
        if (this.manifestacoes.length === 0) {
            this.tabelaCorpo.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Nenhuma reclamação encontrada para os filtros aplicados.</td></tr>`;
            return;
        }
        this.tabelaCorpo.innerHTML = this.manifestacoes.map(item => {
            const dataFormatada = new Date(item.data_criacao).toLocaleDateString('pt-BR');
            const isPendente = item.status === 'Pendente';
            const badgeClass = isPendente ? 'bg-warning text-dark' : 'bg-success';
            const tipoBadge = item.tipo === 'anonimo' ? 'bg-secondary' : 'bg-info text-dark';
            return `
                <tr>
                    <td class="fw-bold">${item.protocolo}</td>
                    <td>${dataFormatada}</td>
                    <td>${item.secretaria_nome || '-'}</td>
                    <td>${item.tema_nome || '-'}</td>
                    <td><span class="badge ${tipoBadge}">${item.tipo.toUpperCase()}</span></td>
                    <td><span class="badge ${badgeClass}">${item.status}</span></td>
                    <td class="text-end">
                        ${isPendente ? `
                            <button class="btn btn-sm btn-primary me-1 btn-responder" data-id="${item.id}">
                                <i class="bi bi-reply-fill"></i> Responder
                            </button>
                        ` : ''}
                        <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${item.id}">
                            <i class="bi bi-trash-fill"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        this.bindAcoesTabela();
    }
    /**
     * Associa eventos aos botões gerados dinamicamente na tabela
     */
    bindAcoesTabela() {
        // Botão Responder
        document.querySelectorAll('.btn-responder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const id = Number(target.getAttribute('data-id'));
                this.abrirModalResposta(id);
            });
        });
        // Botão Excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget;
                const id = Number(target.getAttribute('data-id'));
                this.excluirManifestacao(id);
            });
        });
    }
    abrirModalResposta(id) {
        const item = this.manifestacoes.find(m => m.id === id);
        if (!item)
            return;
        if (this.respostaManifestacaoId)
            this.respostaManifestacaoId.value = id.toString();
        if (this.modalDescricaoMunicipe)
            this.modalDescricaoMunicipe.textContent = item.descricao;
        if (this.respostaTexto)
            this.respostaTexto.value = '';
        // Exibe o modal via Bootstrap JS API
        if (this.modalRespostaEl) {
            const modalBs = new window.bootstrap.Modal(this.modalRespostaEl);
            modalBs.show();
        }
    }
    /**
     * Envia a resposta oficial do administrador via PUT
     */
    async salvarResposta(e) {
        var _a, _b;
        e.preventDefault();
        const id = Number((_a = this.respostaManifestacaoId) === null || _a === void 0 ? void 0 : _a.value);
        const resposta = ((_b = this.respostaTexto) === null || _b === void 0 ? void 0 : _b.value.trim()) || '';
        if (!id || !resposta) {
            alert('A resposta não pode estar vazia.');
            return;
        }
        try {
            const res = await fetch('api/manifestacoes.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, resposta })
            });
            const data = await res.json();
            if (!res.ok || !data.sucesso) {
                throw new Error(data.mensagem || 'Erro ao salvar resposta.');
            }
            alert('Resposta gravada com sucesso!');
            // Esconde o modal
            if (this.modalRespostaEl) {
                const modalBs = window.bootstrap.Modal.getInstance(this.modalRespostaEl);
                modalBs === null || modalBs === void 0 ? void 0 : modalBs.hide();
            }
            this.carregarDados();
        }
        catch (error) {
            console.error('Erro na gravação da resposta:', error);
            const msg = error instanceof Error ? error.message : 'Erro de comunicação.';
            alert(`Falha: ${msg}`);
        }
    }
    /**
     * Exclui a manifestação via DELETE aplicando a validação de regra de negócio
     */
    async excluirManifestacao(id) {
        if (!confirm('Deseja realmente excluir esta manifestação?'))
            return;
        try {
            const res = await fetch(`api/manifestacoes.php?id=${id}`, {
                method: 'DELETE'
            });
            const data = await res.json();
            if (!res.ok || !data.sucesso) {
                throw new Error(data.mensagem || 'Não foi possível excluir.');
            }
            alert(data.mensagem || 'Reclamação excluída com sucesso.');
            this.carregarDados();
        }
        catch (error) {
            console.error('Erro na exclusão:', error);
            const msg = error instanceof Error ? error.message : 'Erro de comunicação.';
            alert(`Atenção: ${msg}`);
        }
    }
}
// Inicializa o Painel Administrativo no carregamento
document.addEventListener('DOMContentLoaded', () => {
    new DashboardOuvidoria();
});
export {};
