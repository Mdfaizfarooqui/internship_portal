<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Project.php';

class ProjectController {

    private $db;
    private $project;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->project = new Project($this->db);
    }

    // Create Project
    public function create() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->name)) {
            $this->project->user_id = $userId;
            $this->project->name = $data->name;
            $this->project->description = $data->description ?? "";
            $this->project->technologies = $data->technologies ?? "";
            $this->project->link = $data->link ?? "";

            if ($this->project->create()) {
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Project created successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to create project."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and name are required."));
        }
    }

    // Get Projects by User
    public function getByUser() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();

        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $projects = $this->project->getByUserId($userId);
        echo json_encode(array("success" => true, "projects" => $projects));
    }

    // Update Project
    public function update() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id) && !empty($userId)) {
            $this->project->id = $data->id;
            $this->project->user_id = $userId;
            $this->project->name = $data->name ?? $this->project->name;
            $this->project->description = $data->description ?? "";
            $this->project->technologies = $data->technologies ?? "";
            $this->project->link = $data->link ?? "";

            if ($this->project->update()) {
                echo json_encode(array("success" => true, "message" => "Project updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update project."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "ID and User ID are required."));
        }
    }

    // Delete Project
    public function delete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Project ID is required."));
            return;
        }

        if ($this->project->delete($id)) {
            echo json_encode(array("success" => true, "message" => "Project deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete project."));
        }
    }
}
?>
