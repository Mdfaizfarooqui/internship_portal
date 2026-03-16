<?php
require_once __DIR__ . '/../utils/CustomJWT.php';

function authenticate() {
    $headers = apache_request_headers();
    $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';

    if ($authHeader) {
        $arr = explode(" ", $authHeader);
        if (count($arr) === 2 && $arr[0] === 'Bearer') {
            $jwt = $arr[1];
            $decoded = CustomJWT::decode($jwt);
            
            if($decoded && isset($decoded->id)) {
                return $decoded->id; 
            }
        }
    }
    
    http_response_code(401);
    echo json_encode(["success" => false, "message" => "Access denied. Invalid or missing token."]);
    exit;
}
?>
