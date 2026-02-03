/**
 * Referral Management API Service
 * Handles all referral-related API calls for admin dashboard
 */

const API_BASE = process.env.REACT_APP_API_URL || '/api/v1';

class ReferralApiService {
  constructor() {
    this.baseUrl = `${API_BASE}/referrals`;
  }

  // Get auth token from localStorage
  getAuthToken() {
    return localStorage.getItem('adminToken') || localStorage.getItem('authToken');
  }

  // Generic request handler
  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.getAuthToken()}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // ==================== REFERRALS ====================

  /**
   * Get all referrals with pagination and filters
   */
  async getReferrals(params = {}) {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.status) queryParams.set('status', params.status);
    if (params.tier) queryParams.set('tier', params.tier);
    if (params.search) queryParams.set('search', params.search);
    if (params.dateFrom) queryParams.set('date_from', params.dateFrom);
    if (params.dateTo) queryParams.set('date_to', params.dateTo);
    if (params.flagged !== undefined) queryParams.set('flagged', params.flagged);

    return this.request(`?${queryParams.toString()}`);
  }

  /**
   * Get single referral by ID
   */
  async getReferral(id) {
    return this.request(`/${id}`);
  }

  /**
   * Get referral details including bonus history
   */
  async getReferralDetails(id) {
    return this.request(`/${id}/details`);
  }

  /**
   * Approve a flagged referral
   */
  async approveReferral(id, reason = '') {
    return this.request(`/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Reject a referral
   */
  async rejectReferral(id, reason) {
    return this.request(`/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  /**
   * Flag a referral for review
   */
  async flagReferral(id, reason, severity = 'medium') {
    return this.request(`/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason, severity }),
    });
  }

  /**
   * Unflag a referral
   */
  async unflagReferral(id) {
    return this.request(`/${id}/unflag`, {
      method: 'POST',
    });
  }

  // ==================== REFERRAL STATS ====================

  /**
   * Get referral statistics overview
   */
  async getStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.set('period', params.period); // day, week, month, year

    return this.request(`/stats/overview?${queryParams.toString()}`);
  }

  /**
   * Get tier distribution stats
   */
  async getTierStats() {
    return this.request('/stats/tiers');
  }

  /**
   * Get bonus distribution stats
   */
  async getBonusStats(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.period) queryParams.set('period', params.period);

    return this.request(`/stats/bonuses?${queryParams.toString()}`);
  }

  /**
   * Get fraud detection stats
   */
  async getFraudStats() {
    return this.request('/stats/fraud');
  }

  // ==================== REFERRAL TIERS ====================

  /**
   * Get all referral tiers
   */
  async getTiers() {
    return this.request('/tiers');
  }

  /**
   * Create new referral tier
   */
  async createTier(tierData) {
    return this.request('/tiers', {
      method: 'POST',
      body: JSON.stringify(tierData),
    });
  }

  /**
   * Update referral tier
   */
  async updateTier(id, tierData) {
    return this.request(`/tiers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(tierData),
    });
  }

  /**
   * Delete referral tier
   */
  async deleteTier(id) {
    return this.request(`/tiers/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Reorder tiers
   */
  async reorderTiers(tierIds) {
    return this.request('/tiers/reorder', {
      method: 'POST',
      body: JSON.stringify({ tier_ids: tierIds }),
    });
  }

  // ==================== BONUS MANAGEMENT ====================

  /**
   * Get all bonus records
   */
  async getBonuses(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.limit) queryParams.set('limit', params.limit);
    if (params.status) queryParams.set('status', params.status);
    if (params.type) queryParams.set('type', params.type);

    return this.request(`/bonuses?${queryParams.toString()}`);
  }

  /**
   * Calculate pending bonuses
   */
  async calculateBonuses() {
    return this.request('/bonuses/calculate', {
      method: 'POST',
    });
  }

  /**
   * Disburse bonus to member
   */
  async disburseBonus(bonusId) {
    return this.request(`/bonuses/${bonusId}/disburse`, {
      method: 'POST',
    });
  }

  /**
   * Reverse bonus
   */
  async reverseBonus(bonusId, reason) {
    return this.request(`/bonuses/${bonusId}/reverse`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== FRAUD DETECTION ====================

  /**
   * Get suspicious referrals
   */
  async getSuspiciousReferrals(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.severity) queryParams.set('severity', params.severity);

    return this.request(`/fraud/suspicious?${queryParams.toString()}`);
  }

  /**
   * Get fraud patterns
   */
  async getFraudPatterns() {
    return this.request('/fraud/patterns');
  }

  /**
   * Investigate suspicious referral
   */
  async investigateFraud(id, notes) {
    return this.request(`/fraud/investigate/${id}`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    });
  }

  /**
   * Ban member for fraud
   */
  async banMemberForFraud(memberId, reason) {
    return this.request(`/fraud/ban/${memberId}`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  }

  // ==================== QR CODE MANAGEMENT ====================

  /**
   * Get all QR codes
   */
  async getQRCodes(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);
    if (params.type) queryParams.set('type', params.type); // referral, loan, guarantor
    if (params.status) queryParams.set('status', params.status);

    return this.request(`/qr-codes?${queryParams.toString()}`);
  }

  /**
   * Get QR code details
   */
  async getQRCodeDetails(id) {
    return this.request(`/qr-codes/${id}`);
  }

  /**
   * Get QR code scan history
   */
  async getQRScanHistory(id, params = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.set('page', params.page);

    return this.request(`/qr-codes/${id}/scans?${queryParams.toString()}`);
  }

  /**
   * Deactivate QR code
   */
  async deactivateQRCode(id) {
    return this.request(`/qr-codes/${id}/deactivate`, {
      method: 'POST',
    });
  }

  /**
   * Regenerate QR code
   */
  async regenerateQRCode(id) {
    return this.request(`/qr-codes/${id}/regenerate`, {
      method: 'POST',
    });
  }

  /**
   * Get QR code statistics
   */
  async getQRStats() {
    return this.request('/qr-codes/stats');
  }

  // ==================== EXPORT ====================

  /**
   * Export referrals to CSV
   */
  async exportReferrals(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.status) queryParams.set('status', params.status);
    if (params.tier) queryParams.set('tier', params.tier);
    if (params.dateFrom) queryParams.set('date_from', params.dateFrom);
    if (params.dateTo) queryParams.set('date_to', params.dateTo);
    if (params.flagged !== undefined) queryParams.set('flagged', params.flagged);

    return this.request(`/export?${queryParams.toString()}`);
  }

  /**
   * Export fraud report
   */
  async exportFraudReport(params = {}) {
    const queryParams = new URLSearchParams();
    if (params.dateFrom) queryParams.set('date_from', params.dateFrom);
    if (params.dateTo) queryParams.set('date_to', params.dateTo);

    return this.request(`/export/fraud?${queryParams.toString()}`);
  }
}

// Export singleton instance
export const referralApi = new ReferralApiService();
export default referralApi;
