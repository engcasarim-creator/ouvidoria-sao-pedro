<?php
session_start();
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    if ($metodo === 'POST') {
        $dados = json_decode(file_get_contents("php://input"), true) ?? $_POST;
        
        $email = trim($dados['email'] ?? '');
        $senha = trim($dados['senha'] ?? '');

        if (empty($email) || empty($senha)) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "Informe o e-mail e a senha."]);
            exit;
        }

        $stmt = $db->prepare("SELECT id, nome, email, senha, cargo FROM usuarios WHERE email = :email");
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        $usuario = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($usuario && password_verify($senha, $usuario['senha'])) {
            // Guarda as informações na sessão do servidor
            $_SESSION['usuario_id'] = $usuario['id'];
            $_SESSION['usuario_nome'] = $usuario['nome'];
            $_SESSION['usuario_cargo'] = $usuario['cargo'];

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Login realizado com sucesso!",
                "redirecionar" => "dashboard.php"
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["sucesso" => false, "mensagem" => "E-mail ou senha incorretos."]);
        }
    } elseif ($metodo === 'GET' && isset($_GET['action']) && $_GET['action'] === 'logout') {
        // Encerra a sessão
        session_destroy();
        header("Location: ../login.php");
        exit;
    } else {
        http_response_code(405);
        echo json_encode(["sucesso" => false, "mensagem" => "Método não permitido."]);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro de Banco de Dados: " . $e->getMessage()]);
}