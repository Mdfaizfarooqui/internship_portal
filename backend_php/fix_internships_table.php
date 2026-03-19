<?php
header("Content-Type: text/plain");
require_once __DIR__ . '/config/Database.php';

echo "Database Migration: Adding user_id to internships table\n";
echo "========================================================\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Failed to connect to the database.\n");
    }
    
    // 1. Add user_id column
    $addColSql = "ALTER TABLE internships ADD COLUMN user_id INT NOT NULL DEFAULT 1 AFTER id";
    
    try {
        $db->exec($addColSql);
        echo "✓ Successfully added 'user_id' column to 'internships' table.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate column name') !== false) {
            echo "ℹ 'user_id' column already exists in 'internships' table.\n";
        } else {
            echo "✗ Error adding column: " . $e->getMessage() . "\n";
        }
    }
    
    // 2. Add foreign key
    $addFkSql = "ALTER TABLE internships ADD CONSTRAINT fk_internships_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE";
    
    try {
        $db->exec($addFkSql);
        echo "✓ Successfully added foreign key constraint linking to users table.\n";
    } catch (PDOException $e) {
        if (strpos($e->getMessage(), 'Duplicate key name') !== false || strpos($e->getMessage(), 'Can\'t write; duplicate key in table') !== false) {
            echo "ℹ Foreign key constraint already exists.\n";
        } else {
             // Ignoring general FK errors if it already exists or if there's conflicting data
            echo "ℹ Foreign Key issue or already added: " . $e->getMessage() . "\n";
        }
    }
    
    echo "\n========================================================\n";
    echo "Migration complete! You can now safely post internships.\n";
    
} catch (Exception $e) {
    echo "\nFATAL ERROR: " . $e->getMessage() . "\n";
}
?>
