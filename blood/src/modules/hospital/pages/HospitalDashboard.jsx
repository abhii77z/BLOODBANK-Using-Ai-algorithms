import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Droplet, AlertCircle, CheckCircle2, Clock, Loader2 } from 'lucide-react';
import { getHospitalDashboardData } from '../../../services/api';

const RequestCard = ({ type, units, urgency, status, id }) => {
  const isCritical = urgency === 'Critical';
  const styles = {
    card: {
      backgroundColor: 'white',
      padding: '16px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '12px',
      transition: 'all 0.2s',
      cursor: 'pointer'
    },
    left: { display: 'flex', alignItems: 'center', gap: '16px' },
    iconBox: {
      width: '40px',
      height: '40px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: isCritical ? '#fee2e2' : '#dbeafe',
      color: isCritical ? '#dc2626' : '#2563eb'
    },
    title: { fontWeight: '700', color: '#1e293b', margin: 0 },
    sub: { fontSize: '0.75rem', color: '#64748b', margin: 0 },
    badge: {
      padding: '4px 12px',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: '700',
      backgroundColor: isCritical ? '#fef2f2' : '#fefce8',
      color: isCritical ? '#dc2626' : '#ca8a04'
    },
    status: {
      fontSize: '0.75rem',
      color: status === 'Pending' ? '#f59e0b' : status === 'Approved' ? '#10b981' : '#94a3b8',
      fontWeight: '600',
      textTransform: 'capitalize'
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      style={styles.card}
    >
      <div style={styles.left}>
        <div style={styles.iconBox}><Droplet size={20} fill="currentColor" /></div>
        <div>
          <h4 style={styles.title}>{type} Blood</h4>
          <p style={styles.sub}>Request #{id} • {units} Units</p>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={styles.badge}>{urgency}</span>
        <span style={styles.status}>{status}</span>
      </div>
    </motion.div>
  );
};

const HospitalDashboard = () => {
  const [data, setData] = useState({ stats: [], recentActivity: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loginId = localStorage.getItem("login_id");
  const hospitalId = localStorage.getItem("hospitalId");

  useEffect(() => {
    const fetchDashboard = async () => {
      // 🔥 CRITICAL FIX: Use login_id as the primary identifier for dashboard stats
      // The backend filters by 'hospitalLoginId' (the _id from 'login' collection)
      const idToUse = localStorage.getItem("login_id");

      if (!idToUse || idToUse === "undefined") {
        setError("No login session found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        console.log("📊 Fetching dashboard for Login ID:", idToUse);
        const res = await getHospitalDashboardData(idToUse);
        console.log("✅ Dashboard data received:", res.data);
        setData(res.data);
        setError(null);
      } catch (err) {
        console.error("❌ Failed to load dashboard:", err);
        setError("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []); // loginId and hospitalId are static from localStorage, no need to watch them if we re-fetch on mount

  const icons = [Clock, CheckCircle2, AlertCircle, Droplet];
  const colors = {
    0: ['#fefce8', '#ca8a04'],
    1: ['#d1fae5', '#059669'],
    2: ['#fee2e2', '#dc2626'],
    3: ['#dbeafe', '#2563eb']
  };

  const styles = {
    container: { padding: '24px' },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      marginBottom: '32px'
    },
    title: { fontSize: '1.5rem', fontWeight: '700', color: '#1e293b' },
    subtitle: { color: '#64748b', marginTop: '4px' },
    newRequestBtn: {
      backgroundColor: '#2563eb',
      color: 'white',
      padding: '10px 20px',
      borderRadius: '8px',
      border: 'none',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      cursor: 'pointer',
      fontWeight: '600',
      transition: 'all 0.2s',
      boxShadow: '0 4px 6px -1px rgba(37, 99, 235, 0.3)'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px',
      marginBottom: '32px'
    },
    statCard: {
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      transition: 'all 0.2s'
    },
    activityCard: {
      backgroundColor: 'white',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      overflow: 'hidden'
    },
    activityHeader: {
      padding: '24px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    activityBody: { padding: '24px' },
    emptyState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#94a3b8'
    },
    errorState: {
      textAlign: 'center',
      padding: '60px 20px',
      color: '#dc2626',
      backgroundColor: '#fef2f2',
      borderRadius: '8px',
      margin: '20px'
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
          <Loader2 className="animate-spin" size={48} color="#2563eb" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorState}>
          <AlertCircle size={48} style={{ margin: '0 auto 16px' }} />
          <p style={{ fontSize: '1.125rem', fontWeight: '600' }}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Blood Requests Dashboard</h1>
          <p style={styles.subtitle}>Manage your hospital's blood requirements.</p>
        </div>
        <button
          style={styles.newRequestBtn}
          onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> New Request
        </button>
      </div>

      <div style={styles.statsGrid}>
        {data.stats && data.stats.length > 0 ? (
          data.stats.map((stat, i) => {
            const Icon = icons[i];
            return (
              <motion.div
                key={i}
                style={styles.statCard}
                whileHover={{ scale: 1.02, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div style={{
                    padding: '8px',
                    borderRadius: '8px',
                    backgroundColor: colors[i][0],
                    color: colors[i][1]
                  }}>
                    <Icon size={20} />
                  </div>
                  <span style={{ fontSize: '1.5rem', fontWeight: '700' }}>{stat.value}</span>
                </div>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>{stat.label}</p>
              </motion.div>
            );
          })
        ) : (
          <div style={{ gridColumn: '1 / -1', ...styles.emptyState }}>
            <p>No statistics available</p>
          </div>
        )}
      </div>

      <div style={styles.activityCard}>
        <div style={styles.activityHeader}>
          <h3 style={{ fontWeight: '700', margin: 0 }}>Recent Activity</h3>
          <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Last 5 requests
          </span>
        </div>
        <div style={styles.activityBody}>
          {data.recentActivity && data.recentActivity.length > 0 ? (
            data.recentActivity.map((req, idx) => (
              <RequestCard key={idx} {...req} />
            ))
          ) : (
            <div style={styles.emptyState}>
              <Droplet size={48} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
              <p style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '8px' }}>
                No Recent Requests
              </p>
              <p style={{ fontSize: '0.875rem' }}>
                Your blood requests will appear here once created
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;