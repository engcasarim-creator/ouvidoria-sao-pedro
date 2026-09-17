<?php
session_start();
if (isset($_SESSION['usuario_id'])) {
    header("Location: dashboard.php");
    exit;
}
include_once 'includes/header.php';
?>

<div class="row justify-content-center my-5">
    <div class="col-md-5 col-lg-4">
        <div class="card shadow-lg border-0">
            <div class="card-header card-header-custom text-center py-3">
                <h5 class="mb-0"><i class="bi bi-shield-lock-fill me-2"></i>Acesso Restrito</h5>
                <small>Servidores Municipais</small>
            </div>
            <div class="card-body p-4">
                <div id="alertLogin" class="alert alert-danger d-none" role="alert"></div>

                <form id="formLogin">
                    <div class="mb-3">
                        <label for="email" class="form-label fw-bold">E-mail Institucional</label>
                        <input type="email" class="form-control" id="email" required placeholder="admin@saopedrodoparana.pr.gov.br">
                    </div>
                    <div class="mb-3">
                        <label for="senha" class="form-label fw-bold">Senha</label>
                        <input type="password" class="form-control" id="senha" required placeholder="••••••••">
                    </div>
                    <button type="submit" class="btn btn-primary w-100 py-2 fw-bold">
                        <i class="bi bi-box-arrow-in-right me-1"></i> Entrar no Painel
                    </button>
                </form>
            </div>
        </div>
    </div>
</div>

<script>
document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
    const alertBox = document.getElementById('alertLogin');
    alertBox.classList.add('d-none');

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    try {
        const response = await fetch('api/login.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha })
        });
        const data = await response.json();

        if (data.sucesso) {
            window.location.href = data.redirecionar;
        } else {
            alertBox.textContent = data.mensagem;
            alertBox.classList.remove('d-none');
        }
    } catch (err) {
        alertBox.textContent = "Erro na conexão com o servidor.";
        alertBox.classList.remove('d-none');
    }
});
</script>

<?php include_once 'includes/footer.php'; ?>