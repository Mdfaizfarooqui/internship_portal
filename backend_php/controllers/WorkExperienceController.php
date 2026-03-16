<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/WorkExperience.php';

class WorkExperienceController {
    
    private $db;
    private $experience;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->experience = new WorkExperience($this->db);
    }

    // Create work experience entry
    public function create() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->company) && !empty($data->position)) {
            $this->experience->user_id = $userId;
            $this->experience->company = $data->company;
            $this->experience->position = $data->position;
            $this->experience->description = $data->description ?? "";
            $this->experience->start_date = $data->start_date;
            $this->experience->end_date = $data->end_date ?? null;
            $this->experience->is_current = $data->is_current ?? false;

            if ($this->experience->create()) {
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Work experience added successfully.", "id" => $this->experience->id));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to add work experience."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID, company, and position are required."));
        }
    }

    // Get work experience by user
    public function getByUser() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $experience = $this->experience->getByUserId($userId);
        echo json_encode(array("success" => true, "experience" => $experience));
    }

    // Update work experience entry
    public function update() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id)) {
            $this->experience->id = $data->id;
            $this->experience->company = $data->company;
            $this->experience->position = $data->position;
            $this->experience->description = $data->description ?? "";
            $this->experience->start_date = $data->start_date;
            $this->experience->end_date = $data->end_date ?? null;
            $this->experience->is_current = $data->is_current ?? false;

            if ($this->experience->update()) {
                echo json_encode(array("success" => true, "message" => "Work experience updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update work experience."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Work experience ID is required."));
        }
    }

    // Delete work experience entry
    public function delete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Work experience ID is required."));
            return;
        }

        if ($this->experience->delete($id)) {
            echo json_encode(array("success" => true, "message" => "Work experience deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete work experience."));
        }
    }
}
?>
