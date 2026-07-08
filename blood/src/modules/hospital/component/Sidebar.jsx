import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Activity, Users, LogOut, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const styles = {
    aside: {
      width: '280px',
      minWidth: '280px', // Ensures it doesn't shrink
      backgroundColor: '#0f172a',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      boxShadow: '4px 0 24px rgba(0,0,0,0.1)',
      position: 'fixed', // Changed from relative to fixed
      left: 0,           // Anchor to left side
      top: 0,            // Anchor to top
      zIndex: 20
    },
    header: {
      padding: '24px',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      borderBottom: '1px solid #1e293b'
    },
    logoBox: {
      backgroundColor: '#2563eb',
      padding: '8px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    brand: {
      fontSize: '1.125rem',
      fontWeight: '700',
      letterSpacing: '-0.025em',
      margin: 0
    },
    subBrand: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      margin: 0
    },
    menu: {
      flex: 1,
      padding: '24px 12px',
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      overflowY: 'auto' // Allows menu to scroll if items exceed screen height
    },
    item: (isActive) => ({
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      backgroundColor: isActive ? '#2563eb' : 'transparent',
      color: isActive ? 'white' : '#94a3b8',
      boxShadow: isActive ? '0 10px 15px -3px rgba(30, 58, 138, 0.5)' : 'none',
      fontWeight: '500'
    }),
    footer: {
      padding: '16px',
      borderTop: '1px solid #1e293b',
      backgroundColor: 'rgba(15, 23, 42, 0.5)'
    },
    logoutBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      width: '100%',
      color: '#94a3b8',
      backgroundColor: 'transparent',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500'
    }
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/hospital' },
    { icon: PlusCircle, label: 'Request Blood', path: '/hospital/request' },
    { icon: Activity, label: 'Request Status', path: '/hospital/status' },
    // { icon: Users, label: 'Donor Database', path: '/hospital/donors' },
    { icon: Users, label: 'AddBlood', path: '/hospital/AddBlood' },
    // { icon: Users, label: 'HealthDetails', path: '/hospital/HealthDetails' } // Fixed path logic
  ];

  return (
    <motion.aside
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      style={styles.aside}
    >
      <div style={styles.header}>
        <div style={styles.logoBox}>
          <Building2 size={24} color="white" />
        </div>
        <div>
          <h2 style={styles.brand}>{localStorage.getItem("username") || "Hospital Portal"}</h2>
          <p style={styles.subBrand}>Hospital Portal</p>
        </div>
      </div>

      <div style={styles.menu}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <motion.div
              key={item.label}
              whileHover={{ x: 5, backgroundColor: isActive ? '#2563eb' : 'rgba(255,255,255,0.05)', color: 'white' }}
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
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(239,68,68,0.1)', color: '#f87171' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate('/')}
          style={styles.logoutBtn}
        >
          <LogOut size={20} />
          <span>Logout System</span>
        </motion.button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;