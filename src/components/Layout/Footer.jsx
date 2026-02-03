import React from 'react';

const Footer = () => {
  return (
    <footer className="site-footer" style={{ marginTop: 'auto' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 2rem' }}>
        <div className="site-info">
          <p>&copy; {new Date().getFullYear()} Coopvest Africa. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
