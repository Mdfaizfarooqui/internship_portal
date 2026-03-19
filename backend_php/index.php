<?php
// Headers
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Force all PHP errors/warnings and uncaught exceptions to return JSON
// instead of breaking the response with HTML like <br /> <b>Warning</b>
ini_set('display_errors', 0);
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    if ($errno === E_DEPRECATED || $errno === E_USER_DEPRECATED || $errno === E_NOTICE || $errno === E_WARNING) {
        return false; // let PHP handle it silently since display_errors=0
    }
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "PHP Error: $errstr", 
        "details" => "Line $errline in " . basename($errfile)
    ]);
    exit;
});

set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        "success" => false, 
        "message" => "Exception: " . $e->getMessage(), 
        "details" => "Line " . $e->getLine() . " in " . basename($e->getFile())
    ]);
    exit;
});

// Handle Preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Simple Router
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = explode( '/', $uri );

// URL Structure: /api/resource/action -> [_, api, resource, action]

// INTERNSHIPS ROUTES
if (isset($uri[2]) && $uri[2] === 'internships') {
    require_once 'controllers/InternshipController.php';
    $controller = new InternshipController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->create();
        } elseif ($uri[3] === 'getActive' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getActive();
        } elseif ($uri[3] === 'getInternship' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getInternship();
        } elseif ($uri[3] === 'getAll' && $_SERVER['REQUEST_METHOD'] === 'GET') {
             $controller->getActive(); // Reuse active for now
        } elseif ($uri[3] === 'getByRecruiter' && $_SERVER['REQUEST_METHOD'] === 'GET') {
             $controller->getByRecruiter();
        } elseif ($uri[3] === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
             $controller->update();
        } elseif ($uri[3] === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
             $controller->delete();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Endpoint not found"]);
        }
    }
}

// AUTH ROUTES
elseif (isset($uri[2]) && $uri[2] === 'auth') {
    require_once 'controllers/AuthController.php';
    $controller = new AuthController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'login' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->login();
        } elseif ($uri[3] === 'register' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->register();
        } elseif ($uri[3] === 'forgot-password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->forgotPassword();
        } elseif ($uri[3] === 'reset-password' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->resetPassword();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Auth Endpoint not found"]);
        }
    }
}

// USER ROUTES
elseif (isset($uri[2]) && $uri[2] === 'users') {
    require_once 'controllers/UserController.php';
    $controller = new UserController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'profile' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getProfile();
        } elseif ($uri[3] === 'profile' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $controller->updateProfile();
        } elseif ($uri[3] === 'profile-picture' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->uploadProfilePicture();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "User Endpoint not found"]);
        }
    }
}

// SKILLS ROUTES
elseif (isset($uri[2]) && $uri[2] === 'skills') {
    require_once 'controllers/SkillController.php';
    $controller = new SkillController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->create();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $controller->update();
        } elseif ($uri[3] === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->delete();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Skill Endpoint not found"]);
        }
    }
}

// EDUCATION ROUTES
elseif (isset($uri[2]) && $uri[2] === 'education') {
    require_once 'controllers/EducationController.php';
    $controller = new EducationController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->create();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $controller->update();
        } elseif ($uri[3] === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->delete();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Education Endpoint not found"]);
        }
    }
}

// WORK EXPERIENCE ROUTES
elseif (isset($uri[2]) && $uri[2] === 'experience') {
    require_once 'controllers/WorkExperienceController.php';
    $controller = new WorkExperienceController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->create();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $controller->update();
        } elseif ($uri[3] === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->delete();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Experience Endpoint not found"]);
        }
    }
}

// APPLICATION ROUTES
elseif (isset($uri[2]) && $uri[2] === 'applications') {
    require_once 'controllers/ApplicationController.php';
    $controller = new ApplicationController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->create();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'internship' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByInternship();
        } elseif ($uri[3] === 'status' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $controller->updateStatus();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Application Endpoint not found"]);
        }
    }
}

// SAVED INTERNSHIPS ROUTES
elseif (isset($uri[2]) && $uri[2] === 'saved') {
    require_once 'controllers/SavedInternshipController.php';
    $controller = new SavedInternshipController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'save' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->save();
        } elseif ($uri[3] === 'unsave' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->unsave();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'check' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->isSaved();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Saved Internship Endpoint not found"]);
        }
    }
}

// RESUME ROUTES
elseif (isset($uri[2]) && $uri[2] === 'resumes') {
    require_once 'controllers/ResumeController.php';
    $controller = new ResumeController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'saveBuilder' && $_SERVER['REQUEST_METHOD'] === 'POST') {
             $controller->saveBuilder();
        } elseif ($uri[3] === 'analyze' && $_SERVER['REQUEST_METHOD'] === 'POST') {
             $controller->analyze();
        } elseif ($uri[3] === 'upload' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->upload();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getById();
        } elseif ($uri[3] === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->delete();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Resume Endpoint not found"]);
        }
    }
}

// SKILL GAP ANALYSIS ROUTES
elseif (isset($uri[2]) && $uri[2] === 'skillgap') {
    require_once 'controllers/SkillGapController.php';
    $controller = new SkillGapController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'analyze' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->analyze();
        } elseif ($uri[3] === 'get' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getAnalysis();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Skill Gap Endpoint not found"]);
        }
    }
}

// PROJECTS ROUTES
elseif (isset($uri[2]) && $uri[2] === 'projects') {
    require_once 'controllers/ProjectController.php';
    $controller = new ProjectController();
    
    if (isset($uri[3])) {
        if ($uri[3] === 'create' && $_SERVER['REQUEST_METHOD'] === 'POST') {
            $controller->create();
        } elseif ($uri[3] === 'user' && $_SERVER['REQUEST_METHOD'] === 'GET') {
            $controller->getByUser();
        } elseif ($uri[3] === 'update' && $_SERVER['REQUEST_METHOD'] === 'PUT') {
            $controller->update();
        } elseif ($uri[3] === 'delete' && $_SERVER['REQUEST_METHOD'] === 'DELETE') {
            $controller->delete();
        } else {
             http_response_code(404);
             echo json_encode(["error" => "Project Endpoint not found"]);
        }
    }
}

// DEFAULT / 404
else {
    http_response_code(404);
    echo json_encode(["error" => "API Endpoint Not Found", "uri" => $uri]);
}
?>
