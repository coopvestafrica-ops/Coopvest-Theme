<?php
/**
 * Wallet Routes
 * 
 * REST API endpoints for wallet management and transactions
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_wallet_routes() {
    // Get wallet balance
    register_rest_route('coopvest/v1', '/wallet/balance', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_balance',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => ['wallet_type' => ['type' => 'string']]
    ]);
    
    // Get user wallets
    register_rest_route('coopvest/v1', '/wallet', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_wallets',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Make contribution
    register_rest_route('coopvest/v1', '/wallet/contribute', [
        'methods' => 'POST',
        'callback' => 'coopvest_contribute',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'amount' => ['required' => true, 'type' => 'number', 'min' => 100],
            'payment_method' => ['required' => true, 'type' => 'string'],
            'description' => ['type' => 'string']
        ]
    ]);
    
    // Request withdrawal
    register_rest_route('coopvest/v1', '/wallet/withdraw', [
        'methods' => 'POST',
        'callback' => 'coopvest_withdraw',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'amount' => ['required' => true, 'type' => 'number', 'min' => 500],
            'bank_name' => ['required' => true, 'type' => 'string'],
            'account_number' => ['required' => true, 'type' => 'string', 'min' => 10, 'max' => 10],
            'account_name' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    // Get transactions
    register_rest_route('coopvest/v1', '/wallet/transactions', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_transactions',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'type' => ['type' => 'string'],
            'status' => ['type' => 'string'],
            'start_date' => ['type' => 'string'],
            'end_date' => ['type' => 'string'],
            'limit' => ['type' => 'number']
        ]
    ]);
    
    // Get transaction by ID
    register_rest_route('coopvest/v1', '/wallet/transactions/(?P<id>[\w-]+)', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_transaction',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Generate statement
    register_rest_route('coopvest/v1', '/wallet/statement', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_statement',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'start_date' => ['required' => true, 'type' => 'string'],
            'end_date' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    // Generate PDF statement
    register_rest_route('coopvest/v1', '/wallet/statement/pdf', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_statement_pdf',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'start_date' => ['required' => true, 'type' => 'string'],
            'end_date' => ['required' => true, 'type' => 'string']
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
 * Get wallet balance
 */
function coopvest_get_balance($request) {
    $user_id = $request->get_param('user_id');
    $wallet_type = $request->get_param('wallet_type') ?: 'savings';
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $balance = $wallet_manager->get_balance($user_id, $wallet_type);
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'balance' => $balance,
            'currency' => 'NGN',
            'wallet_type' => $wallet_type
        ]
    ]);
}

/**
 * Get user wallets
 */
function coopvest_get_wallets($request) {
    $user_id = $request->get_param('user_id');
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $wallets = $wallet_manager->get_user_wallets($user_id);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $wallets
    ]);
}

/**
 * Make contribution
 */
function coopvest_contribute($request) {
    $user_id = $request->get_param('user_id');
    $data = $request->get_params();
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $result = $wallet_manager->process_contribution(
        $user_id,
        (float)$data['amount'],
        $data['payment_method'],
        [
            'description' => $data['description'] ?? 'Monthly contribution',
            'period' => $data['period'] ?? date('Y-m')
        ]
    );
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    // Generate receipt
    $pdf = \Coopvest\PDF_Generator::get_instance();
    $receipt = $pdf->generate_contribution_receipt($user_id, (float)$data['amount'], $data['payment_method']);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Contribution received successfully',
        'data' => $result,
        'receipt' => $receipt
    ], 201);
}

/**
 * Request withdrawal
 */
function coopvest_withdraw($request) {
    $user_id = $request->get_param('user_id');
    $data = $request->get_params();
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $result = $wallet_manager->process_withdrawal($user_id, (float)$data['amount'], [
        'bank_name' => $data['bank_name'],
        'account_number' => $data['account_number'],
        'account_name' => $data['account_name']
    ]);
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Withdrawal request submitted for processing',
        'data' => $result
    ], 201);
}

/**
 * Get transactions
 */
function coopvest_get_transactions($request) {
    $user_id = $request->get_param('user_id');
    $filters = [];
    
    if (!empty($request->get_param('type'))) {
        $filters['type'] = $request->get_param('type');
    }
    if (!empty($request->get_param('status'))) {
        $filters['status'] = $request->get_param('status');
    }
    if (!empty($request->get_param('start_date'))) {
        $filters['start_date'] = $request->get_param('start_date');
    }
    if (!empty($request->get_param('end_date'))) {
        $filters['end_date'] = $request->get_param('end_date');
    }
    if (!empty($request->get_param('limit'))) {
        $filters['limit'] = (int)$request->get_param('limit');
    }
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $transactions = $wallet_manager->get_transactions($user_id, $filters);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $transactions
    ]);
}

/**
 * Get transaction by ID
 */
function coopvest_get_transaction($request) {
    $transaction_id = $request->get_param('id');
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $transaction = $wallet_manager->get_transaction($transaction_id);
    
    if (!$transaction) {
        return new \WP_Error('not_found', 'Transaction not found', ['status' => 404]);
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => $transaction
    ]);
}

/**
 * Get statement
 */
function coopvest_get_statement($request) {
    $user_id = $request->get_param('user_id');
    $start_date = $request->get_param('start_date');
    $end_date = $request->get_param('end_date');
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $statement = $wallet_manager->generate_statement($user_id, $start_date, $end_date);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $statement
    ]);
}

/**
 * Get statement PDF
 */
function coopvest_get_statement_pdf($request) {
    $user_id = $request->get_param('user_id');
    $start_date = $request->get_param('start_date');
    $end_date = $request->get_param('end_date');
    
    $pdf = \Coopvest\PDF_Generator::get_instance();
    $pdf_result = $pdf->generate_statement($user_id, $start_date, $end_date);
    
    if (is_wp_error($pdf_result)) {
        return $pdf_result;
    }
    
    if (isset($pdf_result['html'])) {
        // Return HTML if PDF library not available
        return rest_ensure_response([
            'success' => true,
            'html' => $pdf_result['html'],
            'message' => 'PDF library not available. Raw HTML returned.'
        ]);
    }
    
    // Return PDF file
    header('Content-Type: application/pdf');
    header('Content-Disposition: attachment; filename="statement_' . date('Y-m-d') . '.pdf"');
    echo $pdf_result;
    exit;
}
