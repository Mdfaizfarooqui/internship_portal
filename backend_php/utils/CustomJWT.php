<?php

class CustomJWT {
    // Secret Key configuration (can be moved to env later)
    private static $secret = "internhub_secret_key_2026_super_secure!";

    private static function base64UrlEncode($data) {
        $b64 = base64_encode($data);
        if ($b64 === false) return false;
        $url = strtr($b64, '+/', '-_');
        return rtrim($url, '=');
    }

    private static function base64UrlDecode($data) {
        $b64 = strtr($data, '-_', '+/');
        switch (strlen($b64) % 4) {
            case 0: break;
            case 2: $b64 .= "=="; break;
            case 3: $b64 .= "="; break;
            default: return false; 
        }
        return base64_decode($b64);
    }

    public static function encode($payload) {
        // Headers
        $headers = [
            'alg' => 'HS256',
            'typ' => 'JWT'
        ];
        $headersEncoded = self::base64UrlEncode(json_encode($headers));

        // Payload
        $payload['iat'] = time(); // Issued At
        $payload['exp'] = time() + (86400 * 7); // Expires in 7 days
        $payloadEncoded = self::base64UrlEncode(json_encode($payload));

        // Signature
        $signature = hash_hmac('sha256', "$headersEncoded.$payloadEncoded", self::$secret, true);
        $signatureEncoded = self::base64UrlEncode($signature);

        return "$headersEncoded.$payloadEncoded.$signatureEncoded";
    }

    public static function decode($token) {
        // Break up the tokens
        $parts = explode('.', $token);

        if (count($parts) !== 3) {
            return false;
        }

        $headersEncoded = $parts[0];
        $payloadEncoded = $parts[1];
        $signatureEncoded = $parts[2];

        // Verify the signature
        $signature = hash_hmac('sha256', "$headersEncoded.$payloadEncoded", self::$secret, true);
        $validSignatureEncoded = self::base64UrlEncode($signature);

        if (!hash_equals($validSignatureEncoded, $signatureEncoded)) {
            return false;
        }

        // Verify expiration
        $payload = json_decode(self::base64UrlDecode($payloadEncoded), true);
        if (isset($payload['exp']) && $payload['exp'] < time()) {
            return false;
        }

        return (object)$payload; // Return payload as object for consistency
    }
}
?>
