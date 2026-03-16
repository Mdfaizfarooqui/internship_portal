<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/SavedInternship.php';

class SavedInternshipController {
    
    private $db;
    private $savedInternship;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->savedInternship = new SavedInternship($this->db);
    }

    // Save an internship
    public function save() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->internship_id)) {
            if ($this->savedInternship->save($userId, $data->internship_id)) {
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Internship saved successfully."));
            } else {
                http_response_code(409);
                echo json_encode(array("success" => false, "message" => "Internship already saved."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and Internship ID are required."));
        }
    }

    // Unsave an internship
    public function unsave() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->internship_id)) {
            if ($this->savedInternship->unsave($userId, $data->internship_id)) {
                echo json_encode(array("success" => true, "message" => "Internship removed from saved list."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to remove internship."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and Internship ID are required."));
        }
    }

    // Get saved internships by user
    public function getByUser() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $internships = $this->savedInternship->getByUserId($userId);
        echo json_encode(array("success" => true, "saved_internships" => $internships));
    }

    // Check if internship is saved
    public function isSaved() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $internshipId = isset($_GET['internshipId']) ? $_GET['internshipId'] : null;
        
        if (!$userId || !$internshipId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and Internship ID are required."));
            return;
        }

        $isSaved = $this->savedInternship->isSaved($userId, $internshipId);
        echo json_encode(array("success" => true, "is_saved" => $isSaved));
    }
}
?>
