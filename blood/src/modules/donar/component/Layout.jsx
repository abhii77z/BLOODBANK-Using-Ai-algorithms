import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = () => {
  const styles = {
    container: { display: 'flex', minHeight: '100vh', backgroundColor: '#f9fafb', fontFamily: 'sans-serif' },
    content: { flex: 1, display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '32px', overflowY: 'auto' }
  };

  return (
    <div style={styles.container}>
      <Sidebar />
      <div style={styles.content}>
        <Navbar />
        <main style={styles.main}>
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;