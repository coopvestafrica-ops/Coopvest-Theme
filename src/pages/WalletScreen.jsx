import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const WalletScreen = () => {
  const [balance, setBalance] = useState({
    total: 250000,
    available: 220000,
    locked: 30000
  });

  const [transactions] = useState([
    { id: 1, type: 'credit', description: 'Monthly Contribution', amount: 50000, date: '2024-01-15' },
    { id: 2, type: 'debit', description: 'Withdrawal', amount: 10000, date: '2024-01-14' },
    { id: 3, type: 'credit', description: 'Interest Earned', amount: 2500, date: '2024-01-13' },
    { id: 4, type: 'debit', description: 'Loan Repayment', amount: 15000, date: '2024-01-12' },
  ]);

  return (
    <MainLayout>
      <div className="wallet-wrapper">
        <div className="balance-card">
          <h3>Total Balance</h3>
          <p className="amount">₦{balance.total.toLocaleString()}</p>
          <div style={{ display: 'flex', gap: '2rem', marginTop: '1rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Available</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>₦{balance.available.toLocaleString()}</p>
            </div>
            <div>
              <p style={{ fontSize: '0.875rem', opacity: 0.8 }}>Locked</p>
              <p style={{ fontSize: '1.25rem', fontWeight: 600 }}>₦{balance.locked.toLocaleString()}</p>
            </div>
          </div>
          <div className="balance-actions">
            <button className="btn">Fund Wallet</button>
            <button className="btn">Withdraw</button>
            <button className="btn">Transfer</button>
          </div>
        </div>

        <h2 style={{ marginBottom: '1rem' }}>Recent Transactions</h2>
        <div className="transaction-list">
          {transactions.map((tx) => (
            <div key={tx.id} className="transaction-item">
              <div className={`transaction-icon ${tx.type}`}>
                <span className="material-icons">
                  {tx.type === 'credit' ? 'arrow_downward' : 'arrow_upward'}
                </span>
              </div>
              <div className="transaction-details">
                <h4>{tx.description}</h4>
                <p className="transaction-date">{tx.date}</p>
              </div>
              <p className={`transaction-amount ${tx.type}`}>
                {tx.type === 'credit' ? '+' : '-'}₦{tx.amount.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default WalletScreen;
