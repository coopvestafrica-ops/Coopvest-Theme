import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const LoanApplication = () => {
  const [formData, setFormData] = useState({
    memberId: '',
    loanType: '',
    amount: '',
    purpose: '',
    duration: '',
    guarantor1: '',
    guarantor2: '',
    collateral: ''
  });

  const loanTypes = [
    { value: 'personal', label: 'Personal Loan' },
    { value: 'business', label: 'Business Loan' },
    { value: 'emergency', label: 'Emergency Loan' },
    { value: 'asset', label: 'Asset Financing' },
    { value: 'housing', label: 'Housing Loan' }
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Loan Application:', formData);
  };

  return (
    <MainLayout>
      <div className="loan-application-wrapper">
        <h1 style={{ marginBottom: '2rem' }}>Loan Application</h1>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <h2>Member Information</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Member ID</label>
                <input
                  type="text"
                  name="memberId"
                  value={formData.memberId}
                  onChange={handleChange}
                  placeholder="Enter member ID"
                />
              </div>
              <div className="form-group">
                <label>Member Name</label>
                <input type="text" placeholder="Auto-filled from member ID" readOnly />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Loan Details</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>Loan Type</label>
                <select name="loanType" value={formData.loanType} onChange={handleChange}>
                  <option value="">Select loan type</option>
                  {loanTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Loan Amount (₦)</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  placeholder="Enter amount"
                />
              </div>
              <div className="form-group">
                <label>Duration (Months)</label>
                <select name="duration" value={formData.duration} onChange={handleChange}>
                  <option value="">Select duration</option>
                  <option value="3">3 months</option>
                  <option value="6">6 months</option>
                  <option value="9">9 months</option>
                  <option value="12">12 months</option>
                  <option value="18">18 months</option>
                  <option value="24">24 months</option>
                </select>
              </div>
              <div className="form-group">
                <label>Purpose of Loan</label>
                <textarea
                  name="purpose"
                  value={formData.purpose}
                  onChange={handleChange}
                  placeholder="Describe the purpose"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Guarantors</h2>
            <div className="form-grid">
              <div className="form-group">
                <label>First Guarantor (Member ID)</label>
                <input
                  type="text"
                  name="guarantor1"
                  value={formData.guarantor1}
                  onChange={handleChange}
                  placeholder="Enter guarantor ID"
                />
              </div>
              <div className="form-group">
                <label>Second Guarantor (Member ID)</label>
                <input
                  type="text"
                  name="guarantor2"
                  value={formData.guarantor2}
                  onChange={handleChange}
                  placeholder="Enter guarantor ID"
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h2>Collateral (Optional)</h2>
            <div className="form-group">
              <label>Collateral Description</label>
              <textarea
                name="collateral"
                value={formData.collateral}
                onChange={handleChange}
                placeholder="Enter details of collateral if any"
                rows={3}
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-secondary">Save Draft</button>
            <button type="submit" className="btn btn-primary">Submit Application</button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default LoanApplication;
