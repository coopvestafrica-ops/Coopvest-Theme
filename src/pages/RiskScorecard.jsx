import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const RiskScorecard = () => {
  const [members] = useState([
    { id: 1, name: 'John Doe', memberId: 'M001', creditScore: 750, riskLevel: 'Low', lastAssessment: '2024-01-15' },
    { id: 2, name: 'Jane Smith', memberId: 'M002', creditScore: 620, riskLevel: 'Medium', lastAssessment: '2024-01-14' },
    { id: 3, name: 'Bob Wilson', memberId: 'M003', creditScore: 480, riskLevel: 'High', lastAssessment: '2024-01-13' },
  ]);

  const [showAssessmentModal, setShowAssessmentModal] = useState(false);

  const getRiskColor = (level) => {
    switch(level) {
      case 'Low': return 'var(--color-success-text)';
      case 'Medium': return 'var(--color-warning-text)';
      case 'High': return 'var(--color-error-text)';
      default: return 'inherit';
    }
  };

  return (
    <MainLayout>
      <div className="risk-scorecard-wrapper" style={{ padding: 'var(--spacing-8)' }}>
        <div className="page-header" style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1>Risk Scorecard Management</h1>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => setShowAssessmentModal(true)}>
              New Assessment
            </button>
            <button className="btn btn-secondary">Export Report</button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
              <span className="material-icons">check_circle</span>
            </div>
            <div className="stat-info">
              <h3>Low Risk</h3>
              <p className="stat-value">156</p>
              <p className="stat-change positive">+12 this month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-warning-bg)', color: 'var(--color-warning-text)' }}>
              <span className="material-icons">warning</span>
            </div>
            <div className="stat-info">
              <h3>Medium Risk</h3>
              <p className="stat-value">48</p>
              <p className="stat-change negative">+5 this month</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--color-error-bg)', color: 'var(--color-error-text)' }}>
              <span className="material-icons">error</span>
            </div>
            <div className="stat-info">
              <h3>High Risk</h3>
              <p className="stat-value">12</p>
              <p className="stat-change negative">-3 this month</p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h2>Member Risk Assessments</h2>
          </div>
          <div className="card-body">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Member ID</th>
                    <th>Credit Score</th>
                    <th>Risk Level</th>
                    <th>Last Assessment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id}>
                      <td>
                        <div className="member-info">
                          <div className="member-avatar" style={{ 
                            width: 36, height: 36, borderRadius: '50%', 
                            background: 'var(--color-primary-500)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem'
                          }}>
                            {member.name.charAt(0)}
                          </div>
                          <span className="member-name">{member.name}</span>
                        </div>
                      </td>
                      <td>{member.memberId}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ 
                            width: 40, height: 40, borderRadius: '50%',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 600, fontSize: '0.875rem',
                            background: member.creditScore >= 700 ? 'var(--color-success-bg)' : 
                                       member.creditScore >= 500 ? 'var(--color-warning-bg)' : 'var(--color-error-bg)',
                            color: member.creditScore >= 700 ? 'var(--color-success-text)' : 
                                   member.creditScore >= 500 ? 'var(--color-warning-text)' : 'var(--color-error-text)'
                          }}>
                            {member.creditScore}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge status-${member.riskLevel.toLowerCase()}`}>
                          {member.riskLevel}
                        </span>
                      </td>
                      <td>{member.lastAssessment}</td>
                      <td>
                        <button className="btn btn-sm btn-secondary">View Details</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Assessment Modal */}
        {showAssessmentModal && (
          <div className="modal-overlay active" onClick={() => setShowAssessmentModal(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>New Risk Assessment</h2>
                <button className="modal-close" onClick={() => setShowAssessmentModal(false)}>&times;</button>
              </div>
              <div className="modal-body">
                <div className="form-group">
                  <label>Member ID</label>
                  <input type="text" placeholder="Enter member ID" />
                </div>
                <div className="form-group">
                  <label>Monthly Income (₦)</label>
                  <input type="number" placeholder="Enter monthly income" />
                </div>
                <div className="form-group">
                  <label>Current Debt (₦)</label>
                  <input type="number" placeholder="Enter current debt" />
                </div>
                <div className="form-group">
                  <label>Employment Duration (Months)</label>
                  <input type="number" placeholder="Enter duration" />
                </div>
                <div className="form-group">
                  <label>Savings History</label>
                  <select>
                    <option>Excellent (24+ months)</option>
                    <option>Good (12-24 months)</option>
                    <option>Fair (6-12 months)</option>
                    <option>Poor (&lt; 6 months)</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowAssessmentModal(false)}>Cancel</button>
                <button className="btn btn-primary">Calculate Risk Score</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default RiskScorecard;
