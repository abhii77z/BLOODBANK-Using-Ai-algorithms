import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, History, Calendar, Award, LogOut, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const styles = {
    aside: {
      width: '260px',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      boxShadow: '4px 0 24px rgba(0,0,0,0.02)',
      // --- FIXED POSITIONING CHANGES ---
      position: 'fixed', // Changed from 'relative' to 'fixed'
      top: 0,            // Locks to top
      left: 0,           // Locks to left
      zIndex: 50,        // Ensures it stays above other content
      overflowY: 'auto'  // Allows sidebar itself to scroll if screen is too short
    },
    header: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #f9fafb'
    },
    logoBox: {
      backgroundColor: '#fef2f2',
      padding: '8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    brand: {
      fontSize: '1.25rem',
      fontWeight: '700',
      color: '#1f2937',
      letterSpacing: '-0.025em'
    },
    menu: {
      flex: 1,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    item: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isActive ? '#fef2f2' : 'transparent',
      color: isActive ? '#dc2626' : '#6b7280',
      boxShadow: isActive ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
      fontWeight: isActive ? '600' : '500'
    }),
    footer: {
      padding: '16px',
      borderTop: '1px solid #f9fafb',
      marginTop: 'auto' // Ensures footer stays at bottom
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      width: '100%',
      color: '#6b7280',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500'
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/donor' },
    { icon: History, label: 'Donation History', path: '/donor/history' },
    { icon: Calendar, label: 'Schedule Donation', path: '/donor/schedule' },
    { icon: Award, label: 'HealthDetails', path: '/donor/certificates' },
    { icon: Award, label: 'DirectRequests', path: '/donor/DirectRequests' },
  ];

  return (
    <motion.aside 
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={styles.aside}
    >
      <div style={styles.header}>
        <div style={styles.logoBox}>
          <Heart size={24} color="#dc2626" fill="#dc2626" />
        </div>
        <span style={styles.brand}>LifeSaver</span>
      </div>

      <div style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.label}
              whileHover={{ scale: 1.02, x: 5, backgroundColor: isActive ? '#fef2f2' : '#f9fafb' }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(item.path)}
              style={styles.item(isActive)}
            >
              <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </motion.div>
          );
        })}
      </div>

      <div style={styles.footer}>
        <motion.button
          whileHover={{ scale: 1.02, backgroundColor: '#fef2f2', color: '#dc2626' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          style={styles.logoutBtn}
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;