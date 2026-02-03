import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const ReferralScreen = () => {
  const [referralCode] = useState('COOPVEST2024');
  const [referrals] = useState([
    { id: 1, name: 'John Doe', email: 'john@example.com', date: '2024-01-10', status: 'active', earnings: 5000 },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', date: '2024-01-08', status: 'pending', earnings: 0 },
    { id: 3, name: 'Bob Wilson', email: 'bob@example.com', date: '2024-01-05', status: 'active', earnings: 5000 },
  ]);

  const totalReferrals = referrals.length;
  const totalEarnings = referrals.reduce((sum, r) => sum + r.earnings, 0);

  const copyCode = () => {
    navigator.clipboard.writeText(referralCode);
    alert('Referral code copied!');
  };

  return (
    <MainLayout>
      <div className="referral-wrapper">
        <div className="referral-header">
          <h1>Referral Program</h1>
          <div className="referral-stats">
            <div className="stat-card">
              <h3>Total Referrals</h3>
              <p className="stat-value">{totalReferrals}</p>
            </div>
            <div className="stat-card">
              <h3>Total Earnings</h3>
              <p className="stat-value">₦{totalEarnings.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Your Referral Code</h2>
          <div className="code-display">
            <span className="referral-code">{referralCode}</span>
            <button className="btn btn-secondary" onClick={copyCode}>Copy Code</button>
            <button className="btn btn-primary">Show QR Code</button>
          </div>
          
          <div className="share-buttons">
            <button className="share-whatsapp">Share via WhatsApp</button>
            <button className="share-email">Share via Email</button>
            <button className="share-twitter">Share via Twitter</button>
          </div>
        </div>

        <div className="card" style={{ marginTop: '2rem' }}>
          <h2>Your Referrals</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Date Joined</th>
                  <th>Status</th>
                  <th>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((ref) => (
                  <tr key={ref.id}>
                    <td>
                      <div className="member-info">
                        <div className="member-avatar">
                          <span style={{ 
                            width: 40, height: 40, borderRadius: '50%', 
                            background: 'var(--color-primary-500)', color: 'white',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                          }}>
                            {ref.name.charAt(0)}
                          </span>
                        </div>
                        <div className="member-details">
                          <p className="member-name">{ref.name}</p>
                          <p className="member-email">{ref.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{ref.date}</td>
                    <td>
                      <span className={`status-badge status-${ref.status}`}>{ref.status}</span>
                    </td>
                    <td>₦{ref.earnings.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ReferralScreen;
