<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Application.php';

class ApplicationController {
    
    private $db;
    private $application;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->application = new Application($this->db);
    }

    // Create application
    public function create() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->internship_id)) {
            $this->application->user_id = $userId;
            $this->application->internship_id = $data->internship_id;
            $this->application->resume_id = $data->resume_id ?? null;
            $this->application->status = $data->status ?? 'Pending';
            $this->application->notes = $data->notes ?? "";

            if ($this->application->create()) {
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Application submitted successfully.", "id" => $this->application->id));
            } else {
                http_response_code(409);
                echo json_encode(array("success" => false, "message" => "You have already applied to this internship."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and Internship ID are required."));
        }
    }

    // Get applications by user
    public function getByUser() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $applications = $this->application->getByUserId($userId);
        echo json_encode(array("success" => true, "applications" => $applications));
    }

    // Get applications by internship
    public function getByInternship() {
        $internshipId = isset($_GET['internshipId']) ? $_GET['internshipId'] : null;
        
        if (!$internshipId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Internship ID is required."));
            return;
        }

        $applications = $this->application->getByInternshipId($internshipId);
        echo json_encode(array("success" => true, "applications" => $applications));
    }

    // Update application status
    public function updateStatus() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id) && !empty($data->status)) {
            if ($this->application->updateStatus($data->id, $data->status)) {
                echo json_encode(array("success" => true, "message" => "Application status updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update application status."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Application ID and status are required."));
        }
    }
}
?>
