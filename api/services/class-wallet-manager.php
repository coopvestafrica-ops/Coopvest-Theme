<?php
/**
 * Wallet Manager Service
 * 
 * Manages member wallets, contributions, and transactions
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Wallet_Manager {
    private static $instance = null;
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Get user wallet
     */
    public function get_wallet($user_id, $wallet_type = 'savings') {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_wallets';
        
        $wallet = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE user_id = %d AND wallet_type = %s",
            $user_id,
            $wallet_type
        ), ARRAY_A);
        
        return $wallet ?: null;
    }
    
    /**
     * Get all user wallets
     */
    public function get_user_wallets($user_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_wallets';
        
        return $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$table} WHERE user_id = %d AND status = 'active'",
            $user_id
        ), ARRAY_A);
    }
    
    /**
     * Create wallet for user
     */
    public function create_wallet($user_id, $wallet_type = 'savings', $currency = 'NGN') {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_wallets';
        
        $result = $wpdb->insert($table, [
            'user_id' => $user_id,
            'wallet_type' => $wallet_type,
            'currency' => $currency,
            'balance' => 0,
            'status' => 'active'
        ]);
        
        if ($result === false) {
            return new \WP_Error('db_error', 'Failed to create wallet', ['status' => 500]);
        }
        
        return $this->get_wallet($user_id, $wallet_type);
    }
    
    /**
     * Get or create wallet
     */
    public function get_or_create_wallet($user_id, $wallet_type = 'savings') {
        $wallet = $this->get_wallet($user_id, $wallet_type);
        
        if (!$wallet) {
            return $this->create_wallet($user_id, $wallet_type);
        }
        
        return $wallet;
    }
    
    /**
     * Get wallet balance
     */
    public function get_balance($user_id, $wallet_type = 'savings') {
        $wallet = $this->get_wallet($user_id, $wallet_type);
        
        return $wallet ? (float)$wallet['balance'] : 0;
    }
    
    /**
     * Update wallet balance
     */
    public function update_balance($wallet_id, $amount, $operation = 'set') {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_wallets';
        
        switch ($operation) {
            case 'add':
                $wpdb->query($wpdb->prepare(
                    "UPDATE {$table} SET balance = balance + %f WHERE id = %d",
                    $amount,
                    $wallet_id
                ));
                break;
            case 'subtract':
                $wpdb->query($wpdb->prepare(
                    "UPDATE {$table} SET balance = balance - %f WHERE id = %d",
                    $amount,
                    $wallet_id
                ));
                break;
            case 'set':
                $wpdb->update($table, ['balance' => $amount], ['id' => $wallet_id]);
                break;
        }
        
        return $this->get_wallet_by_id($wallet_id);
    }
    
    /**
     * Get wallet by ID
     */
    public function get_wallet_by_id($wallet_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_wallets';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE id = %d",
            $wallet_id
        ), ARRAY_A);
    }
    
    /**
     * Process contribution
     */
    public function process_contribution($user_id, $amount, $payment_method, $metadata = []) {
        global $wpdb;
        
        $transaction_id = $this->generate_transaction_id();
        
        $wallets_table = $wpdb->prefix . 'coopvest_wallets';
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        // Get or create wallet
        $wallet = $this->get_or_create_wallet($user_id, 'contribution');
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Update wallet balance
            $this->update_balance($wallet['id'], $amount, 'add');
            
            // Record transaction
            $wpdb->insert($transactions_table, [
                'transaction_id' => $transaction_id,
                'user_id' => $user_id,
                'wallet_id' => $wallet['id'],
                'type' => 'contribution',
                'amount' => $amount,
                'currency' => 'NGN',
                'status' => 'completed',
                'reference' => $metadata['reference'] ?? '',
                'description' => $metadata['description'] ?? 'Monthly contribution',
                'metadata' => json_encode([
                    'payment_method' => $payment_method,
                    'period' => $metadata['period'] ?? date('Y-m')
                ]),
                'processed_at' => current_time('mysql')
            ]);
            
            // Update user total contributions
            $users_table_name = $wpdb->prefix . 'coopvest_users';
            $current_total = $wpdb->get_var($wpdb->prepare(
                "SELECT total_contributions FROM {$users_table_name} WHERE user_id = %d",
                $user_id
            )) ?: 0;
            
            $wpdb->update($users_table_name, 
                ['total_contributions' => $current_total + $amount],
                ['user_id' => $user_id]
            );
            
            $wpdb->query('COMMIT');
            
            // Send notification
            $this->send_contribution_notification($user_id, $amount, $transaction_id);
            
            // WebSocket notification
            $ws = \Coopvest\WebSocket_Manager::get_instance();
            $ws->notify_transaction($user_id, [
                'transaction_id' => $transaction_id,
                'type' => 'contribution',
                'amount' => $amount,
                'balance' => $this->get_balance($user_id, 'contribution')
            ]);
            
            return [
                'success' => true,
                'transaction_id' => $transaction_id,
                'wallet' => $this->get_wallet_by_id($wallet['id']),
                'balance' => $this->get_balance($user_id, 'contribution')
            ];
            
        } catch (\Exception $e) {
            $wpdb->query('ROLLBACK');
            return new \WP_Error('transaction_failed', $e->getMessage(), ['status' => 500]);
        }
    }
    
    /**
     * Process withdrawal
     */
    public function process_withdrawal($user_id, $amount, $bank_details = []) {
        global $wpdb;
        
        // Check balance
        $balance = $this->get_balance($user_id, 'savings');
        
        if ($balance < $amount) {
            return new \WP_Error('insufficient_balance', 'Insufficient wallet balance', ['status' => 400]);
        }
        
        $transaction_id = $this->generate_transaction_id();
        
        $wallets_table = $wpdb->prefix . 'coopvest_wallets';
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        
        // Get savings wallet
        $wallet = $this->get_wallet($user_id, 'savings');
        
        if (!$wallet) {
            return new \WP_Error('no_wallet', 'No savings wallet found', ['status' => 400]);
        }
        
        // Start transaction
        $wpdb->query('START TRANSACTION');
        
        try {
            // Update wallet balance
            $this->update_balance($wallet['id'], $amount, 'subtract');
            
            // Record transaction
            $wpdb->insert($transactions_table, [
                'transaction_id' => $transaction_id,
                'user_id' => $user_id,
                'wallet_id' => $wallet['id'],
                'type' => 'withdrawal',
                'amount' => $amount,
                'currency' => 'NGN',
                'status' => 'pending',
                'description' => 'Withdrawal to bank',
                'metadata' => json_encode([
                    'bank_name' => $bank_details['bank_name'] ?? '',
                    'account_number' => $bank_details['account_number'] ?? ''
                ])
            ]);
            
            $wpdb->query('COMMIT');
            
            return [
                'success' => true,
                'transaction_id' => $transaction_id,
                'status' => 'pending',
                'message' => 'Withdrawal request submitted for processing'
            ];
            
        } catch (\Exception $e) {
            $wpdb->query('ROLLBACK');
            return new \WP_Error('transaction_failed', $e->getMessage(), ['status' => 500]);
        }
    }
    
    /**
     * Get user transactions
     */
    public function get_transactions($user_id, $filters = []) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_transactions';
        
        $where = ['user_id = %d'];
        $params = [$user_id];
        
        if (!empty($filters['type'])) {
            $where[] = 'type = %s';
            $params[] = $filters['type'];
        }
        
        if (!empty($filters['status'])) {
            $where[] = 'status = %s';
            $params[] = $filters['status'];
        }
        
        if (!empty($filters['start_date'])) {
            $where[] = 'created_at >= %s';
            $params[] = $filters['start_date'];
        }
        
        if (!empty($filters['end_date'])) {
            $where[] = 'created_at <= %s';
            $params[] = $filters['end_date'];
        }
        
        $sql = "SELECT * FROM {$table} WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC";
        
        if (!empty($filters['limit'])) {
            $sql .= " LIMIT %d";
            $params[] = $filters['limit'];
            
            if (!empty($filters['offset'])) {
                $sql .= " OFFSET %d";
                $params[] = $filters['offset'];
            }
        }
        
        return $wpdb->get_results($wpdb->prepare($sql, $params), ARRAY_A);
    }
    
    /**
     * Get transaction by ID
     */
    public function get_transaction($transaction_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_transactions';
        
        return $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE transaction_id = %s",
            $transaction_id
        ), ARRAY_A);
    }
    
    /**
     * Generate statement
     */
    public function generate_statement($user_id, $start_date, $end_date) {
        $transactions = $this->get_transactions($user_id, [
            'start_date' => $start_date,
            'end_date' => $end_date,
            'status' => 'completed'
        ]);
        
        $totals = [
            'contributions' => 0,
            'withdrawals' => 0,
            'loan_disbursements' => 0,
            'loan_repayments' => 0,
            'interest' => 0
        ];
        
        foreach ($transactions as $t) {
            switch ($t['type']) {
                case 'contribution':
                    $totals['contributions'] += (float)$t['amount'];
                    break;
                case 'withdrawal':
                    $totals['withdrawals'] += (float)$t['amount'];
                    break;
                case 'loan_disbursement':
                    $totals['loan_disbursements'] += (float)$t['amount'];
                    break;
                case 'loan_repayment':
                    $totals['loan_repayments'] += (float)$t['amount'];
                    break;
                case 'interest':
                    $totals['interest'] += (float)$t['amount'];
                    break;
            }
        }
        
        return [
            'user_id' => $user_id,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'transactions' => $transactions,
            'totals' => $totals,
            'balance' => $this->get_balance($user_id, 'savings') + $this->get_balance($user_id, 'contribution')
        ];
    }
    
    /**
     * Transfer between wallets
     */
    public function transfer($user_id, $amount, $from_type, $to_type) {
        global $wpdb;
        
        $wallets_table = $wpdb->prefix . 'coopvest_wallets';
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        
        $from_wallet = $this->get_wallet($user_id, $from_type);
        $to_wallet = $this->get_or_create_wallet($user_id, $to_type);
        
        if (!$from_wallet || (float)$from_wallet['balance'] < $amount) {
            return new \WP_Error('insufficient_balance', 'Insufficient balance in source wallet', ['status' => 400]);
        }
        
        $transaction_id = $this->generate_transaction_id();
        
        $wpdb->query('START TRANSACTION');
        
        try {
            // Deduct from source
            $this->update_balance($from_wallet['id'], $amount, 'subtract');
            
            // Add to destination
            $this->update_balance($to_wallet['id'], $amount, 'add');
            
            // Record transaction
            $wpdb->insert($transactions_table, [
                'transaction_id' => $transaction_id,
                'user_id' => $user_id,
                'wallet_id' => $from_wallet['id'],
                'type' => 'transfer',
                'amount' => $amount,
                'description' => "Transfer from {$from_type} to {$to_type}",
                'metadata' => json_encode([
                    'from_wallet' => $from_type,
                    'to_wallet' => $to_type
                ]),
                'processed_at' => current_time('mysql')
            ]);
            
            $wpdb->query('COMMIT');
            
            return [
                'success' => true,
                'transaction_id' => $transaction_id,
                'from_balance' => $this->get_balance($user_id, $from_type),
                'to_balance' => $this->get_balance($user_id, $to_type)
            ];
            
        } catch (\Exception $e) {
            $wpdb->query('ROLLBACK');
            return new \WP_Error('transfer_failed', $e->getMessage(), ['status' => 500]);
        }
    }
    
    /**
     * Generate unique transaction ID
     */
    private function generate_transaction_id() {
        return 'TXN' . date('YmdHis') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 6));
    }
    
    /**
     * Send contribution notification
     */
    private function send_contribution_notification($user_id, $amount, $transaction_id) {
        $firebase = \Coopvest\Firebase_Notifications::get_instance();
        
        $firebase->notify_user($user_id,
            'Contribution Received',
            "Your contribution of NGN " . number_format($amount, 2) . " has been received.",
            [
                'type' => 'contribution',
                'transaction_id' => $transaction_id,
                'amount' => $amount
            ]
        );
    }
}
