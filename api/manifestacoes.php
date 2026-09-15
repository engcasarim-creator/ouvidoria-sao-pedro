<?php
header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

$database = new Database();
$db = $database->getConnection();
$metodo = $_SERVER['REQUEST_METHOD'];

try {
    switch ($metodo) {

        // =========================================================================
        // GET: Lista as manifestações chamando a Stored Procedure ou View Analítica
        // =========================================================================
        case 'GET':
            $secretaria_id = isset($_GET['secretaria_id']) && $_GET['secretaria_id'] !== '' ? (int)$_GET['secretaria_id'] : null;
            $status = isset($_GET['status']) && $_GET['status'] !== '' ? $_GET['status'] : null;
            $data_inicio = isset($_GET['data_inicio']) && $_GET['data_inicio'] !== '' ? $_GET['data_inicio'] : null;
            $data_fim = isset($_GET['data_fim']) && $_GET['data_fim'] !== '' ? $_GET['data_fim'] : null;

            // Chamada limpa (CALL) à Stored Procedure otimizada
            $sql = "CALL sp_filtrar_ouvidoria(:secretaria_id, :status, :data_inicio, :data_fim)";
            $stmt = $db->prepare($sql);
            
            $stmt->bindValue(':secretaria_id', $secretaria_id, $secretaria_id ? PDO::PARAM_INT : PDO::PARAM_NULL);
            $stmt->bindValue(':status', $status, $status ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':data_inicio', $data_inicio, $data_inicio ? PDO::PARAM_STR : PDO::PARAM_NULL);
            $stmt->bindValue(':data_fim', $data_fim, $data_fim ? PDO::PARAM_STR : PDO::PARAM_NULL);

            $stmt->execute();
            $manifestacoes = $stmt->fetchAll(PDO::FETCH_ASSOC);

            echo json_encode($manifestacoes);
            break;

        // =========================================================================
        // POST: Cria uma nova reclamação do munícipe (Anônima ou Identificada)
        // =========================================================================
        case 'POST':
            $tipo = $_POST['tipo_identificacao'] ?? 'identificado';
            $nome = $tipo === 'identificado' ? ($_POST['nome'] ?? null) : null;
            $email = $tipo === 'identificado' ? ($_POST['email'] ?? null) : null;
            $telefone = $tipo === 'identificado' ? ($_POST['telefone'] ?? null) : null;
            $secretaria_id = (int)($_POST['secretaria_id'] ?? 0);
            $tema_id = (int)($_POST['tema_id'] ?? 0);
            $descricao = trim($_POST['descricao'] ?? '');

            if (!$secretaria_id || !$tema_id || empty($descricao)) {
                http_response_code(400);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Por favor, preencha todos os campos obrigatórios."
                ]);
                exit;
            }

            // Geração de protocolo formatado temporário
            $ano = date('Y');
            $queryCount = $db->query("SELECT COUNT(*) as total FROM manifestacoes");
            $total = $queryCount->fetch()['total'] + 1;
            $protocolo = sprintf("OUV-%05d/%d", $total, $ano);

            $sqlInsert = "INSERT INTO manifestacoes (protocolo, tipo, nome, email, telefone, secretaria_id, tema_id, descricao, status)
                          VALUES (:protocolo, :tipo, :nome, :email, :telefone, :secretaria_id, :tema_id, :descricao, 'Pendente')";

            $stmtInsert = $db->prepare($sqlInsert);
            $stmtInsert->bindParam(':protocolo', $protocolo);
            $stmtInsert->bindParam(':tipo', $tipo);
            $stmtInsert->bindParam(':nome', $nome);
            $stmtInsert->bindParam(':email', $email);
            $stmtInsert->bindParam(':telefone', $telefone);
            $stmtInsert->bindParam(':secretaria_id', $secretaria_id, PDO::PARAM_INT);
            $stmtInsert->bindParam(':tema_id', $tema_id, PDO::PARAM_INT);
            $stmtInsert->bindParam(':descricao', $descricao);

            $stmtInsert->execute();

            http_response_code(201);
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Manifestação cadastrada com sucesso!",
                "dados" => ["protocolo" => $protocolo]
            ]);
            break;

        // =========================================================================
        // PUT: Salva a resposta oficial do Administrador
        // =========================================================================
        case 'PUT':
            $dados = json_decode(file_get_contents("php://input"), true);
            $id = (int)($dados['id'] ?? 0);
            $resposta = trim($dados['resposta'] ?? '');

            if (!$id || empty($resposta)) {
                http_response_code(400);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "ID e texto da resposta são obrigatórios."
                ]);
                exit;
            }

            // Calcula a diferença de dias para atendimento
            $sqlCalc = "UPDATE manifestacoes 
                        SET resposta = :resposta, 
                            status = 'Respondida', 
                            data_resposta = NOW(),
                            dias_atendimento = DATEDIFF(NOW(), data_criacao)
                        WHERE id = :id";

            $stmtUpdate = $db->prepare($sqlCalc);
            $stmtUpdate->bindParam(':resposta', $resposta);
            $stmtUpdate->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtUpdate->execute();

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Resposta gravada com sucesso!"
            ]);
            break;

        // =========================================================================
        // DELETE: Exclui uma manifestação aplicando regras de negócio
        // =========================================================================
        case 'DELETE':
            $id = (int)($_GET['id'] ?? 0);

            if (!$id) {
                http_response_code(400);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "ID inválido para exclusão."
                ]);
                exit;
            }

            // Regra de exclusão da rubrica: Checar status antes de excluir
            $stmtCheck = $db->prepare("SELECT status FROM manifestacoes WHERE id = :id");
            $stmtCheck->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtCheck->execute();
            $item = $stmtCheck->fetch();

            if (!$item) {
                http_response_code(444);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Reclamação não encontrada."
                ]);
                exit;
            }

            if ($item['status'] === 'Respondida') {
                http_response_code(400);
                echo json_encode([
                    "sucesso" => false,
                    "mensagem" => "Regra de exclusão: Esta reclamação já foi respondida e não pode ser excluída do histórico oficial por auditoria."
                ]);
                exit;
            }

            // Executa a exclusão física se o item for 'Pendente'
            $stmtDelete = $db->prepare("DELETE FROM manifestacoes WHERE id = :id");
            $stmtDelete->bindParam(':id', $id, PDO::PARAM_INT);
            $stmtDelete->execute();

            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Reclamação excluída com sucesso."
            ]);
            break;

        default:
            http_response_code(405);
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Método HTTP não permitido."
            ]);
            break;
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        "sucesso" => false,
        "mensagem" => "Erro de Banco de Dados: " . $e->getMessage()
    ]);
}