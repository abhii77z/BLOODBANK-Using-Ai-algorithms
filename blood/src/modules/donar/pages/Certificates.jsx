import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Share2 } from 'lucide-react';

const Certificates = () => {
  // Mock Data State
  const [certificates] = useState([
    { id: 1, title: 'Life Saver Award', date: 'Issued on Oct 15, 2023', type: 'Gold' },
    { id: 2, title: 'Hero Badge', date: 'Issued on Jun 22, 2023', type: 'Silver' },
    { id: 3, title: 'First Donation', date: 'Issued on Feb 10, 2023', type: 'Bronze' },
  ]);

  // --- Handlers ---
  const handleDownload = (title) => {
    // In a real app, this would trigger a file download
    alert(`Downloading certificate: ${title}...`);
  };

  const handleShare = (title) => {
    // In a real app, this would open a share modal
    if (navigator.share) {
      navigator.share({
        title: 'My Blood Donation Certificate',
        text: `I just earned the ${title} for donating blood!`,
        url: window.location.href,
      })
      .catch((error) => console.log('Error sharing', error));
    } else {
      alert(`Shared "${title}" to social media!`);
    }
  };

  // --- Styles ---
  const styles = {
    // Layout Fix for Fixed Sidebar
    pageWrapper: {
      padding: '40px 32px',
      marginLeft: '260px', 
      width: 'calc(100% - 260px)',
      minHeight: '100vh',
      backgroundColor: '#f9fafb'
    },
    container: { 
      maxWidth: '1200px', 
      margin: '0 auto',
      paddingBottom: '32px' 
    },
    header: { marginBottom: '40px' },
    h1: { 
      fontSize: '2rem', 
      fontWeight: '800', 
      color: '#111827', 
      marginBottom: '8px',
      letterSpacing: '-0.025em'
    },
    p: { color: '#6b7280', fontSize: '1.1rem' },
    
    grid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
      gap: '32px' 
    },
    
    card: {
      backgroundColor: 'white',
      borderRadius: '20px',
      overflow: 'hidden',
      border: '1px solid #f3f4f6',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)',
      display: 'flex',
      flexDirection: 'column'
    },
    
    preview: {
      height: '220px',
      background: 'linear-gradient(135deg, #fff1f2 0%, #fee2e2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      borderBottom: '1px solid #f3f4f6'
    },
    // Background watermark icon
    watermark: { 
      position: 'absolute',
      opacity: 0.07, 
      transform: 'scale(4)',
      color: '#dc2626'
    },
    certContent: {
      position: 'relative',
      zIndex: 10,
      textAlign: 'center',
      border: '4px double #fca5a5',
      padding: '16px 24px',
      backgroundColor: 'rgba(255,255,255,0.6)',
      backdropFilter: 'blur(2px)'
    },
    
    content: { padding: '24px', flex: 1, display: 'flex', flexDirection: 'column' },
    title: { fontSize: '1.25rem', fontWeight: '700', color: '#1f2937', marginBottom: '4px' },
    date: { fontSize: '0.875rem', color: '#6b7280', marginBottom: '24px' },
    
    actions: { display: 'flex', gap: '12px', marginTop: 'auto' },
    
    btnPrimary: {
      flex: 1,
      padding: '12px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#dc2626',
      color: 'white',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    },
    btnSecondary: {
      flex: 1,
      padding: '12px',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      backgroundColor: 'white',
      color: '#374151',
      fontSize: '0.875rem',
      fontWeight: '600',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px',
      transition: 'background-color 0.2s'
    }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        
        {/* Header */}
        <div style={styles.header}>
          <h1 style={styles.h1}>My Certificates</h1>
          <p style={styles.p}>Honoring your commitment to saving lives.</p>
        </div>

        {/* Certificates Grid */}
        <div style={styles.grid}>
          {certificates.map((cert, i) => (
            <motion.div
              key={cert.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={styles.card}
              whileHover={{ y: -8, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
            >
              {/* Visual Preview */}
              <div style={styles.preview}>
                <Award size={64} style={styles.watermark} />
                <div style={styles.certContent}>
                  <Award size={40} color="#dc2626" style={{ marginBottom: '8px', margin: '0 auto' }} />
                  <div style={{ fontWeight: '800', color: '#991b1b', letterSpacing: '0.05em' }}>CERTIFICATE</div>
                  <div style={{ fontSize: '0.7rem', color: '#b91c1c', fontWeight: '600' }}>OF APPRECIATION</div>
                </div>
              </div>

              {/* Card Body */}
              <div style={styles.content}>
                <h3 style={styles.title}>{cert.title}</h3>
                <p style={styles.date}>{cert.date}</p>
                
                <div style={styles.actions}>
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: '#b91c1c' }}
                    whileTap={{ scale: 0.98 }}
                    style={styles.btnPrimary}
                    onClick={() => handleDownload(cert.title)}
                  >
                    <Download size={18} /> Download
                  </motion.button>
                  
                  <motion.button 
                    whileHover={{ scale: 1.02, backgroundColor: '#f9fafb' }}
                    whileTap={{ scale: 0.98 }}
                    style={styles.btnSecondary}
                    onClick={() => handleShare(cert.title)}
                  >
                    <Share2 size={18} /> Share
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Certificates;