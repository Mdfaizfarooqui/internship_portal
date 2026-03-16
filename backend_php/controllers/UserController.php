<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/User.php';

class UserController {
    
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    // Get user profile
    public function getProfile() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();

        if (!$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
            return;
        }

        $profile = $this->user->getProfile($userId);

        if ($profile) {
            echo json_encode(array("success" => true, "profile" => $profile));
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "User not found."));
        }
    }

    // Update user profile
    public function updateProfile() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId)) {
            $this->user->id = $userId;
            $this->user->full_name = $data->full_name ?? "";
            $this->user->bio = $data->bio ?? "";
            $this->user->location = $data->location ?? "";
            $this->user->phone = $data->phone ?? "";
            $this->user->github = $data->github ?? "";
            $this->user->linkedin = $data->linkedin ?? "";

            if ($this->user->update()) {
                echo json_encode(array("success" => true, "message" => "Profile updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update profile."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID is required."));
        }
    }

    // Upload profile picture
    public function uploadProfilePicture() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        // This is a placeholder for file upload functionality
        // In a real implementation, you would handle file upload here
        $data = json_decode(file_get_contents("php://input"));

        if (!empty($userId) && !empty($data->profile_picture)) {
            $this->user->id = $userId;
            
            if ($this->user->updateProfilePicture($data->profile_picture)) {
                echo json_encode(array("success" => true, "message" => "Profile picture updated successfully."));
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to update profile picture."));
            }
        } else {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "User ID and profile picture are required."));
        }
    }
}
?>
