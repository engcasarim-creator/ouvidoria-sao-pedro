<?php
require_once __DIR__ . '/config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();

    $email = 'admin@saopedrodoparana.pr.gov.br';
    $senhaPura = 'prefeitura123';
    
    // Gerar hash nativa e válida do PHP
    $senhaHash = password_hash($senhaPura, PASSWORD_DEFAULT);

    // Limpa a tabela e insere o usuário com a hash correta
    $db->exec("DELETE FROM usuarios WHERE email = '$email'");
    
    $stmt = $db->prepare("INSERT INTO usuarios (nome, email, senha, cargo) VALUES (:nome, :email, :senha, :cargo)");
    $stmt->execute([
        ':nome' => 'Administrador Ouvidoria',
        ':email' => $email,
        ':senha' => $senhaHash,
        ':cargo' => 'Administrador'
    ]);

    echo "<h3>✅ Senha recriada com sucesso!</h3>";
    echo "<p><strong>E-mail:</strong> admin@saopedrodoparana.pr.gov.br</p>";
    echo "<p><strong>Senha:</strong> prefeitura123</p>";
    echo "<p><a href='login.php'>Clique aqui para ir para a tela de Login</a></p>";

} catch (Exception $e) {
    echo "<h3>❌ Erro ao atualizar senha:</h3> " . $e->getMessage();
}