<?php
/**
 * CRUD completo de Secretarias (Create, Read, Update, Delete).
 * Mesmo padrão de api/manifestacoes.php: PDO + JSON + ApiResponse.
 */
session_start();
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

// Só usuário logado pode manter cadastros
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
            $stmt = $db->prepare("SELECT id, nome, ativa FROM secretarias WHERE id = :id");
            $stmt->bindValue(':id', (int) $_GET['id'], PDO::PARAM_INT);
            $stmt->execute();
            $registro = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$registro) {
                http_response_code(404);
                echo json_encode(["sucesso" => false, "mensagem" => "Secretaria não encontrada."]);
                exit;
            }
            $registro['ativa'] = (bool) $registro['ativa'];
            echo json_encode($registro);
            exit;
        }

        $stmt = $db->query("SELECT id, nome, ativa FROM secretarias ORDER BY nome ASC");
        $lista = array_map(static function (array $linha): array {
            $linha['ativa'] = (bool) $linha['ativa'];   // mantém o contrato boolean do TypeScript
            return $linha;
        }, $stmt->fetchAll(PDO::FETCH_ASSOC));
        echo json_encode($lista);
        exit;
    }

    // ---------------------------------------------- CREATE
    if ($metodo === 'POST') {
        exigirLogin();
        $dados = json_decode(file_get_contents("php://input"), true) ?? $_POST;

        $nome  = trim($dados['nome'] ?? '');
        $ativa = !empty($dados['ativa']) ? 1 : 0;

        if ($nome === '') {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "Informe o nome da secretaria."]);
            exit;
        }

        $check = $db->prepare("SELECT id FROM secretarias WHERE nome = :nome");
        $check->bindValue(':nome', $nome);
        $check->execute();
        if ($check->fetch()) {
            http_response_code(409);
            echo json_encode(["sucesso" => false, "mensagem" => "Já existe uma secretaria com esse nome."]);
            exit;
        }

        $stmt = $db->prepare("INSERT INTO secretarias (nome, ativa) VALUES (:nome, :ativa)");
        $stmt->bindValue(':nome', $nome);
        $stmt->bindValue(':ativa', $ativa, PDO::PARAM_INT);
        $stmt->execute();

        http_response_code(201);
        echo json_encode([
            "sucesso"  => true,
            "mensagem" => "Secretaria cadastrada com sucesso!",
            "dados"    => ["id" => (int) $db->lastInsertId()]
        ]);
        exit;
    }

    // ---------------------------------------------- UPDATE
    if ($metodo === 'PUT') {
        exigirLogin();
        $dados = json_decode(file_get_contents("php://input"), true);

        $id    = isset($dados['id']) ? (int) $dados['id'] : 0;
        $nome  = trim($dados['nome'] ?? '');
        $ativa = !empty($dados['ativa']) ? 1 : 0;

        if (!$id || $nome === '') {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "Informe o ID e o nome da secretaria."]);
            exit;
        }

        $stmt = $db->prepare("UPDATE secretarias SET nome = :nome, ativa = :ativa WHERE id = :id");
        $stmt->bindValue(':nome', $nome);
        $stmt->bindValue(':ativa', $ativa, PDO::PARAM_INT);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        echo json_encode(["sucesso" => true, "mensagem" => "Secretaria atualizada com sucesso!"]);
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

        // Regra 1: não excluir secretaria com manifestações vinculadas
        $stmt = $db->prepare("SELECT COUNT(*) AS qtd FROM manifestacoes WHERE secretaria_id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $qtdManifestacoes = (int) $stmt->fetch(PDO::FETCH_ASSOC)['qtd'];

        if ($qtdManifestacoes > 0) {
            http_response_code(422);
            echo json_encode([
                "sucesso"  => false,
                "mensagem" => "Regra de Negócio: esta secretaria possui {$qtdManifestacoes} manifestação(ões) registrada(s) e não pode ser excluída. Desative-a no lugar de excluir."
            ]);
            exit;
        }

        // Regra 2: avisa que os temas vinculados serão removidos junto (ON DELETE CASCADE)
        $stmt = $db->prepare("SELECT COUNT(*) AS qtd FROM temas WHERE secretaria_id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        $qtdTemas = (int) $stmt->fetch(PDO::FETCH_ASSOC)['qtd'];

        $stmt = $db->prepare("DELETE FROM secretarias WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);
        $stmt->execute();

        if ($stmt->rowCount() === 0) {
            http_response_code(404);
            echo json_encode(["sucesso" => false, "mensagem" => "Secretaria não encontrada."]);
            exit;
        }

        $msg = "Secretaria excluída com sucesso!";
        if ($qtdTemas > 0) {
            $msg .= " {$qtdTemas} tema(s) vinculado(s) foram removidos junto.";
        }
        echo json_encode(["sucesso" => true, "mensagem" => $msg]);
        exit;
    }

    http_response_code(405);
    echo json_encode(["sucesso" => false, "mensagem" => "Método não permitido."]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro de servidor: " . $e->getMessage()]);
}
