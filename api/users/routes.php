<?php
/**
 * User Routes
 * 
 * REST API endpoints for user management
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_user_routes() {
    // Get all members (admin)
    register_rest_route('coopvest/v1', '/admin/members', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_members',
        'permission_callback' => 'coopvest_verify_member_viewer',
        'args' => [
            'search' => ['type' => 'string'],
            'status' => ['type' => 'string'],
            'kyc_status' => ['type' => 'string'],
            'page' => ['type' => 'number']
        ]
    ]);
    
    // Get member by ID
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_member',
        'permission_callback' => 'coopvest_verify_member_viewer',
        'args' => ['id' => ['validate_callback' => 'is_numeric']]
    ]);
    
    // Update member profile
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'coopvest_update_member',
        'permission_callback' => 'coopvest_verify_member_editor'
    ]);
    
    // Update KYC status
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/kyc', [
        'methods' => 'PATCH',
        'callback' => 'coopvest_update_kyc',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'status' => ['required' => true, 'type' => 'string', 'enum' => ['pending', 'verified', 'rejected']]
        ]
    ]);
    
    // Get member loans
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/loans', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_member_loans',
        'permission_callback' => 'coopvest_verify_member_viewer'
    ]);
    
    // Get member transactions
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/transactions', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_member_transactions',
        'permission_callback' => 'coopvest_verify_member_viewer'
    ]);
    
    // Get member wallet
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/wallet', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_member_wallet',
        'permission_callback' => 'coopvest_verify_member_viewer'
    ]);
    
    // Assign role to user
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/roles', [
        'methods' => 'POST',
        'callback' => 'coopvest_assign_role',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'role_id' => ['required' => true, 'type' => 'number'],
            'expires_at' => ['type' => 'string']
        ]
    ]);
    
    // Remove user role
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/roles/(?P<role_id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'coopvest_remove_role',
        'permission_callback' => 'coopvest_verify_admin'
    ]);
    
    // Ban/unban user
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/ban', [
        'methods' => 'POST',
        'callback' => 'coopvest_ban_member',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'ban' => ['required' => true, 'type' => 'boolean'],
            'reason' => ['type' => 'string']
        ]
    ]);
    
    // Get audit logs for user
    register_rest_route('coopvest/v1', '/admin/members/(?P<id>\d+)/audit', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_member_audit',
        'permission_callback' => 'coopvest_verify_audit_viewer',
        'args' => [
            'limit' => ['type' => 'number']
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
 * Verify member viewer permission
 */
function coopvest_verify_member_viewer($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->has_permission($user_id, 'members.view') && 
        !$role_manager->has_permission($user_id, 'members.*') &&
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Member view permission required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Verify member editor permission
 */
function coopvest_verify_member_editor($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->has_permission($user_id, 'members.edit') && 
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Member edit permission required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Verify admin permission
 */
function coopvest_verify_admin($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    if (is_wp_error($auth)) {
        return $auth;
    }
    
    $user_id = $request->get_param('user_id');
    $role_manager = \Coopvest\Role_Manager::get_instance();
    
    if (!$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Super admin access required', ['status' => 403]);
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
 * Get all members
 */
function coopvest_get_members($request) {
    $filters = [];
    
    if (!empty($request->get_param('search'))) {
        $filters['search'] = $request->get_param('search');
    }
    if (!empty($request->get_param('status'))) {
        $filters['status'] = $request->get_param('status');
    }
    if (!empty($request->get_param('kyc_status'))) {
        $filters['kyc_status'] = $request->get_param('kyc_status');
    }
    if (!empty($request->get_param('page'))) {
        $filters['page'] = (int)$request->get_param('page');
    }
    
    global $wpdb;
    
    $users_table = $wpdb->users;
    $coopvest_users = $wpdb->prefix . 'coopvest_users';
    
    $where = ['1=1'];
    $params = [];
    
    if (!empty($filters['search'])) {
        $where[] = '(u.user_login LIKE %s OR u.user_email LIKE %s OR cu.member_id LIKE %s OR cu.phone LIKE %s)';
        $search = '%' . $filters['search'] . '%';
        $params = array_merge($params, [$search, $search, $search, $search]);
    }
    
    if (!empty($filters['kyc_status'])) {
        $where[] = 'cu.kyc_status = %s';
        $params[] = $filters['kyc_status'];
    }
    
    $sql = "SELECT u.ID, u.user_login, u.user_email, u.display_name, u.user_registered,
            cu.member_id, cu.phone, cu.state, cu.kyc_status, cu.wallet_balance, 
            cu.risk_score, cu.total_contributions
            FROM {$users_table} u
            INNER JOIN {$coopvest_users} cu ON u.ID = cu.user_id";
    
    if (!empty($where)) {
        $sql .= ' WHERE ' . implode(' AND ', $where);
    }
    
    $sql .= ' ORDER BY u.user_registered DESC';
    
    if (!empty($filters['page'])) {
        $limit = 20;
        $offset = ($filters['page'] - 1) * $limit;
        $sql .= " LIMIT {$limit} OFFSET {$offset}";
    }
    
    $members = $params ? $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A)
                     : $wpdb->get_results($sql, ARRAY_A);
    
    // Get total count
    $count_sql = "SELECT COUNT(*) FROM {$users_table} u INNER JOIN {$coopvest_users} cu ON u.ID = cu.user_id";
    if (!empty($where)) {
        $count_sql .= ' WHERE ' . implode(' AND ', $where);
    }
    $total = $params ? $wpdb->get_var($wpdb->prepare($count_sql, $params)) : $wpdb->get_var($count_sql);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $members,
        'pagination' => [
            'total' => (int)$total,
            'page' => $filters['page'] ?? 1,
            'limit' => 20
        ]
    ]);
}

/**
 * Get member by ID
 */
function coopvest_get_member($request) {
    $id = (int)$request->get_param('id');
    
    global $wpdb;
    
    $users_table = $wpdb->users;
    $coopvest_users = $wpdb->prefix . 'coopvest_users';
    
    $member = $wpdb->get_row($wpdb->prepare(
        "SELECT u.ID, u.user_login, u.user_email, u.display_name, u.user_registered,
         cu.* 
         FROM {$users_table} u
         INNER JOIN {$coopvest_users} cu ON u.ID = cu.user_id
         WHERE u.ID = %d",
        $id
    ), ARRAY_A);
    
    if (!$member) {
        return new \WP_Error('not_found', 'Member not found', ['status' => 404]);
    }
    
    // Get user roles
    $role_manager = \Coopvest\Role_Manager::get_instance();
    $roles = $role_manager->get_user_roles($id);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $member,
        'roles' => $roles
    ]);
}

/**
 * Update member profile
 */
function coopvest_update_member($request) {
    $id = (int)$request->get_param('id');
    $data = $request->get_params();
    
    global $wpdb;
    
    $coopvest_users = $wpdb->prefix . 'coopvest_users';
    
    $update_data = [];
    $allowed_fields = ['phone', 'address', 'state', 'lga', 'employer_name', 'employer_phone', 
                       'monthly_income', 'bank_name', 'account_number', 'account_name'];
    
    foreach ($allowed_fields as $field) {
        if (isset($data[$field])) {
            $update_data[$field] = $data[$field];
        }
    }
    
    if (!empty($update_data)) {
        $wpdb->update($coopvest_users, $update_data, ['user_id' => $id]);
    }
    
    // Update user meta if provided
    if (!empty($data['first_name'])) {
        update_user_meta($id, 'first_name', $data['first_name']);
    }
    if (!empty($data['last_name'])) {
        update_user_meta($id, 'last_name', $data['last_name']);
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'member_update', 'coopvest_users', $id, null, $update_data);
    
    return coopvest_get_member($request);
}

/**
 * Update KYC status
 */
function coopvest_update_kyc($request) {
    $id = (int)$request->get_param('id');
    $status = $request->get_param('status');
    $kyc_data = $request->get_param('kyc_data');
    
    global $wpdb;
    
    $coopvest_users = $wpdb->prefix . 'coopvest_users';
    
    $update_data = ['kyc_status' => $status];
    
    if ($status === 'verified') {
        $update_data['kyc_verified_at'] = current_time('mysql');
    }
    
    if (!empty($kyc_data)) {
        $update_data['kyc_data'] = json_encode($kyc_data);
    }
    
    $result = $wpdb->update($coopvest_users, $update_data, ['user_id' => $id]);
    
    if ($result === false) {
        return new \WP_Error('db_error', 'Failed to update KYC status', ['status' => 500]);
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'kyc_update', 'coopvest_users', $id, null, ['status' => $status]);
    
    // Send notification
    $firebase = \Coopvest\Firebase_Notifications::get_instance();
    $firebase->notify_user($id,
        $status === 'verified' ? 'KYC Verification Successful' : 'KYC Verification Failed',
        $status === 'verified' 
            ? 'Your identity has been verified. You can now apply for loans.'
            : 'Your KYC verification was not successful. Please resubmit.'
    );
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'KYC status updated',
        'data' => ['status' => $status]
    ]);
}

/**
 * Get member loans
 */
function coopvest_get_member_loans($request) {
    $id = (int)$request->get_param('id');
    
    $loan_manager = \Coopvest\Loan_Manager::get_instance();
    $loans = $loan_manager->get_user_loans($id);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $loans
    ]);
}

/**
 * Get member transactions
 */
function coopvest_get_member_transactions($request) {
    $id = (int)$request->get_param('id');
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $transactions = $wallet_manager->get_transactions($id);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $transactions
    ]);
}

/**
 * Get member wallet
 */
function coopvest_get_member_wallet($request) {
    $id = (int)$request->get_param('id');
    
    $wallet_manager = \Coopvest\Wallet_Manager::get_instance();
    $wallets = $wallet_manager->get_user_wallets($id);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $wallets
    ]);
}

/**
 * Assign role to user
 */
function coopvest_assign_role($request) {
    $id = (int)$request->get_param('id');
    $role_id = (int)$request->get_param('role_id');
    $expires_at = $request->get_param('expires_at');
    $assigned_by = $request->get_param('user_id');
    
    $role_manager = \Coopvest\Role_Manager::get_instance();
    $result = $role_manager->assign_role($id, $role_id, $expires_at, $assigned_by);
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    // Log action
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($assigned_by, 'role_assign', 'coopvest_user_roles', $id, null, [
        'role_id' => $role_id,
        'expires_at' => $expires_at
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Role assigned successfully'
    ]);
}

/**
 * Remove user role
 */
function coopvest_remove_role($request) {
    $id = (int)$request->get_param('id');
    $role_id = (int)$request->get_param('role_id');
    
    $role_manager = \Coopvest\Role_Manager::get_instance();
    $result = $role_manager->remove_role($id, $role_id);
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'role_remove', 'coopvest_user_roles', $id, null, [
        'role_id' => $role_id
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Role removed'
    ]);
}

/**
 * Ban/unban member
 */
function coopvest_ban_member($request) {
    $id = (int)$request->get_param('id');
    $ban = $request->get_param('ban');
    $reason = $request->get_param('reason');
    $admin_id = $request->get_param('user_id');
    
    update_user_meta($id, 'coopvest_banned', $ban);
    
    if ($ban && $reason) {
        update_user_meta($id, 'coopvest_ban_reason', $reason);
    }
    
    // Log action
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($admin_id, $ban ? 'member_ban' : 'member_unban', 'users', $id, null, [
        'reason' => $reason
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => $ban ? 'Member banned' : 'Member unbanned'
    ]);
}

/**
 * Get member audit logs
 */
function coopvest_get_member_audit($request) {
    $id = (int)$request->get_param('id');
    $limit = $request->get_param('limit') ?: 50;
    
    $audit = \Coopvest\Audit_Logger::get_instance();
    $logs = $audit->get_user_activity($id, $limit);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $logs
    ]);
}
