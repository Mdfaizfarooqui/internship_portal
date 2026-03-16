<?php
class User {
    private $conn;
    private $table_name = "users";

    // Object properties
    public $id;
    public $full_name;
    public $email;
    public $password;
    public $role;
    public $bio;
    public $location;
    public $phone;
    public $github;
    public $linkedin;
    public $profile_picture;
    public $created_at;
    public $updated_at;
    public $otp;
    public $otp_expiry;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Get user by ID
    function getById($id) {
        $query = "SELECT id, full_name, email, role, bio, location, phone, github, linkedin, profile_picture, created_at, updated_at 
                  FROM " . $this->table_name . " 
                  WHERE id = :id LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Get complete profile with skills, education, and experience
    function getProfile($id) {
        $user = $this->getById($id);
        
        if (!$user) {
            return null;
        }

        // Get user skills
        $skillQuery = "SELECT id, skill_name, proficiency_level FROM user_skills WHERE user_id = :id";
        $skillStmt = $this->conn->prepare($skillQuery);
        $skillStmt->bindParam(":id", $id);
        $skillStmt->execute();
        $user['skills'] = $skillStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get education
        $eduQuery = "SELECT * FROM education WHERE user_id = :id ORDER BY graduation_date DESC";
        $eduStmt = $this->conn->prepare($eduQuery);
        $eduStmt->bindParam(":id", $id);
        $eduStmt->execute();
        $user['education'] = $eduStmt->fetchAll(PDO::FETCH_ASSOC);

        // Get work experience
        $expQuery = "SELECT * FROM work_experience WHERE user_id = :id ORDER BY start_date DESC";
        $expStmt = $this->conn->prepare($expQuery);
        $expStmt->bindParam(":id", $id);
        $expStmt->execute();
        $user['experience'] = $expStmt->fetchAll(PDO::FETCH_ASSOC);

        return $user;
    }

    // Update user profile
    function update() {
        $query = "UPDATE " . $this->table_name . "
                SET full_name = :full_name,
                    bio = :bio,
                    location = :location,
                    phone = :phone,
                    github = :github,
                    linkedin = :linkedin
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->full_name = htmlspecialchars(strip_tags($this->full_name));
        $this->bio = htmlspecialchars(strip_tags($this->bio));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->phone = htmlspecialchars(strip_tags($this->phone));
        $this->github = htmlspecialchars(strip_tags($this->github));
        $this->linkedin = htmlspecialchars(strip_tags($this->linkedin));

        // Bind
        $stmt->bindParam(":full_name", $this->full_name);
        $stmt->bindParam(":bio", $this->bio);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":phone", $this->phone);
        $stmt->bindParam(":github", $this->github);
        $stmt->bindParam(":linkedin", $this->linkedin);
        $stmt->bindParam(":id", $this->id);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Update profile picture
    function updateProfilePicture($path) {
        $query = "UPDATE " . $this->table_name . "
                SET profile_picture = :profile_picture
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":profile_picture", $path);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Get user by Email
    function getByEmail($email) {
        $query = "SELECT id, full_name, email FROM " . $this->table_name . " WHERE email = :email LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":email", $email);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Set OTP and Expiry
    function setOtp($otp, $expiry) {
        $query = "UPDATE " . $this->table_name . "
                SET otp = :otp,
                    otp_expiry = :otp_expiry
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":otp", $otp);
        $stmt->bindParam(":otp_expiry", $expiry);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Verify OTP
    function verifyOtp($otp) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE id = :id 
                  AND otp = :otp 
                  AND otp_expiry > NOW()";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":otp", $otp);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }

    // Update Password
    function updatePassword($newPassword) {
        // Hash password
        $password_hash = password_hash($newPassword, PASSWORD_BCRYPT);

        $query = "UPDATE " . $this->table_name . "
                SET password = :password,
                    otp = NULL,
                    otp_expiry = NULL
                WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":password", $password_hash);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }
}
?>
