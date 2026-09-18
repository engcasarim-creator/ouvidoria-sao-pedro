<?php
session_start();

if (!isset($_SESSION['usuario_id'])) {
    header("Location: login.php");
    exit;
}

include_once 'includes/header.php';
?>

<div class="d-flex justify-content-between align-items-center mb-4">
    <h2>Cadastros do Sistema</h2>
    <span class="badge bg-secondary p-2 fs-6" id="badgeResumo">-</span>
</div>

<!-- Componente Bootstrap: Nav Tabs -->
<ul class="nav nav-tabs mb-3" id="tabsCadastro" role="tablist">
    <li class="nav-item" role="presentation">
        <button class="nav-link active" id="tab-secretarias" data-bs-toggle="tab"
                data-bs-target="#pane-secretarias" type="button" role="tab">
            <i class="bi bi-building me-1"></i> Secretarias
        </button>
    </li>
    <li class="nav-item" role="presentation">
        <button class="nav-link" id="tab-temas" data-bs-toggle="tab"
                data-bs-target="#pane-temas" type="button" role="tab">
            <i class="bi bi-tags me-1"></i> Temas
        </button>
    </li>
</ul>

<div class="tab-content">
    <!-- ================= SECRETARIAS ================= -->
    <div class="tab-pane fade show active" id="pane-secretarias" role="tabpanel">
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="chkSomenteAtivas">
                        <label class="form-check-label" for="chkSomenteAtivas">Mostrar somente ativas</label>
                    </div>
                    <button class="btn btn-primary btn-sm" id="btnNovaSecretaria">
                        <i class="bi bi-plus-lg me-1"></i> Nova Secretaria
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Nome</th>
                                <th style="width: 120px;">Situação</th>
                                <th class="text-end" style="width: 170px;">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tabelaSecretarias">
                            <tr><td colspan="3" class="text-center text-muted py-4">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- ================= TEMAS ================= -->
    <div class="tab-pane fade" id="pane-temas" role="tabpanel">
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <select class="form-select form-select-sm w-auto" id="filtroSecretariaTema">
                        <option value="">Todas as secretarias</option>
                    </select>
                    <button class="btn btn-primary btn-sm" id="btnNovoTema">
                        <i class="bi bi-plus-lg me-1"></i> Novo Tema
                    </button>
                </div>

                <div class="table-responsive">
                    <table class="table table-hover align-middle mb-0">
                        <thead class="table-light">
                            <tr>
                                <th>Tema</th>
                                <th>Secretaria</th>
                                <th class="text-end" style="width: 170px;">Ações</th>
                            </tr>
                        </thead>
                        <tbody id="tabelaTemas">
                            <tr><td colspan="3" class="text-center text-muted py-4">Carregando...</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- Modal Secretaria -->
<div class="modal fade" id="modalSecretaria" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="tituloModalSecretaria">Nova Secretaria</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="secretariaId">
                <div class="mb-3">
                    <label for="secretariaNome" class="form-label">Nome <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="secretariaNome" maxlength="150">
                </div>
                <div class="form-check form-switch">
                    <input class="form-check-input" type="checkbox" id="secretariaAtiva" checked>
                    <label class="form-check-label" for="secretariaAtiva">Secretaria ativa</label>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnSalvarSecretaria">Salvar</button>
            </div>
        </div>
    </div>
</div>

<!-- Modal Tema -->
<div class="modal fade" id="modalTema" tabindex="-1">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h5 class="modal-title" id="tituloModalTema">Novo Tema</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <input type="hidden" id="temaId">
                <div class="mb-3">
                    <label for="temaNome" class="form-label">Nome do tema <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="temaNome" maxlength="100">
                </div>
                <div class="mb-3">
                    <label for="temaSecretaria" class="form-label">Secretaria responsável <span class="text-danger">*</span></label>
                    <select class="form-select" id="temaSecretaria"></select>
                </div>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
                <button type="button" class="btn btn-primary" id="btnSalvarTema">Salvar</button>
            </div>
        </div>
    </div>
</div>

<script type="module" src="assets/js/cadastros.js"></script>

<?php include_once 'includes/footer.php'; ?>
