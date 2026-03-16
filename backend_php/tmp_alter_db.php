<?php
include_once __DIR__ . '/config/database.php';
$database = new Database();
$db = $database->getConnection();
try {
    $db->exec("ALTER TABLE resumes ADD COLUMN title VARCHAR(255)");
    $db->exec("ALTER TABLE resumes ADD COLUMN file_path VARCHAR(255)");
    $db->exec("ALTER TABLE resumes ADD COLUMN content TEXT");
    echo "Columns added successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
        echo "Columns already exist.\n";
    } else {
        echo "Error: " . $e->getMessage() . "\n";
    }
}
?>
