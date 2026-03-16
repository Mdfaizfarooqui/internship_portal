<?php
class Resume {
    private $conn;
    private $table_name = "resumes";

    public $id;
    public $user_id;
    public $title;
    public $content;
    public $file_path;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create resume
    function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    title = :title,
                    content = :content,
                    file_path = :file_path";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->content = htmlspecialchars(strip_tags($this->content));

        // Bind
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":content", $this->content);
        $stmt->bindParam(":file_path", $this->file_path);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Get resumes by user ID
    function getByUserId($userId) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  ORDER BY created_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get resume by ID
    function getById($id) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE id = :id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Update resume
    function update() {
        $query = "UPDATE " . $this->table_name . "
                SET title = :title,
                    content = :content,
                    file_path = :file_path
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->content = htmlspecialchars(strip_tags($this->content));

        // Bind
        $stmt->bindParam(":title", $this->title);
        $stmt->bindParam(":content", $this->content);
        $stmt->bindParam(":file_path", $this->file_path);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Delete resume
    function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }
}
?>
