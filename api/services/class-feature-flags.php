<?php
/**
 * Feature Flags Service
 * 
 * Manages feature flags for admin-controlled feature toggling
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Feature_Flags {
    private static $instance = null;
    private $cache = [];
    private $cache_expiry = 300; // 5 minutes
    
    private function __construct() {
        $this->cache = get_transient('coopvest_feature_flags') ?: [];
    }
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Get all features
     */
    public function get_all_features($filters = []) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $where = [];
        $params = [];
        
        if (!empty($filters['category'])) {
            $where[] = 'category = %s';
            $params[] = $filters['category'];
        }
        
        if (!empty($filters['status'])) {
            $where[] = 'status = %s';
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['enabled'])) {
            $where[] = 'enabled = %d';
            $params[] = $filters['enabled'] ? 1 : 0;
        }
        
        if (!empty($filters['platform'])) {
            $where[] = 'JSON_CONTAINS(platforms, %s)';
            $params[] = json_encode($filters['platform']);
        }
        
        $sql = "SELECT * FROM {$table}";
        
        if (!empty($where)) {
            $sql .= ' WHERE ' . implode(' AND ', $where);
        }
        
        if (!empty($filters['page'])) {
            $limit = $filters['limit'] ?? 20;
            $offset = ($filters['page'] - 1) * $limit;
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        
        if (!empty($params)) {
            $results = $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A);
        } else {
            $results = $wpdb->get_results($sql, ARRAY_A);
        }
        
        // Parse JSON fields
        return array_map(function($feature) {
            $feature['platforms'] = json_decode($feature['platforms'], true);
            $feature['target_regions'] = json_decode($feature['target_regions'] ?? '[]', true);
            $feature['config'] = json_decode($feature['config'] ?? '{}', true);
            return $feature;
        }, $results ?: []);
    }
    
    /**
     * Get feature by ID
     */
    public function get_feature($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $feature = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE id = %d",
            $id
        ), ARRAY_A);
        
        if (!$feature) {
            return null;
        }
        
        return $this->parse_feature($feature);
    }
    
    /**
     * Get feature by name
     */
    public function get_feature_by_name($name) {
        // Check cache first
        if (isset($this->cache[$name])) {
            return $this->cache[$name];
        }
        
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $feature = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE name = %s",
            $name
        ), ARRAY_A);
        
        if (!$feature) {
            return null;
        }
        
        $parsed = $this->parse_feature($feature);
        $this->cache[$name] = $parsed;
        
        return $parsed;
    }
    
    /**
     * Get features for specific platform
     */
    public function get_platform_features($platform) {
        $cache_key = "platform_{$platform}";
        
        if (isset($this->cache[$cache_key])) {
            return $this->cache[$cache_key];
        }
        
        $features = $this->get_all_features(['platform' => $platform]);
        
        $this->cache[$cache_key] = $features;
        
        return $features;
    }
    
    /**
     * Check if feature is enabled
     */
    public function is_enabled($feature_name, $user_id = null, $region = null) {
        $feature = $this->get_feature_by_name($feature_name);
        
        if (!$feature) {
            return false;
        }
        
        // Check if globally enabled
        if (!$feature['enabled']) {
            return false;
        }
        
        // Check status
        if ($feature['status'] !== 'active') {
            return false;
        }
        
        // Check start/end dates
        if ($feature['start_date'] && strtotime($feature['start_date']) > time()) {
            return false;
        }
        
        if ($feature['end_date'] && strtotime($feature['end_date']) < time()) {
            return false;
        }
        
        // Check rollout percentage
        if ($feature['rollout_percentage'] < 100) {
            // Use consistent hashing based on user ID or random
            $hash = $user_id ? crc32($user_id . $feature_name) : rand(1, 100);
            if ($hash > $feature['rollout_percentage']) {
                return false;
            }
        }
        
        // Check target audience if user is provided
        if ($user_id && $feature['target_audience'] !== 'all') {
            $user_roles = $this->get_user_roles($user_id);
            if (!in_array($feature['target_audience'], $user_roles)) {
                return false;
            }
        }
        
        // Check target regions
        if ($region && !empty($feature['target_regions'])) {
            if (!in_array($region, $feature['target_regions'])) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Create new feature
     */
    public function create_feature($data) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $result = $wpdb->insert($table, [
            'name' => $data['name'],
            'display_name' => $data['display_name'],
            'description' => $data['description'] ?? '',
            'category' => $data['category'] ?? 'general',
            'platforms' => json_encode($data['platforms'] ?? ['mobile', 'web']),
            'enabled' => $data['enabled'] ?? 0,
            'rollout_percentage' => $data['rollout_percentage'] ?? 0,
            'target_audience' => $data['target_audience'] ?? 'all',
            'target_regions' => json_encode($data['target_regions'] ?? []),
            'priority' => $data['priority'] ?? 'medium',
            'status' => $data['status'] ?? 'planning',
            'config' => json_encode($data['config'] ?? []),
            'start_date' => $data['start_date'] ?? null,
            'end_date' => $data['end_date'] ?? null
        ]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to create feature', ['status' => 500]);
        }
        
        $this->clear_cache();
        
        return $this->get_feature($wpdb->insert_id);
    }
    
    /**
     * Update feature
     */
    public function update_feature($id, $data) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $update_data = [];
        $allowed_fields = ['display_name', 'description', 'category', 'platforms', 'enabled', 
                          'rollout_percentage', 'target_audience', 'target_regions', 
                          'priority', 'status', 'config', 'start_date', 'end_date'];
        
        foreach ($allowed_fields as $field) {
            if (isset($data[$field])) {
                if (in_array($field, ['platforms', 'target_regions', 'config'])) {
                    $update_data[$field] = json_encode($data[$field]);
                } else {
                    $update_data[$field] = $data[$field];
                }
            }
        }
        
        if (empty($update_data)) {
            return $this->get_feature($id);
        }
        
        $result = $wpdb->update($table, $update_data, ['id' => $id]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to update feature', ['status' => 500]);
        }
        
        $this->clear_cache();
        
        return $this->get_feature($id);
    }
    
    /**
     * Toggle feature
     */
    public function toggle_feature($id) {
        $feature = $this->get_feature($id);
        
        if (!$feature) {
            return new \WP_Error('not_found', 'Feature not found', ['status' => 404]);
        }
        
        return $this->update_feature($id, ['enabled' => !$feature['enabled']]);
    }
    
    /**
     * Update rollout percentage
     */
    public function update_rollout($id, $percentage) {
        $percentage = max(0, min(100, (int)$percentage));
        
        return $this->update_feature($id, ['rollout_percentage' => $percentage]);
    }
    
    /**
     * Update feature config
     */
    public function update_config($id, $config) {
        $feature = $this->get_feature($id);
        
        if (!$feature) {
            return new \WP_Error('not_found', 'Feature not found', ['status' => 404]);
        }
        
        $current_config = $feature['config'];
        $merged_config = array_merge($current_config, $config);
        
        return $this->update_feature($id, ['config' => $merged_config]);
    }
    
    /**
     * Delete feature
     */
    public function delete_feature($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $result = $wpdb->delete($table, ['id' => $id]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to delete feature', ['status' => 500]);
        }
        
        $this->clear_cache();
        
        return ['success' => true];
    }
    
    /**
     * Get feature statistics
     */
    public function get_stats() {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_features';
        
        $stats = [
            'total' => $wpdb->get_var("SELECT COUNT(*) FROM {$table}"),
            'enabled' => $wpdb->get_var("SELECT COUNT(*) FROM {$table} WHERE enabled = 1"),
            'by_category' => $wpdb->get_results(
                "SELECT category, COUNT(*) as count FROM {$table} GROUP BY category",
                ARRAY_N
            ),
            'by_status' => $wpdb->get_results(
                "SELECT status, COUNT(*) as count FROM {$table} GROUP BY status",
                ARRAY_N
            ),
            'by_priority' => $wpdb->get_results(
                "SELECT priority, COUNT(*) as count FROM {$table} GROUP BY priority",
                ARRAY_N
            )
        ];
        
        return $stats;
    }
    
    /**
     * Refresh cache
     */
    public function refresh_cache() {
        $this->cache = [];
        $features = $this->get_all_features();
        
        foreach ($features as $feature) {
            $this->cache[$feature['name']] = $feature;
        }
        
        set_transient('coopvest_feature_flags', $this->cache, $this->cache_expiry);
        
        return $this->cache;
    }
    
    /**
     * Clear cache
     */
    private function clear_cache() {
        $this->cache = [];
        delete_transient('coopvest_feature_flags');
    }
    
    /**
     * Parse feature data
     */
    private function parse_feature($feature) {
        return [
            'id' => (int)$feature['id'],
            'name' => $feature['name'],
            'display_name' => $feature['display_name'],
            'description' => $feature['description'],
            'category' => $feature['category'],
            'platforms' => json_decode($feature['platforms'], true),
            'enabled' => (bool)$feature['enabled'],
            'rollout_percentage' => (int)$feature['rollout_percentage'],
            'target_audience' => $feature['target_audience'],
            'target_regions' => json_decode($feature['target_regions'] ?? '[]', true),
            'priority' => $feature['priority'],
            'status' => $feature['status'],
            'config' => json_decode($feature['config'] ?? '{}', true),
            'start_date' => $feature['start_date'],
            'end_date' => $feature['end_date'],
            'created_at' => $feature['created_at'],
            'updated_at' => $feature['updated_at']
        ];
    }
    
    /**
     * Get user roles
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
        
        return $roles ?: ['member'];
    }
    
    /**
     * Get default features for mobile app
     */
    public function get_mobile_default_features() {
        return [
            'loan_application' => true,
            'guarantor_system' => true,
            'qr_verification' => true,
            'two_factor_auth' => false,
            'biometric_login' => true,
            'push_notifications' => true,
            'email_notifications' => true,
            'referral_program' => true,
            'investment_features' => true,
            'offline_mode' => true,
            'salary_deduction' => true,
            'rollover_requests' => true,
            'risk_scoring' => false,
            'compliance_tools' => false
        ];
    }
}
