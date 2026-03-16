<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/UserSkill.php';

class SkillController {
    
    private $db;
    private $skill;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->skill = new UserSkill($this->db);
    }

    // Create skill
    public function create() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->skill_name)) {
            $this->skill->user_id = $userId;
            $this->skill->skill_name = $data->skill_name;
            $this->skill->proficiency_level = $data->proficiency_level ?? 'Beginner';

            if ($this->skill->create()) {
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Skill added successfully.", "id" => $this->skill->id));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to add skill. Skill may already exist."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and skill name are required."));
        }
    }

    // Get skills by user
    public function getByUser() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        
        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $skills = $this->skill->getByUserId($userId);
        echo json_encode(array("success" => true, "skills" => $skills));
    }

    // Update skill
    public function update() {
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->id)) {
            $this->skill->id = $data->id;
            $this->skill->skill_name = $data->skill_name;
            $this->skill->proficiency_level = $data->proficiency_level;

            if ($this->skill->update()) {
                echo json_encode(array("success" => true, "message" => "Skill updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update skill."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Skill ID is required."));
        }
    }

    // Delete skill
    public function delete() {
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Skill ID is required."));
            return;
        }

        if ($this->skill->delete($id)) {
            echo json_encode(array("success" => true, "message" => "Skill deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete skill."));
        }
    }
}
?>
