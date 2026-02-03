import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const InvestmentPool = () => {
  const [pools] = useState([
    {
      id: 1,
      title: 'Real Estate Pool A',
      targetAmount: 5000000,
      currentAmount: 3500000,
      minInvestment: 50000,
      roi: 12,
      duration: 24,
      status: 'active',
      progress: 70,
      description: 'Investment in commercial real estate properties across Lagos.'
    },
    {
      id: 2,
      title: 'Agricultural Fund',
      targetAmount: 3000000,
      currentAmount: 1800000,
      minInvestment: 25000,
      roi: 15,
      duration: 12,
      status: 'active',
      progress: 60,
      description: 'Funding for small-scale farmers and agricultural projects.'
    },
    {
      id: 3,
      title: 'Tech Startup Pool',
      targetAmount: 2000000,
      currentAmount: 2000000,
      minInvestment: 100000,
      roi: 18,
      duration: 36,
      status: 'closed',
      progress: 100,
      description: 'Investment in promising tech startups in Nigeria.'
    }
  ]);

  const totalInvested = 150000;
  const totalReturns = 22500;

  return (
    <MainLayout>
      <div className="investment-pool-wrapper">
        <div className="investment-header">
          <h1>Investment Pool</h1>
          <div className="investment-summary">
            <div className="summary-card">
              <h3>Total Invested</h3>
              <p className="amount">₦{totalInvested.toLocaleString()}</p>
            </div>
            <div className="summary-card">
              <h3>Total Returns</h3>
              <p className="amount">₦{totalReturns.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <section className="available-pools">
          <h2>Available Investment Opportunities</h2>
          <div className="pools-grid">
            {pools.map((pool) => (
              <div key={pool.id} className="pool-card">
                <div className="pool-header">
                  <h3>{pool.title}</h3>
                  <span className={`pool-status ${pool.status}`}>
                    {pool.status}
                  </span>
                </div>
                <div className="pool-body">
                  <div className="pool-stats">
                    <div className="stat">
                      <label>Target Amount</label>
                      <p>₦{pool.targetAmount.toLocaleString()}</p>
                    </div>
                    <div className="stat">
                      <label>Minimum Investment</label>
                      <p>₦{pool.minInvestment.toLocaleString()}</p>
                    </div>
                    <div className="stat">
                      <label>ROI (Annual)</label>
                      <p>{pool.roi}%</p>
                    </div>
                    <div className="stat">
                      <label>Duration</label>
                      <p>{pool.duration} months</p>
                    </div>
                  </div>
                  
                  <div className="pool-progress">
                    <div className="progress-bar">
                      <div className="progress" style={{ width: `${pool.progress}%` }}></div>
                    </div>
                    <p className="progress-text">
                      ₦{pool.currentAmount.toLocaleString()} of ₦{pool.targetAmount.toLocaleString()} raised
                    </p>
                  </div>

                  <div className="pool-description">
                    {pool.description}
                  </div>

                  {pool.status === 'active' && (
                    <button className="btn btn-primary" style={{ width: '100%' }}>
                      Invest Now
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="active-investments" style={{ marginTop: '3rem' }}>
          <h2>Your Investments</h2>
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Investment Pool</th>
                  <th>Amount Invested</th>
                  <th>Date Invested</th>
                  <th>Expected Returns</th>
                  <th>Maturity Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Real Estate Pool A</td>
                  <td>₦100,000</td>
                  <td>Jan 15, 2024</td>
                  <td>₦112,000</td>
                  <td>Jan 15, 2026</td>
                  <td><span className="status-badge status-active">Active</span></td>
                </tr>
                <tr>
                  <td>Agricultural Fund</td>
                  <td>₦50,000</td>
                  <td>Jan 10, 2024</td>
                  <td>₦57,500</td>
                  <td>Jan 10, 2025</td>
                  <td><span className="status-badge status-active">Active</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default InvestmentPool;
