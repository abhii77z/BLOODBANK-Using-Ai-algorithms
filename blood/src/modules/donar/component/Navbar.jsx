import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  
  const [user, setUser] = useState({
    name: '',
    role: '',
    initials: ''
  });

  const loadUserData = () => {
    const storedName = localStorage.getItem("username");
    const storedRole = localStorage.getItem("role");

    if (storedName) {
      setUser({
        name: storedName,
        role: storedRole || 'Donor',
        initials: storedName.substring(0, 2).toUpperCase()
      });
    } else {
       setUser({ name: 'Guest', role: 'Visitor', initials: 'G' });
    }
  };

  useEffect(() => {
    loadUserData();

    // 🔥 Listen for changes to localStorage (from Profile edit)
    window.addEventListener("storage", loadUserData);
    return () => window.removeEventListener("storage", loadUserData);
  }, []);

  // ... (all styles and JSX remain exactly the same as your provided Navbar)
  const styles = {
    nav: {
      height: '64px',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 32px',
      position: 'sticky',
      top: 0,
      zIndex: 10
    },
    profile: {
       display: 'flex',
       alignItems: 'center',
       gap: '12px',
       paddingLeft: '24px',
       borderLeft: '1px solid #f3f4f6',
       cursor: 'pointer'
    },
    userInfo: { textAlign: 'right' },
    userName: { fontSize: '0.875rem', fontWeight: '600', color: '#374151', margin: 0, textTransform: 'capitalize' },
    userRole: { fontSize: '0.75rem', color: '#9ca3af', margin: 0 },
    avatar: { width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #ef4444, #db2777)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
  };

  return (
    <motion.nav initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} style={styles.nav}>
      <div style={{backgroundColor: '#f9fafb', padding: '8px 16px', borderRadius: '9999px', display: 'flex', alignItems: 'center', gap: '10px', width: '380px'}}>
        <Search size={16} color="#9ca3af" />
        <input type="text" placeholder="Search campaigns..." style={{border: 'none', background: 'transparent', outline: 'none', width: '100%', color: '#4b5563'}} />
      </div>

      <div style={{display: 'flex', alignItems: 'center', gap: '24px'}}>
        <motion.button whileHover={{ scale: 1.1 }} style={{background: 'none', border: 'none', cursor: 'pointer', position: 'relative'}}>
          <Bell size={20} color="#9ca3af" />
          <span style={{position: 'absolute', top: 0, right: 0, width: '8px', height: '8px', backgroundColor: '#ef4444', borderRadius: '50%'}}></span>
        </motion.button>
        
        <div style={styles.profile} onClick={() => navigate('/donor/profile')}>
          <div style={styles.userInfo}>
            <p style={styles.userName}>{user.name}</p> 
            <p style={styles.userRole}>{user.role}</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} style={styles.avatar}>
            {user.initials} 
          </motion.div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;