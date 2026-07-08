import React from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  const styles = {
    container: {
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#0f172a',
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
      color: '#f8fafc',
      margin: 0,
      padding: 0,
      width: '100%',
      minHeight: '100vh',
      overflowX: 'hidden',
    },
    navbar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '1.2rem 8%',
      backgroundColor: 'rgba(15, 23, 42, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
    },
    logo: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    navButtons: {
      display: 'flex',
      gap: '15px',
    },
    btnLogin: {
      padding: '0.6rem 1.8rem',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      backgroundColor: 'transparent',
      color: '#ffffff',
      cursor: 'pointer',
      borderRadius: '12px',
      fontWeight: '600',
      transition: 'all 0.3s',
    },
    btnSignup: {
      padding: '0.6rem 1.8rem',
      border: 'none',
      backgroundColor: '#ef4444',
      color: 'white',
      cursor: 'pointer',
      borderRadius: '12px',
      fontWeight: '600',
      transition: 'all 0.3s',
      boxShadow: '0 4px 14px 0 rgba(239, 68, 68, 0.39)',
    },
    heroSection: {
      height: '90vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '0 20px',
      position: 'relative',
    },
    heroTitle: {
      fontSize: '4.5rem',
      fontWeight: '900',
      lineHeight: '1.1',
      marginBottom: '1.5rem',
      animation: 'fadeInUp 0.8s ease-out',
    },
    heroText: {
      fontSize: '1.25rem',
      color: '#94a3b8',
      maxWidth: '700px',
      margin: '0 auto 2.5rem auto',
      animation: 'fadeInUp 1s ease-out',
    },
    ctaButton: {
      padding: '1rem 2.5rem',
      fontSize: '1.1rem',
      backgroundColor: '#ef4444',
      color: 'white',
      border: 'none',
      borderRadius: '14px',
      fontWeight: '700',
      cursor: 'pointer',
      transition: 'all 0.3s',
      boxShadow: '0 10px 20px -5px rgba(239, 68, 68, 0.4)',
    },
    featuresSection: {
      padding: '100px 8%',
      position: 'relative',
    },
    featuresTitle: {
      textAlign: 'center',
      fontSize: '2.5rem',
      fontWeight: '800',
      marginBottom: '4rem',
      color: '#fff',
    },
    featuresGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2.5rem',
      maxWidth: '1200px',
      margin: '0 auto',
    },
    featureCard: {
      backgroundColor: 'rgba(30, 41, 59, 0.5)',
      backdropFilter: 'blur(10px)',
      padding: '2.5rem',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      textAlign: 'left',
      transition: 'all 0.3s',
      cursor: 'default',
    },
    cardIcon: {
      fontSize: '2rem',
      marginBottom: '1.5rem',
      display: 'block',
    },
    cardTitle: {
      color: '#ef4444',
      fontSize: '1.4rem',
      fontWeight: '700',
      marginBottom: '1rem',
    },
    cardText: {
      color: '#94a3b8',
      lineHeight: '1.6',
    },
    footer: {
      borderTop: '1px solid rgba(255, 255, 255, 0.1)',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      color: '#64748b',
      textAlign: 'center',
      padding: '2rem',
      fontSize: '0.9rem',
    },
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0px); }
          }
          .feature-card:hover {
            transform: translateY(-10px);
            background-color: rgba(30, 41, 59, 0.8);
            border-color: rgba(239, 68, 68, 0.4);
          }
          .bg-glow {
            position: absolute;
            width: 500px;
            height: 500px;
            filter: blur(120px);
            opacity: 0.15;
            border-radius: 50%;
            z-index: 1;
          }
          .btn-hover:hover {
            transform: translateY(-2px);
            opacity: 0.9;
          }
        `}
      </style>

      {/* Decorative Background Elements */}
      <div className="bg-glow" style={{ background: '#ef4444', top: '-10%', left: '-10%' }}></div>
      <div className="bg-glow" style={{ background: '#3b82f6', bottom: '10%', right: '-5%' }}></div>

      <nav style={styles.navbar}>
        <div style={styles.logo}>
           <span style={{fontSize: '2rem', animation: 'float 3s infinite ease-in-out'}}>🩸</span>
           <span>BloodLink</span>
        </div>
        <div style={styles.navButtons}>
          <button 
            className="btn-hover"
            style={styles.btnLogin} 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
          <button 
            className="btn-hover"
            style={styles.btnSignup} 
            onClick={() => navigate('/signup')}
          >
            Join Now
          </button>
        </div>
      </nav>

      <header style={styles.heroSection}>
        <div style={{zIndex: 2}}>
          <h1 style={styles.heroTitle}>
            Every Drop <br />
            <span style={{color: '#ef4444'}}>Saves Lives.</span>
          </h1>
          <p style={styles.heroText}>
            Connect with local hospitals and urgent needs. Our AI-driven platform bridges the gap between donors and patients in real-time.
          </p>
          <div>
            <button className="btn-hover" style={styles.ctaButton} onClick={() => navigate('/signup')}>
              Become a Life Saver
            </button>
          </div>
        </div>
      </header>

      <section style={styles.featuresSection}>
        <h2 style={styles.featuresTitle}>Our Ecosystem</h2>
        <div style={styles.featuresGrid}>
          <div className="feature-card" style={styles.featureCard}>
            <span style={styles.cardIcon}>🧑‍🦰</span>
            <h3 style={styles.cardTitle}>For Donors</h3>
            <p style={styles.cardText}>Personalized health insights, nutrition guides based on blood type, and easy scheduling.</p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <span style={styles.cardIcon}>🏥</span>
            <h3 style={styles.cardTitle}>For Hospitals</h3>
            <p style={styles.cardText}>Real-time inventory management and instant connection to local compatible donors.</p>
          </div>
          <div className="feature-card" style={styles.featureCard}>
            <span style={styles.cardIcon}>👨‍💼</span>
            <h3 style={styles.cardTitle}>Admin Panel</h3>
            <p style={styles.cardText}>Advanced analytics, supply-demand predictions, and global system oversight.</p>
          </div>
        </div>
      </section>

      <footer style={styles.footer}>
        <p>© 2026 BloodLink AI Management. Empowering communities, saving lives.</p>
      </footer>
    </div>
  );
};

export default Home;