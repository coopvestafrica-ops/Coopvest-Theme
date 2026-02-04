<?php
/**
 * Guarantor Routes
 * 
 * REST API endpoints for guarantor management
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_guarantor_routes() {
    // Confirm as guarantor
    register_rest_route('coopvest/v1', '/guarantors/confirm', [
        'methods' => 'POST',
        'callback' => 'coopvest_confirm_guarantor',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'loan_id' => ['required' => true, 'type' => 'string'],
            'biometric_data' => ['type' => 'object']
        ]
    ]);
    
    // Parse QR code data
    register_rest_route('coopvest/v1', '/guarantors/parse-qr', [
        'methods' => 'POST',
        'callback' => 'coopvest_parse_qr',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'qr_data' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    // Get guaranteed loans
    register_rest_route('coopvest/v1', '/guarantors/loans', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_guaranteed_loans',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Get guarantor limit info
    register_rest_route('coopvest/v1', '/guarantors/limit', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_guarantor_limit',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
}

/**
 * Verify authentication
 */
function coopvest_verify_auth($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    return !is_wp_error($auth);
}

/**
 * Confirm as guarantor
 */
function coopvest_confirm_guarantor($request) {
    $user_id = $request->get_param('user_id');
    $loan_id = $request->get_param('loan_id');
    $biometric_data = $request->get_param('biometric_data') ?: [];
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $result = $loan_manager->confirm_guarantor($loan_id, $user_id, $biometric_data);
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    // Log action
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_guarantor($user_id, 'confirm', $loan_id, $result['guarantor_id'], [
        'position' => $result['position'],
        'biometric_verified' => !empty($biometric_data)
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => $result['status'] === 'ready_for_approval' 
            ? 'Guarantor confirmed! Loan is now ready for approval.'
            : 'Guarantor confirmed. Waiting for remaining guarantors.',
        'data' => $result
    ], 201);
}

/**
 * Parse QR code data
 */
function coopvest_parse_qr($request) {
    $qr_data = $request->get_param('qr_data');
    
    $qr_generator = \Coopvest\QR_Generator::get_instance();
    $parsed = $qr_generator->parse_qr_data($qr_data);
    
    if (is_wp_error($parsed)) {
        return $parsed;
    }
    
    // Get loan details
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->get_loan($parsed['loanId']);
    
    if (!$loan) {
        return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'loan' => [
                'id' => $loan['loan_id'],
                'borrower_name' => $loan['user_name'],
                'amount' => (float)$loan['amount'],
                'tenor' => (int)$loan['tenor'],
                'interest_rate' => (float)$loan['interest_rate'],
                'monthly_repayment' => (float)$loan['monthly_repayment'],
                'purpose' => $loan['purpose']
            ],
            'guarantor_position' => $parsed['guarantorsRequired'] - ($loan['metadata']['guarantors_confirmed'] ?? 0),
            'expires_at' => $parsed['expiresAt']
        ]
    ]);
}

/**
 * Get guaranteed loans
 */
function coopvest_get_guaranteed_loans($request) {
    $user_id = $request->get_param('user_id');
    
    global $wpdb;
    
    $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    $users_table = $wpdb->prefix . 'coopvest_users';
    
    $guaranteed = $wpdb->get_results($wpdb->prepare(
        "SELECT g.*, l.amount, l.loan_id, l.status as loan_status, 
         l.monthly_repayment, l.tenor, u.display_name as borrower_name
         FROM {$guarantors_table} g 
         INNER JOIN {$loans_table} l ON g.loan_id = l.id 
         INNER JOIN {$users_table} u ON l.user_id = u.ID 
         WHERE g.user_id = %d 
         ORDER BY g.created_at DESC",
        $user_id
    ), ARRAY_A);
    
    // Calculate total guaranteed amount
    $total_guaranteed = 0;
    $active_guaranteed = 0;
    
    foreach ($guaranteed as $g) {
        if ($g['status'] === 'confirmed') {
            $total_guaranteed += (float)$g['amount'];
            if (in_array($g['loan_status'], ['active', 'pending', 'under_review'])) {
                $active_guaranteed += (float)$g['amount'];
            }
        }
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'loans' => $guaranteed,
            'total_guaranteed' => $total_guaranteed,
            'active_guaranteed' => $active_guaranteed,
            'count' => count($guaranteed)
        ]
    ]);
}

/**
 * Get guarantor limit info
 */
function coopvest_get_guarantor_limit($request) {
    $user_id = $request->get_param('user_id');
    
    global $wpdb;
    
    $users_table = $wpdb->prefix . 'coopvest_users';
    
    $profile = $wpdb->get_row($wpdb->prepare(
        "SELECT guarantor_limit, guarantor_used FROM {$users_table} WHERE user_id = %d",
        $user_id
    ), ARRAY_A);
    
    $guarantor_limit = (float)($profile['guarantor_limit'] ?? 0);
    $guarantor_used = (float)($profile['guarantor_used'] ?? 0);
    
    if ($guarantor_limit == 0) {
        // Calculate from average contribution
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        $avg_contribution = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(amount) FROM {$transactions_table} 
             WHERE user_id = %d AND type = 'contribution' AND status = 'completed'",
            $user_id
        )) ?: 0;
        
        $guarantor_limit = max(500000, (float)$avg_contribution * 3);
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'limit' => $guarantor_limit,
            'used' => $guarantor_used,
            'available' => $guarantor_limit - $guarantor_used,
            'percentage_used' => $guarantor_limit > 0 ? round(($guarantor_used / $guarantor_limit) * 100, 2) : 0
        ]
    ]);
}
