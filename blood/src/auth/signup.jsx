import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerDonor } from '../services/api'; 

const Signup = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    phone: '',
    bloodGroup: '',
    age: '',
    gender: '',
    address: ''
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(''); 
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (!formData.fullName || !formData.username || !formData.email || !formData.bloodGroup || !formData.phone) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.age < 18) {
      setError('You must be at least 18 years old to register as a donor.');
      return;
    }

    try {
      await registerDonor(formData);
      alert('Registration Successful! Please Login.');
      navigate('/login'); 
    } catch (err) {
      console.error(err);
      const errorMessage = err.response?.data?.error || "Registration failed. Please try again.";
      setError(errorMessage);
    }
  };

  const styles = {
    container: { 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      fontFamily: "'Inter', sans-serif",
      backgroundColor: '#0f172a',
      background: 'radial-gradient(circle at bottom left, #1e293b, #0f172a)',
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
      flex: 1.2,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 2,
      overflowY: 'auto',
      padding: '20px'
    },
    signupCard: { 
      backgroundColor: 'rgba(30, 41, 59, 0.7)', 
      backdropFilter: 'blur(12px)',
      padding: '2.5rem', 
      borderRadius: '24px', 
      border: '1px solid rgba(255, 255, 255, 0.1)',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', 
      width: '100%', 
      maxWidth: '550px',
      animation: 'fadeInUp 0.8s ease-out',
      margin: 'auto'
    },
    title: { color: '#ffffff', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem', letterSpacing: '-0.025em' },
    subtitle: { color: '#94a3b8', marginBottom: '2rem', fontSize: '1rem' },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr', 
      gap: '15px',
    },
    fullWidth: { gridColumn: '1 / span 2' },
    label: { display: 'block', fontWeight: '500', marginBottom: '6px', color: '#cbd5e1', fontSize: '0.85rem' },
    input: { 
      width: '100%', 
      padding: '12px 16px', 
      borderRadius: '10px', 
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)', 
      color: '#ffffff',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'all 0.3s ease',
      boxSizing: 'border-box'
    },
    select: {
      width: '100%',
      padding: '12px 16px',
      borderRadius: '10px',
      backgroundColor: 'rgba(15, 23, 42, 0.6)',
      border: '1px solid rgba(255, 255, 255, 0.1)',
      color: '#ffffff',
      fontSize: '0.95rem',
      cursor: 'pointer',
      outline: 'none',
      boxSizing: 'border-box'
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
      marginTop: '1rem',
      fontSize: '1.1rem',
      transition: 'all 0.3s',
      boxShadow: '0 10px 15px -3px rgba(239, 68, 68, 0.3)'
    },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'rgba(239, 68, 68, 0.1)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: '15px',
      color: '#ef4444'
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
          input:focus, select:focus { 
            border-color: #ef4444 !important; 
            background-color: rgba(15, 23, 42, 0.8) !important;
            box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
          }
          .signup-btn:hover {
            background-color: #dc2626 !important;
            transform: translateY(-2px);
          }
          .bg-glow {
            position: absolute;
            width: 400px;
            height: 400px;
            background: #ef4444;
            filter: blur(120px);
            opacity: 0.1;
            border-radius: 50%;
            z-index: 1;
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: transparent; }
          ::-webkit-scrollbar-thumb { background: #334155; borderRadius: 10px; }
        `}
      </style>

      <div className="bg-glow" style={{ top: '10%', right: '5%' }}></div>
      <div className="bg-glow" style={{ bottom: '-10%', left: '30%', background: '#3b82f6' }}></div>

      <div style={styles.infoSide}>
        <h1 style={{fontSize: '3.5rem', fontWeight: '900', lineHeight: '1.1', marginBottom: '1.5rem'}}>
          Start Your <span style={{color: '#ef4444'}}>Hero Journey.</span>
        </h1>
        <p style={{fontSize: '1.1rem', color: '#94a3b8', marginBottom: '2.5rem'}}>
          Registering takes less than a minute. Your information is secure and will only be used to connect you with those in need.
        </p>
        
        <div style={{display:'flex', alignItems:'center', marginBottom:'20px'}}>
           <div style={styles.iconBox}>✓</div>
           <p style={{fontSize:'0.95rem', color:'#cbd5e1'}}>Free health screening</p>
        </div>
        <div style={{display:'flex', alignItems:'center', marginBottom:'20px'}}>
           <div style={styles.iconBox}>✓</div>
           <p style={{fontSize:'0.95rem', color:'#cbd5e1'}}>Emergency alerts for your blood type</p>
        </div>
        <div style={{display:'flex', alignItems:'center'}}>
           <div style={styles.iconBox}>✓</div>
           <p style={{fontSize:'0.95rem', color:'#cbd5e1'}}>Track your donation history</p>
        </div>
      </div>

      <div style={styles.formSide}>
        <div style={styles.signupCard}>
          <h2 style={styles.title}>Register as Donor</h2>
          <p style={styles.subtitle}>Fill in your details to create an account</p>
          
          {error && (
            <div style={{color: '#fca5a5', backgroundColor: 'rgba(127, 29, 29, 0.4)', padding: '12px', borderRadius: '10px', marginBottom: '1.5rem', fontSize: '0.85rem', border: '1px solid rgba(239, 68, 68, 0.2)', textAlign: 'center'}}>
              {error}
            </div>
          )}

          <form onSubmit={handleSignup}>
            <div style={styles.formGrid}>
              
              <div style={styles.fullWidth}>
                <label style={styles.label}>Full Name</label>
                <input type="text" name="fullName" placeholder="John Doe" 
                  style={styles.input} onChange={handleChange} required />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Username</label>
                <input type="text" name="username" placeholder="johndoe123" 
                  style={styles.input} onChange={handleChange} required />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Email Address</label>
                <input type="email" name="email" placeholder="john@example.com" 
                  style={styles.input} onChange={handleChange} required />
              </div>

              <div>
                <label style={styles.label}>Phone Number</label>
                <input type="tel" name="phone" placeholder="9876543210" 
                  style={styles.input} onChange={handleChange} required />
              </div>

              <div>
                <label style={styles.label}>Blood Group</label>
                <select name="bloodGroup" style={styles.select} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label style={styles.label}>Age</label>
                <input type="number" name="age" placeholder="21" 
                  style={styles.input} onChange={handleChange} required />
              </div>

              <div>
                <label style={styles.label}>Gender</label>
                <select name="gender" style={styles.select} onChange={handleChange} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Address / City</label>
                <input type="text" name="address" placeholder="e.g. New York" 
                  style={styles.input} onChange={handleChange} required />
              </div>

              <div style={styles.fullWidth}>
                <label style={styles.label}>Password</label>
                <input type="password" name="password" placeholder="Min. 8 characters" 
                  style={styles.input} onChange={handleChange} required />
              </div>

            </div>

            <button type="submit" className="signup-btn" style={styles.button}>Create Account</button>
          </form>

          <p style={{marginTop: '1.5rem', color: '#94a3b8', textAlign: 'center', fontSize: '0.9rem'}}>
            Already have an account? <Link to="/login" style={{color: '#ef4444', fontWeight: '600', textDecoration: 'none'}}>Login here</Link>
          </p>
          
          <div style={{textAlign: 'center', marginTop: '10px'}}>
            <Link to="/" style={{color: '#64748b', fontSize: '0.8rem', textDecoration: 'none'}}>← Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;