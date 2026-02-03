import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const ContributionTracker = () => {
  const [dateRange, setDateRange] = useState('this-month');
  const [contributions, setContributions] = useState([
    { id: 1, date: '2024-01-15', amount: 50000, type: 'Monthly Contribution', status: 'completed', reference: 'TRX-001' },
    { id: 2, date: '2024-01-10', amount: 25000, type: 'Savings', status: 'completed', reference: 'TRX-002' },
    { id: 3, date: '2024-01-05', amount: 100000, type: 'Investment', status: 'pending', reference: 'TRX-003' },
  ]);

  const totalContributions = contributions.reduce((sum, c) => sum + c.amount, 0);
  const thisMonthContributions = contributions
    .filter(c => new Date(c.date).getMonth() === new Date().getMonth())
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <MainLayout>
      <div className="contribution-tracker-wrapper">
        <div className="contribution-header">
          <h1>Contribution Tracker</h1>
          <div className="contribution-summary">
            <div className="summary-card">
              <h3>Total Contributions</h3>
              <p className="amount">₦{totalContributions.toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>This Month</h3>
              <p className="amount">₦{thisMonthContributions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="contribution-filters">
          <div className="filter-group">
            <label>Date Range:</label>
            <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="last-3-months">Last 3 Months</option>
              <option value="last-6-months">Last 6 Months</option>
              <option value="this-year">This Year</option>
            </select>
          </div>
          <button className="btn btn-secondary">Download Statement</button>
          <button className="btn btn-primary">Make New Contribution</button>
        </div>

        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount</th>
                <th>Type</th>
                <th>Status</th>
                <th>Reference</th>
              </tr>
            </thead>
            <tbody>
              {contributions.map((contribution) => (
                <tr key={contribution.id}>
                  <td>{new Date(contribution.date).toLocaleDateString()}</td>
                  <td>₦{contribution.amount.toLocaleString()}</td>
                  <td>{contribution.type}</td>
                  <td>
                    <span className={`status-badge status-${contribution.status}`}>
                      {contribution.status}
                    </span>
                  </td>
                  <td>{contribution.reference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default ContributionTracker;
