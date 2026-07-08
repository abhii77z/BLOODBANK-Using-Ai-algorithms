import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout2 = () => {
  const styles = {
    container: { 
      display: 'flex', 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      fontFamily: "'Inter', sans-serif" 
    },
    content: { 
      flex: 1, 
      display: 'flex', 
      flexDirection: 'column',
      // 🔥 CRITICAL FIX: Add margin to the left so content starts AFTER the sidebar
      marginLeft: '280px', 
      width: 'calc(100% - 280px)', // Ensure width remains correct
      transition: 'margin-left 0.3s ease'
    },
    main: { 
      flex: 1, 
      padding: '32px', 
      overflowY: 'auto' 
    }
  };

  return (
    <div style={styles.container}>
      {/* This is now fixed/static on the left */}
      <Sidebar />
      
      <div style={styles.content}>
        <Navbar />
        <main style={styles.main}>
          {/* This renders the specific dashboard pages */}
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout2;