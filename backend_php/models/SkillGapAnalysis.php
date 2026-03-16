<?php
class SkillGapAnalysis {
    private $conn;
    private $table_name = "skill_gap_analysis";

    public $id;
    public $user_id;
    public $internship_id;
    public $user_skills;
    public $required_skills;
    public $missing_skills;
    public $gap_score;
    public $recommendations;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Analyze skill gap
    function analyze($userId, $targetRoleName) {
        // 1. Get user skills from the Resumes relational table
        $userSkillQuery = "SELECT s.skill_name 
                           FROM skills s
                           JOIN resumes r ON s.resume_id = r.id
                           WHERE r.user_id = :user_id";
        $userSkillStmt = $this->conn->prepare($userSkillQuery);
        $userSkillStmt->bindParam(":user_id", $userId);
        $userSkillStmt->execute();
        $userSkills = $userSkillStmt->fetchAll(PDO::FETCH_ASSOC);

        // 2. Get required skills for the target Job Role
        $reqSkillQuery = "SELECT jrs.skill_name 
                          FROM job_required_skills jrs
                          JOIN job_roles jr ON jrs.role_id = jr.id
                          WHERE jr.role_name = :role_name";
        $reqSkillStmt = $this->conn->prepare($reqSkillQuery);
        $reqSkillStmt->bindParam(":role_name", $targetRoleName);
        $reqSkillStmt->execute();
        $requiredSkills = $reqSkillStmt->fetchAll(PDO::FETCH_COLUMN);

        // Calculate missing skills
        $userSkillNames = array_map(function($s) { return strtolower($s['skill_name'] ?? $s); }, $userSkills);
        $reqSkillNamesLower = array_map('strtolower', $requiredSkills);
        $missingSkills = array_diff($reqSkillNamesLower, $userSkillNames);

        // Calculate gap score (percentage of skills matched)
        $totalRequired = count($requiredSkills);
        $matched = $totalRequired - count($missingSkills);
        $gapScore = $totalRequired > 0 ? round(($matched / $totalRequired) * 100) : 100;

        // Generate recommendations
        $recommendations = $this->generateRecommendations($missingSkills, $gapScore);

        $query = "INSERT INTO " . $this->table_name . "
                SET user_id = :user_id,
                    target_role = :target_role,
                    user_skills = :user_skills,
                    required_skills = :required_skills,
                    missing_skills = :missing_skills,
                    gap_score = :gap_score,
                    recommendations = :recommendations";

        $stmt = $this->conn->prepare($query);

        $userSkillsJson = json_encode($userSkillNames);
        $requiredSkillsJson = json_encode($requiredSkills);
        $missingSkillsJson = json_encode(array_values($missingSkills));

        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":target_role", $targetRoleName);
        $stmt->bindParam(":user_skills", $userSkillsJson);
        $stmt->bindParam(":required_skills", $requiredSkillsJson);
        $stmt->bindParam(":missing_skills", $missingSkillsJson);
        $stmt->bindParam(":gap_score", $gapScore);
        $stmt->bindParam(":recommendations", $recommendations);

        if ($stmt->execute()) {
            return [
                'gap_score' => $gapScore,
                'target_role' => $targetRoleName,
                'user_skills' => $userSkillNames,
                'required_skills' => $requiredSkills,
                'missing_skills' => array_values($missingSkills),
                'recommendations' => $recommendations
            ];
        }

        return null;
    }

    // Get analysis by user and target role
    function getByUserAndRole($userId, $targetRoleName) {
        $query = "SELECT * FROM " . $this->table_name . " 
                  WHERE user_id = :user_id AND target_role = :target_role 
                  ORDER BY analyzed_at DESC 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(":user_id", $userId);
        $stmt->bindParam(":target_role", $targetRoleName);
        $stmt->execute();

        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($result) {
            // Decode JSON fields
            $result['user_skills'] = json_decode($result['user_skills'], true);
            $result['required_skills'] = json_decode($result['required_skills'], true);
            $result['missing_skills'] = json_decode($result['missing_skills'], true);
        }

        return $result;
    }

    // Generate recommendations based on missing skills
    private function generateRecommendations($missingSkills, $gapScore) {
        if ($gapScore >= 80) {
            return "Great match! You have most of the required skills. Consider learning: " . implode(", ", $missingSkills) . " to be fully qualified.";
        } elseif ($gapScore >= 50) {
            return "Good potential! Focus on developing these skills: " . implode(", ", $missingSkills) . " to improve your chances.";
        } else {
            return "This position requires significant skill development. Prioritize learning: " . implode(", ", $missingSkills) . " before applying.";
        }
    }
}
?>
