<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
?>
<nav class="navbar navbar-expand-lg navbar-dark navbar-custom shadow-sm">
    <div class="container">
        <a class="navbar-brand fw-bold d-flex align-items-center" href="index.php">
            <img src="imagens/Brasao.png" alt="Brasão" class="logo-brasao me-2" onerror="this.onerror=null; this.src='imagens/Brasao.jpg';">
            Ouvidoria São Pedro do Paraná
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
            <ul class="navbar-nav ms-auto align-items-center">
                <li class="nav-item">
                    <a class="nav-link text-white" href="index.php"><i class="bi bi-pencil-square me-1"></i> Nova Reclamação</a>
                </li>
                <?php if (isset($_SESSION['usuario_id'])): ?>
                    <li class="nav-item">
                        <a class="nav-link text-white fw-bold" href="dashboard.php"><i class="bi bi-speedometer2 me-1"></i> Painel Admin</a>
                    </li>
                    <li class="nav-item ms-lg-2">
                        <a class="btn btn-outline-light btn-sm" href="api/login.php?action=logout">
                            <i class="bi bi-box-arrow-right me-1"></i> Sair (<?= htmlspecialchars($_SESSION['usuario_nome']) ?>)
                        </a>
                    </li>
                <?php else: ?>
                    <li class="nav-item ms-lg-2">
                        <a class="btn btn-light btn-sm text-primary fw-bold" href="login.php">
                            <i class="bi bi-lock-fill me-1"></i> Área Restrita
                        </a>
                    </li>
                <?php endif; ?>
            </ul>
        </div>
    </div>
</nav>