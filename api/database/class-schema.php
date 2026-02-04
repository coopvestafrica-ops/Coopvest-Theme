<?php
/**
 * Database Schema Helper
 * 
 * Provides schema information and utilities
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Schema {
    
    /**
     * Get all table names
     */
    public static function get_tables() {
        return [
            'coopvest_users',
            'coopvest_wallets',
            'coopvest_transactions',
            'coopvest_loans',
            'coopvest_guarantors',
            'coopvest_features',
            'coopvest_notifications',
            'coopvest_audit_logs',
            'coopvest_roles',
            'coopvest_user_roles',
            'coopvest_device_tokens',
            'coopvest_migrations'
        ];
    }
    
    /**
     * Get table prefix
     */
    public static function get_prefix() {
        global $wpdb;
        return $wpdb->prefix . 'coopvest_';
    }
    
    /**
     * Get full table name with prefix
     */
    public static function table($name) {
        global $wpdb;
        return $wpdb->prefix . $name;
    }
    
    /**
     * Check if table exists
     */
    public static function exists($name) {
        global $wpdb;
        $full_name = $wpdb->prefix . $name;
        return $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $full_name)) === $full_name;
    }
    
    /**
     * Get table structure
     */
    public static function describe($name) {
        global $wpdb;
        $full_name = $wpdb->prefix . $name;
        return $wpdb->get_results("DESCRIBE {$full_name}", ARRAY_A);
    }
    
    /**
     * Get foreign keys for a table
     */
    public static function get_foreign_keys($name) {
        global $wpdb;
        $full_name = $wpdb->prefix . $name;
        return $wpdb->get_results(
            "SELECT COLUMN_NAME, CONSTRAINT_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
             FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
             WHERE TABLE_SCHEMA = DATABASE()
             AND TABLE_NAME = %s
             AND REFERENCED_TABLE_NAME IS NOT NULL",
            ARRAY_A
        );
    }
    
    /**
     * Truncate table (careful!)
     */
    public static function truncate($name) {
        global $wpdb;
        $full_name = $wpdb->prefix . $name;
        $wpdb->query("TRUNCATE TABLE {$full_name}");
    }
    
    /**
     * Drop table
     */
    public static function drop($name) {
        global $wpdb;
        $full_name = $wpdb->prefix . $name;
        $wpdb->query("DROP TABLE IF EXISTS {$full_name}");
    }
}
