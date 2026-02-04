<?php
/**
 * CORS Handler
 * 
 * Handles Cross-Origin Resource Sharing
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class CORS_Handler {
    
    /**
     * Get allowed origins
     */
    public static function get_allowed_origins() {
        $origin = get_option('coopvest_cors_origin', '*');
        
        if ($origin === '*') {
            return ['*'];
        }
        
        return array_map('trim', explode(',', $origin));
    }
    
    /**
     * Check if origin is allowed
     */
    public static function is_origin_allowed($origin) {
        $allowed = self::get_allowed_origins();
        
        if (in_array('*', $allowed)) {
            return true;
        }
        
        return in_array($origin, $allowed);
    }
    
    /**
     * Get request origin
     */
    public static function get_request_origin() {
        $origin = $_SERVER['HTTP_ORIGIN'] ?? $_SERVER['HTTP_REFERER'] ?? '';
        
        if (empty($origin)) {
            // Try to get from Origin header
            $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
        }
        
        return $origin;
    }
    
    /**
     * Add CORS headers to response
     */
    public static function add_headers() {
        $origin = self::get_request_origin();
        
        // In development, allow all
        if (defined('WP_DEBUG') && WP_DEBUG) {
            header('Access-Control-Allow-Origin: *');
        } else {
            $allowed = self::get_allowed_origins();
            
            if (in_array('*', $allowed)) {
                header('Access-Control-Allow-Origin: *');
            } elseif (self::is_origin_allowed($origin)) {
                header('Access-Control-Allow-Origin: ' . $origin);
            }
        }
        
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-ID, X-Requested-With');
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');
        header('Access-Control-Expose-Headers: X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset');
    }
    
    /**
     * Handle OPTIONS preflight request
     */
    public static function handle_preflight() {
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            self::add_headers();
            status_header(200);
            exit;
        }
    }
    
    /**
     * Register CORS for REST API
     */
    public static function register() {
        add_action('rest_api_init', function() {
            self::add_headers();
        }, 15);
        
        add_action('init', function() {
            self::handle_preflight();
        });
    }
}
