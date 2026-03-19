<?php
header("Content-Type: text/plain");
require_once __DIR__ . '/config/Database.php';

echo "=========================================\n";
echo "   Cloud Database Initialization Script\n";
echo "=========================================\n\n";

try {
    $database = new Database();
    $db = $database->getConnection();
    
    if (!$db) {
        die("Failed to connect to the database. Check your DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD environment variables.\n");
    }
    
    echo "1. Successfully connected to the database!\n";
    
    $sqlFile = __DIR__ . '/database.sql';
    if (!file_exists($sqlFile)) {
        die("Error: database.sql not found at $sqlFile\n");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // We remove CREATE DATABASE and USE statements because managed cloud DBs (like Aiven) 
    // usually don't give you permission to create new databases or change the active one dynamically this way.
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    echo "2. Applying database.sql schema...\n";
    foreach ($statements as $statement) {
        if (!empty($statement) && !preg_match('/^(CREATE DATABASE|USE)/i', $statement)) {
            try {
                $db->exec($statement);
            } catch (PDOException $e) {
                // Ignore "Table already exists" or "Duplicate entry" warnings to keep output clean
                if (strpos($e->getMessage(), 'already exists') === false && 
                    strpos($e->getMessage(), 'Duplicate entry') === false) {
                    echo "   [Warning] " . $e->getMessage() . "\n";
                }
            }
        }
    }
    echo "   Schema applied successfully!\n\n";
    
    echo "3. Running additional migrations...\n";
    $migrations = [
        'update_db.php', 
        'update_resume_db.php', 
        'update_scores_table.php'
    ];
    
    foreach ($migrations as $migration) {
        $path = __DIR__ . '/' . $migration;
        if (file_exists($path)) {
            echo "   Executing $migration...\n";
            // Read file, strip PHP tags, run it in this context
            $code = file_get_contents($path);
            $code = str_replace('<?php', '', $code);
            $code = str_replace('?>', '', $code);
            // Replace the include Database.php part in the migration so it doesn't cause redeclaration errors
            $code = preg_replace('/include_once.*Database\.php.*/', '', $code);
            
            try {
                eval($code);
            } catch (Exception $e) {
                echo "   [Error] in $migration: " . $e->getMessage() . "\n";
            }
        }
    }
    
    echo "\n=========================================\n";
    echo "SUCCESS: Your database is fully set up!\n";
    echo "You can now sign up and use the portal.\n";
    echo "Note: For security reasons, you should delete this file (init_cloud_db.php) after running it once.\n";
    echo "=========================================\n";
    
} catch (Exception $e) {
    echo "\nFATAL ERROR: " . $e->getMessage() . "\n";
}
?>
