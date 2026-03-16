<?php
class Application {
    private $conn;
    private $table_name = "applications";

    public $id;
    public $user_id;
    public $internship_id;
    public $resume_id;
    public $status;
    public $applied_at;
    public $notes;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create application
    function create() {
        // First check if user already applied
        if ($this->checkExisting($this->user_id, $this->internship_id)) {
            return false;
        }

        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    internship_id = :internship_id,
                    resume_id = :resume_id,
                    status = :status,
                    notes = :notes";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->notes = htmlspecialchars(strip_tags($this->notes));
        $this->status = $this->status ?? 'Pending';

        // Bind
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":internship_id", $this->internship_id);
        $stmt->bindParam(":resume_id", $this->resume_id);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":notes", $this->notes);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Get applications by user ID
    function getByUserId($userId) {
        $query = "SELECT a.*, i.company, i.position, i.location, i.type, i.stipend
                  FROM " . $this->table_name . " a
                  LEFT JOIN internships i ON a.internship_id = i.id
                  WHERE a.user_id = :user_id 
                  ORDER BY a.applied_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Get applications by internship ID
    function getByInternshipId($internshipId) {
        $query = "SELECT a.*, u.full_name, u.email, u.phone, r.file_path as resume_url
                  FROM " . $this->table_name . " a
                  LEFT JOIN users u ON a.user_id = u.id
                  LEFT JOIN resumes r ON a.resume_id = r.id
                  WHERE a.internship_id = :internship_id 
                  ORDER BY a.applied_at DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":internship_id", $internshipId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update application status
    function updateStatus($id, $status) {
        $query = "UPDATE " . $this->table_name . "
                SET status = :status
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);
        $status = htmlspecialchars(strip_tags($status));
        
        $stmt->bindParam(":status", $status);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }

    // Check if user already applied
    function checkExisting($userId, $internshipId) {
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
