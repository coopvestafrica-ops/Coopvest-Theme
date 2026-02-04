<?php
/**
 * Database Migration Runner
 * 
 * Manages database schema migrations
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Migration_Runner {
    private static $instance = null;
    private $migrations_table;
    private $migrations = [];
    
    private function __construct() {
        global $wpdb;
        $this->migrations_table = $wpdb->prefix . 'coopvest_migrations';
        $this->register_migrations();
    }
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Register all migrations
     */
    private function register_migrations() {
        $this->migrations = [
            '2024_01_01_000001_create_users_table' => [
                'description' => 'Create users table',
                'up' => [$this, 'migrate_create_users_table'],
                'down' => [$this, 'migrate_drop_users_table']
            ],
            '2024_01_01_000002_create_wallets_table' => [
                'description' => 'Create wallets table',
                'up' => [$this, 'migrate_create_wallets_table'],
                'down' => [$this, 'migrate_drop_wallets_table']
            ],
            '2024_01_01_000003_create_transactions_table' => [
                'description' => 'Create transactions table',
                'up' => [$this, 'migrate_create_transactions_table'],
                'down' => [$this, 'migrate_drop_transactions_table']
            ],
            '2024_01_01_000004_create_loans_table' => [
                'description' => 'Create loans table',
                'up' => [$this, 'migrate_create_loans_table'],
                'down' => [$this, 'migrate_drop_loans_table']
            ],
            '2024_01_01_000005_create_guarantors_table' => [
                'description' => Create guarantors table',
                'up' => [$this, 'migrate_create_guarantors_table'],
                'down' => [$this, 'migrate_drop_guarantors_table']
            ],
            '2024_01_01_000006_create_features_table' => [
                'description' => 'Create features table',
                'up' => [$this, 'migrate_create_features_table'],
                'down' => [$this, 'migrate_drop_features_table']
            ],
            '2024_01_01_000007_create_notifications_table' => [
                'description' => 'Create notifications table',
                'up' => [$this, 'migrate_create_notifications_table'],
                'down' => [$this, 'migrate_drop_notifications_table']
            ],
            '2024_01_01_000008_create_audit_logs_table' => [
                'description' => 'Create audit logs table',
                'up' => [$this, 'migrate_create_audit_logs_table'],
                'down' => [$this, 'migrate_drop_audit_logs_table']
            ],
            '2024_01_01_000009_create_roles_table' => [
                'description' => Create roles table',
                'up' => [$this, 'migrate_create_roles_table'],
                'down' => [$this, 'migrate_drop_roles_table']
            ],
            '2024_01_01_000010_create_user_roles_table' => [
                'description' => 'Create user roles table',
                'up' => [$this, 'migrate_create_user_roles_table'],
                'down' => [$this, 'migrate_drop_user_roles_table']
            ],
            '2024_01_01_000011_create_device_tokens_table' => [
                'description' => 'Create device tokens table',
                'up' => [$this, 'migrate_create_device_tokens_table'],
                'down' => [$this, 'migrate_drop_device_tokens_table']
            ],
            '2024_01_01_000012_add_indexes' => [
                'description' => 'Add database indexes',
                'up' => [$this, 'migrate_add_indexes'],
                'down' => [$this, 'migrate_drop_indexes']
            ]
        ];
    }
    
    /**
     * Run all pending migrations
     */
    public function migrate() {
        global $wpdb;
        
        $this->create_migrations_table();
        
        $ran_migrations = $this->get_ran_migrations();
        $to_run = array_diff(array_keys($this->migrations), $ran_migrations);
        
        if (empty($to_run)) {
            return ['success' => true, 'message' => 'No migrations to run', 'ran' => 0];
        }
        
        foreach ($to_run as $migration_key) {
            $migration = $this->migrations[$migration_key];
            
            try {
                call_user_func($migration['up']);
                $this->log_migration($migration_key);
            } catch (\Exception $e) {
                return [
                    'success' => false,
                    'message' => "Migration failed: {$migration_key}",
                    'error' => $e->getMessage()
                ];
            }
        }
        
        return [
            'success' => true,
            'message' => 'Migrations completed',
            'ran' => count($to_run)
        ];
    }
    
    /**
     * Rollback last migration batch
     */
    public function rollback() {
        global $wpdb;
        
        $ran_migrations = $this->get_ran_migrations();
        
        if (empty($ran_migrations)) {
            return ['success' => true, 'message' => 'No migrations to rollback'];
        }
        
        // Rollback in reverse order
        $reversed = array_reverse($ran_migrations);
        
        foreach ($reversed as $migration_key) {
            if (isset($this->migrations[$migration_key])) {
                $migration = $this->migrations[$migration_key];
                
                try {
                    call_user_func($migration['down']);
                    $this->remove_migration($migration_key);
                } catch (\Exception $e) {
                    return [
                        'success' => false,
                        'message' => "Rollback failed: {$migration_key}",
                        'error' => $e->getMessage()
                    ];
                }
            }
        }
        
        return [
            'success' => true,
            'message' => 'Rollback completed',
            'rolled_back' => count($reversed)
        ];
    }
    
    /**
     * Get status of all migrations
     */
    public function status() {
        global $wpdb;
        
        $this->create_migrations_table();
        
        $ran_migrations = $this->get_ran_migrations();
        
        $status = [
            'ran' => [],
            'pending' => []
        ];
        
        foreach ($this->migrations as $key => $migration) {
            if (in_array($key, $ran_migrations)) {
                $status['ran'][] = [
                    'name' => $key,
                    'description' => $migration['description'],
                    'ran_at' => $this->get_migration_date($key)
                ];
            } else {
                $status['pending'][] = [
                    'name' => $key,
                    'description' => $migration['description']
                ];
            }
        }
        
        return $status;
    }
    
    /**
     * Create migrations tracking table
     */
    private function create_migrations_table() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$this->migrations_table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            migration VARCHAR(255) NOT NULL,
            ran_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    /**
     * Get list of ran migrations
     */
    private function get_ran_migrations() {
        global $wpdb;
        
        $migrations = $wpdb->get_col("SELECT migration FROM {$this->migrations_table}");
        
        return $migrations ?: [];
    }
    
    /**
     * Log a migration as ran
     */
    private function log_migration($migration) {
        global $wpdb;
        
        $wpdb->insert($this->migrations_table, ['migration' => $migration]);
    }
    
    /**
     * Remove migration log
     */
    private function remove_migration($migration) {
        global $wpdb;
        
        $wpdb->delete($this->migrations_table, ['migration' => $migration]);
    }
    
    /**
     * Get migration run date
     */
    private function get_migration_date($migration) {
        global $wpdb;
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT ran_at FROM {$this->migrations_table} WHERE migration = %s",
            $migration
        ));
    }
    
    // Migration methods
    
    private function migrate_create_users_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_users';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            member_id VARCHAR(50) UNIQUE NOT NULL,
            phone VARCHAR(20),
            address TEXT,
            state VARCHAR(50),
            lga VARCHAR(50),
            employer_name VARCHAR(100),
            employer_phone VARCHAR(20),
            monthly_income DECIMAL(15,2) DEFAULT 0,
            bank_name VARCHAR(100),
            account_number VARCHAR(20),
            account_name VARCHAR(100),
            kyc_status ENUM('pending','verified','rejected') DEFAULT 'pending',
            kyc_data JSON,
            risk_score DECIMAL(5,2) DEFAULT 0,
            guarantor_limit DECIMAL(15,2) DEFAULT 0,
            guarantor_used DECIMAL(15,2) DEFAULT 0,
            wallet_balance DECIMAL(15,2) DEFAULT 0,
            total_contributions DECIMAL(15,2) DEFAULT 0,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_users_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_users");
    }
    
    private function migrate_create_wallets_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_wallets';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            wallet_type ENUM('savings','contribution','investment') DEFAULT 'savings',
            balance DECIMAL(15,2) DEFAULT 0,
            currency VARCHAR(3) DEFAULT 'NGN',
            status ENUM('active','frozen','closed') DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_wallets_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_wallets");
    }
    
    private function migrate_create_transactions_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_transactions';
        $wallets_table = $wpdb->prefix . 'coopvest_wallets';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            transaction_id VARCHAR(50) UNIQUE NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            wallet_id BIGINT(20) UNSIGNED,
            type ENUM('contribution','withdrawal','loan_disbursement','loan_repayment','interest','refund','transfer') NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            fee DECIMAL(15,2) DEFAULT 0,
            currency VARCHAR(3) DEFAULT 'NGN',
            status ENUM('pending','processing','completed','failed','cancelled') DEFAULT 'pending',
            reference VARCHAR(100),
            description TEXT,
            metadata JSON,
            processed_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE,
            FOREIGN KEY (wallet_id) REFERENCES {$wallets_table}(id) ON DELETE SET NULL
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_transactions_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_transactions");
    }
    
    private function migrate_create_loans_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_loans';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            loan_id VARCHAR(50) UNIQUE NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            tenor INT DEFAULT 6,
            purpose VARCHAR(100),
            interest_rate DECIMAL(5,2) NOT NULL,
            processing_fee DECIMAL(15,2) DEFAULT 0,
            monthly_repayment DECIMAL(15,2) NOT NULL,
            total_repayment DECIMAL(15,2) NOT NULL,
            status ENUM('pending','under_review','approved','rejected','active','completed','defaulted','rolled_over') DEFAULT 'pending',
            qr_code TEXT,
            qr_signature VARCHAR(255),
            qr_expires_at TIMESTAMP NULL,
            disbursement_date TIMESTAMP NULL,
            due_date TIMESTAMP NULL,
            completed_at TIMESTAMP NULL,
            metadata JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_loans_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_loans");
    }
    
    private function migrate_create_guarantors_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_guarantors';
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            guarantor_id VARCHAR(50) UNIQUE NOT NULL,
            loan_id BIGINT(20) UNSIGNED NOT NULL,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            borrower_id BIGINT(20) UNSIGNED NOT NULL,
            position INT DEFAULT 0,
            status ENUM('pending','confirmed','rejected','released') DEFAULT 'pending',
            confirmed_at TIMESTAMP NULL,
            biometric_verified TINYINT(1) DEFAULT 0,
            ip_address VARCHAR(45),
            device_id VARCHAR(100),
            signature VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (loan_id) REFERENCES {$loans_table}(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE,
            FOREIGN KEY (borrower_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_guarantors_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_guarantors");
    }
    
    private function migrate_create_features_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_features';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            description TEXT,
            category VARCHAR(50) DEFAULT 'general',
            platforms JSON DEFAULT '[\"mobile\",\"web\"]',
            enabled TINYINT(1) DEFAULT 0,
            rollout_percentage INT DEFAULT 0,
            target_audience VARCHAR(50) DEFAULT 'all',
            target_regions JSON,
            priority ENUM('high','medium','low') DEFAULT 'medium',
            status ENUM('planning','active','deprecated') DEFAULT 'planning',
            config JSON,
            start_date TIMESTAMP NULL,
            end_date TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_features_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_features");
    }
    
    private function migrate_create_notifications_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_notifications';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            type VARCHAR(50) NOT NULL,
            title VARCHAR(200) NOT NULL,
            message TEXT NOT NULL,
            data JSON,
            read TINYINT(1) DEFAULT 0,
            read_at TIMESTAMP NULL,
            sent_via JSON DEFAULT '[\"in_app\"]',
            sent_at TIMESTAMP NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_notifications_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_notifications");
    }
    
    private function migrate_create_audit_logs_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED,
            action VARCHAR(100) NOT NULL,
            entity_type VARCHAR(50),
            entity_id VARCHAR(100),
            old_value JSON,
            new_value JSON,
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_audit_logs_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_audit_logs");
    }
    
    private function migrate_create_roles_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_roles';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) UNIQUE NOT NULL,
            display_name VARCHAR(100) NOT NULL,
            description TEXT,
            permissions JSON NOT NULL,
            capabilities JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_roles_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_roles");
    }
    
    private function migrate_create_user_roles_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_user_roles';
        $roles_table = $wpdb->prefix . 'coopvest_roles';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            role_id BIGINT(20) UNSIGNED NOT NULL,
            assigned_by BIGINT(20) UNSIGNED,
            assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            expires_at TIMESTAMP NULL,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE,
            FOREIGN KEY (role_id) REFERENCES {$roles_table}(id) ON DELETE CASCADE,
            FOREIGN KEY (assigned_by) REFERENCES {$wpdb->users}(ID) ON DELETE SET NULL
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_user_roles_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_user_roles");
    }
    
    private function migrate_create_device_tokens_table() {
        global $wpdb;
        $table = $wpdb->prefix . 'coopvest_device_tokens';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            platform VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES {$wpdb->users}(ID) ON DELETE CASCADE
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
    
    private function migrate_drop_device_tokens_table() {
        global $wpdb;
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}coopvest_device_tokens");
    }
    
    private function migrate_add_indexes() {
        global $wpdb;
        
        $indexes = [
            'idx_wallet_user' => ['table' => $wpdb->prefix . 'coopvest_wallets', 'column' => 'user_id'],
            'idx_transaction_user' => ['table' => $wpdb->prefix . 'coopvest_transactions', 'column' => 'user_id'],
            'idx_transaction_type' => ['table' => $wpdb->prefix . 'coopvest_transactions', 'column' => 'type'],
            'idx_loan_user' => ['table' => $wpdb->prefix . 'coopvest_loans', 'column' => 'user_id'],
            'idx_loan_status' => ['table' => $wpdb->prefix . 'coopvest_loans', 'column' => 'status'],
            'idx_guarantor_loan' => ['table' => $wpdb->prefix . 'coopvest_guarantors', 'column' => 'loan_id'],
            'idx_guarantor_user' => ['table' => $wpdb->prefix . 'coopvest_guarantors', 'column' => 'user_id'],
            'idx_notification_user' => ['table' => $wpdb->prefix . 'coopvest_notifications', 'column' => 'user_id'],
            'idx_audit_user' => ['table' => $wpdb->prefix . 'coopvest_audit_logs', 'column' => 'user_id'],
            'idx_audit_action' => ['table' => $wpdb->prefix . 'coopvest_audit_logs', 'column' => 'action'],
            'idx_user_roles' => ['table' => $wpdb->prefix . 'coopvest_user_roles', 'column' => 'user_id'],
            'idx_device_token_user' => ['table' => $wpdb->prefix . 'coopvest_device_tokens', 'column' => 'user_id'],
        ];
        
        foreach ($indexes as $name => $index) {
            $table = $index['table'];
            $column = $index['column'];
            $wpdb->query("CREATE INDEX IF NOT EXISTS {$name} ON {$table}({$column})");
        }
    }
    
    private function migrate_drop_indexes() {
        global $wpdb;
        
        $indexes = [
            'idx_wallet_user', 'idx_transaction_user', 'idx_transaction_type',
            'idx_loan_user', 'idx_loan_status', 'idx_guarantor_loan', 'idx_guarantor_user',
            'idx_notification_user', 'idx_audit_user', 'idx_audit_action',
            'idx_user_roles', 'idx_device_token_user'
        ];
        
        foreach ($indexes as $name) {
            $wpdb->query("DROP INDEX IF EXISTS {$name}");
        }
    }
}
