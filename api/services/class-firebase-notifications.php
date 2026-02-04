<?php
/**
 * Firebase Notifications Service
 * 
 * Handles push notifications via Firebase Cloud Messaging
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class Firebase_Notifications {
    private static $instance = null;
    private $server_key;
    private $api_url = 'https://fcm.googleapis.com/fcm/send';
    
    private function __construct() {
        $this->server_key = defined('FIREBASE_SERVER_KEY') ? FIREBASE_SERVER_KEY : get_option('coopvest_firebase_server_key', '');
    }
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Send notification to single device
     */
    public function send($device_token, $title, $message, $data = [], $options = []) {
        if (empty($this->server_key)) {
            return new \WP_Error('no_config', 'Firebase server key not configured', ['status' => 500]);
        }
        
        $notification = array_merge([
            'title' => $title,
            'body' => $message,
            'sound' => 'default',
            'badge' => 1
        ], $options['notification'] ?? []);
        
        $payload = [
            'to' => $device_token,
            'notification' => $notification,
            'data' => array_merge([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'title' => $title,
                'body' => $message
            ], $data),
            'priority' => $options['priority'] ?? 'high',
            'time_to_live' => $options['ttl'] ?? 86400
        ];
        
        return $this->send_request($payload);
    }
    
    /**
     * Send notification to multiple devices
     */
    public function send_multiple($device_tokens, $title, $message, $data = [], $options = []) {
        if (empty($this->server_key)) {
            return new \WP_Error('no_config', 'Firebase server key not configured', ['status' => 500]);
        }
        
        if (empty($device_tokens)) {
            return ['success' => true, 'message' => 'No devices registered'];
        }
        
        $notification = array_merge([
            'title' => $title,
            'body' => $message,
            'sound' => 'default'
        ], $options['notification'] ?? []);
        
        // Split into chunks of 1000 (FCM limit)
        $chunks = array_chunk($device_tokens, 1000);
        $results = [];
        
        foreach ($chunks as $chunk) {
            $payload = [
                'registration_ids' => $chunk,
                'notification' => $notification,
                'data' => array_merge([
                    'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                    'title' => $title,
                    'body' => $message
                ], $data),
                'priority' => $options['priority'] ?? 'high'
            ];
            
            $results[] = $this->send_request($payload);
        }
        
        return $results;
    }
    
    /**
     * Send notification to topic
     */
    public function send_to_topic($topic, $title, $message, $data = [], $options = []) {
        if (empty($this->server_key)) {
            return new \WP_Error('no_config', 'Firebase server key not configured', ['status' => 500]);
        }
        
        $payload = [
            'to' => '/topics/' . $topic,
            'notification' => [
                'title' => $title,
                'body' => $message,
                'sound' => 'default'
            ],
            'data' => array_merge([
                'click_action' => 'FLUTTER_NOTIFICATION_CLICK',
                'title' => $title,
                'body' => $message
            ], $data),
            'priority' => $options['priority'] ?? 'high'
        ];
        
        return $this->send_request($payload);
    }
    
    /**
     * Send HTTP request to FCM
     */
    private function send_request($payload) {
        $headers = [
            'Authorization: key=' . $this->server_key,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $this->api_url);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        
        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        
        if (curl_errno($ch)) {
            curl_close($ch);
            return new \WP_Error('curl_error', 'FCM request failed: ' . curl_error($ch), ['status' => 500]);
        }
        
        curl_close($ch);
        
        $result = json_decode($response, true);
        
        if ($http_code !== 200) {
            return new \WP_Error('fcm_error', 'FCM error: ' . ($result['error'] ?? 'Unknown error'), ['status' => $http_code]);
        }
        
        return $result;
    }
    
    /**
     * Register device token for user
     */
    public function register_token($user_id, $token, $platform = 'android') {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_device_tokens';
        
        // Check if token already exists
        $existing = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table} WHERE token = %s",
            $token
        ));
        
        if ($existing) {
            // Update user_id and platform
            $wpdb->update($table, [
                'user_id' => $user_id,
                'platform' => $platform,
                'last_active' => current_time('mysql')
            ], ['token' => $token]);
        } else {
            // Insert new token
            $wpdb->insert($table, [
                'user_id' => $user_id,
                'token' => $token,
                'platform' => $platform,
                'created_at' => current_time('mysql'),
                'last_active' => current_time('mysql')
            ]);
        }
        
        return ['success' => true];
    }
    
    /**
     * Unregister device token
     */
    public function unregister_token($token) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_device_tokens';
        
        $result = $wpdb->delete($table, ['token' => $token]);
        
        return ['success' => $result !== false];
    }
    
    /**
     * Get user's device tokens
     */
    public function get_user_tokens($user_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_device_tokens';
        
        return $wpdb->get_col($wpdb->prepare(
            "SELECT token FROM {$table} WHERE user_id = %d",
            $user_id
        ));
    }
    
    /**
     * Send notification to user (all devices)
     */
    public function notify_user($user_id, $title, $message, $data = [], $options = []) {
        $tokens = $this->get_user_tokens($user_id);
        
        if (empty($tokens)) {
            return ['success' => false, 'message' => 'No devices registered'];
        }
        
        // Save notification to database
        $this->save_notification($user_id, $title, $message, $data);
        
        return $this->send_multiple($tokens, $title, $message, $data, $options);
    }
    
    /**
     * Save notification to database
     */
    private function save_notification($user_id, $title, $message, $data) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_notifications';
        
        $wpdb->insert($table, [
            'user_id' => $user_id,
            'type' => $data['type'] ?? 'general',
            'title' => $title,
            'message' => $message,
            'data' => json_encode($data),
            'sent_via' => json_encode(['in_app', 'push']),
            'sent_at' => current_time('mysql')
        ]);
        
        return $wpdb->insert_id;
    }
    
    /**
     * Send loan status notification
     */
    public function notify_loan_status($user_id, $loan_id, $status, $additional_data = []) {
        $titles = [
            'pending' => 'Loan Application Received',
            'under_review' => 'Loan Under Review',
            'approved' => 'Loan Approved!',
            'rejected' => 'Loan Application Not Approved',
            'active' => 'Loan Disbursed',
            'completed' => 'Loan Completed',
            'defaulted' => 'Loan Default Warning'
        ];
        
        $messages = [
            'pending' => 'Your loan application is being processed.',
            'under_review' => 'Your loan application is currently under review.',
            'approved' => 'Congratulations! Your loan of NGN ' . ($additional_data['amount'] ?? '0') . ' has been approved.',
            'rejected' => 'Unfortunately, your loan application was not approved. Reason: ' . ($additional_data['reason'] ?? 'Not specified'),
            'active' => 'Your loan has been disbursed to your account.',
            'completed' => 'Congratulations! Your loan has been fully repaid.',
            'defaulted' => 'Your loan is now in default. Please contact us immediately.'
        ];
        
        return $this->notify_user($user_id, 
            $titles[$status] ?? 'Loan Update', 
            $messages[$status] ?? 'Your loan status has been updated.',
            array_merge([
                'type' => 'loan_status',
                'loan_id' => $loan_id,
                'status' => $status
            ], $additional_data)
        );
    }
    
    /**
     * Send guarantor notification
     */
    public function notify_guarantor($user_id, $loan_id, $borrower_name, $amount, $position, $total_required) {
        $messages = [
            1 => "{$borrower_name} has requested you to be their first guarantor for a loan of NGN {$amount}. Tap to view details.",
            2 => "{$borrower_name} has requested you to be their second guarantor. One more guarantor needed. Tap to proceed.",
            3 => "You're the final guarantor for {$borrower_name}'s loan. Your confirmation will complete the guarantee. Tap to confirm."
        ];
        
        return $this->notify_user($user_id,
            'Guarantor Request',
            $messages[$position] ?? "You've been asked to guarantee a loan for {$borrower_name}.",
            [
                'type' => 'guarantor_request',
                'loan_id' => $loan_id,
                'borrower_name' => $borrower_name,
                'amount' => $amount,
                'position' => $position,
                'total_required' => $total_required
            ]
        );
    }
    
    /**
     * Send contribution reminder
     */
    public function send_contribution_reminder($user_id, $amount, $due_date) {
        return $this->notify_user($user_id,
            'Contribution Reminder',
            "Your monthly contribution of NGN {$amount} is due on {$due_date}.",
            [
                'type' => 'contribution_reminder',
                'amount' => $amount,
                'due_date' => $due_date
            ]
        );
    }
    
    /**
     * Broadcast notification to all users
     */
    public function broadcast($title, $message, $data = []) {
        // Send to topic
        $result = $this->send_to_topic('all_users', $title, $message, $data);
        
        // Also save to database for users who might be offline
        global $wpdb;
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $user_ids = $wpdb->get_col("SELECT user_id FROM {$users_table}");
        
        foreach ($user_ids as $user_id) {
            $this->save_notification($user_id, $title, $message, $data);
        }
        
        return $result;
    }
}
