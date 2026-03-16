<?php
// SMTP Configuration
// Please replace the placeholders with your actual SMTP details.
// For Gmail, enable 2-Factor Authentication and generate an "App Password".
return [
    'smtp_host' => 'smtp.gmail.com', // e.g., smtp.gmail.com
    'smtp_port' => 587,              // 587 for TLS, 465 for SSL, 25 for non-secure
    'smtp_user' => 'your_email@gmail.com', 
    'smtp_pass' => 'your_app_password',    // Use App Password for Gmail
    'from_email' => 'your_email@gmail.com',
    'from_name' => 'InternHub Support'
];
?>
