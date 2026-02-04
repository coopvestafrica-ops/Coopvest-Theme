<?php
/**
 * Coopvest Africa - Main API Bootstrap
 * 
 * WordPress REST API Extension for Full-Stack Cooperative Financial Services
 * 
 * @version 1.0.0
 * @author Coopvest Africa
 */

if (!defined('ABSPATH')) {
    exit;
}

// Define constants
define('COOPVEST_API_VERSION', '1.0.0');
define('COOPVEST_API_PREFIX', 'coopvest/v1');
define('COOPVEST_API_DIR', get_template_directory() . '/api');
define('COOPVEST_API_URL', get_template_directory_uri() . '/api');
define('COOPVEST_JWT_SECRET', defined('JWT_AUTH_SECRET_KEY') ? JWT_AUTH_SECRET_KEY : wp_generate_password(64, true, true));
define('COOPVEST_JWT_EXPIRY', HOUR_IN_SECONDS);
define('COOPVEST_REFRESH_EXPIRY', DAY_IN_SECONDS * 7);

// Load Composer autoloader if available
$autoload_path = COOPVEST_API_DIR . '/vendor/autoload.php';
if (file_exists($autoload_path)) {
    require_once $autoload_path;
}

// Load core files
require_once COOPVEST_API_DIR . '/database/class-migration-runner.php';
require_once COOPVEST_API_DIR . '/database/class-schema.php';
require_once COOPVEST_API_DIR . '/services/class-jwt-auth.php';
require_once COOPVEST_API_DIR . '/services/class-feature-flags.php';
require_once COOPVEST_API_DIR . '/services/class-qr-generator.php';
require_once COOPVEST_API_DIR . '/services/class-pdf-generator.php';
require_once COOPVEST_API_DIR . '/services/class-firebase-notifications.php';
require_once COOPVEST_API_DIR . '/services/class-websocket-manager.php';
require_once COOPVEST_API_DIR . '/services/class-role-manager.php';
require_once COOPVEST_API_DIR . '/services/class-wallet-manager.php';
require_once COOPVEST_API_DIR . '/services/class-loan-manager.php';
require_once COOPVEST_API_DIR . '/services/class-audit-logger.php';

// Load middleware
require_once COOPVEST_API_DIR . '/middleware/class-auth-middleware.php';
require_once COOPVEST_API_DIR . '/middleware/class-rate-limiter.php';
require_once COOPVEST_API_DIR . '/middleware/class-cors-handler.php';

// Load route files
require_once COOPVEST_API_DIR . '/auth/routes.php';
require_once COOPVEST_API_DIR . '/features/routes.php';
require_once COOPVEST_API_DIR . '/loans/routes.php';
require_once COOPVEST_API_DIR . '/wallet/routes.php';
require_once COOPVEST_API_DIR . '/guarantors/routes.php';
require_once COOPVEST_API_DIR . '/notifications/routes.php';
require_once COOPVEST_API_DIR . '/users/routes.php';
require_once COOPVEST_API_DIR . '/reports/routes.php';

/**
 * Initialize the API on WordPress init
 */
function coopvest_api_init() {
    // Initialize database tables
    add_action('coopvest_install_tables', 'coopvest_create_database_tables');
    
    // Register REST API routes
    add_action('rest_api_init', 'coopvest_register_api_routes');
    
    // Initialize services
    add_action('init', 'coopvest_init_services');
    
    // Handle WebSocket upgrade
    add_action('rest_api_init', 'coopvest_handle_websocket_upgrade');
    
    // CORS headers
    add_action('rest_api_init', 'coopvest_add_cors_headers');
}
add_action('after_setup_theme', 'coopvest_api_init');

/**
 * Initialize all services
 */
function coopvest_init_services() {
    // Initialize JWT Auth
    \Coopvest\JWT_Auth::get_instance();
    
    // Initialize Feature Flags
    \Coopvest\Feature_Flags::get_instance();
    
    // Initialize Role Manager
    \Coopvest\Role_Manager::get_instance();
    
    // Initialize WebSocket Manager
    \Coopvest\WebSocket_Manager::get_instance();
    
    // Initialize Wallet Manager
    \Coopvest\Wallet_Manager::get_instance();
    
    // Initialize Loan Manager
    \Coopvest\Loan_Manager::get_instance();
    
    // Run database migrations
    do_action('coopvest_install_tables');
}

/**
 * Register all REST API routes
 */
function coopvest_register_api_routes() {
    // Auth routes
    coopvest_register_auth_routes();
    
    // Feature routes
    coopvest_register_feature_routes();
    
    // Loan routes
    coopvest_register_loan_routes();
    
    // Wallet routes
    coopvest_register_wallet_routes();
    
    // Guarantor routes
    coopvest_register_guarantor_routes();
    
    // Notification routes
    coopvest_register_notification_routes();
    
    // User routes
    coopvest_register_user_routes();
    
    // Report routes
    coopvest_register_report_routes();
}

/**
 * Create database tables on activation
 */
function coopvest_create_database_tables() {
    global $wpdb;
    
    $charset_collate = $wpdb->get_charset_collate();
    
    // Users table (extends WP users)
    $users_table = $wpdb->prefix . 'coopvest_users';
    $sql_users = "CREATE TABLE {$users_table} (
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
    
    // Wallets table
    $wallets_table = $wpdb->prefix . 'coopvest_wallets';
    $sql_wallets = "CREATE TABLE {$wallets_table} (
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
    
    // Transactions table
    $transactions_table = $wpdb->prefix . 'coopvest_transactions';
    $sql_transactions = "CREATE TABLE {$transactions_table} (
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
    
    // Loans table
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    $sql_loans = "CREATE TABLE {$loans_table} (
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
    
    // Guarantors table
    $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
    $sql_guarantors = "CREATE TABLE {$guarantors_table} (
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
    
    // Feature flags table
    $features_table = $wpdb->prefix . 'coopvest_features';
    $sql_features = "CREATE TABLE {$features_table} (
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
    
    // Notifications table
    $notifications_table = $wpdb->prefix . 'coopvest_notifications';
    $sql_notifications = "CREATE TABLE {$notifications_table} (
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
    
    // Audit log table
    $audit_table = $wpdb->prefix . 'coopvest_audit_logs';
    $sql_audit = "CREATE TABLE {$audit_table} (
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
    
    // Roles table
    $roles_table = $wpdb->prefix . 'coopvest_roles';
    $sql_roles = "CREATE TABLE {$roles_table} (
        id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) UNIQUE NOT NULL,
        display_name VARCHAR(100) NOT NULL,
        description TEXT,
        permissions JSON NOT NULL,
        capabilities JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) {$charset_collate};";
    
    // User roles table
    $user_roles_table = $wpdb->prefix . 'coopvest_user_roles';
    $sql_user_roles = "CREATE TABLE {$user_roles_table} (
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
    
    dbDelta($users_table);
    dbDelta($wallets_table);
    dbDelta($transactions_table);
    dbDelta($loans_table);
    dbDelta($guarantors_table);
    dbDelta($features_table);
    dbDelta($notifications_table);
    dbDelta($audit_table);
    dbDelta($roles_table);
    dbDelta($user_roles_table);
    
    // Create indexes for better performance
    $wpdb->query("CREATE INDEX idx_wallet_user ON {$wallets_table}(user_id);");
    $wpdb->query("CREATE INDEX idx_transaction_user ON {$transactions_table}(user_id);");
    $wpdb->query("CREATE INDEX idx_loan_user ON {$loans_table}(user_id);");
    $wpdb->query("CREATE INDEX idx_guarantor_loan ON {$guarantors_table}(loan_id);");
    $wpdb->query("CREATE INDEX idx_notification_user ON {$notifications_table}(user_id);");
    $wpdb->query("CREATE INDEX idx_audit_user ON {$audit_table}(user_id);");
    
    // Insert default roles
    coopvest_insert_default_roles();
    
    // Insert default feature flags
    coopvest_insert_default_features();
}

/**
 * Insert default roles
 */
function coopvest_insert_default_roles() {
    global $wpdb;
    
    $roles_table = $wpdb->prefix . 'coopvest_roles';
    
    $roles = [
        [
            'name' => 'super_admin',
            'display_name' => 'Super Administrator',
            'description' => 'Full system access with all permissions',
            'permissions' => ['*'],
            'capabilities' => ['manage_options', 'manage_users', 'manage_roles', 'view_audit_logs']
        ],
        [
            'name' => 'loan_officer',
            'display_name' => 'Loan Officer',
            'description' => 'Can review and approve loan applications',
            'permissions' => ['loans.view', 'loans.approve', 'loans.reject', 'members.view'],
            'capabilities' => ['edit_users']
        ],
        [
            'name' => 'risk_officer',
            'display_name' => 'Risk Officer',
            'description' => 'Can view risk assessments and compliance data',
            'permissions' => ['risk.view', 'compliance.view', 'reports.view', 'members.view', 'loans.view'],
            'capabilities' => ['read']
        ],
        [
            'name' => 'member',
            'display_name' => 'Member',
            'description' => 'Regular cooperative member',
            'permissions' => ['wallet.view', 'wallet.deposit', 'loans.apply', 'guarantor.confirm'],
            'capabilities' => ['read']
        ]
    ];
    
    foreach ($roles as $role) {
        $wpdb->replace($roles_table, $role);
    }
}

/**
 * Insert default feature flags
 */
function coopvest_insert_default_features() {
    global $wpdb;
    
    $features_table = $wpdb->prefix . 'coopvest_features';
    
    $features = [
        [
            'name' => 'loan_application',
            'display_name' => 'Loan Application',
            'description' => 'Enable loan application feature',
            'category' => 'core',
            'platforms' => json_encode(['mobile', 'web']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'high',
            'status' => 'active',
            'config' => json_encode(['maxLoanAmount' => 5000000, 'minLoanAmount' => 50000, 'guarantorsRequired' => 3])
        ],
        [
            'name' => 'guarantor_system',
            'display_name' => 'Guarantor System',
            'description' => 'Enable three-guarantor verification system',
            'category' => 'core',
            'platforms' => json_encode(['mobile', 'web']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'high',
            'status' => 'active',
            'config' => json_encode(['requiredGuarantors' => 3, 'qrExpiryDays' => 7])
        ],
        [
            'name' => 'qr_verification',
            'display_name' => 'QR Code Verification',
            'description' => 'Enable QR code generation and scanning',
            'category' => 'core',
            'platforms' => json_encode(['mobile']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'high',
            'status' => 'active'
        ],
        [
            'name' => 'biometric_login',
            'display_name' => 'Biometric Login',
            'description' => 'Enable fingerprint and face recognition login',
            'category' => 'security',
            'platforms' => json_encode(['mobile']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'medium',
            'status' => 'active'
        ],
        [
            'name' => 'push_notifications',
            'display_name' => 'Push Notifications',
            'description' => 'Enable push notifications via Firebase',
            'category' => 'notifications',
            'platforms' => json_encode(['mobile', 'web']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'medium',
            'status' => 'active'
        ],
        [
            'name' => 'investment_features',
            'display_name' => 'Investment Features',
            'description' => 'Enable investment pools and tracking',
            'category' => 'investments',
            'platforms' => json_encode(['mobile', 'web']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'medium',
            'status' => 'active'
        ],
        [
            'name' => 'offline_mode',
            'display_name' => 'Offline Mode',
            'description' => 'Enable offline data caching and sync',
            'category' => 'technical',
            'platforms' => json_encode(['mobile']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'low',
            'status' => 'active'
        ],
        [
            'name' => 'rollover_requests',
            'display_name' => 'Rollover Requests',
            'description' => 'Enable loan rollover/extension requests',
            'category' => 'loans',
            'platforms' => json_encode(['mobile', 'web']),
            'enabled' => 1,
            'rollout_percentage' => 100,
            'priority' => 'medium',
            'status' => 'active'
        ]
    ];
    
    foreach ($features as $feature) {
        $wpdb->replace($features_table, $feature);
    }
}

/**
 * Handle WebSocket upgrade request
 */
function coopvest_handle_websocket_upgrade() {
    register_rest_route(COOPVEST_API_PREFIX, '/ws/upgrade', [
        'methods' => 'GET',
        'callback' => 'coopvest_handle_ws_upgrade',
        'permission_callback' => 'coopvest_verify_ws_token'
    ]);
}

/**
 * Verify WebSocket connection token
 */
function coopvest_verify_ws_token($request) {
    $token = $request->get_header('Sec-WebSocket-Protocol');
    
    if (!$token) {
        return new WP_Error('ws_no_token', 'WebSocket token required', ['status' => 401]);
    }
    
    $jwt_auth = \Coopvest\JWT_Auth::get_instance();
    $payload = $jwt_auth->verify_token($token);
    
    if (is_wp_error($payload)) {
        return new WP_Error('ws_invalid_token', 'Invalid WebSocket token', ['status' => 401]);
    }
    
    return true;
}

/**
 * Handle WebSocket upgrade response
 */
function coopvest_handle_ws_upgrade($request) {
    return [
        'success' => true,
        'message' => 'WebSocket upgrade header sent'
    ];
}

/**
 * Add CORS headers to API responses
 */
function coopvest_add_cors_headers() {
    $origin = get_option('coopvest_cors_origin', '*');
    
    header("Access-Control-Allow-Origin: $origin");
    header("Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-ID");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
    
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
        status_header(200);
        exit;
    }
}

/**
 * Activation hook
 */
register_activation_hook(__FILE__, function() {
    do_action('coopvest_install_tables');
    
    // Set default options
    update_option('coopvest_cors_origin', '*');
    update_option('coopvest_max_login_attempts', 5);
    update_option('coopvest_lockout_duration', 15); // minutes
});

/**
 * Deactivation hook
 */
register_deactivation_hook(__FILE__, function() {
    // Cleanup if needed
});

// Initialize API on plugins_loaded
add_action('plugins_loaded', 'coopvest_api_init');
