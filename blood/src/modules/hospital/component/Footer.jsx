import React from 'react';

const Footer = () => {
  const styles = {
    footer: {
      padding: '16px 32px',
      textAlign: 'center',
      color: '#94a3b8',
      fontSize: '0.75rem',
      borderTop: '1px solid #e2e8f0',
      marginTop: 'auto',
      backgroundColor: 'white'
    },
    container: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    links: {
      display: 'flex',
      gap: '16px'
    },
    link: {
      color: '#94a3b8',
      textDecoration: 'none',
      cursor: 'pointer'
    }
  };

  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        <p style={{margin: 0}}>&copy; {new Date().getFullYear()} Hospital Management System v2.4.0</p>
        <div style={styles.links}>
          <a href="#" style={styles.link}>Privacy Policy</a>
          <a href="#" style={styles.link}>Terms of Service</a>
          <a href="#" style={styles.link}>Support</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;