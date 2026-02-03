/**
 * Referrals Management Page
 * Admin dashboard for managing member referrals, tiers, bonuses, and fraud detection
 */

import React, { useState, useEffect, useCallback } from 'react';
import './Referrals.css';

// Icons as SVG components
const Icons = {
  Search: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
    </svg>
  ),
  Filter: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  ),
  Download: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
      <polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M23 4v6h-6"/><path d="M1 20v-6h6"/>
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
    </svg>
  ),
  AlertTriangle: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  ),
  Check: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  Users: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  DollarSign: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
    </svg>
  ),
  Flag: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/>
    </svg>
  ),
  Settings: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
    </svg>
  ),
  QrCode: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Eye: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Ban: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
    </svg>
  ),
};

// Demo data for display
const demoReferrals = [
  { id: 'REF001', referrer: { name: 'John Doe', phone: '08012345678', email: 'john@email.com' }, referred: { name: 'Jane Smith', phone: '08012345679', email: 'jane@email.com' }, code: 'COOP2024A', tier: 'Gold', status: 'confirmed', bonusAmount: 5000, bonusStatus: 'disbursed', createdAt: '2024-12-15', flagged: false },
  { id: 'REF002', referrer: { name: 'Mike Johnson', phone: '08012345670', email: 'mike@email.com' }, referred: { name: 'Sarah Williams', phone: '08012345671', email: 'sarah@email.com' }, code: 'COOP2024B', tier: 'Silver', status: 'pending', bonusAmount: 3000, bonusStatus: 'pending', createdAt: '2024-12-18', flagged: false },
  { id: 'REF003', referrer: { name: 'Tom Brown', phone: '08012345672', email: 'tom@email.com' }, referred: { name: 'Emily Davis', phone: '08012345673', email: 'emily@email.com' }, code: 'COOP2024C', tier: 'Bronze', status: 'confirmed', bonusAmount: 1500, bonusStatus: 'pending', createdAt: '2024-12-20', flagged: true, flaggedReason: 'Same device detected' },
  { id: 'REF004', referrer: { name: 'Alice Wilson', phone: '08012345674', email: 'alice@email.com' }, referred: { name: 'Bob Miller', phone: '08012345675', email: 'bob@email.com' }, code: 'COOP2024D', tier: 'Gold', status: 'confirmed', bonusAmount: 5000, bonusStatus: 'disbursed', createdAt: '2024-12-22', flagged: false },
  { id: 'REF005', referrer: { name: 'Charlie Taylor', phone: '08012345676', email: 'charlie@email.com' }, referred: { name: 'Diana Anderson', phone: '08012345677', email: 'diana@email.com' }, code: 'COOP2024E', tier: 'Silver', status: 'rejected', bonusAmount: 0, bonusStatus: 'rejected', createdAt: '2024-12-25', flagged: true, flaggedReason: 'KYC verification failed' },
];

const demoStats = {
  totalReferrals: 1245,
  confirmedReferrals: 980,
  pendingReferrals: 215,
  rejectedReferrals: 50,
  totalBonuses: 4250000,
  pendingBonuses: 890000,
  flaggedReferrals: 12,
  avgReferralsPerMember: 3.2,
};

const demoTiers = [
  { id: 1, name: 'Bronze', minReferrals: 0, discountPercent: 0, color: '#CD7F32' },
  { id: 2, name: 'Silver', minReferrals: 5, discountPercent: 2, color: '#C0C0C0' },
  { id: 3, name: 'Gold', minReferrals: 15, discountPercent: 5, color: '#FFD700' },
  { id: 4, name: 'Platinum', minReferrals: 30, discountPercent: 8, color: '#E5E4E2' },
];

const demoSuspicious = [
  { id: 'FR001', type: 'Same Device', count: 5, severity: 'high', members: ['John Doe', 'Jane Smith', 'Mike Johnson'], detectedAt: '2024-12-28' },
  { id: 'FR002', type: 'Fake Phone Numbers', count: 3, severity: 'critical', members: ['Tom Brown', 'Alice Wilson'], detectedAt: '2024-12-27' },
  { id: 'FR003', type: 'Rapid Referrals', count: 8, severity: 'medium', members: ['Charlie Taylor', 'Diana Anderson'], detectedAt: '2024-12-26' },
];

const demoQRStats = {
  totalQRCodes: 350,
  referralQRs: 280,
  loanQRCodes: 70,
  totalScans: 1250,
  uniqueScans: 980,
};

// Main Component
export default function Referrals() {
  const [activeTab, setActiveTab] = useState('overview');
  const [referrals, setReferrals] = useState(demoReferrals);
  const [stats, setStats] = useState(demoStats);
  const [tiers, setTiers] = useState(demoTiers);
  const [suspicious, setSuspicious] = useState(demoSuspicious);
  const [qrStats, setQRStats] = useState(demoQRStats);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [tierFilter, setTierFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedReferral, setSelectedReferral] = useState(null);
  const [showModal, setShowModal] = useState(false);

  // Filter referrals
  const filteredReferrals = useCallback(() => {
    return referrals.filter(ref => {
      const matchesSearch = 
        ref.referrer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.referred.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ref.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || ref.status === statusFilter;
      const matchesTier = tierFilter === 'all' || ref.tier.toLowerCase() === tierFilter.toLowerCase();
      return matchesSearch && matchesStatus && matchesTier;
    });
  }, [referrals, searchTerm, statusFilter, tierFilter]);

  // Refresh data
  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    setLoading(false);
  };

  // Export referrals
  const exportReferrals = () => {
    const data = filteredReferrals().map(ref => ({
      ID: ref.id,
      'Referrer Name': ref.referrer.name,
      'Referrer Phone': ref.referrer.phone,
      'Referred Name': ref.referred.name,
      'Referred Phone': ref.referred.phone,
      'Referral Code': ref.code,
      Tier: ref.tier,
      Status: ref.status,
      'Bonus Amount': ref.bonusAmount,
      'Bonus Status': ref.bonusStatus,
      'Created At': ref.createdAt,
    }));
    
    const csv = [Object.keys(data[0]).join(','), ...data.map(row => Object.values(row).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `referrals_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Modal handlers
  const openReferralDetails = (referral) => {
    setSelectedReferral(referral);
    setShowModal(true);
  };

  const handleApprove = (id) => {
    setReferrals(prev => prev.map(ref => 
      ref.id === id ? { ...ref, flagged: false, status: 'confirmed', flaggedReason: '' } : ref
    ));
    setStats(prev => ({ ...prev, flaggedReferrals: prev.flaggedReferrals - 1 }));
    setShowModal(false);
  };

  const handleReject = (id) => {
    setReferrals(prev => prev.map(ref => 
      ref.id === id ? { ...ref, status: 'rejected', bonusStatus: 'rejected' } : ref
    ));
    setShowModal(false);
  };

  const handleBan = (memberId) => {
    alert(`Member ${memberId} has been banned for fraud`);
    setShowModal(false);
  };

  return (
    <div className="referrals-page">
      {/* Header */}
      <div className="referrals-header">
        <div>
          <h1>Referral Management</h1>
          <p>Manage member referrals, tiers, bonuses, and fraud detection</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={refreshData} disabled={loading}>
            <Icons.Refresh /> {loading ? 'Loading...' : 'Refresh'}
          </button>
          <button className="btn btn-primary" onClick={exportReferrals}>
            <Icons.Download /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue"><Icons.Users /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.totalReferrals}</span>
            <span className="stat-label">Total Referrals</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><Icons.Check /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.confirmedReferrals}</span>
            <span className="stat-label">Confirmed</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon yellow"><Icons.TrendingUp /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.pendingReferrals}</span>
            <span className="stat-label">Pending</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><Icons.DollarSign /></div>
          <div className="stat-info">
            <span className="stat-value">₦{(stats.totalBonuses / 1000000).toFixed(1)}M</span>
            <span className="stat-label">Total Bonuses</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon red"><Icons.Flag /></div>
          <div className="stat-info">
            <span className="stat-value">{stats.flaggedReferrals}</span>
            <span className="stat-label">Flagged</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon purple"><Icons.QrCode /></div>
          <div className="stat-info">
            <span className="stat-value">{qrStats.totalQRCodes}</span>
            <span className="stat-label">QR Codes</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
          Overview
        </button>
        <button className={`tab ${activeTab === 'referrals' ? 'active' : ''}`} onClick={() => setActiveTab('referrals')}>
          Referrals List
        </button>
        <button className={`tab ${activeTab === 'tiers' ? 'active' : ''}`} onClick={() => setActiveTab('tiers')}>
          Tier Configuration
        </button>
        <button className={`tab ${activeTab === 'bonuses' ? 'active' : ''}`} onClick={() => setActiveTab('bonuses')}>
          Bonus Tracking
        </button>
        <button className={`tab ${activeTab === 'fraud' ? 'active' : ''}`} onClick={() => setActiveTab('fraud')}>
          Fraud Detection
        </button>
        <button className={`tab ${activeTab === 'qr' ? 'active' : ''}`} onClick={() => setActiveTab('qr')}>
          QR Management
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="tab-content">
          <div className="overview-grid">
            {/* Tier Distribution */}
            <div className="card">
              <h3>Tier Distribution</h3>
              <div className="tier-list">
                {tiers.map(tier => {
                  const count = referrals.filter(r => r.tier === tier.name).length;
                  const percent = (count / referrals.length * 100).toFixed(1);
                  return (
                    <div key={tier.id} className="tier-item">
                      <div className="tier-info">
                        <span className="tier-dot" style={{ background: tier.color }}></span>
                        <span className="tier-name">{tier.name}</span>
                        <span className="tier-count">{count}</span>
                      </div>
                      <div className="tier-bar">
                        <div className="tier-fill" style={{ width: `${percent}%`, background: tier.color }}></div>
                      </div>
                      <span className="tier-percent">{percent}%</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Suspicious Activity */}
            <div className="card">
              <h3>Recent Suspicious Activity</h3>
              <div className="suspicious-list">
                {suspicious.slice(0, 3).map(item => (
                  <div key={item.id} className="suspicious-item">
                    <div className={`severity-badge ${item.severity}`}>{item.severity}</div>
                    <div className="suspicious-info">
                      <span className="suspicious-type">{item.type}</span>
                      <span className="suspicious-count">{item.count} cases detected</span>
                    </div>
                    <span className="suspicious-date">{item.detectedAt}</span>
                  </div>
                ))}
              </div>
              <button className="btn btn-text" onClick={() => setActiveTab('fraud')}>View All →</button>
            </div>

            {/* Quick Actions */}
            <div className="card">
              <h3>Quick Actions</h3>
              <div className="quick-actions">
                <button className="action-btn" onClick={() => setActiveTab('tiers')}>
                  <Icons.Settings /> Configure Tiers
                </button>
                <button className="action-btn" onClick={() => setActiveTab('bonuses')}>
                  <Icons.DollarSign /> Calculate Bonuses
                </button>
                <button className="action-btn" onClick={() => exportReferrals()}>
                  <Icons.Download /> Export Report
                </button>
                <button className="action-btn" onClick={() => setActiveTab('qr')}>
                  <Icons.QrCode /> Manage QR Codes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'referrals' && (
        <div className="tab-content">
          {/* Filters */}
          <div className="filters-bar">
            <div className="search-box">
              <Icons.Search />
              <input 
                type="text" 
                placeholder="Search referrals..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="filter-group">
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </select>
              <select value={tierFilter} onChange={(e) => setTierFilter(e.target.value)}>
                <option value="all">All Tiers</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="table-container">
            <table className="referrals-table">
              <thead>
                <tr>
                  <th>Referral Code</th>
                  <th>Referrer</th>
                  <th>Referred</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Bonus</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredReferrals().map(referral => (
                  <tr key={referral.id} className={referral.flagged ? 'flagged-row' : ''}>
                    <td><code>{referral.code}</code></td>
                    <td>
                      <div className="member-info">
                        <span className="member-name">{referral.referrer.name}</span>
                        <span className="member-phone">{referral.referrer.phone}</span>
                      </div>
                    </td>
                    <td>
                      <div className="member-info">
                        <span className="member-name">{referral.referred.name}</span>
                        <span className="member-phone">{referral.referred.phone}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`tier-badge ${referral.tier.toLowerCase()}`}>
                        {referral.tier}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${referral.status}`}>
                        {referral.status}
                      </span>
                    </td>
                    <td>₦{referral.bonusAmount.toLocaleString()}</td>
                    <td>{referral.createdAt}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => openReferralDetails(referral)} title="View Details">
                          <Icons.Eye />
                        </button>
                        {referral.flagged && (
                          <button className="btn-icon danger" title="Flagged">
                            <Icons.Flag />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'tiers' && (
        <div className="tab-content">
          <div className="tiers-config">
            <div className="tiers-header">
              <h3>Tier Configuration</h3>
              <button className="btn btn-primary">+ Add Tier</button>
            </div>
            <div className="tiers-grid">
              {tiers.map(tier => (
                <div key={tier.id} className="tier-card" style={{ borderTop: `4px solid ${tier.color}` }}>
                  <div className="tier-card-header">
                    <span className="tier-badge" style={{ background: tier.color }}>{tier.name}</span>
                    <span className="tier-min">{tier.minReferrals}+ referrals</span>
                  </div>
                  <div className="tier-details">
                    <div className="tier-stat">
                      <span className="label">Discount</span>
                      <span className="value">{tier.discountPercent}%</span>
                    </div>
                    <div className="tier-stat">
                      <span className="label">Members</span>
                      <span className="value">{referrals.filter(r => r.tier === tier.name).length}</span>
                    </div>
                  </div>
                  <div className="tier-actions">
                    <button className="btn btn-small">Edit</button>
                    {tier.name !== 'Bronze' && <button className="btn btn-small btn-danger">Delete</button>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'bonuses' && (
        <div className="tab-content">
          <div className="bonuses-section">
            <div className="bonus-summary">
              <div className="summary-card">
                <h4>Total Disbursed</h4>
                <span className="amount">₦{(stats.totalBonuses - stats.pendingBonuses).toLocaleString()}</span>
              </div>
              <div className="summary-card">
                <h4>Pending Disbursement</h4>
                <span className="amount pending">₦{stats.pendingBonuses.toLocaleString()}</span>
              </div>
              <div className="summary-card">
                <h4>This Month</h4>
                <span className="amount">₦1,250,000</span>
              </div>
            </div>
            <div className="bonus-actions">
              <button className="btn btn-primary">Calculate Pending Bonuses</button>
              <button className="btn btn-secondary">Disburse All Eligible</button>
            </div>
            <div className="table-container">
              <table className="bonuses-table">
                <thead>
                  <tr>
                    <th>Referral</th>
                    <th>Tier</th>
                    <th>Bonus Amount</th>
                    <th>Status</th>
                    <th>Lock-in Ends</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.filter(r => r.bonusStatus === 'pending').map(ref => (
                    <tr key={ref.id}>
                      <td>{ref.referrer.name} → {ref.referred.name}</td>
                      <td><span className={`tier-badge ${ref.tier.toLowerCase()}`}>{ref.tier}</span></td>
                      <td>₦{ref.bonusAmount.toLocaleString()}</td>
                      <td><span className="status-badge pending">{ref.bonusStatus}</span></td>
                      <td>2025-01-15</td>
                      <td><button className="btn btn-small">Disburse</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'fraud' && (
        <div className="tab-content">
          <div className="fraud-section">
            <div className="fraud-stats">
              <div className="fraud-stat critical">
                <span className="count">{suspicious.filter(s => s.severity === 'critical').length}</span>
                <span className="label">Critical Cases</span>
              </div>
              <div className="fraud-stat high">
                <span className="count">{suspicious.filter(s => s.severity === 'high').length}</span>
                <span className="label">High Risk</span>
              </div>
              <div className="fraud-stat medium">
                <span className="count">{suspicious.filter(s => s.severity === 'medium').length}</span>
                <span className="label">Medium Risk</span>
              </div>
            </div>
            <div className="fraud-list">
              {suspicious.map(item => (
                <div key={item.id} className="fraud-card">
                  <div className="fraud-header">
                    <span className={`severity-badge ${item.severity}`}>{item.severity.toUpperCase()}</span>
                    <span className="fraud-id">{item.id}</span>
                  </div>
                  <div className="fraud-body">
                    <h4>{item.type}</h4>
                    <p>{item.count} cases detected involving {item.members.length} members</p>
                    <div className="members-involved">
                      <span>Members:</span>
                      {item.members.map((member, idx) => (
                        <span key={idx} className="member-tag">{member}</span>
                      ))}
                    </div>
                  </div>
                  <div className="fraud-actions">
                    <button className="btn btn-small">Investigate</button>
                    <button className="btn btn-small btn-danger">Ban All</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qr' && (
        <div className="tab-content">
          <div className="qr-section">
            <div className="qr-stats">
              <div className="qr-stat-card">
                <span className="qr-stat-value">{qrStats.referralQRs}</span>
                <span className="qr-stat-label">Referral QR Codes</span>
              </div>
              <div className="qr-stat-card">
                <span className="qr-stat-value">{qrStats.loanQRCodes}</span>
                <span className="qr-stat-label">Loan QR Codes</span>
              </div>
              <div className="qr-stat-card">
                <span className="qr-stat-value">{qrStats.totalScans}</span>
                <span className="qr-stat-label">Total Scans</span>
              </div>
              <div className="qr-stat-card">
                <span className="qr-stat-value">{qrStats.uniqueScans}</span>
                <span className="qr-stat-label">Unique Scans</span>
              </div>
            </div>
            <div className="qr-actions">
              <button className="btn btn-primary">Generate New QR Codes</button>
              <button className="btn btn-secondary">Deactivate Expired</button>
            </div>
            <div className="table-container">
              <table className="qr-table">
                <thead>
                  <tr>
                    <th>QR Code</th>
                    <th>Type</th>
                    <th>Owner</th>
                    <th>Scans</th>
                    <th>Status</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><code>QR-GUAR-001</code></td>
                    <td><span className="type-badge loan">Loan/Guarantor</span></td>
                    <td>John Doe</td>
                    <td>12</td>
                    <td><span className="status-badge active">Active</span></td>
                    <td>2025-01-15</td>
                    <td>
                      <button className="btn btn-small">Deactivate</button>
                    </td>
                  </tr>
                  <tr>
                    <td><code>QR-REF-002</code></td>
                    <td><span className="type-badge referral">Referral</span></td>
                    <td>Jane Smith</td>
                    <td>45</td>
                    <td><span className="status-badge active">Active</span></td>
                    <td>2025-01-20</td>
                    <td>
                      <button className="btn btn-small">Deactivate</button>
                    </td>
                  </tr>
                  <tr>
                    <td><code>QR-GUAR-003</code></td>
                    <td><span className="type-badge loan">Loan/Guarantor</span></td>
                    <td>Mike Johnson</td>
                    <td>3</td>
                    <td><span className="status-badge expired">Expired</span></td>
                    <td>2024-12-20</td>
                    <td>
                      <button className="btn btn-small">Regenerate</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedReferral && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Referral Details</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><Icons.X /></button>
            </div>
            <div className="modal-body">
              <div className="detail-section">
                <h4>Referral Code</h4>
                <code className="large-code">{selectedReferral.code}</code>
              </div>
              <div className="detail-grid">
                <div className="detail-section">
                  <h4>Referrer</h4>
                  <p><strong>Name:</strong> {selectedReferral.referrer.name}</p>
                  <p><strong>Phone:</strong> {selectedReferral.referrer.phone}</p>
                  <p><strong>Email:</strong> {selectedReferral.referrer.email}</p>
                  <p><strong>Tier:</strong> <span className={`tier-badge ${selectedReferral.tier.toLowerCase()}`}>{selectedReferral.tier}</span></p>
                </div>
                <div className="detail-section">
                  <h4>Referred Member</h4>
                  <p><strong>Name:</strong> {selectedReferral.referred.name}</p>
                  <p><strong>Phone:</strong> {selectedReferral.referred.phone}</p>
                  <p><strong>Email:</strong> {selectedReferral.referred.email}</p>
                </div>
              </div>
              <div className="detail-section">
                <h4>Status</h4>
                <p><strong>Current:</strong> <span className={`status-badge ${selectedReferral.status}`}>{selectedReferral.status}</span></p>
                <p><strong>Bonus:</strong> ₦{selectedReferral.bonusAmount.toLocaleString()} ({selectedReferral.bonusStatus})</p>
                <p><strong>Created:</strong> {selectedReferral.createdAt}</p>
                {selectedReferral.flagged && (
                  <p className="flagged-warning"><Icons.Flag /> Flagged: {selectedReferral.flaggedReason}</p>
                )}
              </div>
            </div>
            <div className="modal-footer">
              {selectedReferral.flagged ? (
                <>
                  <button className="btn btn-success" onClick={() => handleApprove(selectedReferral.id)}>
                    <Icons.Check /> Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => handleReject(selectedReferral.id)}>
                    <Icons.X /> Reject
                  </button>
                </>
              ) : (
                <button className="btn btn-secondary" onClick={() => handleReject(selectedReferral.id)}>
                  <Icons.Ban /> Ban for Fraud
                </button>
              )}
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
