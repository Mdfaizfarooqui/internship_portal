<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include_once 'config/database.php';

$database = new Database();
$db = $database->getConnection();

if (!$db) {
    echo json_encode(["success" => false, "message" => "Database connection failed"]);
    exit;
}

$queries = [
    // Ensure resumes table can act as a parent safely
    "CREATE TABLE IF NOT EXISTS resumes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT UNIQUE NOT NULL,
        summary TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )",
    
    // Education Table
    "CREATE TABLE IF NOT EXISTS education (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        degree VARCHAR(255) NOT NULL,
        institute VARCHAR(255) NOT NULL,
        year INT,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )",

    // Skills Table
    "CREATE TABLE IF NOT EXISTS skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )",

    // Projects Table
    "CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        tech_stack VARCHAR(255),
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )",

    // Experience Table
    "CREATE TABLE IF NOT EXISTS experience (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        company VARCHAR(255) NOT NULL,
        role VARCHAR(255) NOT NULL,
        duration VARCHAR(100),
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )",

    // Certifications Table
    "CREATE TABLE IF NOT EXISTS certifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        resume_id INT NOT NULL,
        certificate_name VARCHAR(255) NOT NULL,
        FOREIGN KEY (resume_id) REFERENCES resumes(id) ON DELETE CASCADE
    )",

    // Job Roles Table
    "CREATE TABLE IF NOT EXISTS job_roles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_name VARCHAR(255) UNIQUE NOT NULL
    )",

    // Job Required Skills Table
    "CREATE TABLE IF NOT EXISTS job_required_skills (
        id INT AUTO_INCREMENT PRIMARY KEY,
        role_id INT NOT NULL,
        skill_name VARCHAR(100) NOT NULL,
        FOREIGN KEY (role_id) REFERENCES job_roles(id) ON DELETE CASCADE
    )"
];

$success = true;
$errors = [];

foreach ($queries as $query) {
    try {
        $db->exec($query);
    } catch (PDOException $e) {
        $success = false;
        $errors[] = $e->getMessage();
    }
}

// Seed basic Job roles for the Skill Gap analysis
try {
    $db->exec("INSERT IGNORE INTO job_roles (role_name) VALUES ('Software Engineer'), ('Frontend Developer'), ('Backend Developer')");
    
    // Seed required skills for Software Engineer (ID 1)
    $db->exec("INSERT IGNORE INTO job_required_skills (role_id, skill_name) VALUES (1, 'Java'), (1, 'Spring Boot'), (1, 'MySQL')");
    // Seed Frontend Developer (ID 2)
    $db->exec("INSERT IGNORE INTO job_required_skills (role_id, skill_name) VALUES (2, 'React'), (2, 'JavaScript'), (2, 'CSS')");
    // Seed Backend Developer (ID 3)
    $db->exec("INSERT IGNORE INTO job_required_skills (role_id, skill_name) VALUES (3, 'PHP'), (3, 'MySQL'), (3, 'Node.js')");
} catch (PDOException $e) {
    $errors[] = "Seeding failed: " . $e->getMessage();
}

if ($success) {
    echo json_encode(["success" => true, "message" => "Advanced Resume Database tables created and seeded successfully."]);
} else {
    echo json_encode(["success" => false, "message" => "Errors occurred during setup", "errors" => $errors]);
}
?>
