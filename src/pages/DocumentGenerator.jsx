import React, { useState } from 'react';
import MainLayout from '../components/Layout/MainLayout';

const DocumentGenerator = () => {
  const [documents] = useState([
    { id: 1, name: 'Loan Agreement', icon: 'description', color: '#003366' },
    { id: 2, name: 'Membership Certificate', icon: 'verified', color: '#00b347' },
    { id: 3, name: 'Contribution Receipt', icon: 'receipt', color: '#004080' },
    { id: 4, name: 'Guarantor Form', icon: 'assignment', color: '#f57c00' },
    { id: 5, name: 'Investment Contract', icon: 'contract', color: '#1976d2' },
    { id: 6, name: 'Withdrawal Request', icon: 'upload_file', color: '#dc3545' },
  ]);

  const [recentDocuments] = useState([
    { id: 1, name: 'Loan Agreement - M001', date: '2024-01-15', status: 'generated' },
    { id: 2, name: 'Membership Certificate - M002', date: '2024-01-14', status: 'generated' },
    { id: 3, name: 'Contribution Receipt - M003', date: '2024-01-13', status: 'pending' },
  ]);

  return (
    <MainLayout>
      <div className="document-generator-wrapper">
        <div className="page-header" style={{ marginBottom: 'var(--spacing-8)' }}>
          <h1>Document Generator</h1>
          <div className="quick-actions">
            <button className="btn btn-secondary">View All Documents</button>
          </div>
        </div>

        <section className="document-types">
          <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Document Types</h2>
          <div className="document-types-grid">
            {documents.map((doc) => (
              <div key={doc.id} className="document-type-card" style={{ cursor: 'pointer' }}>
                <div className="card-header" style={{ background: doc.color, display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                  <span className="material-icons" style={{ fontSize: '1.5rem' }}>{doc.icon}</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{doc.name}</span>
                </div>
                <div className="card-body">
                  <p style={{ color: 'var(--color-neutral-600)', fontSize: 'var(--font-size-sm)', marginBottom: 'var(--spacing-4)' }}>
                    Generate and download {doc.name.toLowerCase()} documents instantly.
                  </p>
                  <button className="btn btn-primary" style={{ width: '100%' }}>
                    Generate Document
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="recent-documents" style={{ marginTop: 'var(--spacing-12)' }}>
          <h2 style={{ marginBottom: 'var(--spacing-6)' }}>Recent Documents</h2>
          <div className="card">
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Document Name</th>
                    <th>Date Generated</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentDocuments.map((doc) => (
                    <tr key={doc.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                          <span className="material-icons" style={{ color: 'var(--color-primary-500)' }}>description</span>
                          {doc.name}
                        </div>
                      </td>
                      <td>{doc.date}</td>
                      <td>
                        <span className={`status-badge status-${doc.status === 'generated' ? 'success' : 'pending'}`}>
                          {doc.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn btn-sm btn-secondary">Download</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default DocumentGenerator;
