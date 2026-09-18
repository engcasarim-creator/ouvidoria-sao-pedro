<?php
class Database {
    private string $host;
    private string $db_name;
    private string $username;
    private string $password;
    private ?PDO $conn = null;

    public function __construct() {
        // Detecta se está rodando no XAMPP local ou no InfinityFree,
        // sem precisar trocar nada à mão antes da apresentação.
        $servidorLocal = in_array($_SERVER['SERVER_NAME'] ?? 'localhost', ['localhost', '127.0.0.1'], true);

        if ($servidorLocal) {
            $this->host     = '127.0.0.1';
            $this->db_name  = 'ouvidoria_sao_pedro';
            $this->username = 'root';
            $this->password = '';
        } else {
            $this->host     = 'sql209.infinityfree.com';
            $this->db_name  = 'if0_42946702_ouvidoria';
            $this->username = 'if0_42946702';
            $this->password = 'BmXsD5y8oMjc';
        }
    }

    /**
     * Estabelece a conexão PDO com o MariaDB/MySQL (local ou remoto)
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
