<?php
include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

$sql = "CREATE TABLE IF NOT EXISTS projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    technologies VARCHAR(255),
    link VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
)";

try {
    $db->exec($sql);
    echo "Projects table created successfully.\n";
} catch(PDOException $e) {
    echo "Error creating table: " . $e->getMessage() . "\n";
}
?>
