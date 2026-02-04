<?php
/**
 * Loan Routes
 * 
 * REST API endpoints for loan management
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_loan_routes() {
    // Apply for loan
    register_rest_route('coopvest/v1', '/loans/apply', [
        'methods' => 'POST',
        'callback' => 'coopvest_apply_loan',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'amount' => ['required' => true, 'type' => 'number', 'min' => 50000],
            'tenor' => ['required' => true, 'type' => 'number', 'min' => 1, 'max' => 12],
            'purpose' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    // Get user's loans
    register_rest_route('coopvest/v1', '/loans', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_user_loans',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'status' => ['type' => 'string'],
            'limit' => ['type' => 'number']
        ]
    ]);
    
    // Get loan by ID
    register_rest_route('coopvest/v1', '/loans/(?P<id>[\w-]+)', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_loan',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => ['id' => ['validate_callback' => function($p) { return !empty($p); }]]
    ]);
    
    // Get loan QR code
    register_rest_route('coopvest/v1', '/loans/(?P<id>[\w-]+)/qr', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_loan_qr',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Get guarantor progress
    register_rest_route('coopvest/v1', '/loans/(?P<id>[\w-]+)/progress', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_loan_progress',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Request rollover
    register_rest_route('coopvest/v1', '/loans/(?P<id>[\w-]+)/rollover', [
        'methods' => 'POST',
        'callback' => 'coopvest_request_rollover',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'reason' => ['type' => 'string'],
            'new_tenor' => ['type' => 'number', 'min' => 1, 'max' => 12]
        ]
    ]);
    
    // Admin: Get all loans
    register_rest_route('coopvest/v1', '/admin/loans', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_all_loans',
        'permission_callback' => 'coopvest_verify_loan_officer',
        'args' => [
            'status' => ['type' => 'string'],
            'search' => ['type' => 'string'],
            'page' => ['type' => 'number']
        ]
    ]);
    
    // Admin: Approve loan
    register_rest_route('coopvest/v1', '/admin/loans/(?P<id>[\w-]+)/approve', [
        'methods' => 'POST',
        'callback' => 'coopvest_approve_loan',
        'permission_callback' => 'coopvest_verify_loan_officer'
    ]);
    
    // Admin: Reject loan
    register_rest_route('coopvest/v1', '/admin/loans/(?P<id>[\w-]+)/reject', [
        'methods' => 'POST',
        'callback' => 'coopvest_reject_loan',
        'permission_callback' => 'coopvest_verify_loan_officer',
        'args' => [
            'reason' => ['required' => true, 'type' => 'string']
        ]
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
 * Verify loan officer permission
 */
function coopvest_verify_loan_officer($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->has_permission($user_id, 'loans.approve') && 
        !$role_manager->has_permission($user_id, 'loans.*') &&
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Loan officer access required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Apply for loan
 */
function coopvest_apply_loan($request) {
    $user_id = $request->get_param('user_id');
    $data = $request->get_params();
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->apply($user_id, $data);
    
    if (is_wp_error($loan)) {
        return $loan;
    }
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Loan application submitted successfully',
        'data' => $loan
    ], 201);
}

/**
 * Get user's loans
 */
function coopvest_get_user_loans($request) {
    $user_id = $request->get_param('user_id');
    $filters = [];
    
    if (!empty($request->get_param('status'))) {
        $filters['status'] = $request->get_param('status');
    }
    if (!empty($request->get_param('limit'))) {
        $filters['limit'] = (int)$request->get_param('limit');
    }
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loans = $loan_manager->get_user_loans($user_id, $filters);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $loans
    ]);
}

/**
 * Get loan by ID
 */
function coopvest_get_loan($request) {
    $loan_id = $request->get_param('id');
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->get_loan($loan_id);
    
    if (!$loan) {
        return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => $loan
    ]);
}

/**
 * Get loan QR code
 */
function coopvest_get_loan_qr($request) {
    $loan_id = $request->get_param('id');
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->get_loan($loan_id);
    
    if (!$loan) {
        return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
    }
    
    if (empty($loan['qr_code'])) {
        return new \WP_Error('no_qr', 'No QR code available for this loan', ['status' => 400]);
    }
    
    $qr_data = json_decode($loan['qr_code'], true);
    
    // Generate QR image
    $qr_generator = \Coopvest\QR_Generator::get_instance();
    $qr_image = $qr_generator->generate_qr_image(json_encode($qr_data));
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'qr_data' => $qr_data,
            'qr_image' => $qr_image,
            'expires_at' => $loan['qr_expires_at']
        ]
    ]);
}

/**
 * Get guarantor progress
 */
function coopvest_get_loan_progress($request) {
    $loan_id = $request->get_param('id');
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->get_loan($loan_id);
    
    if (!$loan) {
        return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
    }
    
    $guarantors = $loan['guarantors'];
    $confirmed = array_filter($guarantors, fn($g) => $g['status'] === 'confirmed');
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'loan_id' => $loan_id,
            'guarantors_required' => $loan['metadata']['guarantors_required'] ?? 3,
            'guarantors_confirmed' => count($confirmed),
            'guarantors' => $guarantors,
            'progress' => round((count($confirmed) / ($loan['metadata']['guarantors_required'] ?? 3)) * 100),
            'ready_for_approval' => count($confirmed) >= ($loan['metadata']['guarantors_required'] ?? 3)
        ]
    ]);
}

/**
 * Request loan rollover
 */
function coopvest_request_rollover($request) {
    $loan_id = $request->get_param('id');
    $data = $request->get_params();
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->get_loan($loan_id);
    
    if (!$loan) {
        return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
    }
    
    // Check if rollover feature is enabled
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    if (!$feature_flags->is_enabled('rollover_requests')) {
        return new \WP_Error('feature_disabled', 'Rollover requests are not currently enabled', ['status' => 403]);
    }
    
    // Update loan status to pending rollover
    global $wpdb;
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    
    $metadata = $loan['metadata'] ?? [];
    $metadata['rollover_requested'] = true;
    $metadata['rollover_reason'] = $data['reason'] ?? '';
    $metadata['new_tenor_requested'] = $data['new_tenor'] ?? null;
    $metadata['rollover_requested_at'] = current_time('mysql');
    
    $wpdb->update($loans_table, [
        'status' => 'pending_rollover',
        'metadata' => json_encode($metadata)
    ], ['loan_id' => $loan_id]);
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_loan($user_id, 'rollover_request', $loan_id, null, $metadata);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Rollover request submitted. You will be notified once processed.',
        'data' => [
            'status' => 'pending_rollover',
            'reason' => $data['reason'] ?? ''
        ]
    ]);
}

/**
 * Admin: Get all loans
 */
function coopvest_get_all_loans($request) {
    $filters = [];
    
    if (!empty($request->get_param('status'))) {
        $filters['status'] = $request->get_param('status');
    }
    if (!empty($request->get_param('search'))) {
        $filters['search'] = $request->get_param('search');
    }
    if (!empty($request->get_param('page'))) {
        $filters['page'] = (int)$request->get_param('page');
    }
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loans = $loan_manager->get_all_loans($filters);
    
    // Get total count for pagination
    global $wpdb;
    $loans_table = $wpdb->prefix . 'coopvest_loans';
    $total = $wpdb->get_var("SELECT COUNT(*) FROM {$loans_table}");
    
    return rest_ensure_response([
        'success' => true,
        'data' => $loans,
        'pagination' => [
            'total' => (int)$total,
            'page' => $filters['page'] ?? 1,
            'limit' => 20
        ]
    ]);
}

/**
 * Admin: Approve loan
 */
function coopvest_approve_loan($request) {
    $loan_id = $request->get_param('id');
    $user_id = $request->get_param('user_id');
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->approve($loan_id, $user_id);
    
    if (is_wp_error($loan)) {
        return $loan;
    }
    
    // Log action
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'loan_approve', 'coopvest_loans', $loan_id, null, ['status' => 'active']);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Loan approved and disbursed',
        'data' => $loan
    ]);
}

/**
 * Admin: Reject loan
 */
function coopvest_reject_loan($request) {
    $loan_id = $request->get_param('id');
    $reason = $request->get_param('reason');
    $user_id = $request->get_param('user_id');
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loan = $loan_manager->reject($loan_id, $reason, $user_id);
    
    if (is_wp_error($loan)) {
        return $loan;
    }
    
    // Log action
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'loan_reject', 'coopvest_loans', $loan_id, null, [
        'status' => 'rejected',
        'reason' => $reason
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Loan rejected',
        'data' => $loan
    ]);
}
