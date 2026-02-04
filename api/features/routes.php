<?php
/**
 * Feature Flags Routes
 * 
 * REST API endpoints for managing feature flags
 * 
 * @version 1.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

function coopvest_register_feature_routes() {
    // Get all features
    register_rest_route('coopvest/v1', '/features', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_features',
        'permission_callback' => 'coopvest_verify_auth'
    ]);
    
    // Get feature by ID
    register_rest_route('coopvest/v1', '/features/(?P<id>\d+)', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_feature',
        'permission_callback' => 'coopvest_verify_auth',
        'args' => ['id' => ['validate_callback' => 'is_numeric']]
    ]);
    
    // Create feature
    register_rest_route('coopvest/v1', '/features', [
        'methods' => 'POST',
        'callback' => 'coopvest_create_feature',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'name' => ['required' => true, 'type' => 'string'],
            'display_name' => ['required' => true, 'type' => 'string'],
            'category' => ['type' => 'string'],
            'platforms' => ['type' => 'array']
        ]
    ]);
    
    // Update feature
    register_rest_route('coopvest/v1', '/features/(?P<id>\d+)', [
        'methods' => 'PUT',
        'callback' => 'coopvest_update_feature',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => ['id' => ['validate_callback' => 'is_numeric']]
    ]);
    
    // Toggle feature
    register_rest_route('coopvest/v1', '/features/(?P<id>\d+)/toggle', [
        'methods' => 'POST',
        'callback' => 'coopvest_toggle_feature',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => ['id' => ['validate_callback' => 'is_numeric']]
    ]);
    
    // Update rollout percentage
    register_rest_route('coopvest/v1', '/features/(?P<id>\d+)/rollout', [
        'methods' => 'PATCH',
        'callback' => 'coopvest_update_rollout',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'id' => ['validate_callback' => 'is_numeric'],
            'percentage' => ['required' => true, 'type' => 'number', 'min' => 0, 'max' => 100]
        ]
    ]);
    
    // Update feature config
    register_rest_route('coopvest/v1', '/features/(?P<id>\d+)/config', [
        'methods' => 'PATCH',
        'callback' => 'coopvest_update_config',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => [
            'id' => ['validate_callback' => 'is_numeric'],
            'config' => ['required' => true, 'type' => 'array']
        ]
    ]);
    
    // Delete feature
    register_rest_route('coopvest/v1', '/features/(?P<id>\d+)', [
        'methods' => 'DELETE',
        'callback' => 'coopvest_delete_feature',
        'permission_callback' => 'coopvest_verify_admin',
        'args' => ['id' => ['validate_callback' => 'is_numeric']]
    ]);
    
    // Get features by platform (for mobile app)
    register_rest_route('coopvest/v1', '/features/platform/(?P<platform>[\w-]+)', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_platform_features',
        'permission_callback' => function() { return true; },
        'args' => ['platform' => ['validate_callback' => function($p) { return in_array($p, ['mobile', 'web', 'android', 'ios']); }]]
    ]);
    
    // Get feature statistics
    register_rest_route('coopvest/v1', '/features/stats/summary', [
        'methods' => 'GET',
        'callback' => 'coopvest_get_feature_stats',
        'permission_callback' => 'coopvest_verify_admin'
    ]);
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
    
    if (!$role_manager->has_permission($user_id, 'features.*') && 
        !$role_manager->is_super_admin($user_id)) {
        return new \WP_Error('forbidden', 'Admin access required', ['status' => 403]);
    }
    
    return true;
}

/**
 * Verify authentication
 */
function coopvest_verify_auth($request) {
    $auth = \Coopvest\Auth_Middleware::verify($request);
    return !is_wp_error($auth);
}

/**
 * Get all features
 */
function coopvest_get_features($request) {
    $filters = [];
    
    if (!empty($request->get_param('category'))) {
        $filters['category'] = $request->get_param('category');
    }
    if (!empty($request->get_param('status'))) {
        $filters['status'] = $request->get_param('status');
    }
    if (!empty($request->get_param('enabled'))) {
        $filters['enabled'] = $request->get_param('enabled');
    }
    if (!empty($request->get_param('page'))) {
        $filters['page'] = (int)$request->get_param('page');
    }
    if (!empty($request->get_param('limit'))) {
        $filters['limit'] = (int)$request->get_param('limit');
    }
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $features = $feature_flags->get_all_features($filters);
    
    return rest_ensure_response([
        'success' => true,
        'data' => $features
    ]);
}

/**
 * Get feature by ID
 */
function coopvest_get_feature($request) {
    $id = (int)$request->get_param('id');
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $feature = $feature_flags->get_feature($id);
    
    if (!$feature) {
        return new \WP_Error('not_found', 'Feature not found', ['status' => 404]);
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => $feature
    ]);
}

/**
 * Create feature
 */
function coopvest_create_feature($request) {
    $data = $request->get_params();
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $feature = $feature_flags->create_feature($data);
    
    if (is_wp_error($feature)) {
        return $feature;
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'feature_create', 'coopvest_features', $feature['id'], null, $feature);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Feature created successfully',
        'data' => $feature
    ], 201);
}

/**
 * Update feature
 */
function coopvest_update_feature($request) {
    $id = (int)$request->get_param('id');
    $data = $request->get_params();
    
    // Get old feature for audit
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $old_feature = $feature_flags->get_feature($id);
    
    if (!$old_feature) {
        return new \WP_Error('not_found', 'Feature not found', ['status' => 404]);
    }
    
    $feature = $feature_flags->update_feature($id, $data);
    
    if (is_wp_error($feature)) {
        return $feature;
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'feature_update', 'coopvest_features', $id, $old_feature, $feature);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Feature updated successfully',
        'data' => $feature
    ]);
}

/**
 * Toggle feature
 */
function coopvest_toggle_feature($request) {
    $id = (int)$request->get_param('id');
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $feature = $feature_flags->toggle_feature($id);
    
    if (is_wp_error($feature)) {
        return $feature;
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'feature_toggle', 'coopvest_features', $id, null, ['enabled' => $feature['enabled']]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => $feature['enabled'] ? 'Feature enabled' : 'Feature disabled',
        'data' => $feature
    ]);
}

/**
 * Update rollout percentage
 */
function coopvest_update_rollout($request) {
    $id = (int)$request->get_param('id');
    $percentage = (int)$request->get_param('percentage');
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $feature = $feature_flags->update_rollout($id, $percentage);
    
    if (is_wp_error($feature)) {
        return $feature;
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'feature_rollout', 'coopvest_features', $id, null, ['rollout_percentage' => $percentage]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => "Rollout updated to {$percentage}%",
        'data' => $feature
    ]);
}

/**
 * Update feature config
 */
function coopvest_update_config($request) {
    $id = (int)$request->get_param('id');
    $config = $request->get_param('config');
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $feature = $feature_flags->update_config($id, $config);
    
    if (is_wp_error($feature)) {
        return $feature;
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'feature_config', 'coopvest_features', $id, null, ['config' => $config]);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Feature configuration updated',
        'data' => $feature
    ]);
}

/**
 * Delete feature
 */
function coopvest_delete_feature($request) {
    $id = (int)$request->get_param('id');
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $result = $feature_flags->delete_feature($id);
    
    if (is_wp_error($result)) {
        return $result;
    }
    
    // Log action
    $user_id = $request->get_param('user_id');
    $audit = \Coopvest\Audit_Logger::get_instance();
    $audit->log_admin($user_id, 'feature_delete', 'coopvest_features', $id);
    
    return rest_ensure_response([
        'success' => true,
        'message' => 'Feature deleted successfully'
    ]);
}

/**
 * Get features by platform (mobile app endpoint)
 */
function coopvest_get_platform_features($request) {
    $platform = $request->get_param('platform');
    
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $features = $feature_flags->get_platform_features($platform);
    
    // Convert to simple key-value for mobile
    $feature_map = [];
    foreach ($features as $feature) {
        $feature_map[$feature['name']] = $feature_flags->is_enabled($feature['name']);
    }
    
    return rest_ensure_response([
        'success' => true,
        'data' => $feature_map,
        'default_features' => $feature_flags->get_mobile_default_features()
    ]);
}

/**
 * Get feature statistics
 */
function coopvest_get_feature_stats($request) {
    $feature_flags = \Coopvest\Feature_Flags::get_instance();
    $stats = $feature_flags->get_stats();
    
    return rest_ensure_response([
        'success' => true,
        'data' => $stats
    ]);
}
