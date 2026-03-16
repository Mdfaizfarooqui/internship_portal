<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/SkillGapAnalysis.php';

class SkillGapController {
    
    private $db;
    private $skillGap;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->skillGap = new SkillGapAnalysis($this->db);
    }

    // Analyze skill gap
    public function analyze() {
        // Authenticate request
        include_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();

        if (!$user_id) {
            http_response_code(401);
            echo json_encode(["message" => "Valid authentication required."]);
            return;
        }

        $data = json_decode(file_get_contents("php://input"));

        if (!empty($data->role)) {
            $result = $this->skillGap->analyze($user_id, $data->role);

            if ($result) {
                http_response_code(201);
                echo json_encode(array("success" => true, "analysis" => $result));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to perform skill gap analysis. Or matching job role not found."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Target Job Role is required."));
        }
    }

    // Get existing analysis
    public function getAnalysis() {
        // Authenticate request
        include_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();

        if (!$user_id) {
            http_response_code(401);
            echo json_encode(["message" => "Valid authentication required."]);
            return;
        }

        $role = isset($_GET['role']) ? $_GET['role'] : null;
        
        if (!$role) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Target Job Role is required."));
            return;
        }

        $analysis = $this->skillGap->getByUserAndRole($user_id, $role);
        
        if ($analysis) {
            echo json_encode(array("success" => true, "analysis" => $analysis));
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "No analysis found for this role."));
        }
    }
}
?>
