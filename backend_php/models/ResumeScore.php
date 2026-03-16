<?php
class ResumeScore {
    private $conn;
    private $table_name = "resume_scores";

    public $id;
    public $resume_id;
    public $overall_score;
    public $content_score;
    public $format_score;
    public $keyword_score;
    public $skills_score;
    public $experience_score;
    public $feedback;
    public $strengths;
    public $improvements;
    public $analyzed_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Create or Update score
    function create() {
        // Check if score exists for this resume
        $checkQuery = "SELECT id FROM " . $this->table_name . " WHERE resume_id = :resume_id";
        $checkStmt = $this->conn->prepare($checkQuery);
        $checkStmt->bindParam(":resume_id", $this->resume_id);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            // Update
            $query = "UPDATE " . $this->table_name . "
                    SET overall_score = :overall_score,
                        content_score = :content_score,
                        format_score = :format_score,
                        keyword_score = :keyword_score,
                        skills_score = :skills_score,
                        experience_score = :experience_score,
                        feedback = :feedback,
                        strengths = :strengths,
                        improvements = :improvements,
                        analyzed_at = NOW()
                    WHERE resume_id = :resume_id";
        } else {
            // Insert
            $query = "INSERT INTO " . $this->table_name . "
                    SET resume_id = :resume_id,
                        overall_score = :overall_score,
                        content_score = :content_score,
                        format_score = :format_score,
                        keyword_score = :keyword_score,
                        skills_score = :skills_score,
                        experience_score = :experience_score,
                        feedback = :feedback,
                        strengths = :strengths,
                        improvements = :improvements";
        }

        $stmt = $this->conn->prepare($query);

        // Bind
        $stmt->bindParam(":resume_id", $this->resume_id);
        $stmt->bindParam(":overall_score", $this->overall_score);
        $stmt->bindParam(":content_score", $this->content_score);
        $stmt->bindParam(":format_score", $this->format_score);
        $stmt->bindParam(":keyword_score", $this->keyword_score);
        $stmt->bindParam(":skills_score", $this->skills_score);
        $stmt->bindParam(":experience_score", $this->experience_score);
        
        // Serialize arrays to JSON/String
        $feedbackStr = is_array($this->feedback) ? json_encode($this->feedback) : $this->feedback;
        $strengthsStr = is_array($this->strengths) ? json_encode($this->strengths) : $this->strengths;
        $improvementsStr = is_array($this->improvements) ? json_encode($this->improvements) : $this->improvements;

        $stmt->bindParam(":feedback", $feedbackStr);
        $stmt->bindParam(":strengths", $strengthsStr);
        $stmt->bindParam(":improvements", $improvementsStr);

        return $stmt->execute();
    }

    // Get score by resume ID
    function getByResumeId($resumeId) {
        $query = "SELECT * FROM " . $this->table_name . " WHERE resume_id = :resume_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":resume_id", $resumeId);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($row) {
             // Decode JSON strings back to arrays
            $row['feedback'] = json_decode($row['feedback'], true);
            $row['strengths'] = json_decode($row['strengths'], true);
            $row['improvements'] = json_decode($row['improvements'], true);
            return $row;
        }

        return null;
    }
}
?>
