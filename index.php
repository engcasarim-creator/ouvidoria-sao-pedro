<?php include_once 'includes/header.php'; ?>

<!-- Banner de Boas-Vindas Institucional -->
<div class="banner-ouvidoria text-center mb-4">
    <h1 class="display-5">Canal Direto com o Cidadão</h1>
    <p class="lead mb-0">Envie suas reclamações, sugestões e solicitações para a Prefeitura Municipal de São Pedro do Paraná.</p>
</div>

<div class="row justify-content-center">
    <div class="col-lg-8">
        <div class="card shadow border-0">
            <div class="card-header card-header-custom py-3">
                <h4 class="card-title mb-0"><i class="bi bi-chat-left-dots-fill me-2"></i>Registrar Reclamação</h4>
            </div>
            <div class="card-body p-4">
                <form id="formOuvidoria" enctype="multipart/form-data">
                    
                    <!-- Opção de Anonimato -->
                    <div class="mb-4 p-3 bg-light rounded border">
                        <label class="form-label fw-bold d-block">Tipo de Manifestação</label>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="tipo_identificacao" id="tipoIdentificado" value="identificado" checked>
                            <label class="form-check-label" for="tipoIdentificado">Identificada (Com resposta)</label>
                        </div>
                        <div class="form-check form-check-inline">
                            <input class="form-check-input" type="radio" name="tipo_identificacao" id="tipoAnonimo" value="anonimo">
                            <label class="form-check-label" for="tipoAnonimo">Anônima (Sem resposta direta)</label>
                        </div>
                    </div>

                    <!-- Campos do Munícipe -->
                    <div id="secaoIdentificacao" class="row g-3 mb-3">
                        <div class="col-md-6">
                            <label for="nome" class="form-label">Nome Completo</label>
                            <input type="text" class="form-control" id="nome" name="nome" placeholder="Seu nome completo">
                        </div>
                        <div class="col-md-6">
                            <label for="email" class="form-label">E-mail <span class="text-danger">*</span></label>
                            <input type="email" class="form-control" id="email" name="email" placeholder="nome@exemplo.com">
                        </div>
                        <div class="col-md-6">
                            <label for="telefone" class="form-label">Telefone / WhatsApp <span class="text-danger">*</span></label>
                            <input type="tel" class="form-control" id="telefone" name="telefone" placeholder="(44) 99999-9999">
                        </div>
                    </div>

                    <!-- Seleção de Secretaria -->
                    <div class="mb-3">
                        <label for="secretaria_id" class="form-label fw-bold">Secretaria Destino <span class="text-danger">*</span></label>
                        <select class="form-select" id="secretaria_id" name="secretaria_id" required>
                            <option value="" selected disabled>Selecione a secretaria...</option>
                            <option value="1">Secretaria de Indústria, Comércio e Fomento Agropecuário</option>
                            <option value="2">Secretaria de Esportes</option>
                            <option value="3">Secretaria de Assistência Social</option>
                            <option value="4">Secretaria da Educação</option>
                            <option value="5">Secretaria da Saúde</option>
                            <option value="6">Secretaria de Administração Geral</option>
                            <option value="7">Secretaria de Diretoria de Viação, Obras e Urbanismo</option>
                            <option value="8">Secretaria do Meio Ambiente e Turismo</option>
                        </select>
                    </div>

                    <!-- Tema/Assunto -->
                    <div class="mb-3">
                        <label for="tema_id" class="form-label fw-bold">Tema da Reclamação <span class="text-danger">*</span></label>
                        <select class="form-select" id="tema_id" name="tema_id" required>
                            <option value="1">Atendimento Geral / Diversos</option>
                            <option value="2">Iluminação Pública</option>
                            <option value="3">Pavimentação e Manutenção</option>
                            <option value="4">Saúde e Medicamentos</option>
                        </select>
                    </div>

                    <!-- Descrição da Reclamação -->
                    <div class="mb-3">
                        <label for="descricao" class="form-label fw-bold">Descrição da Reclamação <span class="text-danger">*</span></label>
                        <textarea class="form-control" id="descricao" name="descricao" rows="5" placeholder="Descreva detalhadamente a sua solicitação..." required></textarea>
                    </div>

                    <!-- Anexo Opcional -->
                    <div class="mb-4">
                        <label for="anexo" class="form-label">Anexar Foto (Opcional)</label>
                        <input class="form-control" type="file" id="anexo" name="anexo" accept="image/*">
                        <small class="text-muted">Formatos permitidos: JPG, PNG (Tamanho máximo: 5MB).</small>
                    </div>

                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                        <i class="bi bi-send-fill me-2"></i>Enviar Reclamação
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<script type="module" src="assets/js/form.js"></script>

<?php include_once 'includes/footer.php'; ?>