<?php
class UserSkill {
    private $conn;
    private $table_name = "user_skills";

    public $id;
    public $user_id;
    public $skill_name;
    public $proficiency_level;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new skill
    function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    skill_name = :skill_name,
                    proficiency_level = :proficiency_level";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->skill_name = htmlspecialchars(strip_tags($this->skill_name));
        $this->proficiency_level = htmlspecialchars(strip_tags($this->proficiency_level));

        // Bind
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":skill_name", $this->skill_name);
        $stmt->bindParam(":proficiency_level", $this->proficiency_level);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Get skills by user ID
    function getByUserId($userId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update skill
    function update() {
        $query = "UPDATE " . $this->table_name . "
                SET skill_name = :skill_name,
                    proficiency_level = :proficiency_level
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->skill_name = htmlspecialchars(strip_tags($this->skill_name));
        $this->proficiency_level = htmlspecialchars(strip_tags($this->proficiency_level));

        // Bind
        $stmt->bindParam(":skill_name", $this->skill_name);
        $stmt->bindParam(":proficiency_level", $this->proficiency_level);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Delete skill
    function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }
}
?>
