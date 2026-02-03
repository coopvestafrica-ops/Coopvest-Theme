import React from 'react';
import MainLayout from '../components/Layout/MainLayout';

const AdminDashboard = () => {
  const stats = {
    totalMembers: 1250,
    activeLoans: 342,
    totalContributions: 15000000,
    pendingApprovals: 15
  };

  const recentActivity = [
    { id: 1, action: 'New member registration', user: 'John Doe', time: '2 mins ago', icon: 'person_add' },
    { id: 2, action: 'Loan application submitted', user: 'Jane Smith', time: '15 mins ago', icon: 'description' },
    { id: 3, action: 'Contribution received', user: 'Bob Wilson', time: '1 hour ago', icon: 'payments' },
    { id: 4, action: 'Investment pool updated', user: 'Admin', time: '2 hours ago', icon: 'trending_up' },
    { id: 5, action: 'Document generated', user: 'Sarah Adams', time: '3 hours ago', icon: 'download' },
  ];

  const pendingActions = [
    { id: 1, title: 'Loan Approvals', count: 8, icon: 'fact_check' },
    { id: 2, title: 'Document Signatures', count: 5, icon: 'draw' },
    { id: 3, title: 'Member Verifications', count: 12, icon: 'verified' },
    { id: 4, title: 'Support Tickets', count: 3, icon: 'support_agent' },
  ];

  return (
    <MainLayout>
      <div className="admin-dashboard-wrapper">
        <div className="page-header">
          <h1>Admin Dashboard</h1>
          <div className="quick-actions">
            <button className="btn btn-secondary">Generate Report</button>
            <button className="btn btn-primary">System Settings</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-icons">people</span>
            </div>
            <div className="stat-info">
              <h3>Total Members</h3>
              <p className="stat-value">{stats.totalMembers.toLocaleString()}</p>
              <p className="stat-change positive">+52 this month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-icons">account_balance</span>
            </div>
            <div className="stat-info">
              <h3>Active Loans</h3>
              <p className="stat-value">{stats.activeLoans}</p>
              <p className="stat-change positive">+18 this week</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <span className="material-icons">savings</span>
            </div>
            <div className="stat-info">
              <h3>Total Contributions</h3>
              <p className="stat-value">₦{(stats.totalContributions / 1000000).toFixed(1)}M</p>
              <p className="stat-change positive">+12.5% vs last month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>
              <span className="material-icons">pending_actions</span>
            </div>
            <div className="stat-info">
              <h3>Pending Approvals</h3>
              <p className="stat-value">{stats.pendingApprovals}</p>
              <p className="stat-change">Requires attention</p>
            </div>
          </div>
        </div>

        <div className="analytics-grid">
          <div className="activity-section">
            <h2>Recent Activity</h2>
            {recentActivity.map((activity) => (
              <div key={activity.id} className="activity-item">
                <div className="activity-icon">
                  <span className="material-icons">{activity.icon}</span>
                </div>
                <div className="activity-details" style={{ flex: 1 }}>
                  <p>{activity.action}</p>
                  <p className="activity-time">{activity.user} - {activity.time}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="pending-actions-section">
            <h2>Pending Actions</h2>
            <div className="actions-grid">
              {pendingActions.map((action) => (
                <div key={action.id} className="action-card">
                  <span className="material-icons" style={{ fontSize: '2rem', color: 'var(--color-primary-500)' }}>
                    {action.icon}
                  </span>
                  <h3>{action.title}</h3>
                  <p className="count">{action.count}</p>
                  <button className="btn btn-sm btn-secondary" style={{ marginTop: 'var(--spacing-2)' }}>
                    View All
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 'var(--spacing-8)' }}>
          <div className="card-header">
            <h3>Quick Links</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', gap: 'var(--spacing-4)', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary">Member Management</button>
            <button className="btn btn-secondary">Loan Management</button>
            <button className="btn btn-secondary">Contribution Reports</button>
            <button className="btn btn-secondary">System Analytics</button>
            <button className="btn btn-secondary">User Permissions</button>
            <button className="btn btn-secondary">Audit Logs</button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default AdminDashboard;
