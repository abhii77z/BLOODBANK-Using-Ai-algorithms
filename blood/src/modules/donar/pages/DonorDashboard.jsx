import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom'; 
import { Droplets, Activity, Clock, ArrowRight, Bell, AlertTriangle } from 'lucide-react';
// ✅ Import the new getDonorStats function
import { getNotifications, getDonorStats } from '../../../services/api';

// Reusable Stat Card Component (No changes needed here)
const StatCard = ({ icon: Icon, label, value, bgColor, delay }) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    style={{
      backgroundColor: '#fff',
      padding: '24px',
      borderRadius: '16px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
      border: '1px solid #f3f4f6',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      cursor: 'default'
    }}
    whileHover={{ y: -5, boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
  >
    <div style={{
      width: '48px',
      height: '48px',
      borderRadius: '12px',
      backgroundColor: bgColor,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <Icon size={24} color="#fff" />
    </div>
    <div>
      <h3 style={{ fontSize: '1.875rem', fontWeight: '700', color: '#1f2937', margin: 0, lineHeight: 1 }}>{value}</h3>
      <p style={{ color: '#6b7280', fontSize: '0.875rem', fontWeight: '500', marginTop: '4px' }}>{label}</p>
    </div>
  </motion.div>
);

const DonorDashboard = () => {
  const navigate = useNavigate(); 
  
  // ✅ STATE UPDATED: Initial state is 0/Loading
  const [stats, setStats] = useState({
    totalDonations: 0,
    livesSaved: 0,
    nextEligible: 'Loading...',
    lastDonationMessage: 'Loading your details...'
  });

  const [notifications, setNotifications] = useState([]);
  const [loadingNotifs, setLoadingNotifs] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      const loginId = localStorage.getItem("login_id");
      if (!loginId) return;

      try {
        // 1. Fetch Notifications
        const notifRes = await getNotifications(loginId);
        setNotifications(notifRes.data || []);

        // 2. Fetch Donor Stats (Total, Eligibility, etc)
        const statsRes = await getDonorStats(loginId);
        setStats(statsRes.data);

      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoadingNotifs(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleScheduleClick = () => {
    navigate('/donor/schedule');
  };

  const handleNotificationClick = (notif) => {
    let hospitalName = notif.hospitalName;
    if (!hospitalName && notif.message) {
        const match = notif.message.match(/URGENT:\s*(.*?)\s*needs/);
        if (match && match[1]) {
            hospitalName = match[1];
        }
    }
    navigate('/donor/schedule', { 
      state: { 
        preSelectedHospital: hospitalName || "Unknown Hospital", 
        alertMessage: notif.message 
      } 
    }); 
  };

  const styles = {
    container: {
      padding: '32px',
      marginLeft: '260px', 
      width: 'calc(100% - 260px)', 
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    welcome: { marginBottom: '32px' },
    h1: { fontSize: '1.875rem', fontWeight: '800', color: '#1f2937', margin: '0 0 8px 0', letterSpacing: '-0.025em' },
    p: { color: '#6b7280', margin: 0, fontSize: '1rem' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' },
    alertSection: { marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' },
    alertCard: {
      backgroundColor: '#fff', borderLeft: '4px solid #ef4444', borderRadius: '12px', padding: '20px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', cursor: 'pointer', transition: 'transform 0.2s'
    },
    alertContent: { display: 'flex', gap: '16px', alignItems: 'center' },
    alertIconBox: { background: '#fee2e2', padding: '10px', borderRadius: '50%', color: '#dc2626' },
    emptyAlert: { padding: '24px', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #e5e7eb', textAlign: 'center', color: '#9ca3af' },
    split: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '32px', alignItems: 'start' },
    ctaCard: {
      background: 'linear-gradient(135deg, #ef4444 0%, #be123c 100%)', borderRadius: '24px', padding: '40px',
      color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(220, 38, 38, 0.25)',
    },
    ctaContent: { position: 'relative', zIndex: 10 },
    badge: { backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '6px 16px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'inline-block', marginBottom: '20px', border: '1px solid rgba(255,255,255,0.3)' },
    ctaTitle: { fontSize: '2rem', fontWeight: '800', marginBottom: '16px', lineHeight: 1.1 },
    ctaText: { color: '#ffcfcf', marginBottom: '32px', maxWidth: '450px', fontSize: '1.1rem', lineHeight: 1.6 },
    ctaBtn: { backgroundColor: 'white', color: '#be123c', padding: '14px 28px', borderRadius: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' },
  };

  return (
    <div style={styles.container}>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.welcome}>
        <h1 style={styles.h1}>Welcome back! 👋</h1>
        {/* ✅ Dynamic Welcome Message */}
        <p style={styles.p}>{stats.lastDonationMessage}</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.alertSection}>
        <h3 style={{fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px'}}>
          <Bell size={20} color="#dc2626"/> Recent Alerts
        </h3>
        {loadingNotifs ? (
           <p style={{color: '#6b7280'}}>Loading alerts...</p>
        ) : notifications.length === 0 ? (
           <div style={styles.emptyAlert}>No urgent blood requests at the moment.</div>
        ) : (
          notifications.map((notif) => (
            <motion.div key={notif._id} style={styles.alertCard} whileHover={{ scale: 1.01 }} onClick={() => handleNotificationClick(notif)}>
              <div style={styles.alertContent}>
                <div style={styles.alertIconBox}><AlertTriangle size={24} /></div>
                <div>
                  <h4 style={{margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 'bold', color: '#1f2937'}}>Urgent Request Received</h4>
                  <p style={{margin: 0, color: '#4b5563', fontSize: '0.9rem'}}>{notif.message}</p>
                  <span style={{fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px', display: 'block'}}>{notif.createdAt}</span>
                </div>
              </div>
              <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '8px', fontWeight: '600', fontSize: '0.85rem' }}>Respond Now</div>
            </motion.div>
          ))
        )}
      </motion.div>

      <div style={styles.grid}>
        {/* ✅ Stats are now dynamic */}
        <StatCard icon={Droplets} label="Total Donations" value={stats.totalDonations} bgColor="#ef4444" delay={0.1} />
        <StatCard icon={Activity} label="Lives Saved" value={stats.livesSaved} bgColor="#10b981" delay={0.2} />
        <StatCard icon={Clock} label="Next Eligible" value={stats.nextEligible} bgColor="#3b82f6" delay={0.3} />
      </div>

      <div style={styles.split}>
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} style={styles.ctaCard}>
          <div style={styles.ctaContent}>
            <span style={styles.badge}>Save a Life</span>
            <h2 style={styles.ctaTitle}>Ready to make a difference?</h2>
            <p style={styles.ctaText}>Schedule a donation at a time that works for you.</p>
            <motion.button whileHover={{ scale: 1.05, backgroundColor: '#fef2f2' }} whileTap={{ scale: 0.95 }} style={styles.ctaBtn} onClick={handleScheduleClick}>
              Schedule Donation <ArrowRight size={20} />
            </motion.button>
          </div>
          <div style={{ position: 'absolute', right: '-50px', bottom: '-50px', width: '200px', height: '200px', borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.1)' }}></div>
        </motion.div>
      </div>
    </div>
  );
};

export default DonorDashboard;