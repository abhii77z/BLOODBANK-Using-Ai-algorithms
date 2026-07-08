import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  const styles = {
    footer: {
      backgroundColor: '#fff',
      borderTop: '1px solid #e2e8f0',
      padding: '16px 24px'
    },
    container: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      fontSize: '0.9rem',
      color: '#64748b'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    divider: {
      color: '#cbd5e1'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
      color: '#64748b'
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <div style={styles.leftSection}>
          <span>&copy; {new Date().getFullYear()} BloodBank Management System.</span>
          <span style={styles.divider}>|</span>
          <span>Confidential & Secure</span>
        </div>
        <div style={styles.rightSection}>
          <span>Made with</span>
          <Heart style={{ width: '16px', height: '16px', color: '#dc2626', fill: '#dc2626' }} />
          <span>for saving lives</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
