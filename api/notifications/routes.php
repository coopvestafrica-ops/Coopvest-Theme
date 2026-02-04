<?php
/**
 * Notification Routes
 * 
 * REST API endpoints for notifications
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_notification_routes() {
    // Get user notifications
    register_rest_route('coopvest/v1', '/notifications', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_notifications',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'unread_only' => ['type' => 'boolean'],
            'limit' => ['type' => 'number'],
            'page' => ['type' => 'number']
        ]
    ]);
    
    // Get unread count
    register_rest_route('coopvest/v1', '/notifications/unread-count', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_unread_count',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Mark notification as read
    register_rest_route('coopvest/v1', '/notifications/(?P<id>\d+)/read', [
        'methods' => 'POST',
        'callback' => 'coopvest_mark_notification_read',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Mark all as read
    register_rest_route('coopvest/v1', '/notifications/read-all', [
        'methods' => 'POST',
        'callback' => 'coopvest_mark_all_read',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Register device token
    register_rest_route('coopvest/v1', '/notifications/devices/register', [
        'methods' => 'POST',
        'callback' => 'coopvest_register_device',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'token' => ['required' => true, 'type' => 'string'],
            'platform' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    // Unregister device token
    register_rest_route('coopvest/v1', '/notifications/devices/unregister', [
        'methods' => 'POST',
        'callback' => 'coopvest_unregister_device',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => [
            'token' => ['required' => true, 'type' => 'string']
        ]
    ]);
    
    // Admin: Send broadcast notification
    register_rest_route('coopvest/v1', '/admin/notifications/broadcast', [
        'methods' => 'POST',
        'callback' => 'coopvest_send_broadcast',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'title' => ['required' => true, 'type' => 'string'],
            'message' => ['required' => true, 'type' => 'string']
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
 * Verify admin authentication
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
 * Get user notifications
 */
function coopvest_get_notifications($request) {
    $user_id = $request->get_param('user_id');
    $unread_only = $request->get_param('unread_only');
    $limit = $request->get_param('limit') ?: 20;
    $page = $request->get_param('page') ?: 1;
    
    global $wpdb;
    
    $table = $wpdb->prefix . 'coopvest_notifications';
    
    $where = ['user_id = %d'];
    $params = [$user_id];
    
    if ($unread_only) {
        $where[] = 'read = 0';
    }
    
    $sql = "SELECT * FROM {$table} WHERE " . implode(' AND ', $where);
    $sql .= " ORDER BY created_at DESC";
    $sql .= " LIMIT %d OFFSET %d";
    $params[] = $limit;
    $params[] = ($page - 1) * $limit;
    
    $notifications = $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A);
    
    // Get total for pagination
    $sql = "SELECT COUNT(*) FROM {$table} WHERE " . implode(' AND ', $where);
    $total = $wpdb->get_var($wpdb->prepare($sql, $params));
    
    return rest_ensure_response([
        'success' => true,
        'data' => $notifications,
        'pagination' => [
            'total' => (int)$total,
            'page' => $page,
            'limit' => $limit,
            'pages' => ceil($total / $limit)
        ]
    ]);
}

/**
 * Get unread count
 */
function coopvest_get_unread_count($request) {
    $user_id = $request->get_param('user_id');
    
    global $wpdb;
    
    $table = $wpdb->prefix . 'coopvest_notifications';
    
    $count = $wpdb->get_var($wpdb->prepare(
        "SELECT COUNT(*) FROM {$table} WHERE user_id = %d AND read = 0",
        $user_id
    ));
    
    return rest_ensure_response([
        'success' => true,
        'data' => [
            'count' => (int)$count
        ]
    ]);
}

/**
 * Mark notification as read
 */
function coopvest_mark_notification_read($request) {
    $user_id = $request->get_param('user_id');
    $id = (int)$request->get_param('id');
    
    global $wpdb;
    
    $table = $wpdb->prefix . 'coopvest_notifications';
    
    $result = $wpdb->update($table, [
        'read' => 1,
        'read_at' => current_time('mysql')
    ], [
        'id' => $id,
        'user_id' => $user_id
    ]);
    
    return rest_ensure_response([
        'success' => $result !== false,
        'message' => $result ? 'Notification marked as read' : 'Notification not found'
    ]);
}

/**
 * Mark all as read
 */
function coopvest_mark_all_read($request) {
    $user_id = $request->get_param('user_id');
    
    global $wpdb;
    
    $table = $wpdb->prefix . 'coopvest_notifications';
    
    $result = $wpdb->update($table, [
        'read' => 1,
        'read_at' => current_time('mysql')
    ], [
        'user_id' => $user_id,
        'read' => 0
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'All notifications marked as read',
        'updated' => $result
    ]);
}

/**
 * Register device token
 */
function coopvest_register_device($request) {
    $user_id = $request->get_param('user_id');
    $token = $request->get_param('token');
    $platform = $request->get_param('platform');
    
    $firebase = \Coopvest\Firebase_Notifications::get_instance();
    $result = $firebase->register_token($user_id, $token, $platform);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Device registered successfully'
    ]);
}

/**
 * Unregister device token
 */
function coopvest_unregister_device($request) {
    $token = $request->get_param('token');
    
    $firebase = \Coopvest\Firebase_Notifications::get_instance();
    $result = $firebase->unregister_token($token);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Device unregistered'
    ]);
}

/**
 * Admin: Send broadcast notification
 */
function coopvest_send_broadcast($request) {
    $title = $request->get_param('title');
    $message = $request->get_param('message');
    $data = $request->get_param('data') ?: [];
    
    $firebase = \Coopvest\Firebase_Notifications::get_instance();
    $result = $firebase->broadcast($title, $message, array_merge([
        'type' => 'broadcast',
        'admin_sent' => true
    ], $data));
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'notification_broadcast', 'notifications', null, null, [
        'title' => $title,
        'message' => $message
    ]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Broadcast notification sent',
        'data' => $result
    ]);
}
