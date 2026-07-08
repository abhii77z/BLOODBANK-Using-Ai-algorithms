import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, AlertCircle, Droplets, CheckCircle } from 'lucide-react';
import { getAvailableDirectRequests, respondToDirectRequest } from '../../../services/api';

const DirectRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const loginId = localStorage.getItem("login_id");

  useEffect(() => {
    if (loginId) {
      fetchRequests();
    }
  }, [loginId]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getAvailableDirectRequests(loginId);
      setRequests(res.data || []);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async (requestId) => {
    if (!window.confirm("Are you sure you can donate to this person?")) return;
    try {
      await respondToDirectRequest({
        requestId,
        donorLoginId: loginId,
        response: "accepted"
      });
      alert("Request Accepted! Check your notifications for contact details.");
      fetchRequests(); 
    } catch (err) {
      console.error(err);
      alert("Failed to accept request.");
    }
  };

  // --- 🎨 STYLES FIXED HERE ---
  const styles = {
    pageWrapper: {
      padding: '40px 32px',
      marginLeft: '260px', // ✅ FIXED: Moves content to the right of Sidebar
      width: 'calc(100% - 260px)', // ✅ FIXED: Prevents horizontal scrollbar
      minHeight: '100vh',
      backgroundColor: '#f9fafb',
      fontFamily: "'Inter', sans-serif",
      boxSizing: 'border-box'
    },
    container: { maxWidth: '1000px', margin: '0 auto' },
    header: { marginBottom: '32px' },
    h1: { fontSize: '2rem', fontWeight: '800', color: '#111827', marginBottom: '8px' },
    p: { color: '#6b7280', fontSize: '1.1rem' },
    
    // Card Styles
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '20px'
    },
    patientInfo: { display: 'flex', alignItems: 'center', gap: '16px' },
    bloodBadge: {
      width: '56px',
      height: '56px',
      borderRadius: '12px',
      backgroundColor: '#fee2e2',
      color: '#dc2626',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '800',
      fontSize: '1.1rem',
      border: '1px solid #fecaca'
    },
    urgencyPill: (urgency) => ({
      padding: '4px 12px',
      borderRadius: '99px',
      fontSize: '0.75rem',
      fontWeight: '700',
      backgroundColor: urgency === 'Critical' ? '#fee2e2' : '#fef3c7',
      color: urgency === 'Critical' ? '#b91c1c' : '#92400e',
      textTransform: 'uppercase',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      marginLeft: '12px'
    }),
    btnAction: {
      padding: '12px 24px',
      borderRadius: '10px',
      backgroundColor: '#dc2626',
      color: 'white',
      border: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      fontSize: '0.9rem',
      boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.2)',
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Urgent Direct Requests</h1>
          <p style={styles.p}>Donors in your area need immediate assistance.</p>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <Activity className="animate-spin" size={32} color="#dc2626" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: '#6b7280' }}>Finding matches...</p>
          </div>
        )}

        {!loading && requests.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '20px', border: '2px dashed #e5e7eb' }}>
            <CheckCircle size={64} color="#10b981" style={{ margin: '0 auto 24px', opacity: 0.8 }} />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#374151', marginBottom: '8px' }}>All Clear!</h3>
            <p style={{ color: '#9ca3af', fontSize: '1rem' }}>No pending requests match your blood group right now.</p>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {requests.map((req, i) => (
            <motion.div
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={styles.card}
            >
              <div style={styles.patientInfo}>
                <div style={styles.bloodBadge}>
                  <Droplets size={18} />
                  {req.recipientBloodGroup}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '700', color: '#1f2937' }}>
                      {req.recipientName}
                    </h3>
                    <span style={styles.urgencyPill(req.urgency)}>
                      <AlertCircle size={12} /> {req.urgency}
                    </span>
                  </div>
                  <p style={{ margin: '4px 0 0', color: '#4b5563', fontSize: '0.95rem' }}>
                    for <strong>{req.requestReason}</strong>
                  </p>
                  <p style={{ margin: '4px 0 0', color: '#9ca3af', fontSize: '0.8rem' }}>
                    Match Reason: {req.matchReason}
                  </p>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleAccept(req._id)}
                style={styles.btnAction}
              >
                Donate Now
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DirectRequests;