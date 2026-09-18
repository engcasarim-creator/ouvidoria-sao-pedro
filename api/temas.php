<?php
/**
 * CRUD completo de Temas (assuntos vinculados a cada secretaria).
 */
session_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

function exigirLogin(): void {
    if (!isset($_SESSION['usuario_id'])) {
        http_response_code(401);
        echo json_encode(["sucesso" => false, "mensagem" => "Sessão expirada. Faça login novamente."]);
        exit;
    }
}

try {
    $database = new Database();
    $db = $database->getConnection();
    $metodo = $_SERVER['REQUEST_METHOD'];

    // ---------------------------------------------- READ
    if ($metodo === 'GET') {
        if (!empty($_GET['id'])) {
            $stmt = $db->prepare(
                "SELECT t.id, t.nome, t.secretaria_id, s.nome AS secretaria_nome
                 FROM temas t JOIN secretarias s ON t.secretaria_id = s.id
                 WHERE t.id = :id"
            );
            $stmt->bindValue(':id', (int) $_GET['id'], PDO::PARAM_INT);
            $stmt->execute();
            $registro = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$registro) {
                http_response_code(404);
                echo json_encode(["sucesso" => false, "mensagem" => "Tema não encontrado."]);
                exit;
            }
            echo json_encode($registro);
            exit;
        }

        $sql = "SELECT t.id, t.nome, t.secretaria_id, s.nome AS secretaria_nome
                FROM temas t JOIN secretarias s ON t.secretaria_id = s.id
                WHERE 1=1";
        $params = [];

        if (!empty($_GET['secretaria_id'])) {
            $sql .= " AND t.secretaria_id = :secretaria_id";
            $params[':secretaria_id'] = (int) $_GET['secretaria_id'];
        }

        $sql .= " ORDER BY s.nome ASC, t.nome ASC";

        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        exit;
    }

    // ---------------------------------------------- CREATE
    if ($metodo === 'POST') {
        exigirLogin();
        $dados = json_decode(file_get_contents("php://input"), true) ?? $_POST;

        $nome          = trim($dados['nome'] ?? '');
        $secretaria_id = isset($dados['secretaria_id']) ? (int) $dados['secretaria_id'] : 0;

        if ($nome === '' || !$secretaria_id) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "Informe o nome do tema e a secretaria responsável."]);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO temas (secretaria_id, nome) VALUES (:secretaria_id, :nome)");
        $stmt->bindValue(':secretaria_id', $secretaria_id, PDO::PARAM_INT);
        $stmt->bindValue(':nome', $nome);
        $stmt->execute();

        http_response_code(201);
        echo json_encode([
            "sucesso"  => true,
            "mensagem" => "Tema cadastrado com sucesso!",
            "dados"    => ["id" => (int) $db->lastInsertId()]
        ]);
        exit;
    }

    // ---------------------------------------------- UPDATE
    if ($metodo === 'PUT') {
        exigirLogin();
        $dados = json_decode(file_get_contents("php://input"), true);

        $id            = isset($dados['id']) ? (int) $dados['id'] : 0;
        $nome          = trim($dados['nome'] ?? '');
        $secretaria_id = isset($dados['secretaria_id']) ? (int) $dados['secretaria_id'] : 0;

        if (!$id || $nome === '' || !$secretaria_id) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "Informe ID, nome e secretaria do tema."]);
            exit;
        }

        $stmt = $db->prepare("UPDATE temas SET nome = :nome, secretaria_id = :secretaria_id WHERE id = :id");
        $stmt->bindValue(':nome', $nome);
        $stmt->bindValue(':secretaria_id', $secretaria_id, PDO::PARAM_INT);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(["sucesso" => true, "mensagem" => "Tema atualizado com sucesso!"]);
        exit;
    }

    // ---------------------------------------------- DELETE (com regra de negócio)
    if ($metodo === 'DELETE') {
        exigirLogin();
        $id = isset($_GET['id']) ? (int) $_GET['id'] : 0;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "ID é obrigatório."]);
            exit;
        }

        $stmt = $db->prepare("SELECT COUNT(*) AS qtd FROM manifestacoes WHERE tema_id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $qtd = (int) $stmt->fetch(PDO::FETCH_ASSOC)['qtd'];

        if ($qtd > 0) {
            http_response_code(422);
            echo json_encode([
                "sucesso"  => false,
                "mensagem" => "Regra de Negócio: este tema já foi usado em {$qtd} manifestação(ões) e não pode ser excluído, para preservar o histórico."
            ]);
            exit;
        }

        $stmt = $db->prepare("DELETE FROM temas WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["sucesso" => false, "mensagem" => "Tema não encontrado."]);
            exit;
        }

        echo json_encode(["sucesso" => true, "mensagem" => "Tema excluído com sucesso!"]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["sucesso" => false, "mensagem" => "Método não permitido."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro de servidor: " . $e->getMessage()]);
}
