<?php
class Project {
    private $conn;
    private $table_name = "projects";

    public $id;
    public $user_id;
    public $name;
    public $description;
    public $technologies;
    public $link;
    public $created_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create Project
    public function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    user_id = :user_id,
                    name = :name,
                    description = :description,
                    technologies = :technologies,
                    link = :link";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->technologies = htmlspecialchars(strip_tags($this->technologies));
        $this->link = htmlspecialchars(strip_tags($this->link));

        // Bind
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":technologies", $this->technologies);
        $stmt->bindParam(":link", $this->link);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get Projects by User ID
    public function getByUserId($userId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id ORDER BY created_at DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update Project
    public function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    name = :name,
                    description = :description,
                    technologies = :technologies,
                    link = :link
                WHERE id = :id AND user_id = :user_id";

        $stmt = $this->conn->prepare($query);

        $this->name = htmlspecialchars(strip_tags($this->name));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->technologies = htmlspecialchars(strip_tags($this->technologies));
        $this->link = htmlspecialchars(strip_tags($this->link));

        $stmt->bindParam(":name", $this->name);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":technologies", $this->technologies);
        $stmt->bindParam(":link", $this->link);
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete Project
    public function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Delete All Projects for User
    public function deleteByUser($userId) {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);

        if ($stmt->execute()) {
            return true;
        }
        return false;
    }
}
?>
