<?php
/**
 * Audit Logger Service
 * 
 * Tracks all system actions for compliance and security
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Audit_Logger {
    private static $instance = null;
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Log an action
     */
    public function log($action, $data = []) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        
        $result = $wpdb->insert($table, [
            'user_id' => $data['user_id'] ?? null,
            'action' => $action,
            'entity_type' => $data['entity_type'] ?? null,
            'entity_id' => $data['entity_id'] ?? null,
            'old_value' => isset($data['old_value']) ? json_encode($data['old_value']) : null,
            'new_value' => isset($data['new_value']) ? json_encode($data['new_value']) : null,
            'ip_address' => $data['ip_address'] ?? ($_SERVER['REMOTE_ADDR'] ?? 'unknown'),
            'user_agent' => $data['user_agent'] ?? ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown')
        ]);
        
        return $result !== false;
    }
    
    /**
     * Log user action
     */
    public function log_user_action($user_id, $action, $entity_type, $entity_id, $old_value = null, $new_value = null) {
        return $this->log($action, [
            'user_id' => $user_id,
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'old_value' => $old_value,
            'new_value' => $new_value
        ]);
    }
    
    /**
     * Log authentication event
     */
    public function log_auth($user_id, $action, $success, $details = []) {
        return $this->log('auth.' . $action, [
            'user_id' => $user_id,
            'entity_type' => 'authentication',
            'new_value' => array_merge([
                'success' => $success,
                'action' => $action
            ], $details)
        ]);
    }
    
    /**
     * Log loan action
     */
    public function log_loan($user_id, $action, $loan_id, $old_value = null, $new_value = null) {
        return $this->log('loan.' . $action, [
            'user_id' => $user_id,
            'entity_type' => 'loan',
            'entity_id' => $loan_id,
            'old_value' => $old_value,
            'new_value' => $new_value
        ]);
    }
    
    /**
     * Log guarantor action
     */
    public function log_guarantor($user_id, $action, $loan_id, $guarantor_id, $details = []) {
        return $this->log('guarantor.' . $action, [
            'user_id' => $user_id,
            'entity_type' => 'guarantor',
            'entity_id' => $guarantor_id,
            'new_value' => array_merge([
                'loan_id' => $loan_id
            ], $details)
        ]);
    }
    
    /**
     * Log wallet transaction
     */
    public function log_wallet($user_id, $action, $transaction_id, $amount, $details = []) {
        return $this->log('wallet.' . $action, [
            'user_id' => $user_id,
            'entity_type' => 'wallet',
            'entity_id' => $transaction_id,
            'new_value' => array_merge([
                'amount' => $amount,
                'action' => $action
            ], $details)
        ]);
    }
    
    /**
     * Log admin action
     */
    public function log_admin($admin_id, $action, $entity_type, $entity_id, $old_value = null, $new_value = null) {
        return $this->log('admin.' . $action, [
            'user_id' => $admin_id,
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'old_value' => $old_value,
            'new_value' => $new_value
        ]);
    }
    
    /**
     * Get audit logs
     */
    public function get_logs($filters = []) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        
        $where = ['1=1'];
        $params = [];
        
        if (!empty($filters['user_id'])) {
            $where[] = 'user_id = %d';
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['action'])) {
            $where[] = 'action LIKE %s';
            $params[] = $filters['action'] . '%';
        }
        
        if (!empty($filters['entity_type'])) {
            $where[] = 'entity_type = %s';
            $params[] = $filters['entity_type'];
        }
        
        if (!empty($filters['entity_id'])) {
            $where[] = 'entity_id = %s';
            $params[] = $filters['entity_id'];
        }
        
        if (!empty($filters['start_date'])) {
            $where[] = 'created_at >= %s';
            $params[] = $filters['start_date'];
        }
        
        if (!empty($filters['end_date'])) {
            $where[] = 'created_at <= %s';
            $params[] = $filters['end_date'];
        }
        
        $sql = "SELECT * FROM {$table} WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT %d";
            $params[] = $filters['limit'];
            
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET %d";
                $params[] = $filters['offset'];
            }
        }
        
        $logs = $params ? $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A)
                       : $wpdb->get_results($sql, ARRAY_A);
        
        return array_map(function($log) {
            $log['old_value'] = json_decode($log['old_value'] ?: '{}', true);
            $log['new_value'] = json_decode($log['new_value'] ?: '{}', true);
            return $log;
        }, $logs ?: []);
    }
    
    /**
     * Get audit log count
     */
    public function get_log_count($filters = []) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        
        $where = ['1=1'];
        $params = [];
        
        if (!empty($filters['user_id'])) {
            $where[] = 'user_id = %d';
            $params[] = $filters['user_id'];
        }
        
        if (!empty($filters['action'])) {
            $where[] = 'action LIKE %s';
            $params[] = $filters['action'] . '%';
        }
        
        $sql = "SELECT COUNT(*) FROM {$table} WHERE " . implode(' AND ', $where);
        
        return $params ? $wpdb->get_var($wpdb->prepare($sql, $params)) 
                       : $wpdb->get_var($sql);
    }
    
    /**
     * Get user activity
     */
    public function get_user_activity($user_id, $limit = 50) {
        return $this->get_logs([
            'user_id' => $user_id,
            'limit' => $limit
        ]);
    }
    
    /**
     * Get entity history
     */
    public function get_entity_history($entity_type, $entity_id) {
        return $this->get_logs([
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'limit' => 100
        ]);
    }
    
    /**
     * Get action summary
     */
    public function get_action_summary($start_date, $end_date) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT action, COUNT(*) as count 
             FROM {$table} 
             WHERE created_at BETWEEN %s AND %s 
             GROUP BY action 
             ORDER BY count DESC",
            $start_date,
            $end_date
        ), ARRAY_A);
    }
    
    /**
     * Get recent activity
     */
    public function get_recent_activity($limit = 20) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        $users_table = $wpdb->users;
        $coopvest_users = $wpdb->prefix . 'coopvest_users';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT l.*, u.user_login, cu.member_id 
             FROM {$table} l 
             LEFT JOIN {$users_table} u ON l.user_id = u.ID 
             LEFT JOIN {$coopvest_users} cu ON l.user_id = cu.user_id 
             ORDER BY l.created_at DESC 
             LIMIT %d",
            $limit
        ), ARRAY_A);
    }
    
    /**
     * Export audit logs
     */
    public function export($filters = [], $format = 'json') {
        $logs = $this->get_logs($filters);
        
        if ($format === 'csv') {
            return $this->export_csv($logs);
        }
        
        return json_encode($logs, JSON_PRETTY_PRINT);
    }
    
    /**
     * Export to CSV
     */
    private function export_csv($logs) {
        if (empty($logs)) {
            return '';
        }
        
        $headers = ['ID', 'User ID', 'Action', 'Entity Type', 'Entity ID', 'IP Address', 'Created At'];
        
        $rows = [];
        foreach ($logs as $log) {
            $rows[] = [
                $log['id'],
                $log['user_id'],
                $log['action'],
                $log['entity_type'],
                $log['entity_id'],
                $log['ip_address'],
                $log['created_at']
            ];
        }
        
        $csv = implode(',', $headers) . "\n";
        
        foreach ($rows as $row) {
            $csv .= implode(',', array_map(function($cell) {
                return '"' . str_replace('"', '""', $cell) . '"';
            }, $row)) . "\n";
        }
        
        return $csv;
    }
    
    /**
     * Clean old logs
     */
    public function clean_old_logs($days_to_keep = 90) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        
        $result = $wpdb->query($wpdb->prepare(
            "DELETE FROM {$table} WHERE created_at < DATE_SUB(NOW(), INTERVAL %d DAY)",
            $days_to_keep
        ));
        
        return $result !== false;
    }
}
