<?php
class Internship {
    private $conn;
    private $table_name = "internships";

    // Object properties
    public $id;
    public $user_id;
    public $company;
    public $position;
    public $description;
    public $location;
    public $duration;
    public $stipend;
    public $type;
    public $requirements;
    public $responsibilities;
    public $posted_date;
    public $deadline;
    public $status;
    public $required_skills; // array

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create new internship
    function create() {
        // Query to insert record
        $query = "INSERT INTO " . $this->table_name . "
                SET
                    user_id=:user_id,
                    company=:company,
                    position=:position,
                    description=:description,
                    location=:location,
                    duration=:duration,
                    stipend=:stipend,
                    type=:type,
                    requirements=:requirements,
                    responsibilities=:responsibilities,
                    deadline=:deadline,
                    status=:status,
                    posted_date=:posted_date";

        $stmt = $this->conn->prepare($query);

        // Sanitize and Bind
        $this->user_id = htmlspecialchars(strip_tags($this->user_id ?? 0));
        $this->company = htmlspecialchars(strip_tags($this->company));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->duration = htmlspecialchars(strip_tags($this->duration));
        $this->stipend = htmlspecialchars(strip_tags($this->stipend));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->requirements = htmlspecialchars(strip_tags($this->requirements));
        $this->responsibilities = htmlspecialchars(strip_tags($this->responsibilities));
        $this->status = "Active";
        $this->posted_date = date('Y-m-d H:i:s');

        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":duration", $this->duration);
        $stmt->bindParam(":stipend", $this->stipend);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":requirements", $this->requirements);
        $stmt->bindParam(":responsibilities", $this->responsibilities);
        $stmt->bindParam(":deadline", $this->deadline);
        $stmt->bindParam(":status", $this->status);
        $stmt->bindParam(":posted_date", $this->posted_date);

        if ($stmt->execute()) {
            $this->id = $this->conn->lastInsertId();
            
            // Handle Skills
            if (!empty($this->required_skills) && is_array($this->required_skills)) {
                $skillQuery = "INSERT INTO internship_skills (internship_id, skill_name) VALUES (:internship_id, :skill_name)";
                $skillStmt = $this->conn->prepare($skillQuery);
                
                foreach ($this->required_skills as $skill) {
                    $skill = htmlspecialchars(strip_tags($skill));
                    $skillStmt->bindParam(":internship_id", $this->id);
                    $skillStmt->bindParam(":skill_name", $skill);
                    $skillStmt->execute();
                }
            }
            return true;
        }

        return false;
    }

    // Get Active Internships
    function getActive() {
        // Select all query
        $query = "SELECT * FROM " . $this->table_name . " WHERE status = 'Active' ORDER BY posted_date DESC";
        $stmt = $this->conn->prepare($query);
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
            // Applicant count default 0 for now
            $row['applicantCount'] = 0; 
            
            array_push($internships, $row);
        }

        return $internships;
    }

    // Get Internships By Recruiter
    function getByRecruiter($user_id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE user_id = :user_id ORDER BY posted_date DESC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $user_id);
        $stmt->execute();
        
        $internships = [];
        
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $skillQuery = "SELECT skill_name FROM internship_skills WHERE internship_id = :id";
            $skillStmt = $this->conn->prepare($skillQuery);
            $skillStmt->bindParam(":id", $row['id']);
            $skillStmt->execute();
            $skills = $skillStmt->fetchAll(PDO::FETCH_COLUMN);
            $row['requiredSkills'] = $skills;
            
            $appQuery = "SELECT COUNT(*) as count FROM applications WHERE internship_id = :id";
             try {
                $appStmt = $this->conn->prepare($appQuery);
                $appStmt->bindParam(":id", $row['id']);
                $appStmt->execute();
                $appRow = $appStmt->fetch(PDO::FETCH_ASSOC);
                $row['applicantCount'] = $appRow['count'];
            } catch (Exception $e) {
                $row['applicantCount'] = 0;
            }
            array_push($internships, $row);
        }
        return $internships;
    }

    // Update Internship
    function update() {
        $query = "UPDATE " . $this->table_name . "
                SET
                    company=:company,
                    position=:position,
                    description=:description,
                    location=:location,
                    duration=:duration,
                    stipend=:stipend,
                    type=:type,
                    requirements=:requirements,
                    responsibilities=:responsibilities
                WHERE id=:id AND user_id=:user_id";

        $stmt = $this->conn->prepare($query);

        // Sanitize
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        $this->company = htmlspecialchars(strip_tags($this->company));
        $this->position = htmlspecialchars(strip_tags($this->position));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->location = htmlspecialchars(strip_tags($this->location));
        $this->duration = htmlspecialchars(strip_tags($this->duration));
        $this->stipend = htmlspecialchars(strip_tags($this->stipend));
        $this->type = htmlspecialchars(strip_tags($this->type));
        $this->requirements = htmlspecialchars(strip_tags($this->requirements));
        $this->responsibilities = htmlspecialchars(strip_tags($this->responsibilities));

        // Bind
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);
        $stmt->bindParam(":company", $this->company);
        $stmt->bindParam(":position", $this->position);
        $stmt->bindParam(":description", $this->description);
        $stmt->bindParam(":location", $this->location);
        $stmt->bindParam(":duration", $this->duration);
        $stmt->bindParam(":stipend", $this->stipend);
        $stmt->bindParam(":type", $this->type);
        $stmt->bindParam(":requirements", $this->requirements);
        $stmt->bindParam(":responsibilities", $this->responsibilities);

        if($stmt->execute()) {
            // Option to update skills here (delete existing, insert new)
            if (isset($this->required_skills) && is_array($this->required_skills)) {
                $delQuery = "DELETE FROM internship_skills WHERE internship_id = :id";
                $delStmt = $this->conn->prepare($delQuery);
                $delStmt->bindParam(":id", $this->id);
                $delStmt->execute();

                $skillQuery = "INSERT INTO internship_skills (internship_id, skill_name) VALUES (:internship_id, :skill_name)";
                $skillStmt = $this->conn->prepare($skillQuery);
                foreach ($this->required_skills as $skill) {
                    $skill = htmlspecialchars(strip_tags($skill));
                    $skillStmt->bindParam(":internship_id", $this->id);
                    $skillStmt->bindParam(":skill_name", $skill);
                    $skillStmt->execute();
                }
            }
            return true;
        }
        return false;
    }

    // Delete Internship
    function delete() {
        $query = "DELETE FROM " . $this->table_name . " WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        
        $this->id = htmlspecialchars(strip_tags($this->id));
        $this->user_id = htmlspecialchars(strip_tags($this->user_id));
        
        $stmt->bindParam(":id", $this->id);
        $stmt->bindParam(":user_id", $this->user_id);
        
        if($stmt->execute()) {
            return true;
        }
        return false;
    }

    // Get Single Internship
    function getSingle($id) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":id", $id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
            // Fetch skills
            $skillQuery = "SELECT skill_name FROM internship_skills WHERE internship_id = :id";
            $skillStmt = $this->conn->prepare($skillQuery);
            $skillStmt->bindParam(":id", $id);
            $skillStmt->execute();
            $skills = $skillStmt->fetchAll(PDO::FETCH_COLUMN);
            
            $row['requiredSkills'] = $skills;
            // Applicant count
            // For now mock or fetch from applications table if it exists
            $appQuery = "SELECT COUNT(*) as count FROM applications WHERE internship_id = :id";
             try {
                $appStmt = $this->conn->prepare($appQuery);
                $appStmt->bindParam(":id", $id);
                $appStmt->execute();
                $appRow = $appStmt->fetch(PDO::FETCH_ASSOC);
                $row['applicantCount'] = $appRow['count'];
            } catch (Exception $e) {
                $row['applicantCount'] = 0; // Fallback if table doesn't exist yet
            }

            return $row;
        }

        return null;
    }
}
?>
