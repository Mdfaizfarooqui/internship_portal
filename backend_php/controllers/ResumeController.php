<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/Resume.php';

class ResumeController {
    
    private $db;
    private $resume;
    private $education;
    private $experience;
    private $skill;
    private $project;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->resume = new Resume($this->db);
        
        // Initialize other models for sync
        include_once __DIR__ . '/../models/Education.php';
        include_once __DIR__ . '/../models/WorkExperience.php';
        include_once __DIR__ . '/../models/Project.php';
        // Skills are handled via direct DB or controller if needed, but direct DB is better for transactions
        // For simplicity in this existing architecture, we'll instantiate models if they exist or use raw queries if needed.
        // Assuming models exist based on file structure
        $this->education = new Education($this->db);
        $this->experience = new WorkExperience($this->db);
        $this->project = new Project($this->db);
    }

    // Save Resume Builder Data (Full Relational Sync)
    public function saveBuilder() {
        // Authenticate request using new Custom JWT Wrapper
        include_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();

        $data = json_decode(file_get_contents("php://input"));

        if(empty($user_id)) {
            http_response_code(400);
            echo json_encode(["message" => "Invalid or missing token authentication."]);
            return;
        }

        try {
            $this->db->beginTransaction();

            // Check if Base Resume profile exists
            $stmt = $this->db->prepare("SELECT id FROM resumes WHERE user_id = :user_id LIMIT 1");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Auto-patch missing summary column for older database schemas
            try { $this->db->exec("ALTER TABLE resumes ADD COLUMN summary TEXT"); } catch (Exception $e) {}
            
            if($row) {
                $resume_id = $row['id'];
                // Update summary
                $stmt = $this->db->prepare("UPDATE resumes SET summary = :summary WHERE id = :id");
                $summary = $data->personalInfo->summary ?? '';
                $stmt->bindParam(':summary', $summary);
                $stmt->bindParam(':id', $resume_id);
                $stmt->execute();
                
                // Clean old relationships before re-inserting
                $this->db->exec("DELETE FROM user_skills WHERE user_id = $user_id");
                $this->db->exec("DELETE FROM education WHERE user_id = $user_id");
                $this->db->exec("DELETE FROM projects WHERE user_id = $user_id");
                $this->db->exec("DELETE FROM work_experience WHERE user_id = $user_id");
                $this->db->exec("DELETE FROM certifications WHERE resume_id = $resume_id");
            } else {
                // Create new basic resume shell (title and content are NOT NULL in original schema)
                $stmt = $this->db->prepare("INSERT INTO resumes (user_id, title, content, summary) VALUES (:user_id, 'My Built Resume', '', :summary)");
                $summary = $data->personalInfo->summary ?? '';
                $stmt->bindParam(':user_id', $user_id);
                $stmt->bindParam(':summary', $summary);
                $stmt->execute();
                $resume_id = $this->db->lastInsertId();
            }

            // Sync Personal Info globally with User object
            if (!empty($data->personalInfo)) {
                $query = "UPDATE users SET full_name = :name WHERE id = :id";
                $stmt = $this->db->prepare($query);
                $name = htmlspecialchars(strip_tags($data->personalInfo->fullName ?? ''));
                $stmt->bindParam(':name', $name);
                $stmt->bindParam(':id', $user_id);
                $stmt->execute();
            }

            // 2. Insert Skills (into user_skills)
            if (isset($data->skills) && is_array($data->skills)) {
                $stmt = $this->db->prepare("INSERT INTO user_skills (user_id, skill_name) VALUES (:user_id, :skill_name)");
                foreach($data->skills as $skill) {
                    $skillName = is_object($skill) ? ($skill->name ?? $skill->skill_name) : $skill;
                    $stmt->execute([':user_id' => $user_id, ':skill_name' => htmlspecialchars(strip_tags($skillName))]);
                }
            }

            // 3. Insert Education (into education matching database.sql)
            if (isset($data->education) && is_array($data->education)) {
                $stmt = $this->db->prepare("INSERT INTO education (user_id, degree, institution, field_of_study, start_date, graduation_date, description) VALUES (:user_id, :degree, :institution, :field_of_study, :start_date, :graduation_date, :description)");
                foreach($data->education as $edu) {
                    $startDate = !empty($edu->startDate) ? $edu->startDate : null;
                    if (isset($edu->endDate) && strpos($edu->endDate, '-') !== false) {
                        $gradDate = (explode('-', $edu->endDate)[0]) . '-01-01'; // map year to full date format
                    } else {
                        $gradDate = null;
                    }

                    $stmt->execute([
                        ':user_id' => $user_id,
                        ':degree' => $edu->degree ?? '',
                        ':institution' => $edu->institution ?? '',
                        ':field_of_study' => '',
                        ':start_date' => $startDate,
                        ':graduation_date' => $gradDate,
                        ':description' => ''
                    ]);
                }
            }

            // 4. Insert Experience (into work_experience matching database.sql)
            if (isset($data->experience) && is_array($data->experience)) {
                $stmt = $this->db->prepare("INSERT INTO work_experience (user_id, company, position, description, start_date, end_date) VALUES (:user_id, :company, :position, :description, :start_date, :end_date)");
                foreach($data->experience as $exp) {
                    $stmt->execute([
                        ':user_id' => $user_id,
                        ':company' => $exp->company ?? '',
                        ':position' => $exp->position ?? '',
                        ':description' => '',
                        ':start_date' => !empty($exp->startDate) ? $exp->startDate : '2000-01-01',
                        ':end_date' => !empty($exp->endDate) ? $exp->endDate : null
                    ]);
                }
            }

            // 5. Insert Projects (into projects matching database.sql)
            if (isset($data->projects) && is_array($data->projects)) {
                $stmt = $this->db->prepare("INSERT INTO projects (user_id, name, description, technologies) VALUES (:user_id, :name, :description, :technologies)");
                foreach($data->projects as $proj) {
                    $stmt->execute([
                        ':user_id' => $user_id,
                        ':name' => $proj->name ?? '',
                        ':description' => $proj->description ?? '',
                        ':technologies' => $proj->technologies ?? ''
                    ]);
                }
            }

            // 6. Insert Certifications (matching update_resume_db.php schema as there was no old table)
            if (isset($data->certifications) && is_array($data->certifications)) {
                 $stmt = $this->db->prepare("INSERT INTO certifications (resume_id, certificate_name) VALUES (:resume_id, :certificate_name)");
                 foreach($data->certifications as $cert) {
                     $stmt->execute([':resume_id' => $resume_id, ':certificate_name' => $cert->name ?? $cert]);
                 }
            }

            $this->db->commit();
            
            http_response_code(201);
            echo json_encode(["success" => true, "message" => "Advanced Resume synced to internal database successfully.", "resume_id" => $resume_id]);

        } catch (Exception $e) {
            $this->db->rollBack();
            http_response_code(503);
            echo json_encode(["success" => false, "message" => "Unable to save resume. " . $e->getMessage(), "error" => $e->getMessage()]);
        }
    }

    // Upload/Create resume
    public function upload() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        // Check if file is uploaded
        if (isset($_FILES['resume_file']) && $_FILES['resume_file']['error'] === UPLOAD_ERR_OK) {
            $title = $_POST['title'] ?? null;
            
            if (!$userId || !$title) {
                 http_response_code(400);
                 echo json_encode(array("success" => false, "message" => "User ID and title are required."));
                 return;
            }

            $uploadDir = __DIR__ . '/../../uploads/resumes/';
            if (!file_exists($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }

            $fileTmpPath = $_FILES['resume_file']['tmp_name'];
            $fileName = $_FILES['resume_file']['name'];
            $fileNameCmps = explode(".", $fileName);
            $fileExtension = strtolower(end($fileNameCmps));
            $newFileName = md5(time() . $fileName) . '.' . $fileExtension;
            $dest_path = $uploadDir . $newFileName;

            $allowedfileExtensions = array('pdf', 'doc', 'docx');

            if (in_array($fileExtension, $allowedfileExtensions)) {
                if(move_uploaded_file($fileTmpPath, $dest_path)) {
                    // File moved successfully, save to DB
                    $this->resume->user_id = $userId;
                    $this->resume->title = $title;
                    $this->resume->content = ""; // No JSON content for file uploads
                    $this->resume->file_path = 'uploads/resumes/' . $newFileName;

                    if ($this->resume->create()) {
                        http_response_code(201);
                        echo json_encode(array("success" => true, "message" => "Resume uploaded successfully.", "id" => $this->resume->id, "file_path" => $this->resume->file_path));
                    } else {
                         http_response_code(503);
                         echo json_encode(array("success" => false, "message" => "File uploaded but failed to save record."));
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(array("success" => false, "message" => "Error moving uploaded file."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "Upload failed. Allowed file types: " . implode(',', $allowedfileExtensions)));
            }

        } else {
            // Value-based creation (fallback or JSON)
            $data = json_decode(file_get_contents("php://input"));

            if (!empty($userId) && !empty($data->title)) {
                $this->resume->user_id = $userId;
                $this->resume->title = $data->title;
                $this->resume->content = $data->content ?? "";
                $this->resume->file_path = $data->file_path ?? null;

                if ($this->resume->create()) {
                    http_response_code(201);
                    echo json_encode(array("success" => true, "message" => "Resume record created successfully.", "id" => $this->resume->id));
                } else {
                    http_response_code(503);
                    echo json_encode(array("success" => false, "message" => "Unable to create resume record."));
                }
            } else {
                 http_response_code(400);
                 echo json_encode(array("success" => false, "message" => "No file uploaded and missing required data."));
            }
        }
    }

    // Fetch User Profile / Resume Data (stitching relational tables)
    public function getByUser() {
        // Authenticate request using new Custom JWT Wrapper
        include_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();

        if (!$user_id) {
            http_response_code(401);
            echo json_encode(["message" => "Valid authentication required."]);
            return;
        }

        $resumeData = [
            "summary" => "",
            "education" => [],
            "skills" => [],
            "projects" => [],
            "experience" => [],
            "certifications" => []
        ];

        try {
            // Get main resume anchor
            $stmt = $this->db->prepare("SELECT id, summary FROM resumes WHERE user_id = :user_id LIMIT 1");
            $stmt->bindParam(':user_id', $user_id);
            $stmt->execute();
            $resume = $stmt->fetch(PDO::FETCH_ASSOC);

            if($resume) {
                $resume_id = $resume['id'];
                $resumeData['summary'] = $resume['summary'] ?? '';

                // Get Skills
                $stmt = $this->db->prepare("SELECT skill_name as name FROM user_skills WHERE user_id = :user_id");
                $stmt->execute([':user_id' => $user_id]);
                $resumeData['skills'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Get Education
                $stmt = $this->db->prepare("SELECT degree, institution, graduation_date as year FROM education WHERE user_id = :user_id");
                $stmt->execute([':user_id' => $user_id]);
                $resumeData['education'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Get Projects
                $stmt = $this->db->prepare("SELECT name, description, technologies as tech_stack FROM projects WHERE user_id = :user_id");
                $stmt->execute([':user_id' => $user_id]);
                $resumeData['projects'] = $stmt->fetchAll(PDO::FETCH_ASSOC);

                // Get Experience
                $stmt = $this->db->prepare("SELECT company, position as role, start_date, end_date FROM work_experience WHERE user_id = :user_id");
                $stmt->execute([':user_id' => $user_id]);
                $resumeData['experience'] = array_map(function($exp) {
                    $startDate = substr($exp['start_date'] ?? '', 0, 7);
                    $endDate = $exp['end_date'] ? substr($exp['end_date'], 0, 7) : 'Present';
                    $exp['duration'] = $startDate . ' - ' . $endDate;
                    return $exp;
                }, $stmt->fetchAll(PDO::FETCH_ASSOC));

                // Get Certifications
                $stmt = $this->db->prepare("SELECT certificate_name FROM certifications WHERE resume_id = :id");
                $stmt->execute([':id' => $resume_id]);
                $resumeData['certifications'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                http_response_code(200);
                echo json_encode(["success" => true, "resume" => $resumeData]);
            } else {
                http_response_code(404);
                echo json_encode(["message" => "Resume not found.", "resume" => $resumeData]);
            }
        } catch(PDOException $e) {
             http_response_code(500);
             echo json_encode(["message" => "Database error.", "error" => $e->getMessage()]);
        }
    }

    // Get single resume (Deprecated / Handled by getByUser for auth flow)
    public function getById() {
        http_response_code(410);
        echo json_encode(["message" => "Use getByUser with Bearer token authentication instead."]);
    }

    // Delete resume
    public function delete() {
        require_once __DIR__ . '/../middleware/auth.php';
        $userId = authenticate();
        $id = isset($_GET['id']) ? $_GET['id'] : null;
        
        if (!$id || !$userId) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Resume ID is required."));
            return;
        }

        if ($this->resume->delete($id)) {
            echo json_encode(array("success" => true, "message" => "Resume deleted successfully."));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to delete resume."));
        }
    }
    // Analyze Resume
    public function analyze() {
        // Authenticate request using new Custom JWT Wrapper
        include_once __DIR__ . '/../middleware/auth.php';
        $user_id = authenticate();

        if (!$user_id) {
            http_response_code(401);
            echo json_encode(["message" => "Valid authentication required."]);
            return;
        }

        // Fetch Main Resume Anchor
        $stmt = $this->db->prepare("SELECT id, summary FROM resumes WHERE user_id = :user_id LIMIT 1");
        $stmt->execute([':user_id' => $user_id]);
        $resume = $stmt->fetch(PDO::FETCH_ASSOC);

        if(!$resume) {
            http_response_code(404);
            echo json_encode(["message" => "Your Resume Profile is empty."]);
            return;
        }

        $resume_id = $resume['id'];
        
        // HEURISTIC SCORING LOGIC FROM RELATIONAL TABLES
        $scores = $this->calculateScores($resume_id, $resume['summary'] ?? '');

        // Save Scores
        include_once __DIR__ . '/../models/ResumeScore.php';
        $resumeScore = new ResumeScore($this->db);
        $resumeScore->resume_id = $resume_id;
        $resumeScore->overall_score = $scores['overall'];
        $resumeScore->content_score = $scores['content'];
        $resumeScore->format_score = $scores['format'];
        $resumeScore->keyword_score = $scores['keywords'];
        $resumeScore->skills_score = $scores['skills'];
        $resumeScore->experience_score = $scores['experience'];
        $resumeScore->feedback = json_encode($scores['feedback']);
        $resumeScore->strengths = json_encode($scores['strengths']);
        $resumeScore->improvements = json_encode($scores['improvements']);

        if ($resumeScore->create()) {
             echo json_encode(["success" => true, "score" => $scores]);
        } else {
             http_response_code(503);
             echo json_encode(["success" => false, "message" => "Failed to save analysis."]);
        }
    }

    private function calculateScores($resume_id, $summary) {
        $contentScore = 0;
        $formatScore = 0;
        $keywordScore = 50; // Starting baseline for words
        $skillsScore = 0;
        $experienceScore = 0;
        $feedback = [];
        $strengths = [];
        $improvements = [];

        // 1. Content Analysis (Summary Length)
        if (!empty($summary) && strlen($summary) > 50) {
            $contentScore += 40;
            $strengths[] = "Good professional summary.";
        } else {
            $improvements[] = "Add a longer professional summary.";
            $feedback[] = "Your professional summary is brief or missing.";
        }
        
        $contentScore = min(100, $contentScore + 50); // Base 50

        // Helpers to count tables
        $getCount = function($table, $keyStr) use ($resume_id, $summary) {
            $stmt = $this->db->query("SELECT COUNT(*) FROM {$table} WHERE {$keyStr}");
            return $stmt->fetchColumn();
        };

        // Extract user_id to correctly query legacy tables for analytics
        $stmt = $this->db->prepare("SELECT user_id FROM resumes WHERE id = :id LIMIT 1");
        $stmt->execute([':id' => $resume_id]);
        $uid = $stmt->fetchColumn();

        $eduCount = $getCount('education', "user_id = {$uid}");
        $expCount = $getCount('work_experience', "user_id = {$uid}");
        $skillCount = $getCount('user_skills', "user_id = {$uid}");
        $projCount = $getCount('projects', "user_id = {$uid}");
        $certCount = $getCount('certifications', "resume_id = {$resume_id}");

        // 2. Format Analysis (Structure Check)
        if ($eduCount > 0) $formatScore += 20;
        if ($expCount > 0) $formatScore += 30;
        if ($skillCount > 0) $formatScore += 20;
        if ($projCount > 0) $formatScore += 20;
        if ($certCount > 0) $formatScore += 10;
        
        if ($formatScore == 100) {
            $strengths[] = "Resume has all key sections.";
        } else {
            $improvements[] = "Ensure you have Education, Experience, Skills, and Projects sections.";
        }

        // 4. Skills Analysis
        if ($skillCount >= 5) {
            $skillsScore = 100;
            $strengths[] = "Strong skills section.";
        } else {
            $skillsScore = $skillCount * 20;
            $improvements[] = "Add more skills to your profile (Aim for at least 5).";
        }

        // 5. Experience Analysis
        if ($expCount >= 2) {
             $experienceScore = 90;
             $strengths[] = "Good amount of work experience listed.";
        } elseif ($expCount == 1) {
             $experienceScore = 70;
        } else {
             $experienceScore = 40;
             $improvements[] = "Try to gain more work experience or list relevant projects as experience.";
             
             // Boost if they have no experience but a lot of projects
             if ($projCount >= 3) {
                 $experienceScore += 20;
                 $strengths[] = "Good use of Personal Projects to offset lack of experience.";
             }
        }

        // Overall Score Calculation
        $overall = round(($contentScore * 0.2) + ($formatScore * 0.2) + ($keywordScore * 0.2) + ($skillsScore * 0.2) + ($experienceScore * 0.2));

        return [
            'overall_score' => $overall,
            'overall' => $overall,
            'content' => $contentScore,
            'format' => $formatScore,
            'keywords' => $keywordScore,
            'skills' => $skillsScore,
            'experience' => $experienceScore,
            'feedback' => $feedback,
            'strengths' => $strengths,
            'improvements' => $improvements
        ];
    }
}
?>
