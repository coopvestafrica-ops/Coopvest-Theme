<?php
/**
 * PDF Generator Service
 * 
 * Generates PDFs for statements, receipts, and loan agreements
 * 
 * @version 1.0.0
 */

namespace Coopvest;

class PDF_Generator {
    private static $instance = null;
    
    private function __construct() {}
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    /**
     * Generate contribution statement PDF
     */
    public function generate_statement($user_id, $start_date, $end_date, $options = []) {
        global $wpdb;
        
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        // Get user info
        $user_info = $wpdb->get_row($wpdb->prepare(
            "SELECT u.user_email, cu.member_id, cu.bank_name, cu.account_number 
             FROM {$wpdb->users} u 
             LEFT JOIN {$users_table} cu ON u.ID = cu.user_id 
             WHERE u.ID = %d",
            $user_id
        ), ARRAY_A);
        
        // Get transactions
        $transactions = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$transactions_table} 
             WHERE user_id = %d 
             AND created_at BETWEEN %s AND %s 
             AND status = 'completed'
             ORDER BY created_at ASC",
            $user_id,
            $start_date,
            $end_date
        ), ARRAY_A);
        
        // Calculate totals
        $contributions = 0;
        $withdrawals = 0;
        
        foreach ($transactions as $t) {
            if ($t['type'] === 'contribution') {
                $contributions += (float)$t['amount'];
            } elseif ($t['type'] === 'withdrawal') {
                $withdrawals += (float)$t['amount'];
            }
        }
        
        $balance = $contributions - $withdrawals;
        
        // Generate PDF
        $html = $this->generate_statement_html([
            'user_info' => $user_info,
            'transactions' => $transactions,
            'start_date' => $start_date,
            'end_date' => $end_date,
            'totals' => [
                'contributions' => $contributions,
                'withdrawals' => $withdrawals,
                'balance' => $balance
            ],
            'options' => $options
        ]);
        
        return $this->generate_pdf($html, 'statement_' . date('Y-m-d') . '.pdf');
    }
    
    /**
     * Generate receipt PDF
     */
    public function generate_receipt($transaction_id, $options = []) {
        global $wpdb;
        
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $transaction = $wpdb->get_row($wpdb->prepare(
            "SELECT t.*, u.user_email, cu.member_id 
             FROM {$transactions_table} t 
             LEFT JOIN {$users_table} cu ON t.user_id = cu.user_id 
             LEFT JOIN {$wpdb->users} u ON t.user_id = u.ID 
             WHERE t.transaction_id = %s",
            $transaction_id
        ), ARRAY_A);
        
        if (!$transaction) {
            return new \WP_Error('not_found', 'Transaction not found', ['status' => 404]);
        }
        
        $html = $this->generate_receipt_html([
            'transaction' => $transaction,
            'options' => $options
        ]);
        
        return $this->generate_pdf($html, 'receipt_' . $transaction_id . '.pdf');
    }
    
    /**
     * Generate loan agreement PDF
     */
    public function generate_loan_agreement($loan_id, $options = []) {
        global $wpdb;
        
        $loans_table = $wpdb->prefix . 'coopvest_loans';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        $loan = $wpdb->get_row($wpdb->prepare(
            "SELECT l.*, u.user_email, u.display_name,
             cu.member_id, cu.bank_name, cu.account_number, cu.account_name
             FROM {$loans_table} l 
             LEFT JOIN {$users_table} cu ON l.user_id = cu.user_id 
             LEFT JOIN {$wpdb->users} u ON l.user_id = u.ID 
             WHERE l.loan_id = %s",
            $loan_id
        ), ARRAY_A);
        
        if (!$loan) {
            return new \WP_Error('not_found', 'Loan not found', ['status' => 404]);
        }
        
        $html = $this->generate_agreement_html([
            'loan' => $loan,
            'options' => $options
        ]);
        
        return $this->generate_pdf($html, 'loan_agreement_' . $loan_id . '.pdf');
    }
    
    /**
     * Generate contribution receipt PDF
     */
    public function generate_contribution_receipt($user_id, $amount, $payment_method, $options = []) {
        $transaction_id = $this->generate_transaction_id();
        
        global $wpdb;
        
        $transactions_table = $wpdb->prefix . 'coopvest_transactions';
        $users_table = $wpdb->prefix . 'coopvest_users';
        
        // Get user info
        $user_info = $wpdb->get_row($wpdb->prepare(
            "SELECT u.user_email, u.display_name, cu.member_id, cu.bank_name, cu.account_number 
             FROM {$wpdb->users} u 
             LEFT JOIN {$users_table} cu ON u.ID = cu.user_id 
             WHERE u.ID = %d",
            $user_id
        ), ARRAY_A);
        
        $html = $this->generate_contribution_receipt_html([
            'transaction_id' => $transaction_id,
            'user_info' => $user_info,
            'amount' => $amount,
            'payment_method' => $payment_method,
            'date' => current_time('mysql'),
            'options' => $options
        ]);
        
        return $this->generate_pdf($html, 'contribution_receipt_' . $transaction_id . '.pdf');
    }
    
    /**
     * Generate PDF from HTML using TCPDF or dompdf
     */
    private function generate_pdf($html, $filename) {
        // Try to use TCPDF if available
        if (class_exists('\TCPDF')) {
            return $this->generate_with_tcpdf($html, $filename);
        }
        
        // Try to use dompdf if available
        if (class_exists('\Dompdf\Dompdf')) {
            return $this->generate_with_dompdf($html, $filename);
        }
        
        // Fallback: return HTML with instructions
        return [
            'html' => $html,
            'filename' => $filename,
            'message' => 'PDF library not installed. Raw HTML returned.'
        ];
    }
    
    /**
     * Generate PDF using TCPDF
     */
    private function generate_with_tcpdf($html, $filename) {
        $pdf = new \TCPDF(PDF_PAGE_ORIENTATION, PDF_UNIT, PDF_PAGE_FORMAT, true, 'UTF-8', false);
        
        $pdf->SetCreator('Coopvest Africa');
        $pdf->SetAuthor('Coopvest Africa');
        $pdf->SetTitle($filename);
        
        $pdf->SetMargins(15, 30, 15);
        $pdf->SetHeaderMargin(10);
        $pdf->SetFooterMargin(10);
        
        $pdf->AddPage();
        
        $pdf->writeHTML($html, true, false, true, false, '');
        
        return $pdf->Output($filename, 'S');
    }
    
    /**
     * Generate PDF using dompdf
     */
    private function generate_with_dompdf($html, $filename) {
        $dompdf = new \Dompdf\Dompdf([
            'defaultFont' => 'Helvetica',
            'isRemoteEnabled' => true,
            'isHtml5ParserEnabled' => true
        ]);
        
        $dompdf->loadHtml($html);
        $dompdf->setPaper('A4', 'portrait');
        $dompdf->render();
        
        return $dompdf->output();
    }
    
    /**
     * Generate statement HTML
     */
    private function generate_statement_html($data) {
        $user_info = $data['user_info'];
        $transactions = $data['transactions'];
        $totals = $data['totals'];
        
        $rows = '';
        foreach ($transactions as $t) {
            $status = ucfirst($t['status']);
            $date = date('d/m/Y', strtotime($t['created_at']));
            
            $rows .= '<tr>
                <td>' . $date . '</td>
                <td>' . strtoupper($t['type']) . '</td>
                <td>' . $t['description'] . '</td>
                <td style="text-align:right;">' . number_format($t['amount'], 2) . '</td>
                <td>' . $status . '</td>
            </tr>';
        }
        
        return '<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #1B5E20; }
                .title { font-size: 18px; margin-top: 10px; }
                .info-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #1B5E20; color: white; }
                .totals { margin-top: 20px; text-align: right; }
                .total-row { font-size: 14px; margin: 5px 0; }
                .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Coopvest Africa</div>
                <div class="title">Contribution Statement</div>
            </div>
            
            <div class="info-box">
                <div class="info-row"><strong>Member ID:</strong> <span>' . ($user_info['member_id'] ?? 'N/A') . '</span></div>
                <div class="info-row"><strong>Email:</strong> <span>' . $user_info['user_email'] . '</span></div>
                <div class="info-row"><strong>Period:</strong> <span>' . date('d/m/Y', strtotime($data['start_date'])) . ' - ' . date('d/m/Y', strtotime($data['end_date'])) . '</span></div>
                <div class="info-row"><strong>Generated:</strong> <span>' . date('d/m/Y H:i') . '</span></div>
            </div>
            
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th style="text-align:right;">Amount (NGN)</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ' . $rows . '
                </tbody>
            </table>
            
            <div class="totals">
                <div class="total-row"><strong>Total Contributions:</strong> NGN ' . number_format($totals['contributions'], 2) . '</div>
                <div class="total-row"><strong>Total Withdrawals:</strong> NGN ' . number_format($totals['withdrawals'], 2) . '</div>
                <div class="total-row" style="font-size: 16px; margin-top: 10px;"><strong>Balance:</strong> NGN ' . number_format($totals['balance'], 2) . '</div>
            </div>
            
            <div class="footer">
                <p>This is a computer-generated document. No signature is required.</p>
                <p>Coopvest Africa Cooperative Society Limited</p>
            </div>
        </body>
        </html>';
    }
    
    /**
     * Generate receipt HTML
     */
    private function generate_receipt_html($data) {
        $t = $data['transaction'];
        
        return '<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #1B5E20; }
                .title { font-size: 18px; margin-top: 10px; }
                .receipt-box { border: 2px solid #1B5E20; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .amount { font-size: 28px; font-weight: bold; text-align: center; margin: 20px 0; color: #1B5E20; }
                .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Coopvest Africa</div>
                <div class="title">Transaction Receipt</div>
            </div>
            
            <div class="receipt-box">
                <div class="info-row"><strong>Transaction ID:</strong> <span>' . $t['transaction_id'] . '</span></div>
                <div class="info-row"><strong>Date:</strong> <span>' . date('d/m/Y H:i', strtotime($t['created_at'])) . '</span></div>
                <div class="info-row"><strong>Type:</strong> <span>' . strtoupper($t['type']) . '</span></div>
                <div class="info-row"><strong>Member ID:</strong> <span>' . ($t['member_id'] ?? 'N/A') . '</span></div>
                <div class="info-row"><strong>Description:</strong> <span>' . $t['description'] . '</span></div>
                <div class="info-row"><strong>Reference:</strong> <span>' . ($t['reference'] ?? 'N/A') . '</span></div>
                
                <div class="amount">NGN ' . number_format($t['amount'], 2) . '</div>
                
                <div class="info-row"><strong>Status:</strong> <span>' . ucfirst($t['status']) . '</span></div>
                <div class="info-row"><strong>Payment Method:</strong> <span>' . ($t['metadata'] ? json_decode($t['metadata'])->payment_method ?? 'N/A' : 'N/A') . '</span></div>
            </div>
            
            <div class="footer">
                <p>Thank you for your cooperation!</p>
                <p>Coopvest Africa Cooperative Society Limited</p>
            </div>
        </body>
        </html>';
    }
    
    /**
     * Generate agreement HTML
     */
    private function generate_agreement_html($data) {
        $loan = $data['loan'];
        
        return '<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; line-height: 1.6; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #1B5E20; }
                .title { font-size: 20px; margin-top: 10px; text-decoration: underline; }
                .section { margin: 20px 0; }
                .section-title { font-size: 14px; font-weight: bold; margin-bottom: 10px; color: #1B5E20; }
                .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
                .info-item { margin-bottom: 5px; }
                .amount-box { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
                .amount-row { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .terms { font-size: 10px; color: #666; margin-top: 30px; }
                .signature { margin-top: 50px; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Coopvest Africa</div>
                <div class="title">LOAN AGREEMENT</div>
            </div>
            
            <div class="section">
                <p>This Loan Agreement is made between <strong>Coopvest Africa Cooperative Society Limited</strong> 
                (hereinafter called "the Society") and <strong>' . $loan['display_name'] . '</strong> 
                (hereinafter called "the Borrower")</p>
            </div>
            
            <div class="section">
                <div class="section-title">1. LOAN DETAILS</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Loan ID:</strong> ' . $loan['loan_id'] . '</div>
                    <div class="info-item"><strong>Member ID:</strong> ' . ($loan['member_id'] ?? 'N/A') . '</div>
                    <div class="info-item"><strong>Loan Purpose:</strong> ' . ucfirst($loan['purpose']) . '</div>
                    <div class="info-item"><strong>Disbursement Date:</strong> ' . ($loan['disbursement_date'] ? date('d/m/Y', strtotime($loan['disbursement_date'])) : 'Pending') . '</div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">2. LOAN AMOUNT AND TERMS</div>
                <div class="amount-box">
                    <div class="amount-row"><span>Principal Amount:</span> <span>NGN ' . number_format($loan['amount'], 2) . '</span></div>
                    <div class="amount-row"><span>Interest Rate:</span> <span>' . $loan['interest_rate'] . '% per annum</span></div>
                    <div class="amount-row"><span>Loan Tenor:</span> <span>' . $loan['tenor'] . ' months</span></div>
                    <div class="amount-row"><span>Processing Fee:</span> <span>NGN ' . number_format($loan['processing_fee'], 2) . '</span></div>
                    <hr>
                    <div class="amount-row" style="font-weight:bold;"><span>Monthly Repayment:</span> <span>NGN ' . number_format($loan['monthly_repayment'], 2) . '</span></div>
                    <div class="amount-row" style="font-weight:bold;"><span>Total Repayment:</span> <span>NGN ' . number_format($loan['total_repayment'], 2) . '</span></div>
                </div>
            </div>
            
            <div class="section">
                <div class="section-title">3. BANK DETAILS</div>
                <div class="info-grid">
                    <div class="info-item"><strong>Bank Name:</strong> ' . ($loan['bank_name'] ?? 'N/A') . '</div>
                    <div class="info-item"><strong>Account Number:</strong> ' . ($loan['account_number'] ?? 'N/A') . '</div>
                    <div class="info-item"><strong>Account Name:</strong> ' . ($loan['account_name'] ?? 'N/A') . '</div>
                </div>
            </div>
            
            <div class="terms">
                <p><strong>Terms and Conditions:</strong></p>
                <p>1. The Borrower agrees to repay the loan in monthly installments as specified above.</p>
                <p>2. Late payments will attract a penalty of 5% per month on the outstanding amount.</p>
                <p>3. Early repayment is allowed with a 50% reduction in interest.</p>
                <p>4. Default in payment may result in recovery from salary/guarantors.</p>
                <p>5. The Society reserves the right to vary the terms and conditions with notice.</p>
            </div>
            
            <div class="signature">
                <p style="margin-bottom: 50px;">_____________________________<br>Borrower Signature & Date</p>
                <p>_____________________________<br>Authorized Officer & Date</p>
            </div>
        </body>
        </html>';
    }
    
    /**
     * Generate contribution receipt HTML
     */
    private function generate_contribution_receipt_html($data) {
        return '<!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Helvetica, Arial, sans-serif; font-size: 12px; }
                .header { text-align: center; margin-bottom: 30px; }
                .logo { font-size: 24px; font-weight: bold; color: #1B5E20; }
                .title { font-size: 18px; margin-top: 10px; }
                .receipt-box { border: 2px solid #1B5E20; padding: 20px; border-radius: 5px; margin: 20px 0; }
                .info-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
                .amount { font-size: 28px; font-weight: bold; text-align: center; margin: 20px 0; color: #1B5E20; }
                .footer { margin-top: 40px; text-align: center; font-size: 10px; color: #666; }
            </style>
        </head>
        <body>
            <div class="header">
                <div class="logo">Coopvest Africa</div>
                <div class="title">Contribution Receipt</div>
            </div>
            
            <div class="receipt-box">
                <div class="info-row"><strong>Receipt No:</strong> <span>' . $data['transaction_id'] . '</span></div>
                <div class="info-row"><strong>Date:</strong> <span>' . date('d/m/Y H:i', strtotime($data['date'])) . '</span></div>
                <div class="info-row"><strong>Member:</strong> <span>' . $data['user_info']['display_name'] . '</span></div>
                <div class="info-row"><strong>Member ID:</strong> <span>' . ($data['user_info']['member_id'] ?? 'N/A') . '</span></div>
                <div class="info-row"><strong>Payment Method:</strong> <span>' . ucfirst($data['payment_method']) . '</span></div>
                
                <div class="amount">NGN ' . number_format($data['amount'], 2) . '</div>
                
                <p style="text-align: center; font-size: 11px;">Payment received and confirmed</p>
            </div>
            
            <div class="footer">
                <p>Keep this receipt for your records.</p>
                <p>Coopvest Africa Cooperative Society Limited</p>
            </div>
        </body>
        </html>';
    }
    
    /**
     * Generate unique transaction ID
     */
    private function generate_transaction_id() {
        return 'TXN' . date('Ymd') . strtoupper(substr(md5(uniqid(rand(), true)), 0, 8));
    }
}
