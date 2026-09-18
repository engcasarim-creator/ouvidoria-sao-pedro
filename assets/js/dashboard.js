class DashboardOuvidoria {
    constructor() {
        this.manifestacoes = [];
        this.modoExibicao = 'ativas';
        // Elementos do DOM
        this.tabelaCorpo = null;
        this.totalRegistrosBadge = null;
        this.metricTotal = null;
        this.metricPendentes = null;
        this.metricTaxa = null;
        this.metricTopSecretaria = null;
        this.filtroDataInicio = null;
        this.filtroDataFim = null;
        this.filtroSecretaria = null;
        this.btnFiltrar = null;
        // Botões de Alternância das Abas (Ativas vs Arquivadas)
        this.btnAbaAtivas = null;
        this.btnAbaArquivadas = null;
        // Elementos do Modal de Resposta
        this.formResposta = null;
        this.modalRespostaEl = null;
        this.modalDescricaoMunicipe = null;
        this.respostaManifestacaoId = null;
        this.respostaCanal = null;
        this.respostaEmailMunicipe = null;
        this.boxEmailMunicipe = null;
        this.respostaTexto = null;
        // Elementos do Modal de Histórico
        this.modalHistoricoEl = null;
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
        this.btnAbaAtivas = document.getElementById('btnAbaAtivas');
        this.btnAbaArquivadas = document.getElementById('btnAbaArquivadas');
        this.formResposta = document.getElementById('formResposta');
        this.modalRespostaEl = document.getElementById('modalResposta');
        this.modalDescricaoMunicipe = document.getElementById('modalDescricaoMunicipe');
        this.respostaManifestacaoId = document.getElementById('respostaManifestacaoId');
        this.respostaCanal = document.getElementById('respostaCanal');
        this.respostaEmailMunicipe = document.getElementById('respostaEmailMunicipe');
        this.boxEmailMunicipe = document.getElementById('boxEmailMunicipe');
        this.respostaTexto = document.getElementById('respostaTexto');
        this.modalHistoricoEl = document.getElementById('modalHistorico');
    }
    bindEvents() {
        if (this.btnFiltrar) {
            this.btnFiltrar.addEventListener('click', () => this.carregarDados());
        }
        // Alternância de Abas: Ativas vs Arquivadas
        if (this.btnAbaAtivas) {
            this.btnAbaAtivas.addEventListener('click', () => {
                this.modoExibicao = 'ativas';
                this.atualizarBotoesAbas();
                this.carregarDados();
            });
        }
        if (this.btnAbaArquivadas) {
            this.btnAbaArquivadas.addEventListener('click', () => {
                this.modoExibicao = 'arquivadas';
                this.atualizarBotoesAbas();
                this.carregarDados();
            });
        }
        if (this.formResposta) {
            this.formResposta.addEventListener('submit', (e) => this.salvarResposta(e));
        }
        if (this.respostaCanal) {
            this.respostaCanal.addEventListener('change', () => {
                this.atualizarCamposCanalResposta();
            });
        }
        // Delegação de eventos de clique na tabela
        if (this.tabelaCorpo) {
            this.tabelaCorpo.addEventListener('click', (e) => {
                const target = e.target;
                // 1. Botão Responder
                const btnResponder = target.closest('.btn-responder');
                if (btnResponder) {
                    const id = Number(btnResponder.getAttribute('data-id'));
                    if (id)
                        this.abrirModalResposta(id);
                    return;
                }
                // 2. Clique no Histórico ou na Badge
                const btnHistorico = target.closest('.btn-ver-historico');
                if (btnHistorico) {
                    const id = Number(btnHistorico.getAttribute('data-id'));
                    if (id)
                        this.abrirModalHistorico(id);
                    return;
                }
                // 3. Botão Arquivar (Para respondidas)
                const btnArquivar = target.closest('.btn-arquivar');
                if (btnArquivar) {
                    const id = Number(btnArquivar.getAttribute('data-id'));
                    if (id)
                        this.arquivarManifestacao(id);
                    return;
                }
                // 4. Botão Excluir (Para pendentes)
                const btnExcluir = target.closest('.btn-excluir');
                if (btnExcluir) {
                    const id = Number(btnExcluir.getAttribute('data-id'));
                    if (id)
                        this.excluirManifestacao(id);
                    return;
                }
            });
        }
    }
    atualizarBotoesAbas() {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (this.modoExibicao === 'ativas') {
            (_a = this.btnAbaAtivas) === null || _a === void 0 ? void 0 : _a.classList.add('btn-primary', 'active');
            (_b = this.btnAbaAtivas) === null || _b === void 0 ? void 0 : _b.classList.remove('btn-outline-primary');
            (_c = this.btnAbaArquivadas) === null || _c === void 0 ? void 0 : _c.classList.add('btn-outline-secondary');
            (_d = this.btnAbaArquivadas) === null || _d === void 0 ? void 0 : _d.classList.remove('btn-secondary', 'active');
        }
        else {
            (_e = this.btnAbaArquivadas) === null || _e === void 0 ? void 0 : _e.classList.add('btn-secondary', 'active');
            (_f = this.btnAbaArquivadas) === null || _f === void 0 ? void 0 : _f.classList.remove('btn-outline-secondary');
            (_g = this.btnAbaAtivas) === null || _g === void 0 ? void 0 : _g.classList.add('btn-outline-primary');
            (_h = this.btnAbaAtivas) === null || _h === void 0 ? void 0 : _h.classList.remove('btn-primary', 'active');
        }
    }
    escapeHtml(texto) {
        if (!texto)
            return '';
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }
    formatarDataHora(dataIsoStr) {
        if (!dataIsoStr)
            return '-';
        try {
            const data = new Date(dataIsoStr);
            if (isNaN(data.getTime())) {
                const partes = dataIsoStr.split('T')[0].split('-');
                if (partes.length === 3)
                    return `${partes[2]}/${partes[1]}/${partes[0]}`;
                return dataIsoStr;
            }
            return data.toLocaleString('pt-BR');
        }
        catch (_a) {
            return dataIsoStr;
        }
    }
    async carregarDados() {
        var _a, _b, _c;
        const secretaria = ((_a = this.filtroSecretaria) === null || _a === void 0 ? void 0 : _a.value) || '';
        const inicio = ((_b = this.filtroDataInicio) === null || _b === void 0 ? void 0 : _b.value) || '';
        const fim = ((_c = this.filtroDataFim) === null || _c === void 0 ? void 0 : _c.value) || '';
        const params = new URLSearchParams();
        // Garante que o parâmetro 'exibir' seja enviado para a API PHP
        params.append('exibir', this.modoExibicao);
        if (secretaria)
            params.append('secretaria_id', secretaria);
        if (inicio)
            params.append('data_inicio', inicio);
        if (fim)
            params.append('data_fim', fim);
        try {
            const response = await fetch(`api/manifestacoes.php?${params.toString()}`);
            if (!response.ok)
                throw new Error('Erro na comunicação');
            this.manifestacoes = await response.json();
            // Recalcula os cards e a contagem com base exata na lista retornada
            this.atualizarMetricsComReduce();
            this.renderizarTabela();
        }
        catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
    }
    atualizarMetricsComReduce() {
        const resumo = this.manifestacoes.reduce((acc, item) => {
            acc.total++;
            if (item.status === 'Pendente')
                acc.pendentes++;
            else if (item.status === 'Respondida' || item.status === 'Arquivada')
                acc.respondidas++;
            const secNome = item.secretaria_nome || 'Não informada';
            acc.secretariasCount[secNome] = (acc.secretariasCount[secNome] || 0) + 1;
            return acc;
        }, {
            total: 0,
            pendentes: 0,
            respondidas: 0,
            secretariasCount: {}
        });
        let topSecretaria = '-';
        let maxCount = 0;
        for (const [sec, count] of Object.entries(resumo.secretariasCount)) {
            if (count > maxCount) {
                maxCount = count;
                topSecretaria = sec;
            }
        }
        const taxaResolucao = resumo.total > 0
            ? ((resumo.respondidas / resumo.total) * 100).toFixed(1)
            : '0';
        // Atualiza os cartões com o total real filtrado pela aba
        if (this.metricTotal)
            this.metricTotal.textContent = resumo.total.toString();
        if (this.metricPendentes)
            this.metricPendentes.textContent = resumo.pendentes.toString();
        if (this.metricTaxa)
            this.metricTaxa.textContent = `${taxaResolucao}%`;
        if (this.metricTopSecretaria)
            this.metricTopSecretaria.textContent = topSecretaria;
        // Atualiza a badge do topo informando o total correto
        if (this.totalRegistrosBadge) {
            const nomePasta = this.modoExibicao === 'ativas' ? 'ATIVAS' : 'ARQUIVADAS';
            this.totalRegistrosBadge.textContent = `${resumo.total} Registros Encontrados (${nomePasta})`;
        }
    }
    renderizarTabela() {
        if (!this.tabelaCorpo)
            return;
        if (this.manifestacoes.length === 0) {
            this.tabelaCorpo.innerHTML = `<tr><td colspan="7" class="text-center text-muted py-4">Nenhuma manifestação encontrada na pasta <strong>${this.modoExibicao}</strong>.</td></tr>`;
            return;
        }
        this.tabelaCorpo.innerHTML = this.manifestacoes.map(item => {
            const dataFormatada = this.formatarDataHora(item.data_criacao);
            const isPendente = item.status === 'Pendente';
            const isArquivada = item.status === 'Arquivada';
            const tipoBadge = item.tipo === 'anonimo' ? 'bg-secondary' : 'bg-info text-dark';
            let statusHtml = '';
            if (isPendente) {
                statusHtml = `<span class="badge bg-warning text-dark">Pendente</span>`;
            }
            else if (isArquivada) {
                statusHtml = `<span class="badge bg-secondary btn-ver-historico" data-id="${item.id}" style="cursor: pointer;" title="Clique para ver o histórico"><i class="bi bi-archive-fill me-1"></i>Arquivada</span>`;
            }
            else {
                statusHtml = `<span class="badge bg-success btn-ver-historico" data-id="${item.id}" style="cursor: pointer;" title="Clique para ver o histórico"><i class="bi bi-check-circle-fill me-1"></i>Respondida</span>`;
            }
            let acoesHtml = '';
            if (isPendente) {
                acoesHtml = `
                    <button class="btn btn-sm btn-primary me-1 btn-responder" data-id="${item.id}">
                        <i class="bi bi-reply-fill"></i> Responder
                    </button>
                    <button class="btn btn-sm btn-outline-danger btn-excluir" data-id="${item.id}" title="Excluir">
                        <i class="bi bi-trash-fill"></i>
                    </button>
                `;
            }
            else if (isArquivada) {
                acoesHtml = `
                    <button class="btn btn-sm btn-outline-secondary me-1 btn-ver-historico" data-id="${item.id}" title="Ver Histórico">
                        <i class="bi bi-clock-history"></i> Histórico
                    </button>
                `;
            }
            else {
                acoesHtml = `
                    <button class="btn btn-sm btn-outline-secondary me-1 btn-ver-historico" data-id="${item.id}" title="Ver Histórico">
                        <i class="bi bi-clock-history"></i> Histórico
                    </button>
                    <button class="btn btn-sm btn-outline-warning btn-arquivar" data-id="${item.id}" title="Arquivar esta manifestação">
                        <i class="bi bi-archive-fill"></i> Arquivar
                    </button>
                `;
            }
            return `
                <tr>
                    <td class="fw-bold">${this.escapeHtml(item.protocolo)}</td>
                    <td>${dataFormatada}</td>
                    <td>${this.escapeHtml(item.secretaria_nome || '-')}</td>
                    <td>${this.escapeHtml(item.tema_nome || '-')}</td>
                    <td><span class="badge ${tipoBadge}">${this.escapeHtml(item.tipo.toUpperCase())}</span></td>
                    <td>${statusHtml}</td>
                    <td class="text-end">${acoesHtml}</td>
                </tr>
            `;
        }).join('');
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
        if (this.respostaEmailMunicipe)
            this.respostaEmailMunicipe.value = item.email || 'Não informado / Anônimo';
        if (this.respostaCanal)
            this.respostaCanal.value = 'E-mail';
        this.atualizarCamposCanalResposta();
        this.exibirModal(this.modalRespostaEl);
    }
    atualizarCamposCanalResposta() {
        var _a;
        const canal = (_a = this.respostaCanal) === null || _a === void 0 ? void 0 : _a.value;
        if (this.boxEmailMunicipe) {
            this.boxEmailMunicipe.style.display = (canal === 'E-mail') ? 'block' : 'none';
        }
    }
    abrirModalHistorico(id) {
        const item = this.manifestacoes.find(m => m.id === id);
        if (!item)
            return;
        const setTxt = (idEl, txt) => {
            const el = document.getElementById(idEl);
            if (el)
                el.textContent = txt;
        };
        setTxt('hist-protocolo', item.protocolo || '-');
        setTxt('hist-data', this.formatarDataHora(item.data_criacao));
        setTxt('hist-secretaria', item.secretaria_nome || '-');
        setTxt('hist-tema', item.tema_nome || '-');
        setTxt('hist-tipo', (item.tipo || '').toUpperCase());
        setTxt('hist-cidadao', item.nome || 'Anônimo / Não identificado');
        setTxt('hist-email', item.email || 'Não informado');
        setTxt('hist-telefone', item.telefone || 'Não informado');
        setTxt('hist-descricao', item.descricao || '');
        setTxt('hist-resposta', item.resposta || 'Nenhuma resposta transcrita.');
        setTxt('hist-canal', item.canal_resposta || 'Telefone / WhatsApp');
        setTxt('hist-data-resposta', item.data_resposta ? this.formatarDataHora(item.data_resposta) : '-');
        if (this.modalHistoricoEl) {
            this.exibirModal(this.modalHistoricoEl);
        }
    }
    exibirModal(element) {
        if (!element)
            return;
        try {
            if (typeof bootstrap !== 'undefined' && bootstrap.Modal) {
                const modalBs = bootstrap.Modal.getInstance(element) || new bootstrap.Modal(element);
                modalBs.show();
            }
        }
        catch (err) {
            console.error('Erro ao abrir o modal:', err);
        }
    }
    async salvarResposta(e) {
        var _a, _b, _c;
        e.preventDefault();
        const id = Number((_a = this.respostaManifestacaoId) === null || _a === void 0 ? void 0 : _a.value);
        const resposta = ((_b = this.respostaTexto) === null || _b === void 0 ? void 0 : _b.value.trim()) || '';
        const canal = ((_c = this.respostaCanal) === null || _c === void 0 ? void 0 : _c.value) || 'E-mail';
        if (!id || !resposta) {
            alert('Por favor, informe a resposta.');
            return;
        }
        try {
            const res = await fetch('api/manifestacoes.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id,
                    resposta,
                    canal_resposta: canal
                })
            });
            const data = await res.json();
            if (!res.ok || !data.sucesso) {
                throw new Error(data.mensagem || 'Erro ao salvar a resposta.');
            }
            alert('Resposta salva com sucesso!');
            if (this.modalRespostaEl && typeof bootstrap !== 'undefined') {
                const modalBs = bootstrap.Modal.getInstance(this.modalRespostaEl);
                modalBs === null || modalBs === void 0 ? void 0 : modalBs.hide();
            }
            this.carregarDados();
        }
        catch (error) {
            console.error('Erro ao salvar resposta:', error);
            alert('Falha ao salvar a resposta.');
        }
    }
    async arquivarManifestacao(id) {
        if (!confirm('Deseja arquivar esta manifestação respondida? Ela sairá da sua lista ativa do dia a dia.'))
            return;
        try {
            const res = await fetch('api/manifestacoes.php', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: id,
                    acao: 'arquivar'
                })
            });
            const data = await res.json();
            if (!res.ok || !data.sucesso) {
                throw new Error(data.mensagem || 'Erro ao arquivar.');
            }
            alert('Manifestação arquivada com sucesso!');
            this.carregarDados();
        }
        catch (error) {
            console.error('Erro ao arquivar:', error);
            alert('Falha ao arquivar a reclamação.');
        }
    }
    async excluirManifestacao(id) {
        if (!confirm('Deseja realmente excluir esta manifestação pendente?'))
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
            alert('Regra de Negócio: Não é possível excluir esta reclamação.');
        }
    }
}
document.addEventListener('DOMContentLoaded', () => {
    new DashboardOuvidoria();
});
export {};
