<?php

class SMTPMailer {
    private $host;
    private $port;
    private $username;
    private $password;
    private $fromEmail;
    private $fromName;
    private $timeout = 30;
    private $debug = false;

    public function __construct() {
        $config = require __DIR__ . '/../config/mail_config.php';
        $this->host = $config['smtp_host'];
        $this->port = $config['smtp_port'];
        $this->username = $config['smtp_user'];
        $this->password = $config['smtp_pass'];
        $this->fromEmail = $config['from_email'];
        $this->fromName = $config['from_name'];
    }

    public function send($to, $subject, $body) {
        $socket = fsockopen($this->host, $this->port, $errno, $errstr, $this->timeout);
        if (!$socket) {
            throw new Exception("Could not connect to SMTP host: $errstr ($errno)");
        }

        $this->serverParams($socket, "220");

        // HELO/EHLO
        fputs($socket, "EHLO " . $this->host . "\r\n");
        $this->serverParams($socket, "250");

        // STARTTLS
        if ($this->port == 587) {
            fputs($socket, "STARTTLS\r\n");
            $this->serverParams($socket, "220");
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            fputs($socket, "EHLO " . $this->host . "\r\n");
            $this->serverParams($socket, "250");
        }

        // AUTH LOGIN
        fputs($socket, "AUTH LOGIN\r\n");
        $this->serverParams($socket, "334");
        fputs($socket, base64_encode($this->username) . "\r\n");
        $this->serverParams($socket, "334");
        fputs($socket, base64_encode($this->password) . "\r\n");
        $this->serverParams($socket, "235");

        // MAIL FROM
        fputs($socket, "MAIL FROM: <" . $this->fromEmail . ">\r\n");
        $this->serverParams($socket, "250");

        // RCPT TO
        fputs($socket, "RCPT TO: <" . $to . ">\r\n");
        $this->serverParams($socket, "250");

        // DATA
        fputs($socket, "DATA\r\n");
        $this->serverParams($socket, "354");

        // Headers
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=utf-8\r\n";
        $headers .= "From: " . $this->fromName . " <" . $this->fromEmail . ">\r\n";
        $headers .= "To: <" . $to . ">\r\n";
        $headers .= "Subject: " . $subject . "\r\n";

        fputs($socket, $headers . "\r\n" . $body . "\r\n.\r\n");
        $this->serverParams($socket, "250");

        // QUIT
        fputs($socket, "QUIT\r\n");
        fclose($socket);

        return true;
    }

    private function serverParams($socket, $expected_response) {
        $server_response = "";
        while (substr($server_response, 3, 1) != ' ') {
            if (!($server_response = fgets($socket, 256))) {
                throw new Exception("Error while fetching server response codes.");
            }
        }
        if (substr($server_response, 0, 3) != $expected_response) {
            throw new Exception("Unable to send email: " . $server_response);
        }
    }
}
?>
