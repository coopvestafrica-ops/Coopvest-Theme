<?php
/**
 * JWT Authentication Service
 * 
 * Handles token generation, validation, and refresh for API access
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class JWT_Auth {
    private static $instance = null;
    private $secret_key;
    private $algorithm = 'HS256';
    private $access_token_expiry;
    private $refresh_token_expiry;
    
    private function __construct() {
        $this->secret_key = defined('COOPVEST_JWT_SECRET') ? COOPVEST_JWT_SECRET : wp_generate_password(64, true, true);
        $this->access_token_expiry = defined('COOPVEST_JWT_EXPIRY') ? COOPVEST_JWT_EXPIRY : HOUR_IN_SECONDS;
        $this->refresh_token_expiry = defined('COOPVEST_REFRESH_EXPIRY') ? COOPVEST_REFRESH_EXPIRY : DAY_IN_SECONDS * 7;
    }
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Generate access token for user
     */
    public function generate_access_token($user_id, $additional_claims = []) {
        $issued_at = time();
        $expires_at = $issued_at + $this->access_token_expiry;
        
        $payload = array_merge([
            'iss' => get_site_url(),
            'sub' => $user_id,
            'iat' => $issued_at,
            'exp' => $expires_at,
            'type' => 'access',
            'jti' => $this->generate_jti()
        ], $additional_claims);
        
        return $this->encode($payload);
    }
    
    /**
     * Generate refresh token for user
     */
    public function generate_refresh_token($user_id) {
        $issued_at = time();
        $expires_at = $issued_at + $this->refresh_token_expiry;
        
        $payload = [
            'iss' => get_site_url(),
            'sub' => $user_id,
            'iat' => $issued_at,
            'exp' => $expires_at,
            'type' => 'refresh',
            'jti' => $this->generate_jti()
        ];
        
        return $this->encode($payload);
    }
    
    /**
     * Generate token pair (access + refresh)
     */
    public function generate_token_pair($user_id, $additional_claims = []) {
        $user = get_userdata($user_id);
        
        $additional_claims = array_merge([
            'user' => [
                'id' => $user_id,
                'email' => $user->user_email,
                'login' => $user->user_login,
                'roles' => $this->get_user_roles($user_id)
            ]
        ], $additional_claims);
        
        return [
            'access_token' => $this->generate_access_token($user_id, $additional_claims),
            'refresh_token' => $this->generate_refresh_token($user_id),
            'token_type' => 'Bearer',
            'expires_in' => $this->access_token_expiry
        ];
    }
    
    /**
     * Verify and decode token
     */
    public function verify_token($token) {
        try {
            $parts = explode('.', $token);
            
            if (count($parts) !== 3) {
                return new \WP_Error('invalid_token', 'Invalid token format', ['status' => 401]);
            }
            
            $header = $this->base64_decode($parts[0]);
            $payload = $this->base64_decode($parts[1]);
            $signature = $parts[2];
            
            $header_data = json_decode($header, true);
            $payload_data = json_decode($payload, true);
            
            // Verify signature
            $expected_signature = $this->generate_signature($parts[0], $parts[1]);
            
            if (!$this->verify_signature($expected_signature, $signature)) {
                return new \WP_Error('invalid_signature', 'Invalid token signature', ['status' => 401]);
            }
            
            // Check expiration
            if (isset($payload_data['exp']) && $payload_data['exp'] < time()) {
                return new \WP_Error('token_expired', 'Token has expired', ['status' => 401]);
            }
            
            // Check not before
            if (isset($payload_data['nbf']) && $payload_data['nbf'] > time()) {
                return new \WP_Error('token_not_yet_valid', 'Token not yet valid', ['status' => 401]);
            }
            
            return $payload_data;
            
        } catch (\Exception $e) {
            return new \WP_Error('token_error', 'Token verification failed: ' . $e->getMessage(), ['status' => 401]);
        }
    }
    
    /**
     * Refresh access token using refresh token
     */
    public function refresh_access_token($refresh_token) {
        $payload = $this->verify_token($refresh_token);
        
        if (is_wp_error($payload)) {
            return $payload;
        }
        
        if ($payload['type'] !== 'refresh') {
            return new \WP_Error('invalid_token_type', 'Invalid token type', ['status' => 401]);
        }
        
        $user_id = $payload['sub'];
        
        // Verify user still exists and is active
        $user = get_userdata($user_id);
        if (!$user) {
            return new \WP_Error('user_not_found', 'User no longer exists', ['status' => 401]);
        }
        
        // Check if user is not banned
        if (get_user_meta($user_id, 'coopvest_banned', true)) {
            return new \WP_Error('user_banned', 'User account is suspended', ['status' => 403]);
        }
        
        return $this->generate_token_pair($user_id);
    }
    
    /**
     * Validate user credentials
     */
    public function validate_credentials($username, $password) {
        $user = wp_authenticate_username_password(null, $username, $password);
        
        if (is_wp_error($user)) {
            // Check if too many failed attempts
            $this->check_login_attempts($username);
            return $user;
        }
        
        // Check if user is banned
        if (get_user_meta($user->ID, 'coopvest_banned', true)) {
            return new \WP_Error('account_suspended', 'Your account has been suspended. Please contact support.', ['status' => 403]);
        }
        
        // Clear failed login attempts on successful login
        $this->clear_login_attempts($username);
        
        return $user;
    }
    
    /**
     * Check login attempts for rate limiting
     */
    private function check_login_attempts($username) {
        $max_attempts = get_option('coopvest_max_login_attempts', 5);
        $lockout_duration = get_option('coopvest_lockout_duration', 15) * 60;
        
        $attempts = get_transient('coopvest_login_attempts_' . md5($username)) ?: 0;
        
        if ($attempts >= $max_attempts) {
            $lockout_time = get_transient('coopvest_login_lockout_' . md5($username));
            if ($lockout_time) {
                $remaining = ceil(($lockout_time - time()) / 60);
                return new \WP_Error('too_many_attempts', 
                    "Too many failed login attempts. Please try again in {$remaining} minutes.", 
                    ['status' => 429]
                );
            }
        }
        
        return null;
    }
    
    /**
     * Increment login attempts
     */
    public function increment_login_attempts($username) {
        $max_attempts = get_option('coopvest_max_login_attempts', 5);
        $lockout_duration = get_option('coopvest_lockout_duration', 15) * 60;
        
        $attempts = get_transient('coopvest_login_attempts_' . md5($username)) ?: 0;
        $attempts++;
        
        set_transient('coopvest_login_attempts_' . md5($username), $attempts, $lockout_duration);
        
        if ($attempts >= $max_attempts) {
            set_transient('coopvest_login_lockout_' . md5($username), time() + $lockout_duration, $lockout_duration);
        }
    }
    
    /**
     * Clear login attempts on successful login
     */
    private function clear_login_attempts($username) {
        delete_transient('coopvest_login_attempts_' . md5($username));
        delete_transient('coopvest_login_lockout_' . md5($username));
    }
    
    /**
     * Get user roles from custom roles table
     */
    private function get_user_roles($user_id) {
        global $wpdb;
        
        $roles_table = $wpdb->prefix . 'coopvest_roles';
        $user_roles_table = $wpdb->prefix . 'coopvest_user_roles';
        
        $roles = $wpdb->get_col($wpdb->prepare(
            "SELECT r.name FROM {$roles_table} r 
             INNER JOIN {$user_roles_table} ur ON r.id = ur.role_id 
             WHERE ur.user_id = %d AND (ur.expires_at IS NULL OR ur.expires_at > NOW())",
            $user_id
        ));
        
        if (empty($roles)) {
            // Get WordPress roles as fallback
            $user = get_userdata($user_id);
            $roles = $user->roles;
        }
        
        return $roles;
    }
    
    /**
     * Check if user has permission
     */
    public function check_permission($user_id, $permission) {
        $roles = $this->get_user_roles($user_id);
        
        global $wpdb;
        $roles_table = $wpdb->prefix . 'coopvest_roles';
        
        foreach ($roles as $role_name) {
            $role_permissions = $wpdb->get_var($wpdb->prepare(
                "SELECT permissions FROM {$roles_table} WHERE name = %s",
                $role_name
            ));
            
            if ($role_permissions) {
                $permissions = json_decode($role_permissions, true);
                
                // Check for wildcard permission
                if (in_array('*', $permissions)) {
                    return true;
                }
                
                // Check for specific permission
                if (in_array($permission, $permissions)) {
                    return true;
                }
                
                // Check for parent permission (e.g., loans.view covers loans.*)
                foreach ($permissions as $p) {
                    if (strpos($p, $permission) === 0 && (substr($p, -1) === '*' || $p === $permission)) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    /**
     * Generate unique token ID
     */
    private function generate_jti() {
        return bin2hex(random_bytes(16));
    }
    
    /**
     * Encode payload to JWT
     */
    private function encode($payload) {
        $header = [
            'typ' => 'JWT',
            'alg' => $this->algorithm
        ];
        
        $header_encoded = $this->base64_encode(json_encode($header));
        $payload_encoded = $this->base64_encode(json_encode($payload));
        
        $signature = $this->generate_signature($header_encoded, $payload_encoded);
        
        return $header_encoded . '.' . $payload_encoded . '.' . $signature;
    }
    
    /**
     * Generate signature
     */
    private function generate_signature($header_encoded, $payload_encoded) {
        $data = $header_encoded . '.' . $payload_encoded;
        $hash = hash_hmac('sha256', $data, $this->secret_key, true);
        return $this->base64_encode($hash);
    }
    
    /**
     * Verify signature
     */
    private function verify_signature($expected, $actual) {
        return hash_equals($expected, $actual);
    }
    
    /**
     * Base64 URL encode
     */
    private function base64_encode($data) {
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Base64 URL decode
     */
    private function base64_decode($data) {
        $padding = 4 - (strlen($data) % 4);
        if ($padding !== 4) {
            $data .= str_repeat('=', $padding);
        }
        return base64_decode(strtr($data, '-_', '+/'));
    }
    
    /**
     * Get token expiry time
     */
    public function get_token_expiry() {
        return $this->access_token_expiry;
    }
}
