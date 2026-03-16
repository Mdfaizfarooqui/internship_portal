<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Internship.php';

class InternshipController {
    
    private $db;
    private $internship;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->internship = new Internship($this->db);
    }

    public function create() {
        require_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();
        // Get raw posted data
        $data = json_decode(file_get_contents("php://input"));

        if(
            !empty($data->company) &&
            !empty($data->position)
        ){
            // Set properties
            $this->internship->user_id = $user_id;
            $this->internship->company = $data->company;
            $this->internship->position = $data->position; // Using position as title
            $this->internship->description = $data->description ?? "";
            $this->internship->location = $data->location;
            $this->internship->duration = $data->duration ?? "";
            $this->internship->stipend = $data->stipend ?? "";
            $this->internship->type = $data->type;
            $this->internship->requirements = $data->requirements ?? "";
            $this->internship->responsibilities = $data->responsibilities ?? "";
            $this->internship->deadline = $data->deadline ?? null;
            $this->internship->required_skills = $data->requiredSkills ?? [];

            // Create
            if($this->internship->create()){
                http_response_code(201);
                echo json_encode(array("success" => true, "message" => "Internship created.", "internship" => $this->internship));
            } else{
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to create internship."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Unable to create internship. Data is incomplete."));
        }
    }

    public function getActive() {
        $result = $this->internship->getActive();
        echo json_encode(array("success" => true, "internships" => $result));
    }

    public function getInternship() {
        $id = isset($_GET['id']) ? $_GET['id'] : die();
        
        $result = $this->internship->getSingle($id);

        if ($result) {
            echo json_encode(array("success" => true, "internship" => $result));
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "Internship not found."));
        }
    }

    public function getByRecruiter() {
        require_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();
        $result = $this->internship->getByRecruiter($user_id);
        echo json_encode(array("success" => true, "internships" => $result));
    }

    public function update() {
        require_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();
        $data = json_decode(file_get_contents("php://input"));
        
        $this->internship->id = $data->id;
        $this->internship->user_id = $user_id;

        if(!empty($this->internship->id) && !empty($this->internship->user_id)) {
            $this->internship->company = $data->company;
            $this->internship->position = $data->position;
            $this->internship->description = $data->description ?? "";
            $this->internship->location = $data->location;
            $this->internship->duration = $data->duration ?? "";
            $this->internship->stipend = $data->stipend ?? "";
            $this->internship->type = $data->type;
            $this->internship->requirements = $data->requirements ?? "";
            $this->internship->responsibilities = $data->responsibilities ?? "";
            $this->internship->required_skills = $data->requiredSkills ?? [];

            if($this->internship->update()) {
                http_response_code(200);
                echo json_encode(array("success" => true, "message" => "Internship updated."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update internship."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Unable to update internship. Data is incomplete."));
        }
    }

    public function delete() {
        require_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();
        $id = isset($_GET['id']) ? $_GET['id'] : die();
        
        $this->internship->id = $id;
        $this->internship->user_id = $user_id;

        if($this->internship->delete()) {
            http_response_code(200);
            echo json_encode(array("success" => true, "message" => "Internship deleted."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete internship."));
        }
    }
}
?>
