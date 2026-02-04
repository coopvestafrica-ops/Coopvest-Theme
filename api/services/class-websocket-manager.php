<?php
/**
 * WebSocket Manager
 * 
 * Manages WebSocket connections for real-time updates
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class WebSocket_Manager {
    private static $instance = null;
    private $connections = [];
    private $user_connections = [];
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Add a client connection
     */
    public function add_connection($connection_id, $user_id, $socket) {
        $this->connections[$connection_id] = [
            'user_id' => $user_id,
            'socket' => $socket,
            'connected_at' => time(),
            'subscriptions' => []
        ];
        
        if (!isset($this->user_connections[$user_id])) {
            $this->user_connections[$user_id] = [];
        }
        $this->user_connections[$user_id][] = $connection_id;
        
        // Log connection
        $this->log_connection($user_id, 'connect', $connection_id);
    }
    
    /**
     * Remove a client connection
     */
    public function remove_connection($connection_id) {
        if (isset($this->connections[$connection_id])) {
            $user_id = $this->connections[$connection_id]['user_id'];
            
            // Remove from user connections
            if (isset($this->user_connections[$user_id])) {
                $index = array_search($connection_id, $this->user_connections[$user_id]);
                if ($index !== false) {
                    unset($this->user_connections[$user_id][$index]);
                }
            }
            
            // Log disconnection
            $this->log_connection($user_id, 'disconnect', $connection_id);
            
            // Remove connection
            unset($this->connections[$connection_id]);
        }
    }
    
    /**
     * Send message to specific connection
     */
    public function send($connection_id, $type, $data) {
        if (isset($this->connections[$connection_id])) {
            $message = json_encode([
                'type' => $type,
                'data' => $data,
                'timestamp' => time()
            ]);
            
            return $this->connections[$connection_id]['socket']->send($message);
        }
        return false;
    }
    
    /**
     * Send message to user (all connections)
     */
    public function send_to_user($user_id, $type, $data) {
        if (!isset($this->user_connections[$user_id])) {
            return false;
        }
        
        $success = true;
        foreach ($this->user_connections[$user_id] as $connection_id) {
            if (!$this->send($connection_id, $type, $data)) {
                $success = false;
            }
        }
        return $success;
    }
    
    /**
     * Broadcast to all connected clients
     */
    public function broadcast($type, $data) {
        $message = json_encode([
            'type' => $type,
            'data' => $data,
            'timestamp' => time()
        ]);
        
        foreach ($this->connections as $connection) {
            $connection['socket']->send($message);
        }
    }
    
    /**
     * Subscribe connection to a channel
     */
    public function subscribe($connection_id, $channel) {
        if (isset($this->connections[$connection_id])) {
            $this->connections[$connection_id]['subscriptions'][] = $channel;
        }
    }
    
    /**
     * Unsubscribe from channel
     */
    public function unsubscribe($connection_id, $channel) {
        if (isset($this->connections[$connection_id])) {
            $index = array_search($channel, $this->connections[$connection_id]['subscriptions']);
            if ($index !== false) {
                unset($this->connections[$connection_id]['subscriptions'][$index]);
            }
        }
    }
    
    /**
     * Broadcast to channel subscribers
     */
    public function broadcast_to_channel($channel, $type, $data) {
        $message = json_encode([
            'type' => $type,
            'data' => $data,
            'timestamp' => time()
        ]);
        
        foreach ($this->connections as $connection) {
            if (in_array($channel, $connection['subscriptions'])) {
                $connection['socket']->send($message);
            }
        }
    }
    
    /**
     * Notify loan progress update
     */
    public function notify_loan_progress($loan_id, $guarantors_confirmed, $total_required) {
        // Broadcast to all subscribers of this loan
        $this->broadcast_to_channel("loan:{$loan_id}", 'loan_progress', [
            'loan_id' => $loan_id,
            'guarantors_confirmed' => $guarantors_confirmed,
            'total_required' => $total_required,
            'progress' => round(($guarantors_confirmed / $total_required) * 100)
        ]);
    }
    
    /**
     * Notify loan status change
     */
    public function notify_loan_status($loan_id, $status, $additional_data = []) {
        $this->broadcast('loan_status', array_merge([
            'loan_id' => $loan_id,
            'status' => $status
        ], $additional_data));
    }
    
    /**
     * Notify new notification
     */
    public function notify_new_notification($user_id, $notification) {
        $this->send_to_user($user_id, 'notification', $notification);
    }
    
    /**
     * Notify wallet update
     */
    public function notify_wallet_update($user_id, $wallet_data) {
        $this->send_to_user($user_id, 'wallet_update', $wallet_data);
    }
    
    /**
     * Notify transaction
     */
    public function notify_transaction($user_id, $transaction) {
        $this->send_to_user($user_id, 'transaction', $transaction);
    }
    
    /**
     * Get connection statistics
     */
    public function get_stats() {
        $total_connections = count($this->connections);
        $unique_users = count($this->user_connections);
        
        $channels = [];
        foreach ($this->connections as $connection) {
            foreach ($connection['subscriptions'] as $channel) {
                if (!isset($channels[$channel])) {
                    $channels[$channel] = 0;
                }
                $channels[$channel]++;
            }
        }
        
        return [
            'total_connections' => $total_connections,
            'unique_users' => $unique_users,
            'channels' => $channels,
            'memory_usage' => memory_get_usage(true)
        ];
    }
    
    /**
     * Get user connections
     */
    public function get_user_connection_count($user_id) {
        return count($this->user_connections[$user_id] ?? []);
    }
    
    /**
     * Check if user is connected
     */
    public function is_user_connected($user_id) {
        return isset($this->user_connections[$user_id]) && count($this->user_connections[$user_id]) > 0;
    }
    
    /**
     * Log connection event
     */
    private function log_connection($user_id, $event, $connection_id) {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_websocket_logs';
        
        $wpdb->insert($table, [
            'user_id' => $user_id,
            'event' => $event,
            'connection_id' => $connection_id,
            'ip_address' => $_SERVER['REMOTE_ADDR'] ?? 'unknown',
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? 'unknown'
        ]);
    }
    
    /**
     * Create websocket logs table
     */
    public function create_logs_table() {
        global $wpdb;
        
        $table = $wpdb->prefix . 'coopvest_websocket_logs';
        $charset_collate = $wpdb->get_charset_collate();
        
        $sql = "CREATE TABLE {$table} (
            id BIGINT(20) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            user_id BIGINT(20) UNSIGNED,
            event VARCHAR(50) NOT NULL,
            connection_id VARCHAR(100),
            ip_address VARCHAR(45),
            user_agent TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) {$charset_collate};";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }
}

/**
 * WebSocket Server Class (for Ratchet or similar)
 * This is a template that can be used with Ratchet WebSocket library
 */
class Coopvest_WebSocket_Server {
    public function onOpen($conn) {
        $WebSocket = \Coopvest\WebSocket_Manager::get_instance();
        
        // Extract user ID from query string or token
        $query = $conn->WebSocket->request->getQuery();
        $token = $query->get('token');
        
        if ($token) {
            $jwt_auth = \Coopvest\JWT_Auth::get_instance();
            $payload = $jwt_auth->verify_token($token);
            
            if (!is_wp_error($payload)) {
                $user_id = $payload['sub'];
                $connection_id = uniqid('ws_');
                
                $WebSocket->add_connection($connection_id, $user_id, $conn);
                
                // Send welcome message
                $conn->send(json_encode([
                    'type' => 'connected',
                    'connection_id' => $connection_id,
                    'timestamp' => time()
                ]));
            }
        }
    }
    
    public function onMessage($conn, $msg) {
        $WebSocket = \Coopvest\WebSocket_Manager::get_instance();
        
        $data = json_decode($msg, true);
        
        if (!$data) {
            return;
        }
        
        switch ($data['type']) {
            case 'subscribe':
                if (!empty($data['channel'])) {
                    $WebSocket->subscribe($data['connection_id'], $data['channel']);
                }
                break;
                
            case 'unsubscribe':
                if (!empty($data['channel'])) {
                    $WebSocket->unsubscribe($data['connection_id'], $data['channel']);
                }
                break;
                
            case 'ping':
                $conn->send(json_encode([
                    'type' => 'pong',
                    'timestamp' => time()
                ]));
                break;
        }
    }
    
    public function onClose($conn) {
        $WebSocket = \Coopvest\WebSocket_Manager::get_instance();
        
        // Find and remove connection
        foreach ($WebSocket->connections as $connection_id => $connection) {
            if ($connection['socket'] === $conn) {
                $WebSocket->remove_connection($connection_id);
                break;
            }
        }
    }
}
