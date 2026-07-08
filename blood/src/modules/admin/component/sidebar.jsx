import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom'; // <--- Import hooks
import { Home, Users, Droplet, FileText, Settings, LogOut, Activity } from 'lucide-react';

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Define paths for your menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home, path: '/admin' },
    { id: 'users', label: 'Manage Users', icon: Users, path: '/admin/users' },
    { id: 'inventory', label: 'Blood Inventory', icon: Droplet, path: '/admin/inventory' }, // Placeholder if you haven't made this yet
    { id: 'activity', label: 'Activity Log', icon: Activity, path: '/admin/activity' },
    { id: 'settings', label: 'Settings', icon: Settings, path: '/admin/settings' },
  ];

  const styles = {
    aside: {
      width: '250px',
      background: 'linear-gradient(180deg, #1e293b 0%, #334155 100%)',
      color: '#fff',
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      boxShadow: '4px 0 10px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      height: '100vh',
      overflowY: 'auto'
    },
    header: {
      padding: '20px',
      borderBottom: '1px solid #475569'
    },
    logoContainer: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    logoIcon: {
      width: '40px',
      height: '40px',
      backgroundColor: '#dc2626',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    logoText: {
      fontWeight: 'bold',
      fontSize: '1.25rem',
      margin: 0
    },
    logoSubtext: {
      fontSize: '0.75rem',
      color: '#94a3b8',
      margin: 0
    },
    nav: {
      flex: 1,
      padding: '20px 12px'
    },
    menuButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      marginBottom: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.95rem',
      fontWeight: '500'
    },
    activeButton: {
      backgroundColor: '#dc2626',
      color: '#fff',
      boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
    },
    inactiveButton: {
      backgroundColor: 'transparent',
      color: '#cbd5e1'
    },
    footer: {
      padding: '16px',
      borderTop: '1px solid #475569'
    },
    logoutButton: {
      width: '100%',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontSize: '0.95rem',
      fontWeight: '500',
      backgroundColor: 'transparent',
      color: '#cbd5e1'
    }
  };

  return (
    <aside style={styles.aside}>
      <div style={styles.header}>
        <div style={styles.logoContainer}>
          <div style={styles.logoIcon}>
            <Droplet style={{ width: '24px', height: '24px', fill: '#fff' }} />
          </div>
          <div>
            <h1 style={styles.logoText}>BloodBank</h1>
            <p style={styles.logoSubtext}>Admin Panel</p>
          </div>
        </div>
      </div>
      
      <nav style={styles.nav}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          // Check if the current URL matches the menu item path
          // For the main dashboard ('/admin'), we want exact match, otherwise includes
          const isActive = item.path === '/admin' 
            ? location.pathname === '/admin'
            : location.pathname.includes(item.path);
          
          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)} // Use navigate instead of onTabChange
              style={{
                ...styles.menuButton,
                ...(isActive ? styles.activeButton : styles.inactiveButton)
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'rgba(71, 85, 105, 0.5)';
                  e.currentTarget.style.color = '#fff';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#cbd5e1';
                }
              }}
            >
              <Icon style={{ width: '20px', height: '20px' }} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div style={styles.footer}>
        <button
          style={styles.logoutButton}
          onClick={() => navigate('/login')} // Handle logout navigation
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'rgba(220, 38, 38, 0.2)';
            e.currentTarget.style.color = '#f87171';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#cbd5e1';
          }}
        >
          <LogOut style={{ width: '20px', height: '20px' }} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;