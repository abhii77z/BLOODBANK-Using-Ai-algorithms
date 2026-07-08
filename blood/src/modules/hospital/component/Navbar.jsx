import React from 'react';
import { Bell, Search, Settings, HelpCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const styles = {
    nav: {
      height: '64px',
      backgroundColor: 'white',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10,
      boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
    },
    title: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1e293b',
      margin: 0
    },
    searchBox: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      backgroundColor: '#f1f5f9',
      padding: '8px 12px',
      borderRadius: '8px',
      width: '256px',
      transition: 'all 0.2s'
    },
    input: {
      backgroundColor: 'transparent',
      border: 'none',
      outline: 'none',
      fontSize: '0.875rem',
      width: '100%',
      color: '#475569'
    },
    actions: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      borderLeft: '1px solid #e2e8f0',
      paddingLeft: '24px'
    },
    iconBtn: {
      padding: '8px',
      color: '#94a3b8',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    badge: {
      position: 'absolute',
      top: '6px',
      right: '6px',
      width: '8px',
      height: '8px',
      backgroundColor: '#ef4444',
      borderRadius: '50%'
    }
  };

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      style={styles.nav}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <h2 style={styles.title}>Dashboard Overview</h2>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <div style={styles.searchBox}>
          <Search size={16} color="#94a3b8" />
          <input 
            type="text" 
            placeholder="Search records..." 
            style={styles.input}
          />
        </div>

        <div style={styles.actions}>
          <motion.button whileHover={{ scale: 1.1, color: '#2563eb' }} style={styles.iconBtn}>
            <Bell size={20} />
            <span style={styles.badge}></span>
          </motion.button>
          <motion.button whileHover={{ scale: 1.1, color: '#2563eb' }} style={styles.iconBtn}>
            <Settings size={20} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1, color: '#2563eb' }} style={styles.iconBtn}>
            <HelpCircle size={20} />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;