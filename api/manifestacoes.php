<?php
ini_set('display_errors', 0);
error_reporting(E_ALL);

header('Content-Type: application/json; charset=utf-8');

require_once __DIR__ . '/../config/database.php';

try {
    $database = new Database();
    $db = $database->getConnection();
    $metodo = $_SERVER['REQUEST_METHOD'];

    if ($metodo === 'POST') {
        $tipo = $_POST['tipo_identificacao'] ?? 'anonimo';
        
        $nome = ($tipo === 'identificado' && !empty($_POST['nome'])) ? trim($_POST['nome']) : null;
        $email = ($tipo === 'identificado' && !empty($_POST['email'])) ? trim($_POST['email']) : null;
        $telefone = ($tipo === 'identificado' && !empty($_POST['telefone'])) ? trim($_POST['telefone']) : null;
        
        $secretaria_id = !empty($_POST['secretaria_id']) ? intval($_POST['secretaria_id']) : null;
        $tema_id = !empty($_POST['tema_id']) ? intval($_POST['tema_id']) : null;
        $descricao = !empty($_POST['descricao']) ? trim($_POST['descricao']) : null;

        if (!$secretaria_id || !$tema_id || !$descricao) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "Preencha todos os campos obrigatórios."]);
            exit;
        }

        $protocolo = 'M' . date('Ymd') . '-' . strtoupper(substr(md5(uniqid()), 0, 4));

        $sql = "INSERT INTO manifestacoes (protocolo, tipo, nome, email, telefone, secretaria_id, tema_id, descricao, status) 
                VALUES (:protocolo, :tipo, :nome, :email, :telefone, :secretaria_id, :tema_id, :descricao, 'Pendente')";

        $stmt = $db->prepare($sql);
        $stmt->bindValue(':protocolo', $protocolo);
        $stmt->bindValue(':tipo', $tipo);
        $stmt->bindValue(':nome', $nome, $nome === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':email', $email, $email === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':telefone', $telefone, $telefone === null ? PDO::PARAM_NULL : PDO::PARAM_STR);
        $stmt->bindValue(':secretaria_id', $secretaria_id, PDO::PARAM_INT);
        $stmt->bindValue(':tema_id', $tema_id, PDO::PARAM_INT);
        $stmt->bindValue(':descricao', $descricao);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode([
                "sucesso" => true,
                "mensagem" => "Manifestação cadastrada com sucesso!",
                "dados" => ["protocolo" => $protocolo]
            ]);
        } else {
            throw new Exception("Não foi possível salvar a manifestação.");
        }

    } elseif ($metodo === 'GET') {
        $pagina     = isset($_GET['pagina'])     ? max(1, (int) $_GET['pagina'])      : 1;
$porPagina  = isset($_GET['por_pagina']) ? max(1, (int) $_GET['por_pagina'])  : 10;

// Chamada limpa à procedure: nenhum SQL montado no PHP
$stmt = $db->prepare("CALL sp_listar_manifestacoes(?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([
    $_GET['exibir']        ?? 'ativas',
    !empty($_GET['secretaria_id']) ? (int) $_GET['secretaria_id'] : null,
    !empty($_GET['status'])        ? $_GET['status']              : null,
    !empty($_GET['busca'])         ? $_GET['busca']               : null,
    !empty($_GET['data_inicio'])   ? $_GET['data_inicio']         : null,
    !empty($_GET['data_fim'])      ? $_GET['data_fim']            : null,
    $pagina,
    $porPagina
]);
$resultados = $stmt->fetchAll(PDO::FETCH_ASSOC);
$stmt->closeCursor(); // obrigatório antes de outro CALL na mesma conexão

// Total de páginas vem da segunda procedure
$stmtTotal = $db->prepare("CALL sp_contar_manifestacoes(?, ?, ?, ?, ?, ?)");
$stmtTotal->execute([
    $_GET['exibir']        ?? 'ativas',
    !empty($_GET['secretaria_id']) ? (int) $_GET['secretaria_id'] : null,
    !empty($_GET['status'])        ? $_GET['status']              : null,
    !empty($_GET['busca'])         ? $_GET['busca']               : null,
    !empty($_GET['data_inicio'])   ? $_GET['data_inicio']         : null,
    !empty($_GET['data_fim'])      ? $_GET['data_fim']            : null
]);
$total = (int) ($stmtTotal->fetch(PDO::FETCH_ASSOC)['total_registros'] ?? 0);
$stmtTotal->closeCursor();

echo json_encode([
    "dados"      => $resultados,
    "pagina"     => $pagina,
    "por_pagina" => $porPagina,
    "total"      => $total,
    "paginas"    => (int) ceil($total / $porPagina)
]);

    } elseif ($metodo === 'PUT') {
        $dados = json_decode(file_get_contents("php://input"), true);
        $id = $dados['id'] ?? null;
        $acao = $dados['acao'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "ID é obrigatório."]);
            exit;
        }

        // SE FOR AÇÃO DE ARQUIVAR
        if ($acao === 'arquivar') {
            $sql = "UPDATE manifestacoes SET status = 'Arquivada' WHERE id = :id";
            $stmt = $db->prepare($sql);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);

            if ($stmt->execute()) {
                echo json_encode(["sucesso" => true, "mensagem" => "Manifestação arquivada com sucesso!"]);
            } else {
                throw new Exception("Falha ao arquivar manifestação.");
            }
            exit;
        }

        // SE FOR AÇÃO DE RESPONDER (Exige o campo resposta)
        $resposta = $dados['resposta'] ?? null;
        $canal_resposta = $dados['canal_resposta'] ?? 'Telefone / WhatsApp';

        if (!$resposta) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "A resposta é obrigatória."]);
            exit;
        }

        $sql = "UPDATE manifestacoes SET resposta = :resposta, canal_resposta = :canal_resposta, status = 'Respondida', data_resposta = NOW() WHERE id = :id";
        $stmt = $db->prepare($sql);
        $stmt->bindValue(':resposta', $resposta);
        $stmt->bindValue(':canal_resposta', $canal_resposta);
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            // Dispara e-mail se o canal escolhido for E-mail
            if ($canal_resposta === 'E-mail') {
                $stmtGet = $db->prepare("SELECT email, protocolo, nome FROM manifestacoes WHERE id = :id");
                $stmtGet->bindValue(':id', $id, PDO::PARAM_INT);
                $stmtGet->execute();
                $m = $stmtGet->fetch(PDO::FETCH_ASSOC);

                if ($m && !empty($m['email'])) {
                    $to = $m['email'];
                    $subject = "Ouvidoria Municipal - Resposta ao Protocolo " . $m['protocolo'];
                    $body = "Olá " . ($m['nome'] ?? 'Cidadão') . ",\n\nSua manifestação (Protocolo: {$m['protocolo']}) foi respondida pela Ouvidoria:\n\n\"{$resposta}\"\n\nAtenciosamente,\nOuvidoria Municipal de São Pedro do Paraná";
                    $headers = "From: ouvidoria@saopedrodoparana.pr.gov.br\r\nContent-Type: text/plain; charset=UTF-8";
                    
                    @mail($to, $subject, $body, $headers);
                }
            }

            echo json_encode(["sucesso" => true, "mensagem" => "Resposta gravada com sucesso!"]);
        } else {
            throw new Exception("Falha ao atualizar resposta.");
        }

    } elseif ($metodo === 'DELETE') {
        $id = $_GET['id'] ?? null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["sucesso" => false, "mensagem" => "ID é obrigatório."]);
            exit;
        }

        $stmtCheck = $db->prepare("SELECT status FROM manifestacoes WHERE id = :id");
        $stmtCheck->bindValue(':id', $id, PDO::PARAM_INT);
        $stmtCheck->execute();
        $manifestacao = $stmtCheck->fetch(PDO::FETCH_ASSOC);

        if ($manifestacao && $manifestacao['status'] === 'Respondida') {
            http_response_code(422);
            echo json_encode(["sucesso" => false, "mensagem" => "Regra de Negócio: Não é permitido excluir uma reclamação que já foi respondida."]);
            exit;
        }

        $stmt = $db->prepare("DELETE FROM manifestacoes WHERE id = :id");
        $stmt->bindValue(':id', $id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            echo json_encode(["sucesso" => true, "mensagem" => "Manifestação excluída com sucesso!"]);
        } else {
            throw new Exception("Falha ao excluir.");
        }
    }

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["sucesso" => false, "mensagem" => "Erro de servidor: " . $e->getMessage()]);
}