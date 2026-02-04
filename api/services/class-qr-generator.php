<?php
/**
 * QR Code Generator Service
 * 
 * Generates QR codes for loan guarantor validation
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class QR_Generator {
    private static $instance = null;
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Generate QR code data for loan
     */
    public function generate_qr_data($loan) {
        $signature = $this->generate_signature($loan);
        
        $qr_data = [
            'loanId' => $loan['loan_id'],
            'borrowerId' => $loan['user_id'],
            'borrowerName' => $this->get_user_name($loan['user_id']),
            'amount' => (float)$loan['amount'],
            'tenor' => (int)$loan['tenor'],
            'interestRate' => (float)$loan['interest_rate'],
            'purpose' => $loan['purpose'],
            'guarantorsRequired' => (int)($loan['guarantors_required'] ?? 3),
            'expiresAt' => $loan['qr_expires_at'],
            'signature' => $signature,
            'version' => '1.0'
        ];
        
        return json_encode($qr_data);
    }
    
    /**
     * Generate QR code image
     */
    public function generate_qr_image($data, $options = []) {
        $size = $options['size'] ?? 300;
        $margin = $options['margin'] ?? 2;
        $error_correction = $options['error_correction'] ?? 'H';
        
        // Use Bacon QR Code library if available
        if (class_exists(\BaconQrCode\Writer::class)) {
            return $this->generate_with_bacon($data, $size, $margin, $error_correction);
        }
        
        // Fallback to Google Charts API (for development)
        return $this->generate_with_google($data, $size);
    }
    
    /**
     * Generate QR using Bacon QR Code library
     */
    private function generate_with_bacon($data, $size, $margin, $error_correction) {
        $writer = new \BaconQrCode\Writer(
            new \BaconQrCode\Renderer\Image\Svg()
        );
        
        $writer->setMargin($margin);
        
        $error_correction_map = [
            'L' => \BaconQrCode\Common\ErrorCorrectionLevel::L,
            'M' => \BaconQrCode\Common\ErrorCorrectionLevel::M,
            'Q' => \BaconQrCode\Common\ErrorCorrectionLevel::Q,
            'H' => \BaconQrCode\Common\ErrorCorrectionLevel::H
        ];
        
        $writer->setErrorCorrectionLevel($error_correction_map[$error_correction] ?? $error_correction_map['H']);
        
        $svg = $writer->writeString($data);
        
        // Convert SVG to PNG if needed
        if (isset($options['format']) && $options['format'] === 'png') {
            return $this->svg_to_png($svg, $size);
        }
        
        return $svg;
    }
    
    /**
     * Generate QR using Google Charts API (fallback)
     */
    private function generate_with_google($data, $size) {
        $url = sprintf(
            'https://chart.googleapis.com/chart?chs=%dx%d&cht=qr&chl=%s&choe=UTF-8',
            $size,
            $size,
            urlencode($data)
        );
        
        return $url;
    }
    
    /**
     * Generate signature for QR data
     */
    public function generate_signature($loan) {
        $secret = defined('COOPVEST_QR_SECRET') ? COOPVEST_QR_SECRET : 'coopvest-qr-secret-key';
        
        $data = json_encode([
            'loanId' => $loan['loan_id'],
            'amount' => $loan['amount'],
            'userId' => $loan['user_id'],
            'timestamp' => time()
        ]);
        
        return hash_hmac('sha256', $data, $secret);
    }
    
    /**
     * Verify QR code signature
     */
    public function verify_signature($qr_data, $signature) {
        $secret = defined('COOPVEST_QR_SECRET') ? COOPVEST_QR_SECRET : 'coopvest-qr-secret-key';
        
        $expected = hash_hmac('sha256', $qr_data, $secret);
        
        return hash_equals($expected, $signature);
    }
    
    /**
     * Parse and validate QR code data
     */
    public function parse_qr_data($qr_string) {
        $data = json_decode($qr_string, true);
        
        if (!$data) {
            return new \WP_Error('invalid_qr', 'Invalid QR code data', ['status' => 400]);
        }
        
        // Required fields
        $required = ['loanId', 'borrowerId', 'amount', 'tenor', 'interestRate', 'signature'];
        foreach ($required as $field) {
            if (!isset($data[$field])) {
                return new \WP_Error('missing_field', "Missing required field: {$field}", ['status' => 400]);
            }
        }
        
        // Verify signature
        $stored_signature = $data['signature'];
        unset($data['signature']);
        
        $qr_json = json_encode($data);
        if (!$this->verify_signature($qr_json, $stored_signature)) {
            return new \WP_Error('invalid_signature', 'QR code signature verification failed', ['status' => 400]);
        }
        
        // Check expiry
        if (!empty($data['expiresAt']) && strtotime($data['expiresAt']) < time()) {
            return new \WP_Error('qr_expired', 'QR code has expired', ['status' => 400]);
        }
        
        return $data;
    }
    
    /**
     * Get user name helper
     */
    private function get_user_name($user_id) {
        $user = get_userdata($user_id);
        
        if (!$user) {
            return 'Unknown User';
        }
        
        $first_name = get_user_meta($user_id, 'first_name', true);
        $last_name = get_user_meta($user_id, 'last_name', true);
        
        if ($first_name && $last_name) {
            return $first_name . ' ' . $last_name;
        }
        
        return $user->display_name ?: $user->user_login;
    }
    
    /**
     * Generate guarantor link
     */
    public function generate_guarantor_link($loan_id, $guarantor_position) {
        $base_url = get_option('coopvest_app_url', 'coopvest://');
        
        $token = $this->generate_link_token($loan_id, $guarantor_position);
        
        return $base_url . '/guarantor/' . $loan_id . '/' . $guarantor_position . '?token=' . $token;
    }
    
    /**
     * Generate link token for deep linking
     */
    private function generate_link_token($loan_id, $guarantor_position) {
        $secret = defined('COOPVEST_QR_SECRET') ? COOPVEST_QR_SECRET : 'coopvest-qr-secret-key';
        
        $data = json_encode([
            'loanId' => $loan_id,
            'position' => $guarantor_position,
            'timestamp' => time()
        ]);
        
        return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
    }
    
    /**
     * Validate link token
     */
    public function validate_link_token($token, $loan_id, $guarantor_position) {
        $secret = defined('COOPVEST_QR_SECRET') ? COOPVEST_QR_SECRET : 'coopvest-qr-secret-key';
        
        $padding = 4 - (strlen($token) % 4);
        if ($padding !== 4) {
            $token .= str_repeat('=', $padding);
        }
        
        $data = json_decode(base64_decode(strtr($token, '-_', '+/')), true);
        
        if (!$data) {
            return false;
        }
        
        return $data['loanId'] === $loan_id && 
               $data['position'] == $guarantor_position && 
               ($data['timestamp'] + DAY_IN_SECONDS) > time();
    }
}
