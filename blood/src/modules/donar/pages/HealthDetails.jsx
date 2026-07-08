import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Apple, Activity, AlertTriangle, Heart } from 'lucide-react';
import { getDonorProfile } from '../../../services/api';

const HealthDetails = () => {
  const [profile, setProfile] = useState(null);
  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    getDonorProfile(loginId).then(res => setProfile(res.data));
  }, [loginId]);

  // THE ALGORITHM (Rule-Based)
  const getHealthData = (bg) => {
    const suggestions = {
      "O-": {
        food: "Iron-rich foods like spinach, red meat, and beans to maintain high hemoglobin.",
        health: "Universal Donor: Stay hydrated 48h before donation for smooth flow.",
        risk: "Check for iron deficiency regularly due to high demand for your type.",
        color: "#dc2626"
      },
      "A+": {
        food: "Focus on a plant-based diet, berries, and citrus fruits for iron absorption.",
        health: "Common Need: Maintain a consistent sleep cycle to stay eligible.",
        risk: "Sensitive to high-cortisol stress; practice yoga or meditation.",
        color: "#2563eb"
      },
      "B+": {
        food: "Include dairy products, eggs, and green vegetables. Avoid corn and peanuts.",
        health: "Cardio Health: Maintain stamina with moderate aerobic exercise.",
        risk: "Monitor blood sugar levels closely between donations.",
        color: "#059669"
      },
      "AB+": {
        food: "Seafood, tofu, and green veggies. You are the Universal Recipient.",
        health: "Platelet Power: Focus on platelet donation; your plasma is vital.",
        risk: "Potential for higher cholesterol; monitor healthy fats.",
        color: "#7c3aed"
      }
    };
    const data = suggestions[bg] || { 
        food: "Balanced diet with high iron.", 
        health: "Regular checkups and hydration.", 
        risk: "Standard health monitoring.", 
        color: "#dc2626" 
    };

    // Transform into array for the grid
    return [
      { id: 1, title: 'Diet Suggestion', desc: data.food, icon: <Apple />, type: 'Nutrition' },
      { id: 2, title: 'Health Guidance', desc: data.health, icon: <Activity />, type: 'Wellness' },
      { id: 3, title: 'Risk Prevention', desc: data.risk, icon: <AlertTriangle />, type: 'Safety' },
    ];
  };

  const styles = {
    pageWrapper: {
      padding: '40px 32px',
      marginLeft: '260px', 
      width: 'calc(100% - 260px)',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', sans-serif"
    },
    container: { maxWidth: '1200px', margin: '0 auto' },
    header: { marginBottom: '40px' },
    h1: { fontSize: '2.2rem', fontWeight: '800', color: '#111827', marginBottom: '8px' },
    p: { color: '#6b7280', fontSize: '1.1rem' },
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', 
      gap: '24px' 
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      border: '1px solid #f3f4f6',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
      overflow: 'hidden'
    },
    cardHeader: (color) => ({
      padding: '24px',
      background: `linear-gradient(135deg, ${color}15 0%, ${color}05 100%)`,
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      borderBottom: `1px solid ${color}10`
    }),
    iconBox: (color) => ({
      padding: '10px',
      borderRadius: '12px',
      backgroundColor: 'white',
      color: color,
      boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
      display: 'flex'
    }),
    body: { padding: '24px' },
    badge: {
      display: 'inline-block',
      padding: '4px 12px',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      backgroundColor: '#f3f4f6',
      color: '#374151',
      marginBottom: '12px',
      textTransform: 'uppercase'
    },
    bloodSummary: {
      marginTop: '40px',
      padding: '32px',
      borderRadius: '24px',
      background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  };

  if (!profile) return <div style={styles.pageWrapper}>Loading Health Data...</div>;

  const insights = getHealthData(profile.bloodGroup);
  const themeColor = insights[0].color || "#dc2626";

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.h1}>Health & Details</h1>
          <p style={styles.p}>Personalized algorithm-based suggestions for <b>{profile.fullName}</b>.</p>
        </div>

        {/* Insights Grid */}
        <div style={styles.grid}>
          {insights.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -5 }}
              style={styles.card}
            >
              <div style={styles.cardHeader(themeColor)}>
                <div style={styles.iconBox(themeColor)}>
                  {React.cloneElement(item.icon, { size: 24 })}
                </div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: '#1f2937' }}>
                  {item.title}
                </h3>
              </div>

              <div style={styles.body}>
                <span style={styles.badge}>{item.type}</span>
                <p style={{ color: '#4b5563', lineHeight: '1.6', fontSize: '1rem', margin: 0 }}>
                  {item.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Blood Compatibility Summary */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={styles.bloodSummary}
        >
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: '800', margin: '0 0 8px 0' }}>
              Blood Group: <span style={{ color: '#f87171' }}>{profile.bloodGroup}</span>
            </h2>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.1rem' }}>
              Your blood type is <b>{profile.bloodGroup === 'O-' ? 'a Universal Match' : 'compatible with specific recipients'}</b>.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <Heart size={48} color="#ef4444" fill="#ef4444" />
          </div>
        </motion.div>

      </div>
    </div>
  );
};

export default HealthDetails;