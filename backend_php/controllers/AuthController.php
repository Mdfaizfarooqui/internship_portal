<?php
include_once __DIR__ . '/../config/Database.php';
include_once __DIR__ . '/../models/User.php';
include_once __DIR__ . '/../utils/CustomJWT.php';

class AuthController {
    
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    // Login User
    public function login() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Email and password are required."));
            return;
        }

        $query = "SELECT * FROM users WHERE email = :email LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':email', $data->email);
        $stmt->execute();
        $user = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($user && password_verify($data->password, $user['password'])) {
            unset($user['password']); // Do not send password hash back
            
            // Issue JWT Token
            $token = CustomJWT::encode(['id' => $user['id'], 'role' => $user['role']]);

            echo json_encode(array("success" => true, "message" => "Login successful.", "user" => $user, "token" => $token));
        } else {
            http_response_code(401);
            echo json_encode(array("success" => false, "message" => "Invalid email or password."));
        }
    }

    // Register User
    public function register() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->name) || empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Name, email, and password are required."));
            return;
        }

        // Check if email already exists
        $checkQuery = "SELECT id FROM users WHERE email = :email LIMIT 1";
        $checkStmt = $this->db->prepare($checkQuery);
        $checkStmt->bindParam(':email', $data->email);
        $checkStmt->execute();

        if ($checkStmt->rowCount() > 0) {
            http_response_code(409);
            echo json_encode(array("success" => false, "message" => "Email already exists."));
            return;
        }

        $role = (!empty($data->role) && in_array(strtolower($data->role), ['student', 'recruiter'])) ? strtolower($data->role) : 'student';

        // Insert new user
        $query = "INSERT INTO users (full_name, email, password, role) VALUES (:name, :email, :password, :role)";
        $stmt = $this->db->prepare($query);
        $password_hash = password_hash($data->password, PASSWORD_BCRYPT);

        $stmt->bindParam(':name', $data->name);
        $stmt->bindParam(':email', $data->email);
        $stmt->bindParam(':password', $password_hash);
        $stmt->bindParam(':role', $role);

        if ($stmt->execute()) {
            $userId = $this->db->lastInsertId();
            
            // Fetch newly created user
            $userQuery = "SELECT id, full_name, email, role FROM users WHERE id = :id LIMIT 1";
            $userStmt = $this->db->prepare($userQuery);
            $userStmt->bindParam(':id', $userId);
            $userStmt->execute();
            $user = $userStmt->fetch(PDO::FETCH_ASSOC);

            // Issue JWT Token
            $token = CustomJWT::encode(['id' => $user['id'], 'role' => $user['role']]);

            http_response_code(201);
            echo json_encode(array("success" => true, "message" => "Registration successful.", "user" => $user, "token" => $token));
        } else {
            http_response_code(503);
            echo json_encode(array("success" => false, "message" => "Unable to register user."));
        }
    }

    // Forgot Password - Generate and Send OTP
    public function forgotPassword() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Email is required."));
            return;
        }

        $userExists = $this->user->getByEmail($data->email);

        if ($userExists) {
            $this->user->id = $userExists['id'];
            
            // Generate 6-digit OTP
            $otp = rand(100000, 999999);
            // Set expiry to 15 minutes from now
            $expiry = date('Y-m-d H:i:s', strtotime('+15 minutes'));

            if ($this->user->setOtp($otp, $expiry)) {
                // Send Email via SMTP
                $to = $data->email;
                $subject = "Password Reset OTP - InternHub";
                $message = "
                    <html>
                    <head>
                        <title>Password Reset OTP</title>
                    </head>
                    <body>
                        <div style='font-family: Arial, sans-serif; padding: 20px; color: #333;'>
                            <h2>Password Reset Request</h2>
                            <p>You requested a password reset for your InternHub account.</p>
                            <p>Your One-Time Password (OTP) is:</p>
                            <h1 style='color: #06b6d4; letter-spacing: 5px;'>" . $otp . "</h1>
                            <p>This OTP is valid for 15 minutes.</p>
                            <p>If you did not request this, please ignore this email.</p>
                        </div>
                    </body>
                    </html>
                ";

                $mailSent = false;
                $smtpError = "";

                // Try SMTP first (if configured)
                try {
                    require_once __DIR__ . '/../utils/SMTPMailer.php';
                    $mailer = new SMTPMailer();
                    $mailSent = $mailer->send($to, $subject, $message);
                } catch (Exception $e) {
                    $smtpError = $e->getMessage();
                    // Fallback to PHP mail() - unlikely to work on local but good practice
                     try {
                        // $mailSent = @mail($to, $subject, $message, "From: no-reply@internhub.com\r\nContent-Type: text/html; charset=UTF-8");
                        // Don't fallback to mail() as it causes lag/issues on Windows without config
                     } catch (Exception $ex) {}
                }

                if ($mailSent) {
                    echo json_encode(array("success" => true, "message" => "OTP sent to your email."));
                } else {
                    // Fallback for local development or if SMTP fails
                    echo json_encode(array("success" => true, "message" => "OTP generated. Configure SMTP in backend_php/config/mail_config.php to send real emails.", "debug_otp" => $otp, "error" => $smtpError));
                }
            } else {
                http_response_code(503);
                echo json_encode(array("success" => false, "message" => "Unable to generate OTP."));
            }
        } else {
            // Return success even if email not found to prevent user enumeration (security best practice)
            // But for this project, let's be explicit to help the user
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "Email not found."));
        }
    }

    // Reset Password - Verify OTP and Update Password
    public function resetPassword() {
        $data = json_decode(file_get_contents("php://input"));

        if (empty($data->email) || empty($data->otp) || empty($data->new_password)) {
            http_response_code(400);
            echo json_encode(array("success" => false, "message" => "Email, OTP, and New Password are required."));
            return;
        }

        $userExists = $this->user->getByEmail($data->email);

        if ($userExists) {
            $this->user->id = $userExists['id'];

            if ($this->user->verifyOtp($data->otp)) {
                if ($this->user->updatePassword($data->new_password)) {
                    echo json_encode(array("success" => true, "message" => "Password reset successfully."));
                } else {
                    http_response_code(503);
                    echo json_encode(array("success" => false, "message" => "Unable to update password."));
                }
            } else {
                http_response_code(400);
                echo json_encode(array("success" => false, "message" => "Invalid or expired OTP."));
            }
        } else {
            http_response_code(404);
            echo json_encode(array("success" => false, "message" => "User not found."));
        }
    }
}
?>
