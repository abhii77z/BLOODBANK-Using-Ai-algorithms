import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Phone } from 'lucide-react';
import { getAllUsers } from '../../../services/api'; // adjust path if needed

const DonorDatabase = () => {
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    try {
      const res = await getAllUsers();

      // 🔹 Filter only donors
      const donorUsers = res.data.filter(
        (user) => user?.login_details?.usertype === 'donor'
      );

      setDonors(donorUsers);
    } catch (error) {
      console.error('Error fetching donors:', error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { paddingBottom: '32px' },
    header: { marginBottom: '32px' },
    h1: { fontSize: '1.875rem', fontWeight: '700', color: '#1e293b' },
    p: { color: '#64748b' },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
      gap: '24px'
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    },
    top: { display: 'flex', justifyContent: 'space-between' },
    avatar: {
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      backgroundColor: '#dbeafe',
      color: '#2563eb',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700'
    },
    bloodType: {
      padding: '4px 12px',
      borderRadius: '8px',
      backgroundColor: '#fef2f2',
      color: '#dc2626',
      fontWeight: '700'
    },
    contact: { display: 'flex', gap: '12px' },
    btn: {
      flex: 1,
      padding: '8px',
      borderRadius: '8px',
      border: '1px solid #e2e8f0',
      background: 'white',
      cursor: 'pointer',
      display: 'flex',
      gap: '8px',
      justifyContent: 'center'
    }
  };

  if (loading) return <p>Loading donors...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>Donor Database</h1>
        <p style={styles.p}>Visible to hospitals only</p>
      </div>

      <div style={styles.grid}>
        {donors.map((donor, i) => (
          <motion.div
            key={donor._id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            style={styles.card}
            whileHover={{ y: -5 }}
          >
            <div style={styles.top}>
              <div style={styles.avatar}>
                {donor.name?.charAt(0).toUpperCase()}
              </div>
              <div style={styles.bloodType}>
                {donor.details?.bloodGroup || 'N/A'}
              </div>
            </div>

            <div>
              <h3>{donor.name}</h3>
              <p>{donor.address}</p>
            </div>

            <div style={styles.contact}>
              <button style={styles.btn}>
                <Phone size={16} /> {donor.contact || 'N/A'}
              </button>
              <button style={styles.btn}>
                <Mail size={16} /> {donor.email}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DonorDatabase;