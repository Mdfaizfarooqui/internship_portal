<?php
/**
 * Database Setup Script
 * This script will create the database and all tables from database.sql
 */

$host = "localhost";
$username = "root";
$password = "";
$dbname = "internship_portal";

try {
    // Connect without DB to create it
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    echo "Connected to MySQL successfully.\n";
    
    // Create database
    $pdo->exec("CREATE DATABASE IF NOT EXISTS $dbname");
    echo "Database '$dbname' created/verified.\n";
    
    // Use the database
    $pdo->exec("USE $dbname");
    
    // Read and execute SQL file
    $sqlFile = __DIR__ . '/database.sql';
    
    if (!file_exists($sqlFile)) {
        die("Error: database.sql file not found!\n");
    }
    
    $sql = file_get_contents($sqlFile);
    
    // Split by semicolon and execute each statement
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    foreach ($statements as $statement) {
        if (!empty($statement) && !preg_match('/^(CREATE DATABASE|USE)/i', $statement)) {
            try {
                $pdo->exec($statement);
            } catch (PDOException $e) {
                // Ignore duplicate entry errors for sample data
                if (strpos($e->getMessage(), 'Duplicate entry') === false) {
                    echo "Warning: " . $e->getMessage() . "\n";
                }
            }
        }
    }
    
    echo "\n✓ Database setup completed successfully!\n";
    echo "✓ All tables created\n";
    echo "✓ Sample data inserted\n\n";
    
    echo "You can now start the server with:\n";
    echo "  php -S localhost:8000\n\n";
    
    echo "Test credentials:\n";
    echo "  Email: john@example.com\n";
    echo "  Password: password\n";
    
} catch (PDOException $e) {
    die("Database Error: " . $e->getMessage() . "\n");
}
?>
