import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, CheckCircle, MapPin, Calendar, Droplet, Activity } from 'lucide-react';
import { getDonorHistory } from '../../../services/api';

const DonationHistory = () => {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await getDonorHistory(loginId);
        setHistory(res.data || []);
      } catch (err) {
        console.error("Failed to load history", err);
      } finally {
        setLoading(false);
      }
    };
    if (loginId) fetchHistory();
  }, [loginId]);

  const styles = {
    pageWrapper: {
      padding: '40px 32px',
      marginLeft: '260px', // Matches your Sidebar layout
      width: 'calc(100% - 260px)',
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', sans-serif"
    },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '32px' },
    h1: { fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '8px' },
    p: { color: '#6b7280', fontSize: '1.1rem' },
    
    // Card Styles matching your design system
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '16px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      transition: 'all 0.2s ease'
    },
    leftSection: { display: 'flex', alignItems: 'center', gap: '20px' },
    iconBox: {
      width: '50px',
      height: '50px',
      borderRadius: '12px',
      backgroundColor: '#dbeafe', // Blue tint
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },
    locationText: { fontSize: '1.1rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' },
    metaText: { color: '#6b7280', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' },
    
    statusBadge: {
      padding: '6px 16px',
      borderRadius: '99px',
      fontSize: '0.85rem',
      fontWeight: '700',
      backgroundColor: '#dcfce7', // Green tint
      color: '#166534',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.h1}>Donation History</h1>
          <p style={styles.p}>Thank you for being a hero. Here is a record of your impact.</p>
        </div>

        {/* Loading State */}
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading history...</div>}

        {/* Empty State */}
        {!loading && history.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px', backgroundColor: 'white', borderRadius: '16px', border: '1px dashed #d1d5db' }}>
            <Activity size={48} color="#9ca3af" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>You haven't made any donations yet.</p>
          </div>
        )}

        {/* List */}
        <div>
          {history.map((item, i) => (
            <motion.div 
              key={item._id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={styles.card}
            >
              <div style={styles.leftSection}>
                <div style={styles.iconBox}>
                  <Droplet size={24} />
                </div>
                <div>
                  <div style={styles.locationText}>
                    {item.locationName || "Direct Donation"}
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={styles.metaText}>
                      <Calendar size={14} /> {item.date}
                    </div>
                    <div style={styles.metaText}>
                      <Clock size={14} /> {item.time}
                    </div>
                  </div>
                </div>
              </div>

              <div style={styles.statusBadge}>
                <CheckCircle size={16} /> Completed
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default DonationHistory;