import React from 'react';

const Footer = () => {
  const styles = {
    footer: {
      padding: '24px',
      textAlign: 'center',
      color: '#9ca3af',
      fontSize: '0.875rem',
      borderTop: '1px solid #f3f4f6',
      marginTop: 'auto',
      backgroundColor: 'rgba(255,255,255,0.5)'
    }
  };

  return (
    <footer style={styles.footer}>
      <p>&copy; {new Date().getFullYear()} LifeSaver Network. Making a difference, one drop at a time.</p>
    </footer>
  );
};

export default Footer;