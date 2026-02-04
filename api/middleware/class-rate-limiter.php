<?php
/**
 * Rate Limiter
 * 
 * Implements request rate limiting
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Rate_Limiter {
    private static $instance = null;
    private $limits = [];
    
    private function __construct() {
        // Configure default limits
        $this->limits = [
            'default' => [
                'requests' => 100,
                'window' => 15 * MINUTE_IN_SECONDS // 15 minutes
            ],
            'auth' => [
                'requests' => 10,
                'window' => 15 * MINUTE_IN_SECONDS // 15 minutes
            ],
            'api' => [
                'requests' => 200,
                'window' => MINUTE_IN_SECONDS // 1 minute
            ]
        ];
    }
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Check if request is within limits
     */
    public function check($identifier, $type = 'default') {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        $key = $this->get_key($identifier, $type);
        
        $current = get_transient($key) ?: 0;
        
        return $current < $limit['requests'];
    }
    
    /**
     * Increment request counter
     */
    public function increment($identifier, $type = 'default') {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        $key = $this->get_key($identifier, $type);
        
        $current = get_transient($key) ?: 0;
        $current++;
        
        set_transient($key, $current, $limit['window']);
        
        return $current;
    }
    
    /**
     * Get remaining requests
     */
    public function remaining($identifier, $type = 'default') {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        $key = $this->get_key($identifier, $type);
        
        $current = get_transient($key) ?: 0;
        
        return max(0, $limit['requests'] - $current);
    }
    
    /**
     * Get retry after seconds
     */
    public function get_retry_after($identifier, $type = 'default') {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        $key = $this->get_key($identifier, $type);
        
        $ttl = get_transient($key);
        
        if (!$ttl) {
            return 0;
        }
        
        return min($limit['window'], $ttl);
    }
    
    /**
     * Get rate limit headers
     */
    public function get_headers($identifier, $type = 'default') {
        $limit = $this->limits[$type] ?? $this->limits['default'];
        
        return [
            'X-RateLimit-Limit' => $limit['requests'],
            'X-RateLimit-Remaining' => $this->remaining($identifier, $type),
            'X-RateLimit-Reset' => time() + $this->get_retry_after($identifier, $type)
        ];
    }
    
    /**
     * Get cache key
     */
    private function get_key($identifier, $type) {
        return 'coopvest_rate_' . md5($type . '_' . $identifier);
    }
    
    /**
     * Reset limit for identifier
     */
    public function reset($identifier, $type = 'default') {
        $key = $this->get_key($identifier, $type);
        delete_transient($key);
        
        return true;
    }
    
    /**
     * Add custom limit type
     */
    public function add_limit_type($name, $requests, $window) {
        $this->limits[$name] = [
            'requests' => $requests,
            'window' => $window
        ];
    }
}
