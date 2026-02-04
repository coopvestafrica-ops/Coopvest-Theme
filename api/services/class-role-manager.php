<?php
/**
 * Role Manager Service
 * 
 * Manages roles and permissions for RBAC
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Role_Manager {
    private static $instance = null;
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Get all roles
     */
    public function get_all_roles() {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_roles';
        
        $roles = $wpdb->get_results("SELECT * FROM {$table}", ARRAY_A);
        
        return array_map(function($role) {
            $role['permissions'] = json_decode($role['permissions'], true);
            $role['capabilities'] = json_decode($role['capabilities'] ?: '[]', true);
            return $role;
        }, $roles ?: []);
    }
    
    /**
     * Get role by name
     */
    public function get_role($name) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_roles';
        
        $role = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE name = %s",
            $name
        ), ARRAY_A);
        
        if (!$role) {
            return null;
        }
        
        $role['permissions'] = json_decode($role['permissions'], true);
        $role['capabilities'] = json_decode($role['capabilities'] ?: '[]', true);
        
        return $role;
    }
    
    /**
     * Get role by ID
     */
    public function get_role_by_id($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_roles';
        
        $role = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE id = %d",
            $id
        ), ARRAY_A);
        
        if (!$role) {
            return null;
        }
        
        $role['permissions'] = json_decode($role['permissions'], true);
        $role['capabilities'] = json_decode($role['capabilities'] ?: '[]', true);
        
        return $role;
    }
    
    /**
     * Create new role
     */
    public function create_role($data) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_roles';
        
        $result = $wpdb->insert($table, [
            'name' => $data['name'],
            'display_name' => $data['display_name'],
            'description' => $data['description'] ?? '',
            'permissions' => json_encode($data['permissions'] ?? []),
            'capabilities' => json_encode($data['capabilities'] ?? [])
        ]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to create role', ['status' => 500]);
        }
        
        return $this->get_role_by_id($wpdb->insert_id);
    }
    
    /**
     * Update role
     */
    public function update_role($id, $data) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_roles';
        
        $update_data = [];
        
        if (isset($data['display_name'])) {
            $update_data['display_name'] = $data['display_name'];
        }
        if (isset($data['description'])) {
            $update_data['description'] = $data['description'];
        }
        if (isset($data['permissions'])) {
            $update_data['permissions'] = json_encode($data['permissions']);
        }
        if (isset($data['capabilities'])) {
            $update_data['capabilities'] = json_encode($data['capabilities']);
        }
        
        if (empty($update_data)) {
            return $this->get_role_by_id($id);
        }
        
        $result = $wpdb->update($table, $update_data, ['id' => $id]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to update role', ['status' => 500]);
        }
        
        return $this->get_role_by_id($id);
    }
    
    /**
     * Delete role
     */
    public function delete_role($id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_roles';
        
        // Prevent deletion of system roles
        $role = $this->get_role_by_id($id);
        if (!$role) {
            return new \WP_Error('not_found', 'Role not found', ['status' => 404]);
        }
        
        $system_roles = ['super_admin', 'loan_officer', 'risk_officer', 'member'];
        if (in_array($role['name'], $system_roles)) {
            return new \WP_Error('cannot_delete', 'Cannot delete system role', ['status' => 403]);
        }
        
        $result = $wpdb->delete($table, ['id' => $id]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to delete role', ['status' => 500]);
        }
        
        return ['success' => true];
    }
    
    /**
     * Get user roles
     */
    public function get_user_roles($user_id) {
        global $wpdb;
        
        $roles_table = $wpdb->prefix . 'coopvest_roles';
        $user_roles_table = $wpdb->prefix . 'coopvest_user_roles';
        
        $roles = $wpdb->get_results($wpdb->prepare(
            "SELECT r.* FROM {$roles_table} r 
             INNER JOIN {$user_roles_table} ur ON r.id = ur.role_id 
             WHERE ur.user_id = %d AND (ur.expires_at IS NULL OR ur.expires_at > NOW())",
            $user_id
        ), ARRAY_A);
        
        return array_map(function($role) {
            $role['permissions'] = json_decode($role['permissions'], true);
            $role['capabilities'] = json_decode($role['capabilities'] ?: '[]', true);
            return $role;
        }, $roles ?: []);
    }
    
    /**
     * Assign role to user
     */
    public function assign_role($user_id, $role_id, $expires_at = null, $assigned_by = null) {
        global $wpdb;
        
        $user_roles_table = $wpdb->prefix . 'coopvest_user_roles';
        
        // Check if user already has this role
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$user_roles_table} 
             WHERE user_id = %d AND role_id = %d AND (expires_at IS NULL OR expires_at > NOW())",
            $user_id,
            $role_id
        ));
        
        if ($existing) {
            // Update expiration if provided
            if ($expires_at) {
                $wpdb->update($user_roles_table, 
                    ['expires_at' => $expires_at],
                    ['id' => $existing->id]
                );
            }
            return ['success' => true, 'message' => 'Role already assigned'];
        }
        
        $result = $wpdb->insert($user_roles_table, [
            'user_id' => $user_id,
            'role_id' => $role_id,
            'assigned_by' => $assigned_by,
            'assigned_at' => current_time('mysql'),
            'expires_at' => $expires_at
        ]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to assign role', ['status' => 500]);
        }
        
        return ['success' => true];
    }
    
    /**
     * Remove role from user
     */
    public function remove_role($user_id, $role_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_user_roles';
        
        $result = $wpdb->delete($table, [
            'user_id' => $user_id,
            'role_id' => $role_id
        ]);
        
        return ['success' => $result !== false];
    }
    
    /**
     * Check if user has permission
     */
    public function has_permission($user_id, $permission) {
        $roles = $this->get_user_roles($user_id);
        
        foreach ($roles as $role) {
            $permissions = $role['permissions'];
            
            // Check for wildcard
            if (in_array('*', $permissions)) {
                return true;
            }
            
            // Check exact permission
            if (in_array($permission, $permissions)) {
                return true;
            }
            
            // Check parent permission (e.g., loans.view covers loans.*)
            foreach ($permissions as $p) {
                if (strpos($p, $permission) === 0 && (substr($p, -1) === '*' || $p === $permission)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    /**
     * Check if user has any of the permissions
     */
    public function has_any_permission($user_id, $permissions) {
        foreach ($permissions as $permission) {
            if ($this->has_permission($user_id, $permission)) {
                return true;
            }
        }
        return false;
    }
    
    /**
     * Check if user has all permissions
     */
    public function has_all_permissions($user_id, $permissions) {
        foreach ($permissions as $permission) {
            if (!$this->has_permission($user_id, $permission)) {
                return false;
            }
        }
        return true;
    }
    
    /**
     * Check if user has role
     */
    public function has_role($user_id, $role_name) {
        $roles = $this->get_user_roles($user_id);
        
        foreach ($roles as $role) {
            if ($role['name'] === $role_name) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * Check if user is super admin
     */
    public function is_super_admin($user_id) {
        return $this->has_role($user_id, 'super_admin');
    }
    
    /**
     * Get role permissions
     */
    public function get_role_permissions($user_id) {
        $roles = $this->get_user_roles($user_id);
        $all_permissions = [];
        
        foreach ($roles as $role) {
            $all_permissions = array_merge($all_permissions, $role['permissions']);
        }
        
        return array_unique($all_permissions);
    }
    
    /**
     * Sync WordPress roles with custom roles
     */
    public function sync_wordpress_roles($user_id) {
        $user = get_userdata($user_id);
        
        if (!$user) {
            return false;
        }
        
        global $wpdb;
        $roles_table = $wpdb->prefix . 'coopvest_roles';
        
        $wp_roles = $user->roles;
        
        foreach ($wp_roles as $wp_role) {
            // Map WordPress roles to custom roles
            $role_map = [
                'administrator' => 'super_admin',
                'editor' => 'loan_officer',
                'author' => 'risk_officer',
                'contributor' => 'member',
                'subscriber' => 'member'
            ];
            
            if (isset($role_map[$wp_role])) {
                $custom_role = $this->get_role($role_map[$wp_role]);
                if ($custom_role) {
                    $this->assign_role($user_id, $custom_role['id']);
                }
            }
        }
        
        return true;
    }
    
    /**
     * Get default roles
     */
    public function get_default_roles() {
        return [
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
                'permissions' => ['loans.view', 'loans.approve', 'loans.reject', 'loans.disburse', 'members.view', 'members.edit'],
                'capabilities' => ['edit_users']
            ],
            [
                'name' => 'risk_officer',
                'display_name' => 'Risk Officer',
                'description' => 'Can view risk assessments and compliance data',
                'permissions' => ['risk.view', 'compliance.view', 'reports.view', 'members.view', 'loans.view', 'guarantors.view'],
                'capabilities' => ['read']
            ],
            [
                'name' => 'member',
                'display_name' => 'Member',
                'description' => 'Regular cooperative member',
                'permissions' => ['wallet.view', 'wallet.deposit', 'wallet.withdraw', 'loans.apply', 'loans.view', 'guarantor.confirm', 'contributions.view'],
                'capabilities' => ['read']
            ]
        ];
    }
}
