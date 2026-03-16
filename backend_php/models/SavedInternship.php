<?php
class SavedInternship {
    private $conn;
    private $table_name = "saved_internships";

    public $id;
    public $user_id;
    public $internship_id;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Save an internship
    function save($userId, $internshipId) {
        // Check if already saved
        if ($this->isSaved($userId, $internshipId)) {
            return false;
        }

        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    internship_id = :internship_id";

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":internship_id", $internshipId);

        if ($stmt->execute()) {
            return true;
        }

        return false;
    }

    // Unsave an internship
    function unsave($userId, $internshipId) {
        $query = "DELETE FROM " . $this->table_name . " 
                  WHERE user_id = :user_id AND internship_id = :internship_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":internship_id", $internshipId);

        return $stmt->execute();
    }

    // Get saved internships by user ID
    function getByUserId($userId) {
        $query = "SELECT s.id as saved_id, s.saved_at, i.*
                  FROM " . $this->table_name . " s
                  LEFT JOIN internships i ON s.internship_id = i.id
                  WHERE s.user_id = :user_id 
                  ORDER BY s.saved_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        $internships = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Fetch skills for this internship
            $skillQuery = "SELECT skill_name FROM internship_skills WHERE internship_id = :id";
            $skillStmt = $this->conn->prepare($skillQuery);
            $skillStmt->bindParam(":id", $row['id']);
            $skillStmt->execute();
            $skills = $skillStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $row['requiredSkills'] = $skills;
            array_push($internships, $row);
        }

        return $internships;
    }

    // Check if internship is saved
    function isSaved($userId, $internshipId) {
        $query = "SELECT id FROM " . $this->table_name . " 
                  WHERE user_id = :user_id AND internship_id = :internship_id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":internship_id", $internshipId);
        $stmt->execute();

        return $stmt->rowCount() > 0;
    }
}
?>
