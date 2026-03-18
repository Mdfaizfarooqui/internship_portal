<?php
class Database {
    private $host;
    private $db_name;
    private $username;
    private $password;
    public $conn;

    public function __construct() {
        // Read from environment variables (set in Render dashboard)
        // Falls back to local XAMPP defaults for development
        $this->host     = getenv('DB_HOST')     ?: 'localhost';
        $this->db_name  = getenv('DB_NAME')     ?: 'internship_portal';
        $this->username = getenv('DB_USERNAME') ?: 'root';
        $this->password = getenv('DB_PASSWORD') ?: '';
    }

    public function getConnection() {
        $this->conn = null;

        try {
            // Support custom ports for cloud databases like Aiven
            $port = 3306;
            $host = $this->host;
            
            if (strpos($this->host, ':') !== false) {
                $parts = explode(':', $this->host);
                $host = $parts[0];
                $port = $parts[1];
            } else {
                $env_port = getenv('DB_PORT');
                if ($env_port) $port = $env_port;
            }

            $dsn = "mysql:host=" . $host . ";port=" . $port . ";dbname=" . $this->db_name . ";charset=utf8";
            $this->conn = new PDO($dsn, $this->username, $this->password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
        } catch(PDOException $exception) {
            http_response_code(503);
            echo json_encode(["error" => "Database connection failed: " . $exception->getMessage()]);
            exit;
        }

        return $this->conn;
    }
}
?>
