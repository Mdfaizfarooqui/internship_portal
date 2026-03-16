<?php
class Education {
    private $conn;
    private $table_name = "education";

    public $id;
    public $user_id;
    public $degree;
    public $institution;
    public $field_of_study;
    public $start_date;
    public $graduation_date;
    public $gpa;
    public $description;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create education entry
    function create() {
        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    degree = :degree,
                    institution = :institution,
                    field_of_study = :field_of_study,
                    start_date = :start_date,
                    graduation_date = :graduation_date,
                    gpa = :gpa,
                    description = :description";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->degree = htmlspecialchars(strip_tags($this->degree));
        $this->institution = htmlspecialchars(strip_tags($this->institution));
        $this->field_of_study = htmlspecialchars(strip_tags($this->field_of_study));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":degree", $this->degree);
        $stmt->bindParam(":institution", $this->institution);
        $stmt->bindParam(":field_of_study", $this->field_of_study);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":graduation_date", $this->graduation_date);
        $stmt->bindParam(":gpa", $this->gpa);
        $stmt->bindParam(":description", $this->description);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            return true;
        }

        return false;
    }

    // Get education by user ID
    function getByUserId($userId) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id 
                  ORDER BY graduation_date DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->execute();

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Update education entry
    function update() {
        $query = "UPDATE " . $this->table_name . "
                SET degree = :degree,
                    institution = :institution,
                    field_of_study = :field_of_study,
                    start_date = :start_date,
                    graduation_date = :graduation_date,
                    gpa = :gpa,
                    description = :description
                WHERE id = :id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->degree = htmlspecialchars(strip_tags($this->degree));
        $this->institution = htmlspecialchars(strip_tags($this->institution));
        $this->field_of_study = htmlspecialchars(strip_tags($this->field_of_study));
        $this->description = htmlspecialchars(strip_tags($this->description));

        // Bind
        $stmt->bindParam(":degree", $this->degree);
        $stmt->bindParam(":institution", $this->institution);
        $stmt->bindParam(":field_of_study", $this->field_of_study);
        $stmt->bindParam(":start_date", $this->start_date);
        $stmt->bindParam(":graduation_date", $this->graduation_date);
        $stmt->bindParam(":gpa", $this->gpa);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":id", $this->id);

        return $stmt->execute();
    }

    // Delete education entry
    function delete($id) {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);

        return $stmt->execute();
    }
    // Delete education for user
    function deleteByUser($userId) {
        $query = "DELETE FROM " . $this->table_name . " WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        return $stmt->execute();
    }
}
?>
