<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Education.php';

class EducationController {
    
    private $db;
    private $education;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->education = new Education($this->db);
    }

    // Create education entry
    public function create() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->degree) && !empty($data->institution)) {
            $this->education->user_id = $userId;
            $this->education->degree = $data->degree;
            $this->education->institution = $data->institution;
            $this->education->field_of_study = $data->field_of_study ?? "";
            $this->education->start_date = $data->start_date ?? null;
            $this->education->graduation_date = $data->graduation_date ?? null;
            $this->education->gpa = $data->gpa ?? null;
            $this->education->description = $data->description ?? "";

            if ($this->education->create()) {
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Education added successfully.", "id" => $this->education->id));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to add education."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID, degree, and institution are required."));
        }
    }

    // Get education by user
    public function getByUser() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $education = $this->education->getByUserId($userId);
        echo json_encode(array("success" => true, "education" => $education));
    }

    // Update education entry
    public function update() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id)) {
            $this->education->id = $data->id;
            $this->education->degree = $data->degree;
            $this->education->institution = $data->institution;
            $this->education->field_of_study = $data->field_of_study ?? "";
            $this->education->start_date = $data->start_date ?? null;
            $this->education->graduation_date = $data->graduation_date ?? null;
            $this->education->gpa = $data->gpa ?? null;
            $this->education->description = $data->description ?? "";

            if ($this->education->update()) {
                echo json_encode(array("success" => true, "message" => "Education updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update education."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Education ID is required."));
        }
    }

    // Delete education entry
    public function delete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Education ID is required."));
            return;
        }

        if ($this->education->delete($id)) {
            echo json_encode(array("success" => true, "message" => "Education deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete education."));
        }
    }
}
?>
