<?php
/**
 * Authentication Routes
 * 
 * Handles user authentication: login, register, logout, token refresh
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_auth_routes() {
    register_rest_route('coopvest/v1', '/auth/login', [
        'methods' => 'POST',
        'callback' => 'coopvest_login',
        'permission_callback' => function() { return true; },
        'args' => [
            'username' => ['required' => true, 'type' => 'string'],
            'password' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    register_rest_route('coopvest/v1', '/auth/register', [
        'methods' => 'POST',
        'callback' => 'coopvest_register',
        'permission_callback' => function() { return true; },
        'args' => [
            'email' => ['required' => true, 'type' => 'email'],
            'username' => ['required' => true, 'type' => 'string', 'min' => 4, 'max' => 20],
            'password' => ['required' => true, 'type' => 'string', 'min' => 8],
            'first_name' => ['required' => true, 'type' => 'string'],
            'last_name' => ['required' => true, 'type' => 'string'],
            'phone' => ['required' => true, 'type' => 'string'],
            'state' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    register_rest_route('coopvest/v1', '/auth/refresh', [
        'methods' => 'POST',
        'callback' => 'coopvest_refresh_token',
        'permission_callback' => function() { return true; },
        'args' => [
            'refresh_token' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    register_rest_route('coopvest/v1', '/auth/logout', [
        'methods' => 'POST',
        'callback' => 'coopvest_logout',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    register_rest_route('coopvest/v1', '/auth/profile', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_profile',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    register_rest_route('coopvest/v1', '/auth/password/reset', [
        'methods' => 'POST',
        'callback' => 'coopvest_request_password_reset',
        'permission_callback' => function() { return true; },
        'args' => [
            'email' => ['required' => true, 'type' => 'email']
        ]
    ]);
    
    register_rest_route('coopvest/v1', '/auth/password/reset/confirm', [
        'methods' => 'POST',
        'callback' => 'coopvest_reset_password',
        'permission_callback' => function() { return true; },
        'args' => [
            'token' => ['required' => true, 'type' => 'string'],
            'password' => ['required' => true, 'type' => 'string', 'min' => 8]
        ]
    ]);
}

/**
 * Verify authentication callback
 */
function coopvest_verify_auth($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    return !is_wp_error($auth);
}

/**
 * User login
 */
function coopvest_login($request) {
    $username = $request->get_param('username');
    $password = $request->get_param('password');
    
    $jwt_auth = \Coopvest\JWT_Auth::get_instance();
    
    // Validate credentials
    $user = $jwt_auth->validate_credentials($username, $password);
    
    if (is_wp_error($user)) {
        // Log failed attempt
        $jwt_auth->increment_login_attempts($username);
        
        return new \WP_Error($user->get_error_code(), $user->get_error_message(), ['status' => 401]);
    }
    
    // Generate token pair
    $tokens = $jwt_auth->generate_token_pair($user->ID);
    
    // Log successful login
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_auth($user->ID, 'login', true, [
        'ip' => $_SERVER['REMOTE_ADDR']
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Login successful',
        'data' => $tokens,
        'user' => [
            'id' => $user->ID,
            'email' => $user->user_email,
            'display_name' => $user->display_name
        ]
    ]);
}

/**
 * User registration
 */
function coopvest_register($request) {
    $data = $request->get_params();
    
    // Validate email
    if (!is_email($data['email'])) {
        return new \WP_Error('invalid_email', 'Please provide a valid email address', ['status' => 400]);
    }
    
    // Check if user exists
    if (email_exists($data['email'])) {
        return new \WP_Error('email_exists', 'Email already registered', ['status' => 400]);
    }
    
    if (username_exists($data['username'])) {
        return new \WP_Error('username_exists', 'Username already taken', ['status' => 400]);
    }
    
    // Create WordPress user
    $user_id = wp_create_user(
        $data['username'],
        $data['password'],
        $data['email']
    );
    
    if (is_wp_error($user_id)) {
        return new \WP_Error('registration_failed', $user_id->get_error_message(), ['status' => 500]);
    }
    
    // Update user meta
    wp_update_user([
        'ID' => $user_id,
        'first_name' => $data['first_name'],
        'last_name' => $data['last_name'],
        'display_name' => $data['first_name'] . ' ' . $data['last_name']
    ]);
    
    update_user_meta($user_id, 'first_name', $data['first_name']);
    update_user_meta($user_id, 'last_name', $data['last_name']);
    update_user_meta($user_id, 'phone', $data['phone']);
    update_user_meta($user_id, 'state', $data['state']);
    
    // Create coopvest user profile
    global $wpdb;
    $users_table = $wpdb->prefix . 'coopvest_users';
    
    $member_id = 'M' . date('Y') . strtoupper(substr(md5($user_id . time()), 0, 6));
    
    $wpdb->insert($users_table, [
        'user_id' => $user_id,
        'member_id' => $member_id,
        'phone' => $data['phone'],
        'state' => $data['state'],
        'lga' => $data['lga'] ?? '',
        'kyc_status' => 'pending'
    ]);
    
    // Create default wallets
    $wallets_table = $wpdb->prefix . 'coopvest_wallets';
    $wallet_types = ['savings', 'contribution', 'investment'];
    
    foreach ($wallet_types as $type) {
        $wpdb->insert($wallets_table, [
            'user_id' => $user_id,
            'wallet_type' => $type,
            'balance' => 0
        ]);
    }
    
    // Assign default member role
    $role_manager = \Coopvest\Role_Manager::get_instance();
    $member_role = $role_manager->get_role('member');
    if ($member_role) {
        $role_manager->assign_role($user_id, $member_role['id']);
    }
    
    // Generate tokens
    $jwt_auth = \Coopvest\JWT_Auth::get_instance();
    $tokens = $jwt_auth->generate_token_pair($user_id);
    
    // Log registration
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_auth($user_id, 'register', true, [
        'member_id' => $member_id
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Registration successful',
        'data' => $tokens,
        'user' => [
            'id' => $user_id,
            'email' => $data['email'],
            'display_name' => $data['first_name'] . ' ' . $data['last_name'],
            'member_id' => $member_id
        ]
    ]);
}

/**
 * Refresh access token
 */
function coopvest_refresh_token($request) {
    $refresh_token = $request->get_param('refresh_token');
    
    $jwt_auth = \Coopvest\JWT_Auth::get_instance();
    $tokens = $jwt_auth->refresh_access_token($refresh_token);
    
    if (is_wp_error($tokens)) {
        return $tokens;
    }
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Token refreshed',
        'data' => $tokens
    ]);
}

/**
 * User logout
 */
function coopvest_logout($request) {
    $user_id = $request->get_param('user_id');
    
    // Log logout
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_auth($user_id, 'logout', true);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Logged out successfully'
    ]);
}

/**
 * Get user profile
 */
function coopvest_get_profile($request) {
    $user_id = $request->get_param('user_id');
    $user = get_userdata($user_id);
    
    if (!$user) {
        return new \WP_Error('not_found', 'User not found', ['status' => 404]);
    }
    
    global $wpdb;
    $users_table = $wpdb->prefix . 'coopvest_users';
    $wallets_table = $wpdb->prefix . 'coopvest_wallets';
    
    $profile = $wpdb->get_row($wpdb->prepare(
        "SELECT * FROM {$users_table} WHERE user_id = %d",
        $user_id
    ), ARRAY_A);
    
    $wallets = $wpdb->get_results($wpdb->prepare(
        "SELECT wallet_type, balance, currency FROM {$wallets_table} WHERE user_id = %d AND status = 'active'",
        $user_id
    ), ARRAY_A);
    
    $wallet_map = [];
    foreach ($wallets as $wallet) {
        $wallet_map[$wallet['wallet_type']] = $wallet;
    }
    
    // Get user roles
    $role_manager = \Coopvest\Role_Manager::get_instance();
    $roles = $role_manager->get_user_roles($user_id);
    $role_names = array_map(fn($r) => $r['display_name'], $roles);
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'id' => $user_id,
            'email' => $user->user_email,
            'display_name' => $user->display_name,
            'first_name' => get_user_meta($user_id, 'first_name', true),
            'last_name' => get_user_meta($user_id, 'last_name', true),
            'phone' => $profile['phone'] ?? '',
            'member_id' => $profile['member_id'] ?? '',
            'kyc_status' => $profile['kyc_status'] ?? 'pending',
            'wallet_balance' => (float)($profile['wallet_balance'] ?? 0),
            'wallets' => $wallet_map,
            'roles' => $role_names,
            'risk_score' => (float)($profile['risk_score'] ?? 0),
            'created_at' => $user->user_registered
        ]
    ]);
}

/**
 * Request password reset
 */
function coopvest_request_password_reset($request) {
    $email = $request->get_param('email');
    
    $user = get_user_by('email', $email);
    
    if (!$user) {
        // Don't reveal if user exists
        return rest_ensure_response([
            'success' => true,
            'message' => 'If an account exists with this email, a reset link will be sent.'
        ]);
    }
    
    // Generate reset token
    $reset_key = get_password_reset_key($user);
    
    if (is_wp_error($reset_key)) {
        return new \WP_Error('reset_failed', 'Could not generate reset key', ['status' => 500]);
    }
    
    // Send email (simplified - in production use proper email template)
    $reset_url = add_query_arg([
        'key' => $reset_key,
        'login' => rawurlencode($user->user_login)
    ], home_url('/reset-password/'));
    
    // Log the request
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_auth($user->ID, 'password_reset_request', true);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'If an account exists with this email, a reset link will be sent.',
        'debug_url' => $reset_url // Remove in production
    ]);
}

/**
 * Reset password with token
 */
function coopvest_reset_password($request) {
    $token = $request->get_param('token');
    $password = $request->get_param('password');
    
    // Verify token and get user
    $user = check_password_reset_key($token, '');
    
    if (is_wp_error($user)) {
        return new \WP_Error('invalid_token', 'Invalid or expired reset token', ['status' => 400]);
    }
    
    // Reset password
    wp_set_password($password, $user->ID);
    
    // Log
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_auth($user->ID, 'password_reset_complete', true);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Password reset successful. Please login with your new password.'
    ]);
}
