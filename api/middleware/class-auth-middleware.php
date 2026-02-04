<?php
/**
 * Authentication Middleware
 * 
 * Verifies JWT tokens and checks permissions
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Auth_Middleware {
    
    /**
     * Verify authentication
     */
    public static function verify($request) {
        $auth_header = $request->get_header('Authorization');
        
        if (!$auth_header) {
            return new \WP_Error('no_token', 'Authorization header missing', ['status' => 401]);
        }
        
        // Check for Bearer token
        if (!preg_match('/Bearer\s+(.+)/i', $auth_header, $matches)) {
            return new \WP_Error('invalid_format', 'Invalid authorization format. Use: Bearer <token>', ['status' => 401]);
        }
        
        $token = $matches[1];
        
        // Verify token
        $jwt_auth = JWT_Auth::get_instance();
        $payload = $jwt_auth->verify_token($token);
        
        if (is_wp_error($payload)) {
            return $payload;
        }
        
        // Store user ID in request for later use
        $request->set_param('user_id', $payload['sub']);
        $request->set_param('user_payload', $payload);
        
        return true;
    }
    
    /**
     * Verify admin authentication
     */
    public static function verify_admin($request) {
        // First verify authentication
        $result = self::verify($request);
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        $user_id = $request->get_param('user_id');
        
        // Check if user has admin role
        $role_manager = Role_Manager::get_instance();
        
        if (!$role_manager->has_permission($user_id, 'admin.*') && 
            !$role_manager->has_permission($user_id, 'settings.*') &&
            !$role_manager->is_super_admin($user_id)) {
            return new \WP_Error('forbidden', 'Admin access required', ['status' => 403]);
        }
        
        return true;
    }
    
    /**
     * Verify specific permission
     */
    public static function verify_permission($permission) {
        return function($request) use ($permission) {
            $result = self::verify($request);
            
            if (is_wp_error($result)) {
                return $result;
            }
            
            $user_id = $request->get_param('user_id');
            $role_manager = Role_Manager::get_instance();
            
            if (!$role_manager->has_permission($user_id, $permission)) {
                return new \WP_Error('forbidden', "Permission '{$permission}' required", ['status' => 403]);
            }
            
            return true;
        };
    }
    
    /**
     * Verify role
     */
    public static function verify_role($role) {
        return function($request) use ($role) {
            $result = self::verify($request);
            
            if (is_wp_error($result)) {
                return $result;
            }
            
            $user_id = $request->get_param('user_id');
            $role_manager = Role_Manager::get_instance();
            
            if (!$role_manager->has_role($user_id, $role)) {
                return new \WP_Error('forbidden', "Role '{$role}' required", ['status' => 403]);
            }
            
            return true;
        };
    }
    
    /**
     * Optional authentication (doesn't fail if no token)
     */
    public static function optional($request) {
        $auth_header = $request->get_header('Authorization');
        
        if (!$auth_header) {
            return true;
        }
        
        return self::verify($request);
    }
    
    /**
     * Check feature flag
     */
    public static function check_feature($feature_name) {
        return function($request) use ($feature_name) {
            $user_id = $request->get_param('user_id');
            
            $feature_flags = Feature_Flags::get_instance();
            
            if (!$feature_flags->is_enabled($feature_name, $user_id)) {
                return new \WP_Error('feature_disabled', "Feature '{$feature_name}' is not enabled", ['status' => 403]);
            }
            
            return true;
        };
    }
    
    /**
     * Verify IP whitelist (for admin routes)
     */
    public static function verify_ip_whitelist($request) {
        $whitelist = get_option('coopvest_admin_ip_whitelist', '');
        
        if (empty($whitelist)) {
            return true; // Whitelist not configured, allow all
        }
        
        $client_ip = $_SERVER['REMOTE_ADDR'] ?? '';
        $allowed_ips = array_map('trim', explode(',', $whitelist));
        
        if (!in_array($client_ip, $allowed_ips)) {
            // Log the unauthorized attempt
            $audit = Audit_Logger::get_instance();
            $audit->log('admin.ip_blocked', [
                'entity_type' => 'admin_access',
                'new_value' => [
                    'ip' => $client_ip,
                    'attempted_path' => $request->get_route()
                ]
            ]);
            
            return new \WP_Error('ip_blocked', 'Access denied from this IP address', ['status' => 403]);
        }
        
        return true;
    }
    
    /**
     * Rate limiting check
     */
    public static function check_rate_limit($request) {
        $limiter = Rate_Limiter::get_instance();
        
        $user_id = $request->get_param('user_id') ?? $_SERVER['REMOTE_ADDR'] ?? 'anonymous';
        
        if (!$limiter->check($user_id)) {
            $retry_after = $limiter->get_retry_after($user_id);
            
            return new \WP_Error('rate_limit_exceeded', 
                'Too many requests. Please try again later.', 
                ['status' => 429, 'retry_after' => $retry_after]
            );
        }
        
        return true;
    }
    
    /**
     * Validate request data
     */
    public static function validate($schema) {
        return function($request) use ($schema) {
            $body = $request->get_json_params();
            
            foreach ($schema as $field => $rules) {
                $required = $rules['required'] ?? false;
                $type = $rules['type'] ?? 'string';
                $min = $rules['min'] ?? null;
                $max = $rules['max'] ?? null;
                $pattern = $rules['pattern'] ?? null;
                
                // Check required
                if ($required && !isset($body[$field])) {
                    return new \WP_Error('missing_field', "Required field '{$field}' is missing", ['status' => 400]);
                }
                
                if (isset($body[$field])) {
                    $value = $body[$field];
                    
                    // Type validation
                    switch ($type) {
                        case 'email':
                            if (!is_email($value)) {
                                return new \WP_Error('invalid_field', "Invalid email format for '{$field}'", ['status' => 400]);
                            }
                            break;
                            
                        case 'number':
                            if (!is_numeric($value)) {
                                return new \WP_Error('invalid_field', "'{$field}' must be a number", ['status' => 400]);
                            }
                            break;
                            
                        case 'string':
                            if (!is_string($value)) {
                                return new \WP_Error('invalid_field', "'{$field}' must be a string", ['status' => 400]);
                            }
                            break;
                            
                        case 'array':
                            if (!is_array($value)) {
                                return new \WP_Error('invalid_field', "'{$field}' must be an array", ['status' => 400]);
                            }
                            break;
                    }
                    
                    // Min/max validation
                    if ($min !== null && strlen((string)$value) < $min) {
                        return new \WP_Error('invalid_field', "'{$field}' must be at least {$min} characters", ['status' => 400]);
                    }
                    
                    if ($max !== null && strlen((string)$value) > $max) {
                        return new \WP_Error('invalid_field', "'{$field}' must not exceed {$max} characters", ['status' => 400]);
                    }
                    
                    // Pattern validation
                    if ($pattern && !preg_match($pattern, $value)) {
                        return new \WP_Error('invalid_field', "Invalid format for '{$field}'", ['status' => 400]);
                    }
                }
            }
            
            return true;
        };
    }
}
