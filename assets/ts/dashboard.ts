import { Manifestacao, ApiResponse } from './interfaces.js';

class DashboardOuvidoria {
    private manifestacoes: Manifestacao[] = [];
    
    // Elementos da Interface
    private tabelaCorpo: HTMLElement | null = null;
    private totalRegistrosBadge: HTMLElement | null = null;
    
    // Cards de Indicadores
    private metricTotal: HTMLElement | null = null;
    private metricPendentes: HTMLElement | null = null;
    private metricTaxa: HTMLElement | null = null;
    private metricTopSecretaria: HTMLElement | null = null;

    // Filtros
    private filtroDataInicio: HTMLInputElement | null = null;
    private filtroDataFim: HTMLInputElement | null = null;
    private filtroSecretaria: HTMLSelectElement | null = null;
    private btnFiltrar: HTMLElement | null = null;

    // Modal de Resposta
    private formResposta: HTMLFormElement | null = null;
    private modalRespostaEl: HTMLElement | null = null;
    private modalDescricaoMunicipe: HTMLElement | null = null;
    private respostaManifestacaoId: HTMLInputElement | null = null;
    private respostaTexto: HTMLTextAreaElement | null = null;

    constructor() {
        this.init();
    }

    private init(): void {
        this.mapearElementos();
        this.bindEvents();
        this.carregarDados();
    }

    private mapearElementos(): void {
        this.tabelaCorpo = document.getElementById('tabelaManifestacoes');
        this.totalRegistrosBadge = document.getElementById('totalRegistros');

        this.metricTotal = document.getElementById('metricTotal');
        this.metricPendentes = document.getElementById('metricPendentes');
        this.metricTaxa = document.getElementById('metricTaxa');
        this.metricTopSecretaria = document.getElementById('metricTopSecretaria');

        this.filtroDataInicio = document.getElementById('filtroDataInicio') as HTMLInputElement | null;
        this.filtroDataFim = document.getElementById('filtroDataFim') as HTMLInputElement | null;
        this.filtroSecretaria = document.getElementById('filtroSecretaria') as HTMLSelectElement | null;
        this.btnFiltrar = document.getElementById('btnFiltrar');

        this.formResposta = document.getElementById('formResposta') as HTMLFormElement | null;
        this.modalRespostaEl = document.getElementById('modalResposta');
        this.modalDescricaoMunicipe = document.getElementById('modalDescricaoMunicipe');
        this.respostaManifestacaoId = document.getElementById('respostaManifestacaoId') as HTMLInputElement | null;
        this.respostaTexto = document.getElementById('respostaTexto') as HTMLTextAreaElement | null;
    }

    private bindEvents(): void {
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
    private async carregarDados(): Promise<void> {
        const secretaria = this.filtroSecretaria?.value || '';
        const inicio = this.filtroDataInicio?.value || '';
        const fim = this.filtroDataFim?.value || '';

        const params = new URLSearchParams();
        if (secretaria) params.append('secretaria_id', secretaria);
        if (inicio) params.append('data_inicio', inicio);
        if (fim) params.append('data_fim', fim);

        try {
            const response = await fetch(`api/manifestacoes.php?${params.toString()}`);
            if (!response.ok) throw new Error('Falha ao carregar dados da API');

            this.manifestacoes = await response.json();
            
            this.atualizarMetricsComReduce();
            this.renderizarTabela();

        } catch (error) {
            console.error('Erro ao buscar manifestações:', error);
            if (this.tabelaCorpo) {
                this.tabelaCorpo.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">Erro ao carregar os dados. Verifique a conexão.</td></tr>`;
            }
        }
    }

    /**
     * Calcula as métricas em uma única iteração utilizando .reduce()
     */
    private atualizarMetricsComReduce(): void {
        const resumo = this.manifestacoes.reduce((acc, item) => {
            acc.total++;

            if (item.status === 'Pendente') {
                acc.pendentes++;
            } else if (item.status === 'Respondida') {
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
            secretariasCount: {} as Record<string, number>
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
        if (this.metricTotal) this.metricTotal.textContent = resumo.total.toString();
        if (this.metricPendentes) this.metricPendentes.textContent = resumo.pendentes.toString();
        if (this.metricTaxa) this.metricTaxa.textContent = `${taxaResolucao}%`;
        if (this.metricTopSecretaria) this.metricTopSecretaria.textContent = topSecretaria;
        if (this.totalRegistrosBadge) this.totalRegistrosBadge.textContent = `${resumo.total} Registros Encontrados`;
    }

    /**
     * Renderiza as linhas da tabela utilizando .map()
     */
    private renderizarTabela(): void {
        if (!this.tabelaCorpo) return;

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
    private bindAcoesTabela(): void {
        // Botão Responder
        document.querySelectorAll('.btn-responder').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const id = Number(target.getAttribute('data-id'));
                this.abrirModalResposta(id);
            });
        });

        // Botão Excluir
        document.querySelectorAll('.btn-excluir').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = e.currentTarget as HTMLElement;
                const id = Number(target.getAttribute('data-id'));
                this.excluirManifestacao(id);
            });
        });
    }

    private abrirModalResposta(id: number): void {
        const item = this.manifestacoes.find(m => m.id === id);
        if (!item) return;

        if (this.respostaManifestacaoId) this.respostaManifestacaoId.value = id.toString();
        if (this.modalDescricaoMunicipe) this.modalDescricaoMunicipe.textContent = item.descricao;
        if (this.respostaTexto) this.respostaTexto.value = '';

        // Exibe o modal via Bootstrap JS API
        if (this.modalRespostaEl) {
            const modalBs = new (window as any).bootstrap.Modal(this.modalRespostaEl);
            modalBs.show();
        }
    }

    /**
     * Envia a resposta oficial do administrador via PUT
     */
    private async salvarResposta(e: Event): Promise<void> {
        e.preventDefault();

        const id = Number(this.respostaManifestacaoId?.value);
        const resposta = this.respostaTexto?.value.trim() || '';

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

            const data: ApiResponse<null> = await res.json();

            if (!res.ok || !data.sucesso) {
                throw new Error(data.mensagem || 'Erro ao salvar resposta.');
            }

            alert('Resposta gravada com sucesso!');

            // Esconde o modal
            if (this.modalRespostaEl) {
                const modalBs = (window as any).bootstrap.Modal.getInstance(this.modalRespostaEl);
                modalBs?.hide();
            }

            this.carregarDados();

        } catch (error) {
            console.error('Erro na gravação da resposta:', error);
            const msg = error instanceof Error ? error.message : 'Erro de comunicação.';
            alert(`Falha: ${msg}`);
        }
    }

    /**
     * Exclui a manifestação via DELETE aplicando a validação de regra de negócio
     */
    private async excluirManifestacao(id: number): Promise<void> {
        if (!confirm('Deseja realmente excluir esta manifestação?')) return;

        try {
            const res = await fetch(`api/manifestacoes.php?id=${id}`, {
                method: 'DELETE'
            });

            const data: ApiResponse<null> = await res.json();

            if (!res.ok || !data.sucesso) {
                throw new Error(data.mensagem || 'Não foi possível excluir.');
            }

            alert(data.mensagem || 'Reclamação excluída com sucesso.');
            this.carregarDados();

        } catch (error) {
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