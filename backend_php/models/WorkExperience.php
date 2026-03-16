<?php
class WorkExperience {
    private $conn;
    private $table_name = "work_experience";

    public $id;
    public $user_id;
    public $company;
    public $position;
    public $description;
    public $start_date;
    public $end_date;
    public $is_current;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create work experience entry
    function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    company = :company,
                    position = :position,
                    description = :description,
                    start_date = :start_date,
                    end_date = :end_date,
                    is_current = :is_current";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->company = htmlspecialchars(strip_tags($this->company));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":is_current", $this->is_current);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Get work experience by user ID
    function getByUserId($userId) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  ORDER BY start_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update work experience entry
    function update() {
        $query = "UPDATE " . $this->table_name . "
                SET company = :company,
                    position = :position,
                    description = :description,
                    start_date = :start_date,
                    end_date = :end_date,
                    is_current = :is_current
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->company = htmlspecialchars(strip_tags($this->company));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":end_date", $this->end_date);
        $stmt->bindParam(":is_current", $this->is_current);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Delete work experience entry
    function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }
    // Delete work experience for user
    function deleteByUser($userId) {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        return $stmt->execute();
    }
}
?>
