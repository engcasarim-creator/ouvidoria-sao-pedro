<?php
class Database {
    private string $host = "localhost";
    private string $db_name = "ouvidoria_sao_pedro";
    private string $username = "root";
    private string $password = "";
    private ?PDO $conn = null;

    /**
     * Estabelece a conexão PDO com o MariaDB/MySQL do XAMPP
     */
    public function getConnection(): ?PDO {
        $this->conn = null;

        try {
            $this->conn = new PDO(
                "mysql:host=" . $this->host . ";dbname=" . $this->db_name . ";charset=utf8mb4",
                $this->username,
                $this->password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false
                ]
            );
        } catch (PDOException $exception) {
            // Em ambiente de produção, logar o erro em vez de exibir detalhes sensíveis
            header('Content-Type: application/json; charset=utf-8');
            http_response_code(500);
            echo json_encode([
                "sucesso" => false,
                "mensagem" => "Erro de conexão com o banco de dados: " . $exception->getMessage()
            ]);
            exit;
        }

        return $this->conn;
    }
}