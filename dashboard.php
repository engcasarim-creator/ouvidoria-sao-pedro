<?php
session_start();

// Trava de segurança: Redireciona para o login se não estiver autenticado
if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

include_once 'includes/header.php'; 
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Painel da Ouvidoria Municipal</h2>
    <span class="badge bg-secondary p-2 fs-6" id="totalRegistros">0 Registros Encontrados</span>
</div>

<!-- Cards de Métricas Globais -->
<div class="row g-3 mb-4">
    <div class="col-md-3">
        <div class="card border-0 bg-primary text-white shadow-sm h-100">
            <div class="card-body">
                <h6 class="card-subtitle mb-2 opacity-75">Total de Reclamações</h6>
                <h3 class="card-title mb-0 fw-bold" id="metricTotal">0</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card border-0 bg-warning text-dark shadow-sm h-100">
            <div class="card-body">
                <h6 class="card-subtitle mb-2 opacity-75">Pendentes</h6>
                <h3 class="card-title mb-0 fw-bold" id="metricPendentes">0</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card border-0 bg-success text-white shadow-sm h-100">
            <div class="card-body">
                <h6 class="card-subtitle mb-2 opacity-75">Taxa de Resolução</h6>
                <h3 class="card-title mb-0 fw-bold" id="metricTaxa">0%</h3>
            </div>
        </div>
    </div>
    <div class="col-md-3">
        <div class="card border-0 bg-info text-white shadow-sm h-100">
            <div class="card-body">
                <h6 class="card-subtitle mb-2 opacity-75">Secretaria Mais Acionada</h6>
                <h6 class="card-title mb-0 fw-bold text-truncate" id="metricTopSecretaria">-</h6>
            </div>
        </div>
    </div>
</div>

<!-- Filtros e Navegação entre Ativas / Arquivadas -->
<div class="card border-0 shadow-sm mb-4">
    <div class="card-body">
        <!-- Botões para chavear a visualização da fila de atendimento -->
        <div class="d-flex justify-content-between align-items-center mb-3">
            <div class="btn-group" role="group" aria-label="Filtro de Estado">
                <button type="button" class="btn btn-primary active" id="btnAbaAtivas">
                    <i class="bi bi-inbox-fill me-1"></i> Em Andamento / Ativas
                </button>
                <button type="button" class="btn btn-outline-secondary" id="btnAbaArquivadas">
                    <i class="bi bi-archive-fill me-1"></i> Arquivadas
                </button>
            </div>
        </div>

        <form class="row g-3" id="formFiltros">
            <div class="col-md-3">
                <label class="form-label fw-bold">Data Início</label>
                <input type="date" class="form-control" id="filtroDataInicio">
            </div>
            <div class="col-md-3">
                <label class="form-label fw-bold">Data Fim</label>
                <input type="date" class="form-control" id="filtroDataFim">
            </div>
            <div class="col-md-4">
                <label class="form-label fw-bold">Secretaria</label>
                <select class="form-select" id="filtroSecretaria">
                    <option value="">Todas as Secretarias</option>
                    <option value="1">Indústria, Comércio e Fomento Agropecuário</option>
                    <option value="2">Esportes</option>
                    <option value="3">Assistência Social</option>
                    <option value="4">Educação</option>
                    <option value="5">Saúde</option>
                    <option value="6">Administração Geral</option>
                    <option value="7">Viação, Obras e Urbanismo</option>
                    <option value="8">Meio Ambiente e Turismo</option>
                </select>
            </div>
            <div class="col-md-2 d-flex align-items-end">
                <button type="button" class="btn btn-outline-primary w-100" id="btnFiltrar">
                    <i class="bi bi-funnel-fill me-1"></i>Filtrar
                </button>
            </div>
        </form>
    </div>
</div>

<!-- Tabela Dinâmica de Registros -->
<div class="card border-0 shadow-sm">
    <div class="card-body p-0">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                    <tr>
                        <th>Protocolo</th>
                        <th>Data</th>
                        <th>Secretaria</th>
                        <th>Tema</th>
                        <th>Tipo</th>
                        <th>Status</th>
                        <th class="text-end">Ações</th>
                    </tr>
                </thead>
                <tbody id="tabelaManifestacoes">
                    <!-- Preenchido dinamicamente via TypeScript -->
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal para Resposta Administrativa -->
<div class="modal fade" id="modalResposta" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form id="formResposta">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title"><i class="bi bi-reply-fill me-2"></i>Responder Reclamação</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
                </div>
                <div class="modal-body">
                    <input type="hidden" id="respostaManifestacaoId">
                    
                    <div class="mb-3">
                        <label class="form-label fw-bold">Descrição da Reclamação do Munícipe</label>
                        <p class="p-3 bg-light rounded border text-break" id="modalDescricaoMunicipe"></p>
                    </div>

                    <!-- Escolha do Canal de Resposta -->
                    <div class="mb-3">
                        <label for="respostaCanal" class="form-label fw-bold">Forma de Envio / Canal de Resposta <span class="text-danger">*</span></label>
                        <select id="respostaCanal" class="form-select" required>
                            <option value="E-mail">E-mail (Notificação por e-mail)</option>
                            <option value="Telefone / WhatsApp">Telefone / WhatsApp (Transcrição do atendimento)</option>
                        </select>
                    </div>

                    <div class="mb-3" id="boxEmailMunicipe">
                        <label class="form-label text-muted small">E-mail Cadastrado do Contribuinte</label>
                        <input type="text" id="respostaEmailMunicipe" class="form-control form-control-sm bg-light" readonly>
                    </div>

                    <div class="mb-3">
                        <label for="respostaTexto" class="form-label fw-bold">Resposta Oficial / Transcrição <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="respostaTexto" rows="4" placeholder="Escreva aqui a resposta oficial enviada..." required></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-primary">Salvar Resposta</button>
                </div>
            </form>
        </div>
    </div>
</div>

<!-- Modal de Histórico Completo da Reclamação -->
<div class="modal fade" id="modalHistorico" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-dark text-white">
                <h5 class="modal-title"><i class="bi bi-clock-history me-2"></i>Histórico da Manifestação</h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Fechar"></button>
            </div>
            <div class="modal-body">
                <div class="row g-3 mb-3">
                    <div class="col-md-6"><strong>Protocolo:</strong> <span id="hist-protocolo" class="text-primary fw-bold"></span></div>
                    <div class="col-md-6"><strong>Data de Abertura:</strong> <span id="hist-data"></span></div>
                    <div class="col-md-6"><strong>Secretaria:</strong> <span id="hist-secretaria"></span></div>
                    <div class="col-md-6"><strong>Tema:</strong> <span id="hist-tema"></span></div>
                    <div class="col-md-6"><strong>Tipo:</strong> <span id="hist-tipo"></span></div>
                    <div class="col-md-6"><strong>Cidadão:</strong> <span id="hist-cidadao"></span></div>
                    <div class="col-md-6"><strong>E-mail:</strong> <span id="hist-email"></span></div>
                    <div class="col-md-6"><strong>Telefone:</strong> <span id="hist-telefone"></span></div>
                </div>

                <hr>

                <div class="mb-3">
                    <label class="fw-bold">Descrição da Reclamação:</label>
                    <div id="hist-descricao" class="p-3 bg-light rounded border mt-1"></div>
                </div>

                <hr>

                <div class="mb-3">
                    <label class="fw-bold text-success">Resposta Oficial da Prefeitura:</label>
                    <div id="hist-resposta" class="p-3 bg-light rounded border border-success mt-1"></div>
                </div>

                <div class="row text-muted small mt-2">
                    <div class="col-md-6"><strong>Canal Utilizado:</strong> <span id="hist-canal" class="fw-bold text-dark"></span></div>
                    <div class="col-md-6"><strong>Data da Resposta:</strong> <span id="hist-data-resposta"></span></div>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            </div>
        </div>
    </div>
</div>

<!-- Script JS Compilado com parâmetro de versão v=4.0 para evitar cache -->
<script type="module" src="assets/js/dashboard.js?v=4.0"></script>

<?php include_once 'includes/footer.php'; ?>