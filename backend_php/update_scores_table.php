<?php
include_once __DIR__ . '/config/Database.php';

$database = new Database();
$db = $database->getConnection();

$sql = "ALTER TABLE resume_scores 
        ADD COLUMN strengths TEXT,
        ADD COLUMN improvements TEXT";

try {
    $db->exec($sql);
    echo "resume_scores table updated successfully.\n";
} catch (PDOException $e) {
    if (strpos($e->getMessage(), "Duplicate column name") !== false) {
        echo "Columns already exist.\n";
    } else {
        echo "Error updating table: " . $e->getMessage() . "\n";
    }
}
?>
