import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getDonorProfile } from '../services/api'; 

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await loginUser(formData);
      const data = response.data;
      const loginId = data.login_id;

      localStorage.setItem("login_id", loginId);
      localStorage.setItem("role", data.usertype);
      localStorage.setItem("userid", data.userid);
      localStorage.setItem("username", data.username);

      if (data.hospitalId) {
        localStorage.setItem("hospitalId", data.hospitalId);
      }

      try {
        const profileRes = await getDonorProfile(loginId);
        localStorage.setItem("fullName", profileRes.data.fullName);
      } catch (profileErr) {
        localStorage.setItem("fullName", data.username);
      }

      window.dispatchEvent(new Event("storage"));
      
      if (data.usertype === "admin") navigate("/admin");
      else if (data.usertype === "hospital") navigate("/hospital");
      else navigate("/donor");

    } catch (err) {
      setError(err.response?.data?.error || "Invalid credentials.");
    }
  };

  const styles = {
    container: { 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#0f172a',
      background: 'radial-gradient(circle at top right, #1e293b, #0f172a)',
      overflow: 'hidden',
      color: '#f8fafc'
    },
    infoSide: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 8%',
      zIndex: 2,
      display: window.innerWidth < 900 ? 'none' : 'flex' 
    },
    formSide: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2
    },
    loginCard: { 
      backgroundColor: 'rgba(30, 41, 59, 0.7)', 
      backdropFilter: 'blur(12px)',
      padding: '3.5rem', 
      borderRadius: '24px', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
      width: '100%', 
      maxWidth: '440px',
      animation: 'fadeInUp 0.8s ease-out'
    },
    title: { color: '#ffffff', fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.025em' },
    subtitle: { color: '#94a3b8', marginBottom: '2.5rem', fontSize: '1.1rem' },
    formGroup: { marginBottom: '1.5rem', textAlign: 'left' },
    label: { display: 'block', fontWeight: '500', marginBottom: '8px', color: '#cbd5e1', fontSize: '0.9rem' },
    input: { 
      width: '100%', 
      padding: '14px 16px', 
      borderRadius: '12px', 
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      color: '#ffffff',
      fontSize: '1rem',
      outline: 'none',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    button: { 
      width: '100%', 
      padding: '14px', 
      backgroundColor: '#ef4444', 
      color: 'white', 
      border: 'none', 
      borderRadius: '12px', 
      fontWeight: '700', 
      cursor: 'pointer', 
      marginTop: '1.5rem',
      fontSize: '1.1rem',
      transition: 'all 0.3s',
      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
    },
    benefitItem: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '30px',
      animation: 'slideInLeft 0.5s ease-out forwards'
    },
    iconBox: {
      width: '56px',
      height: '56px',
      borderRadius: '16px',
      background: 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '20px',
      fontSize: '1.5rem',
      boxShadow: '0 8px 16px rgba(239, 68, 68, 0.2)'
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(-30px); }
            to { opacity: 1; transform: translateX(0); }
          }
          @keyframes float {
            0% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
            100% { transform: translateY(0px); }
          }
          input:focus { 
            border-color: #ef4444 !important; 
            background-color: rgba(15, 23, 42, 0.8) !important;
            box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.1);
          }
          .login-btn:hover {
            background-color: #dc2626 !important;
            transform: translateY(-2px);
            box-shadow: 0 15px 20px -5px rgba(239, 68, 68, 0.4);
          }
          .bg-glow {
            position: absolute;
            width: 400px;
            height: 400px;
            background: #ef4444;
            filter: blur(120px);
            opacity: 0.15;
            border-radius: 50%;
            z-index: 1;
          }
        `}
      </style>

      {/* Decorative Glows */}
      <div className="bg-glow" style={{ top: '-10%', left: '-5%' }}></div>
      <div className="bg-glow" style={{ bottom: '10%', right: '10%', background: '#3b82f6' }}></div>

      {/* Left Panel: Narrative Side */}
      <div style={styles.infoSide}>
        <h1 style={{fontSize: '4rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem'}}>
          Every Drop <span style={{color: '#ef4444'}}>Saves Lives.</span>
        </h1>
        <p style={{fontSize: '1.25rem', color: '#94a3b8', marginBottom: '3.5rem', maxWidth: '500px'}}>
          Join thousands of donors who are making a real difference in people's lives every day.
        </p>
        
        <div style={styles.benefitItem}>
          <div style={{...styles.iconBox, animation: 'float 3s infinite ease-in-out'}}>🩸</div>
          <div>
            <h4 style={{fontSize: '1.2rem', marginBottom: '4px'}}>Direct Impact</h4>
            <p style={{color: '#94a3b8', fontSize: '0.95rem'}}>Your single donation can save up to 3 lives.</p>
          </div>
        </div>

        <div style={styles.benefitItem}>
          <div style={{...styles.iconBox, background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'}}>🏥</div>
          <div>
            <h4 style={{fontSize: '1.2rem', marginBottom: '4px'}}>Hospital Network</h4>
            <p style={{color: '#94a3b8', fontSize: '0.95rem'}}>Real-time connection with emergency blood needs.</p>
          </div>
        </div>

        <div style={styles.benefitItem}>
          <div style={styles.iconBox}>⌛</div>
          <div>
            <h4 style={{fontSize: '1.2rem', marginBottom: '4px'}}>Quick Appointment</h4>
            <p style={{color: '#94a3b8', fontSize: '0.95rem'}}>Process takes only 15 minutes of your time.</p>
          </div>
        </div>
      </div>

      {/* Right Panel: The Form */}
      <div style={styles.formSide}>
        <div style={styles.loginCard}>
          <h2 style={styles.title}>Welcome Back</h2>
          <p style={styles.subtitle}>Enter your credentials to continue</p>
          
          {error && (
            <div style={{color: '#fca5a5', backgroundColor: 'rgba(127, 29, 29, 0.4)', padding: '14px', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Username</label>
              <input type="text" name="username" style={styles.input} onChange={handleChange} placeholder="Enter username" required />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Password</label>
              <input type="password" name="password" style={styles.input} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="login-btn" style={styles.button}>Sign In</button>
          </form>

          <p style={{marginTop: '2.5rem', color: '#94a3b8', textAlign: 'center', fontSize: '0.95rem'}}>
            New donor? <Link to="/signup" style={{color: '#ef4444', fontWeight: '600', textDecoration: 'none'}}>Join the community</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;