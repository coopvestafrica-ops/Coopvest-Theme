<?php
/**
 * Report Routes
 * 
 * REST API endpoints for reports and analytics
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_report_routes() {
    // Dashboard stats
    register_rest_route('coopvest/v1', '/reports/dashboard', [
        'methods' => 'GET',
        'callback' => 'coopvest_dashboard_stats',
        'permission_callback' => 'coopvest_verify_report_viewer'
    ]);
    
    // Member statistics
    register_rest_route('coopvest/v1', '/reports/members', [
        'methods' => 'GET',
        'callback' => 'coopvest_member_stats',
        'permission_callback' => 'coopvest_verify_report_viewer'
    ]);
    
    // Loan statistics
    register_rest_route('coopvest/v1', '/reports/loans', [
        'methods' => 'GET',
        'callback' => 'coopvest_loan_stats',
        'permission_callback' => 'coopvest_verify_report_viewer'
    ]);
    
    // Wallet statistics
    register_rest_route('coopvest/v1', '/reports/wallet', [
        'methods' => 'GET',
        'callback' => 'coopvest_wallet_stats',
        'permission_callback' => 'coopvest_verify_report_viewer'
    ]);
    
    // Transaction report
    register_rest_route('coopvest/v1', '/reports/transactions', [
        'methods' => 'GET',
        'callback' => 'coopvest_transaction_report',
        'permission_callback' => 'coopvest_verify_report_viewer',
        'args' => [
            'start_date' => ['type' => 'string'],
            'end_date' => ['type' => 'string'],
            'type' => ['type' => 'string']
        ]
    ]);
    
    // Audit logs
    register_rest_route('coopvest/v1', '/reports/audit', [
        'methods' => 'GET',
        'callback' => 'coopvest_audit_report',
        'permission_callback' => 'coopvest_verify_audit_viewer',
        'args' => [
            'start_date' => ['type' => 'string'],
            'end_date' => ['type' => 'string'],
            'action' => ['type' => 'string'],
            'limit' => ['type' => 'number']
        ]
    ]);
    
    // Risk assessment report
    register_rest_route('coopvest/v1', '/reports/risk', [
        'methods' => 'GET',
        'callback' => 'coopvest_risk_report',
        'permission_callback' => 'coopvest_verify_risk_officer'
    ]);
    
    // Guarantor report
    register_rest_route('coopvest/v1', '/reports/guarantors', [
        'methods' => 'GET',
        'callback' => 'coopvest_guarantor_report',
        'permission_callback' => 'coopvest_verify_report_viewer'
    ]);
    
    // Export report
    register_rest_route('coopvest/v1', '/reports/export', [
        'methods' => 'GET',
        'callback' => 'coopvest_export_report',
        'permission_callback' => 'coopvest_verify_report_viewer',
        'args' => [
            'type' => ['required' => true, 'type' => 'string'],
            'format' => ['type' => 'string', 'default' => 'json'],
            'start_date' => ['type' => 'string'],
            'end_date' => ['type' => 'string']
        ]
    ]);
}

/**
 * Verify report viewer permission
 */
function coopvest_verify_report_viewer($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->has_permission($user_id, 'reports.view') && 
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Report view permission required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Verify audit viewer permission
 */
function coopvest_verify_audit_viewer($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->has_permission($user_id, 'audit.view') && 
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Audit view permission required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Verify risk officer permission
 */
function coopvest_verify_risk_officer($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->has_permission($user_id, 'risk.view') && 
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Risk officer access required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Dashboard statistics
 */
function coopvest_dashboard_stats($request) {
    global $wpdb;
    
    $users_table = $wpdb->prefix . 'coopvest_users';
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    $transactions_table = $wpdb->prefix . 'coopvest_transactions';
    
    // Member stats
    $total_members = $wpdb->get_var("SELECT COUNT(*) FROM {$users_table}");
    $verified_kyc = $wpdb->get_var("SELECT COUNT(*) FROM {$users_table} WHERE kyc_status = 'verified'");
    $pending_kyc = $wpdb->get_var("SELECT COUNT(*) FROM {$users_table} WHERE kyc_status = 'pending'");
    
    // Wallet stats
    $total_wallet_balance = $wpdb->get_var("SELECT SUM(wallet_balance) FROM {$users_table}");
    $total_contributions = $wpdb->get_var("SELECT SUM(total_contributions) FROM {$users_table}");
    
    // Loan stats
    $active_loans = $wpdb->get_var("SELECT COUNT(*) FROM {$loans_table} WHERE status = 'active'");
    $pending_loans = $wpdb->get_var("SELECT COUNT(*) FROM {$loans_table} WHERE status IN ('pending', 'under_review')");
    $total_loans_disbursed = $wpdb->get_var("SELECT COUNT(*) FROM {$loans_table} WHERE status IN ('active', 'completed')");
    $total_loan_amount = $wpdb->get_var("SELECT SUM(amount) FROM {$loans_table} WHERE status = 'active'");
    
    // Recent activity
    $recent_transactions = $wpdb->get_results(
        "SELECT * FROM {$transactions_table} WHERE status = 'completed' ORDER BY created_at DESC LIMIT 5",
        ARRAY_A
    );
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'members' => [
                'total' => (int)$total_members,
                'verified_kyc' => (int)$verified_kyc,
                'pending_kyc' => (int)$pending_kyc
            ],
            'wallet' => [
                'total_balance' => (float)$total_wallet_balance,
                'total_contributions' => (float)$total_contributions
            ],
            'loans' => [
                'active' => (int)$active_loans,
                'pending' => (int)$pending_loans,
                'total_disbursed' => (int)$total_loans_disbursed,
                'total_amount' => (float)$total_loan_amount
            ],
            'recent_transactions' => $recent_transactions
        ]
    ]);
}

/**
 * Member statistics
 */
function coopvest_member_stats($request) {
    global $wpdb;
    
    $users_table = $wpdb->prefix . 'coopvest_users';
    
    $stats = [
        'by_state' => $wpdb->get_results(
            "SELECT state, COUNT(*) as count FROM {$users_table} WHERE state != '' GROUP BY state ORDER BY count DESC",
            ARRAY_N
        ),
        'by_kyc_status' => $wpdb->get_results(
            "SELECT kyc_status, COUNT(*) as count FROM {$users_table} GROUP BY kyc_status",
            ARRAY_N
        ),
        'risk_distribution' => $wpdb->get_results(
            "SELECT 
                CASE 
                    WHEN risk_score < 30 THEN 'Low Risk'
                    WHEN risk_score < 60 THEN 'Medium Risk'
                    ELSE 'High Risk'
                END as risk_level,
                COUNT(*) as count
             FROM {$users_table}
             GROUP BY risk_level",
            ARRAY_N
        )
    ];
    
    return rest_ensure_response([
        'success' => true,
        'data' => $stats
    ]);
}

/**
 * Loan statistics
 */
function coopvest_loan_stats($request) {
    global $wpdb;
    
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    
    $stats = [
        'by_status' => $wpdb->get_results(
            "SELECT status, COUNT(*) as count, SUM(amount) as total_amount 
             FROM {$loans_table} 
             GROUP BY status",
            ARRAY_N
        ),
        'by_purpose' => $wpdb->get_results(
            "SELECT purpose, COUNT(*) as count, AVG(amount) as avg_amount 
             FROM {$loans_table} 
             WHERE purpose != '' 
             GROUP BY purpose",
            ARRAY_N
        ),
        'by_tenor' => $wpdb->get_results(
            "SELECT tenor, COUNT(*) as count, AVG(amount) as avg_amount 
             FROM {$loans_table} 
             GROUP BY tenor",
            ARRAY_N
        ),
        'average_interest_rate' => $wpdb->get_var("SELECT AVG(interest_rate) FROM {$loans_table} WHERE status IN ('active', 'completed')"),
        'default_rate' => 0 // Calculate based on defaulted loans
    ];
    
    return rest_ensure_response([
        'success' => true,
        'data' => $stats
    ]);
}

/**
 * Wallet statistics
 */
function coopvest_wallet_stats($request) {
    global $wpdb;
    
    $wallets_table = $wpdb->prefix . 'coopvest_wallets';
    $transactions_table = $wpdb->prefix . 'coopvest_transactions';
    
    $stats = [
        'by_type' => $wpdb->get_results(
            "SELECT wallet_type, SUM(balance) as total_balance 
             FROM {$wallets_table} 
             WHERE status = 'active'
             GROUP BY wallet_type",
            ARRAY_N
        ),
        'monthly_contributions' => $wpdb->get_results(
            "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total 
             FROM {$transactions_table} 
             WHERE type = 'contribution' AND status = 'completed' 
             GROUP BY month 
             ORDER BY month DESC 
             LIMIT 12",
            ARRAY_N
        ),
        'monthly_withdrawals' => $wpdb->get_results(
            "SELECT DATE_FORMAT(created_at, '%Y-%m') as month, SUM(amount) as total 
             FROM {$transactions_table} 
             WHERE type = 'withdrawal' AND status = 'completed' 
             GROUP BY month 
             ORDER BY month DESC 
             LIMIT 12",
            ARRAY_N
        )
    ];
    
    return rest_ensure_response([
        'success' => true,
        'data' => $stats
    ]);
}

/**
 * Transaction report
 */
function coopvest_transaction_report($request) {
    $start_date = $request->get_param('start_date');
    $end_date = $request->get_param('end_date');
    $type = $request->get_param('type');
    
    global $wpdb;
    
    $transactions_table = $wpdb->prefix . 'coopvest_transactions';
    
    $where = ['1=1'];
    $params = [];
    
    if ($start_date) {
        $where[] = 'created_at >= %s';
        $params[] = $start_date;
    }
    
    if ($end_date) {
        $where[] = 'created_at <= %s';
        $params[] = $end_date . ' 23:59:59';
    }
    
    if ($type) {
        $where[] = 'type = %s';
        $params[] = $type;
    }
    
    $sql = "SELECT * FROM {$transactions_table} WHERE " . implode(' AND ', $where);
    $sql .= " ORDER BY created_at DESC";
    
    $transactions = $params ? $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A)
                           : $wpdb->get_results($sql, ARRAY_A);
    
    // Summary
    $summary = $wpdb->get_row($wpdb->prepare(
        "SELECT 
            COUNT(*) as total_count,
            SUM(CASE WHEN type = 'contribution' THEN amount ELSE 0 END) as total_contributions,
            SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END) as total_withdrawals,
            SUM(CASE WHEN type = 'loan_disbursement' THEN amount ELSE 0 END) as total_disbursed,
            SUM(CASE WHEN type = 'loan_repayment' THEN amount ELSE 0 END) as total_repayments
         FROM {$transactions_table}
         WHERE " . implode(' AND ', $where),
        $params
    ), ARRAY_A);
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'transactions' => $transactions,
            'summary' => $summary
        ]
    ]);
}

/**
 * Audit report
 */
function coopvest_audit_report($request) {
    $filters = [];
    
    if (!empty($request->get_param('start_date'))) {
        $filters['start_date'] = $request->get_param('start_date');
    }
    if (!empty($request->get_param('end_date'))) {
        $filters['end_date'] = $request->get_param('end_date');
    }
    if (!empty($request->get_param('action'))) {
        $filters['action'] = $request->get_param('action');
    }
    if (!empty($request->get_param('limit'))) {
        $filters['limit'] = (int)$request->get_param('limit');
    }
    
    $audit = \Coopvest\Audit_Logger::get_instance();
    $logs = $audit->get_logs($filters);
    
    // Summary
    $summary = $audit->get_action_summary(
        $filters['start_date'] ?? date('Y-m-01'),
        $filters['end_date'] ?? date('Y-m-t')
    );
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'logs' => $logs,
            'summary' => $summary
        ]
    ]);
}

/**
 * Risk report
 */
function coopvest_risk_report($request) {
    global $wpdb;
    
    $users_table = $wpdb->prefix . 'coopvest_users';
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    
    $risk_stats = [
        'distribution' => $wpdb->get_results(
            "SELECT 
                CASE 
                    WHEN risk_score < 30 THEN 'Low'
                    WHEN risk_score < 60 THEN 'Medium'
                    ELSE 'High'
                END as risk_category,
                COUNT(*) as count,
                AVG(total_contributions) as avg_contributions
             FROM {$users_table}
             GROUP BY risk_category",
            ARRAY_N
        ),
        'high_risk_members' => $wpdb->get_results(
            "SELECT u.*, l.amount as loan_amount, l.status as loan_status
             FROM {$users_table} u
             LEFT JOIN {$loans_table} l ON u.user_id = l.user_id AND l.status IN ('active', 'pending')
             WHERE u.risk_score >= 60
             ORDER BY u.risk_score DESC
             LIMIT 50",
            ARRAY_A
        ),
        'guarantor_exposure' => $wpdb->get_results(
            "SELECT user_id, SUM(guarantor_used) as total_guaranteed 
             FROM {$users_table} 
             WHERE guarantor_used > 0 
             GROUP BY user_id 
             ORDER BY total_guaranteed DESC
             LIMIT 20",
            ARRAY_N
        )
    ];
    
    return rest_ensure_response([
        'success' => true,
        'data' => $risk_stats
    ]);
}

/**
 * Guarantor report
 */
function coopvest_guarantor_report($request) {
    global $wpdb;
    
    $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    
    $stats = [
        'guarantor_activity' => $wpdb->get_results(
            "SELECT user_id, COUNT(*) as confirmed_count, SUM(l.amount) as total_guaranteed
             FROM {$guarantors_table} g
             INNER JOIN {$loans_table} l ON g.loan_id = l.id
             WHERE g.status = 'confirmed'
             GROUP BY user_id
             ORDER BY confirmed_count DESC
             LIMIT 20",
            ARRAY_N
        ),
        'guarantor_outcomes' => $wpdb->get_results(
            "SELECT 
                CASE 
                    WHEN l.status = 'completed' THEN 'Loan Completed'
                    WHEN l.status = 'active' THEN 'Loan Active'
                    WHEN l.status = 'defaulted' THEN 'Loan Defaulted'
                    ELSE l.status
                END as outcome,
                COUNT(*) as count
             FROM {$guarantors_table} g
             INNER JOIN {$loans_table} l ON g.loan_id = l.id
             WHERE g.status = 'confirmed'
             GROUP BY outcome",
            ARRAY_N
        )
    ];
    
    return rest_ensure_response([
        'success' => true,
        'data' => $stats
    ]);
}

/**
 * Export report
 */
function coopvest_export_report($request) {
    $type = $request->get_param('type');
    $format = $request->get_param('format') ?: 'json';
    $start_date = $request->get_param('start_date');
    $end_date = $request->get_param('end_date');
    
    switch ($type) {
        case 'transactions':
            $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
            // Get all transactions
            global $wpdb;
            $transactions_table = $wpdb->prefix . 'coopvest_transactions';
            $data = $wpdb->get_results("SELECT * FROM {$transactions_table}", ARRAY_A);
            break;
            
        case 'members':
            global $wpdb;
            $users_table = $wpdb->prefix . 'coopvest_users';
            $data = $wpdb->get_results("SELECT * FROM {$users_table}", ARRAY_A);
            break;
            
        case 'loans':
            $loan_manager = \Coopvest\Loan_Manager::get_instance();
            $data = $loan_manager->get_all_loans();
            break;
            
        default:
            return new \WP_Error('invalid_type', 'Invalid report type', ['status' => 400]);
    }
    
    if ($format === 'csv') {
        header('Content-Type: text/csv');
        header('Content-Disposition: attachment; filename="' . $type . '_report_' . date('Y-m-d') . '.csv"');
        
        if (!empty($data)) {
            $headers = array_keys($data[0]);
            echo implode(',', $headers) . "\n";
            
            foreach ($data as $row) {
                echo implode(',', array_map(function($cell) {
                    return '"' . str_replace('"', '""', $cell) . '"';
                }, array_values($row))) . "\n";
            }
        }
        exit;
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => $data
    ]);
}
