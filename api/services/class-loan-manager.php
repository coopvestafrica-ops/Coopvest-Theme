<?php
/**
 * Loan Manager Service
 * 
 * Manages loan applications, guarantor system, and loan lifecycle
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Loan_Manager {
    private static $instance = null;
    private $guarantors_required = 3;
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Apply for loan
     */
    public function apply($user_id, $data) {
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        // Validate user can apply
        $can_apply = $this->can_apply($user_id);
        if (is_wp_error($can_apply)) {
            return $can_apply;
        }
        
        // Calculate loan details
        $amount = (float)$data['amount'];
        $tenor = (int)$data['tenor'];
        $interest_rate = $this->get_interest_rate($tenor);
        $processing_fee = $amount * 0.02; // 2% processing fee
        $monthly_repayment = $this->calculate_monthly_repayment($amount, $tenor, $interest_rate);
        $total_repayment = $monthly_repayment * $tenor;
        
        $loan_id = $this->generate_loan_id();
        
        // Generate QR code
        $qr_data = $this->generate_qr_data([
            'loan_id' => $loan_id,
            'user_id' => $user_id,
            'amount' => $amount,
            'tenor' => $tenor,
            'interest_rate' => $interest_rate,
            'purpose' => $data['purpose']
        ]);
        
        $qr_expires_at = date('Y-m-d H:i:s', strtotime('+7 days'));
        
        $result = $wpdb->insert($loans_table, [
            'loan_id' => $loan_id,
            'user_id' => $user_id,
            'amount' => $amount,
            'tenor' => $tenor,
            'purpose' => $data['purpose'],
            'interest_rate' => $interest_rate,
            'processing_fee' => $processing_fee,
            'monthly_repayment' => $monthly_repayment,
            'total_repayment' => $total_repayment,
            'status' => 'pending',
            'qr_code' => $qr_data,
            'qr_signature' => $qr_data['signature'] ?? '',
            'qr_expires_at' => $qr_expires_at,
            'metadata' => json_encode([
                'guarantors_required' => $this->guarantors_required,
                'guarantors_confirmed' => 0
            ])
        ]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to create loan application', ['status' => 500]);
        }
        
        // Get the loan with ID
        $loan = $this->get_loan($loan_id);
        
        // Audit log
        $this->log_action($user_id, 'loan_application', 'coopvest_loans', $loan['id'], null, $loan);
        
        // Send notification
        $firebase = \Coopvest\Firebase_Notifications::get_instance();
        $firebase->notify_loan_status($user_id, $loan_id, 'pending', ['amount' => $amount]);
        
        return $loan;
    }
    
    /**
     * Get loan by ID
     */
    public function get_loan($loan_id) {
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $loan = $wpdb->get_row($wpdb->prepare(
            "SELECT l.*, u.display_name as user_name, u.user_email,
             cu.member_id, cu.bank_name, cu.account_number, cu.account_name
             FROM {$loans_table} l 
             LEFT JOIN {$users_table} u ON l.user_id = u.ID 
             LEFT JOIN {$users_table} cu ON l.user_id = cu.user_id
             WHERE l.loan_id = %s",
            $loan_id
        ), ARRAY_A);
        
        if (!$loan) {
            return null;
        }
        
        $loan['guarantors'] = $this->get_guarantors($loan['id']);
        $loan['metadata'] = json_decode($loan['metadata'] ?: '{}', true);
        
        return $loan;
    }
    
    /**
     * Get loans for user
     */
    public function get_user_loans($user_id, $filters = []) {
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        
        $where = ['user_id = %d'];
        $params = [$user_id];
        
        if (!empty($filters['status'])) {
            $where[] = 'status = %s';
            $params[] = $filters['status'];
        }
        
        $sql = "SELECT * FROM {$loans_table} WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT %d";
            $params[] = $filters['limit'];
        }
        
        $loans = $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A);
        
        return array_map(function($loan) {
            $loan['metadata'] = json_decode($loan['metadata'] ?: '{}', true);
            return $loan;
        }, $loans ?: []);
    }
    
    /**
     * Get all loans (admin)
     */
    public function get_all_loans($filters = []) {
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $where = ['1=1'];
        $params = [];
        
        if (!empty($filters['status'])) {
            $where[] = 'l.status = %s';
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['search'])) {
            $where[] = '(l.loan_id LIKE %s OR u.display_name LIKE %s OR cu.member_id LIKE %s)';
            $params[] = '%' . $filters['search'] . '%';
            $params[] = '%' . $filters['search'] . '%';
            $params[] = '%' . $filters['search'] . '%';
        }
        
        $sql = "SELECT l.*, u.display_name as user_name, u.user_email, cu.member_id
                FROM {$loans_table} l 
                LEFT JOIN {$users_table} u ON l.user_id = u.ID 
                LEFT JOIN {$users_table} cu ON l.user_id = cu.user_id
                WHERE " . implode(' AND ', $where);
        
        if (!empty($filters['page'])) {
            $limit = $filters['limit'] ?? 20;
            $offset = ($filters['page'] - 1) * $limit;
            $sql .= " LIMIT {$limit} OFFSET {$offset}";
        }
        
        $loans = $params ? $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A) 
                       : $wpdb->get_results($sql, ARRAY_A);
        
        return array_map(function($loan) {
            $loan['guarantors'] = $this->get_guarantors($loan['id']);
            $loan['metadata'] = json_decode($loan['metadata'] ?: '{}', true);
            return $loan;
        }, $loans ?: []);
    }
    
    /**
     * Approve loan
     */
    public function approve($loan_id, $approved_by) {
        $loan = $this->get_loan($loan_id);
        
        if (!$loan) {
            return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
        }
        
        if ($loan['status'] !== 'pending' && $loan['status'] !== 'under_review') {
            return new \WP_Error('invalid_status', 'Loan cannot be approved in current status', ['status' => 400]);
        }
        
        // Check if all guarantors confirmed
        $guarantors = $this->get_guarantors($loan['id']);
        $confirmed = array_filter($guarantors, fn($g) => $g['status'] === 'confirmed');
        
        if (count($confirmed) < $this->guarantors_required) {
            return new \WP_Error('guarantors_incomplete', 'Cannot approve: not all guarantors have confirmed', ['status' => 400]);
        }
        
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        
        $disbursement_date = current_time('mysql');
        $due_date = date('Y-m-d H:i:s', strtotime("+{$loan['tenor']} months", strtotime($disbursement_date)));
        
        $result = $wpdb->update($loans_table, [
            'status' => 'active',
            'disbursement_date' => $disbursement_date,
            'due_date' => $due_date,
            'metadata' => json_encode([
                'guarantors_required' => $this->guarantors_required,
                'guarantors_confirmed' => count($confirmed),
                'approved_by' => $approved_by,
                'approved_at' => current_time('mysql')
            ])
        ], ['loan_id' => $loan_id]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to approve loan', ['status' => 500]);
        }
        
        // Send notification to borrower
        $firebase = \Coopvest\Firebase_Notifications::get_instance();
        $firebase->notify_loan_status($loan['user_id'], $loan_id, 'active', [
            'amount' => $loan['amount'],
            'monthly_repayment' => $loan['monthly_repayment']
        ]);
        
        // WebSocket notification
        $ws = \Coopvest\WebSocket_Manager::get_instance();
        $ws->notify_loan_status($loan_id, 'active', [
            'amount' => $loan['amount']
        ]);
        
        return $this->get_loan($loan_id);
    }
    
    /**
     * Reject loan
     */
    public function reject($loan_id, $reason, $rejected_by) {
        $loan = $this->get_loan($loan_id);
        
        if (!$loan) {
            return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
        }
        
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        
        $result = $wpdb->update($loans_table, [
            'status' => 'rejected',
            'metadata' => json_encode([
                'rejected_by' => $rejected_by,
                'rejected_at' => current_time('mysql'),
                'rejection_reason' => $reason
            ])
        ], ['loan_id' => $loan_id]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to reject loan', ['status' => 500]);
        }
        
        // Send notification
        $firebase = \Coopvest\Firebase_Notifications::get_instance();
        $firebase->notify_loan_status($loan['user_id'], $loan_id, 'rejected', [
            'reason' => $reason
        ]);
        
        return $this->get_loan($loan_id);
    }
    
    /**
     * Confirm as guarantor
     */
    public function confirm_guarantor($loan_id, $guarantor_user_id, $biometric_data = []) {
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $loan = $this->get_loan($loan_id);
        
        if (!$loan) {
            return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
        }
        
        // Check if guarantor is the borrower
        if ($loan['user_id'] == $guarantor_user_id) {
            return new \WP_Error('self_guarantor', 'Cannot guarantee your own loan', ['status' => 400]);
        }
        
        // Check if already guarantor
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$guarantors_table} 
             WHERE loan_id = %d AND user_id = %d",
            $loan['id'],
            $guarantor_user_id
        ));
        
        if ($existing) {
            return new \WP_Error('already_guarantor', 'Already a guarantor for this loan', ['status' => 400]);
        }
        
        // Check guarantor limit
        $guarantor_limit = $this->get_guarantor_limit($guarantor_user_id);
        $guarantor_used = $this->get_guarantor_used($guarantor_user_id);
        
        if ($guarantor_used >= $guarantor_limit) {
            return new \WP_Error('guarantor_limit_reached', 'Guarantor limit reached', ['status' => 400]);
        }
        
        // Get next position
        $max_position = $wpdb->get_var($wpdb->prepare(
            "SELECT MAX(position) FROM {$guarantors_table} WHERE loan_id = %d",
            $loan['id']
        )) ?: 0;
        
        $position = $max_position + 1;
        
        // Get guarantor info
        $guarantor_user = get_userdata($guarantor_user_id);
        
        // Generate signature
        $signature = $this->generate_guarantor_signature($loan_id, $guarantor_user_id, $position);
        
        $result = $wpdb->insert($guarantors_table, [
            'guarantor_id' => $this->generate_guarantor_id(),
            'loan_id' => $loan['id'],
            'user_id' => $guarantor_user_id,
            'borrower_id' => $loan['user_id'],
            'position' => $position,
            'status' => 'confirmed',
            'confirmed_at' => current_time('mysql'),
            'biometric_verified' => !empty($biometric_data),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'device_id' => $biometric_data['device_id'] ?? '',
            'signature' => $signature
        ]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to confirm guarantor', ['status' => 500]);
        }
        
        // Update guarantor used amount
        $this->update_guarantor_used($guarantor_user_id, $loan['amount']);
        
        // Get updated guarantor count
        $guarantor_count = $this->get_confirmed_guarantor_count($loan['id']);
        
        // Update loan metadata
        $metadata = $loan['metadata'];
        $metadata['guarantors_confirmed'] = $guarantor_count;
        $metadata['last_guarantor_confirmed'] = current_time('mysql');
        
        $wpdb->update($loans_table, [
            'metadata' => json_encode($metadata)
        ], ['id' => $loan['id']]);
        
        // WebSocket notification for progress update
        $ws = \Coopvest\WebSocket_Manager::get_instance();
        $ws->notify_loan_progress($loan_id, $guarantor_count, $this->guarantors_required);
        
        // Notify borrower
        $borrower_user = get_userdata($loan['user_id']);
        $ws->send_to_user($loan['user_id'], 'guarantor_confirmed', [
            'loan_id' => $loan_id,
            'guarantor_name' => $guarantor_user->display_name,
            'guarantor_count' => $guarantor_count,
            'total_required' => $this->guarantors_required
        ]);
        
        // Firebase notification
        $firebase = \Coopvest\Firebase_Notifications::get_instance();
        $firebase->notify_guarantor($loan['user_id'], $loan_id, 
            $borrower_user->display_name, $loan['amount'], 
            $position, $this->guarantors_required);
        
        return [
            'success' => true,
            'guarantor_id' => $this->generate_guarantor_id(),
            'position' => $position,
            'guarantor_count' => $guarantor_count,
            'total_required' => $this->guarantors_required,
            'status' => $guarantor_count >= $this->guarantors_required ? 'ready_for_approval' : 'pending_guarantors'
        ];
    }
    
    /**
     * Get guarantors for loan
     */
    public function get_guarantors($loan_id) {
        global $wpdb;
        
        $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT g.*, u.display_name as guarantor_name, u.user_email
             FROM {$guarantors_table} g 
             LEFT JOIN {$users_table} u ON g.user_id = u.ID 
             WHERE g.loan_id = %d 
             ORDER BY g.position ASC",
            $loan_id
        ), ARRAY_A);
    }
    
    /**
     * Check if user can apply for loan
     */
    public function can_apply($user_id) {
        global $wpdb;
        
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        // Check KYC status
        $kyc_status = $wpdb->get_var($wpdb->prepare(
            "SELECT kyc_status FROM {$users_table} WHERE user_id = %d",
            $user_id
        ));
        
        if ($kyc_status !== 'verified') {
            return new \WP_Error('kyc_required', 'KYC verification required before applying for loans', ['status' => 400]);
        }
        
        // Check for active/defaulted loans
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $active_loan = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$loans_table} 
             WHERE user_id = %d AND status IN ('active', 'pending', 'under_review')",
            $user_id
        ));
        
        if ($active_loan > 0) {
            return new \WP_Error('existing_loan', 'Cannot apply: you have an active or pending loan', ['status' => 400]);
        }
        
        // Check contribution history (at least 3 months)
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        $contribution_count = $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$transactions_table} 
             WHERE user_id = %d AND type = 'contribution' AND status = 'completed'",
            $user_id
        ));
        
        if ($contribution_count < 3) {
            return new \WP_Error('insufficient_contributions', 'At least 3 monthly contributions required', ['status' => 400]);
        }
        
        return true;
    }
    
    /**
     * Get interest rate based on tenor
     */
    private function get_interest_rate($tenor) {
        $rates = [
            3 => 8.0,
            6 => 10.0,
            9 => 12.0,
            12 => 15.0
        ];
        
        return $rates[$tenor] ?? 10.0;
    }
    
    /**
     * Calculate monthly repayment
     */
    private function calculate_monthly_repayment($amount, $tenor, $interest_rate) {
        $monthly_rate = $interest_rate / 100 / 12;
        
        if ($monthly_rate > 0) {
            return $amount * ($monthly_rate * pow(1 + $monthly_rate, $tenor)) / (pow(1 + $monthly_rate, $tenor) - 1);
        }
        
        return $amount / $tenor;
    }
    
    /**
     * Generate unique loan ID
     */
    private function generate_loan_id() {
        return 'LN' . date('Y') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }
    
    /**
     * Generate unique guarantor ID
     */
    private function generate_guarantor_id() {
        return 'GAR' . date('Ymd') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
    }
    
    /**
     * Generate QR data
     */
    private function generate_qr_data($loan) {
        $qr = \Coopvest\QR_Generator::get_instance();
        
        return json_decode($qr->generate_qr_data($loan), true);
    }
    
    /**
     * Generate guarantor signature
     */
    private function generate_guarantor_signature($loan_id, $guarantor_id, $position) {
        $secret = defined('COOPVEST_GUARANTOR_SECRET') ? COOPVEST_GUARANTOR_SECRET : 'guarantor-secret';
        
        return hash_hmac('sha256', json_encode([
            'loan_id' => $loan_id,
            'guarantor_id' => $guarantor_id,
            'position' => $position,
            'timestamp' => time()
        ]), $secret);
    }
    
    /**
     * Get guarantor limit
     */
    private function get_guarantor_limit($user_id) {
        global $wpdb;
        
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $limit = $wpdb->get_var($wpdb->prepare(
            "SELECT guarantor_limit FROM {$users_table} WHERE user_id = %d",
            $user_id
        ));
        
        // Default: 3x monthly contribution or minimum 500,000
        if (!$limit || $limit == 0) {
            $contribution = $this->get_average_contribution($user_id);
            $limit = max(500000, $contribution * 3);
        }
        
        return $limit;
    }
    
    /**
     * Get guarantor used amount
     */
    private function get_guarantor_used($user_id) {
        global $wpdb;
        
        $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        
        $used = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(l.amount) FROM {$guarantors_table} g 
             INNER JOIN {$loans_table} l ON g.loan_id = l.id 
             WHERE g.user_id = %d AND g.status = 'confirmed' 
             AND l.status IN ('active', 'pending', 'under_review')",
            $user_id
        ));
        
        return (float)($used ?: 0);
    }
    
    /**
     * Update guarantor used amount
     */
    private function update_guarantor_used($user_id, $amount) {
        global $wpdb;
        
        $users_table = $wpdb->prefix . 'coopvest_users';
        $current = $this->get_guarantor_used($user_id);
        
        $wpdb->update($users_table, [
            'guarantor_used' => $current + $amount
        ], ['user_id' => $user_id]);
    }
    
    /**
     * Get confirmed guarantor count
     */
    private function get_confirmed_guarantor_count($loan_id) {
        global $wpdb;
        
        $guarantors_table = $wpdb->prefix . 'coopvest_guarantors';
        
        return $wpdb->get_var($wpdb->prepare(
            "SELECT COUNT(*) FROM {$guarantors_table} 
             WHERE loan_id = %d AND status = 'confirmed'",
            $loan_id
        ));
    }
    
    /**
     * Get average contribution
     */
    private function get_average_contribution($user_id) {
        global $wpdb;
        
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        
        $avg = $wpdb->get_var($wpdb->prepare(
            "SELECT AVG(amount) FROM {$transactions_table} 
             WHERE user_id = %d AND type = 'contribution' AND status = 'completed'",
            $user_id
        ));
        
        return (float)($avg ?: 0);
    }
    
    /**
     * Log action
     */
    private function log_action($user_id, $action, $entity_type, $entity_id, $old_value, $new_value) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_audit_logs';
        
        $wpdb->insert($table, [
            'user_id' => $user_id,
            'action' => $action,
            'entity_type' => $entity_type,
            'entity_id' => $entity_id,
            'old_value' => json_encode($old_value),
            'new_value' => json_encode($new_value),
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    }
}
