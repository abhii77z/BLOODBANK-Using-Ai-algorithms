import React from 'react';
import { Bell, Search, User } from 'lucide-react';

const Navbar = () => {
  const styles = {
    nav: {
      height: '64px',
      backgroundColor: '#fff',
      borderBottom: '1px solid #e2e8f0',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
    },
    searchContainer: {
      position: 'relative',
      flex: 1,
      maxWidth: '500px'
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#94a3b8'
    },
    searchInput: {
      width: '100%',
      paddingLeft: '40px',
      paddingRight: '16px',
      paddingTop: '8px',
      paddingBottom: '8px',
      border: '1px solid #cbd5e1',
      borderRadius: '8px',
      fontSize: '0.9rem',
      outline: 'none'
    },
    rightSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px'
    },
    notificationButton: {
      position: 'relative',
      padding: '8px',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'background-color 0.2s'
    },
    badge: {
      position: 'absolute',
      top: '-4px',
      right: '-4px',
      width: '20px',
      height: '20px',
      backgroundColor: '#dc2626',
      color: '#fff',
      fontSize: '0.7rem',
      fontWeight: 'bold',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    userSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      paddingLeft: '16px',
      borderLeft: '1px solid #e2e8f0'
    },
    userInfo: {
      textAlign: 'right'
    },
    userName: {
      fontSize: '0.9rem',
      fontWeight: '600',
      color: '#1e293b',
      margin: 0
    },
    userRole: {
      fontSize: '0.75rem',
      color: '#64748b',
      margin: 0
    },
    avatar: {
      width: '40px',
      height: '40px',
      background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.searchContainer}>
        <Search style={{ ...styles.searchIcon, width: '20px', height: '20px' }} />
        <input
          type="text"
          placeholder="Search patients, donors, inventory..."
          style={styles.searchInput}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#dc2626';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(220, 38, 38, 0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#cbd5e1';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>
      
      <div style={styles.rightSection}>
        <button
          style={styles.notificationButton}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f5f9'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <Bell style={{ width: '20px', height: '20px', color: '#475569' }} />
          <span style={styles.badge}>3</span>
        </button>
        
        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>Administrator</p>
            <p style={styles.userRole}>Super Admin</p>
          </div>
          <div style={styles.avatar}>
            <User style={{ width: '20px', height: '20px', color: '#fff' }} />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
