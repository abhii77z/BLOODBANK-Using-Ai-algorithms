import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, AlertTriangle, CheckCircle, Droplet, 
  X, Calendar, BarChart3, Loader2, RefreshCw, Info
} from 'lucide-react';
import { getBloodPredictions } from '../../../services/api';

const BloodPredictionModal = ({ isOpen, onClose }) => {
  const [predictions, setPredictions] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [methodology, setMethodology] = useState('');
  const [predictionDate, setPredictionDate] = useState('');

  const fetchPredictions = async () => {
    setLoading(true);
    try {
      const res = await getBloodPredictions();
      setPredictions(res.data.predictions || []);
      setSummary(res.data.summary || {});
      setMethodology(res.data.methodology || '');
      setPredictionDate(res.data.predictionDate || '');
    } catch (error) {
      console.error("Failed to fetch predictions:", error);
      alert("Failed to load predictions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchPredictions();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getPriorityStyles = (priority) => {
    const styles = {
      high: { bg: '#fee2e2', color: '#991b1b', icon: AlertTriangle },
      medium: { bg: '#fef3c7', color: '#92400e', icon: TrendingUp },
      low: { bg: '#dbeafe', color: '#1e40af', icon: Info },
      none: { bg: '#dcfce7', color: '#166534', icon: CheckCircle }
    };
    return styles[priority] || styles.none;
  };

  const modalStyles = {
    overlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)',
      padding: '20px'
    },
    modal: {
      backgroundColor: '#fff',
      borderRadius: '20px',
      width: '100%',
      maxWidth: '1200px',
      maxHeight: '90vh',
      display: 'flex',
      flexDirection: 'column',
      boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
    },
    header: {
      padding: '32px',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    title: {
      fontSize: '1.75rem',
      fontWeight: '800',
      color: '#0f172a',
      margin: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#64748b',
      marginTop: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    closeBtn: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#64748b',
      padding: '8px',
      borderRadius: '8px',
      transition: 'all 0.2s'
    },
    body: {
      padding: '32px',
      overflowY: 'auto',
      flex: 1
    },
    summaryGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '16px',
      marginBottom: '32px'
    },
    summaryCard: {
      padding: '20px',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      backgroundColor: '#f8fafc'
    },
    predictionGrid: {
      display: 'grid',
      gap: '16px'
    },
    predictionCard: (priority) => ({
      padding: '24px',
      borderRadius: '12px',
      border: `2px solid ${getPriorityStyles(priority).bg}`,
      backgroundColor: '#fff',
      transition: 'all 0.2s',
      cursor: 'pointer'
    }),
    cardHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '16px'
    },
    bloodType: {
      fontSize: '1.5rem',
      fontWeight: '800',
      color: '#0f172a'
    },
    priorityBadge: (priority) => {
      const style = getPriorityStyles(priority);
      return {
        padding: '6px 12px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '700',
        backgroundColor: style.bg,
        color: style.color,
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        textTransform: 'uppercase'
      };
    },
    statsRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '16px',
      marginBottom: '16px'
    },
    statBox: {
      textAlign: 'center',
      padding: '12px',
      backgroundColor: '#f8fafc',
      borderRadius: '8px'
    },
    statLabel: {
      fontSize: '0.75rem',
      color: '#64748b',
      marginBottom: '4px',
      fontWeight: '600'
    },
    statValue: {
      fontSize: '1.25rem',
      fontWeight: '800',
      color: '#0f172a'
    },
    recommendation: {
      padding: '16px',
      backgroundColor: '#f1f5f9',
      borderRadius: '8px',
      fontSize: '0.875rem',
      color: '#334155',
      lineHeight: '1.6',
      borderLeft: '4px solid #0e7490'
    },
    footer: {
      padding: '24px 32px',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    refreshBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 20px',
      backgroundColor: '#0e7490',
      color: '#fff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={modalStyles.overlay}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          style={modalStyles.modal}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div style={modalStyles.header}>
            <div>
              <h2 style={modalStyles.title}>
                <BarChart3 size={32} color="#0e7490" />
                Blood Demand Predictions
              </h2>
              <p style={modalStyles.subtitle}>
                <Calendar size={14} />
                Forecast Date: {predictionDate || 'Loading...'}
              </p>
              <p style={{...modalStyles.subtitle, marginTop: '4px'}}>
                <Info size={14} />
                {methodology}
              </p>
            </div>
            <button style={modalStyles.closeBtn} onClick={onClose}>
              <X size={24} />
            </button>
          </div>

          {/* Body */}
          <div style={modalStyles.body}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px' }}>
                <Loader2 className="animate-spin" size={48} color="#0e7490" style={{ margin: '0 auto' }} />
                <p style={{ marginTop: '16px', color: '#64748b' }}>Analyzing data...</p>
              </div>
            ) : (
              <>
                {/* Summary Cards */}
                {summary && (
                  <div style={modalStyles.summaryGrid}>
                    <div style={modalStyles.summaryCard}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                        CRITICAL SHORTAGES
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#dc2626' }}>
                        {summary.criticalShortages || 0}
                      </div>
                    </div>
                    <div style={modalStyles.summaryCard}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                        WARNINGS
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#f59e0b' }}>
                        {summary.warnings || 0}
                      </div>
                    </div>
                    <div style={modalStyles.summaryCard}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '8px', fontWeight: '600' }}>
                        ADEQUATE STOCK
                      </div>
                      <div style={{ fontSize: '2rem', fontWeight: '800', color: '#10b981' }}>
                        {summary.adequateStock || 0}
                      </div>
                    </div>
                  </div>
                )}

                {/* Prediction Cards */}
                <div style={modalStyles.predictionGrid}>
                  {predictions.map((pred, idx) => {
                    const PriorityIcon = getPriorityStyles(pred.priority).icon;
                    return (
                      <motion.div
                        key={pred.bloodGroup}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        style={modalStyles.predictionCard(pred.priority)}
                      >
                        <div style={modalStyles.cardHeader}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Droplet size={24} fill="#dc2626" color="#dc2626" />
                            <span style={modalStyles.bloodType}>{pred.bloodGroup}</span>
                          </div>
                          <div style={modalStyles.priorityBadge(pred.priority)}>
                            <PriorityIcon size={14} />
                            {pred.status}
                          </div>
                        </div>

                        <div style={modalStyles.statsRow}>
                          <div style={modalStyles.statBox}>
                            <div style={modalStyles.statLabel}>PREDICTED DEMAND</div>
                            <div style={modalStyles.statValue}>{pred.predictedDemand}</div>
                          </div>
                          <div style={modalStyles.statBox}>
                            <div style={modalStyles.statLabel}>CURRENT STOCK</div>
                            <div style={modalStyles.statValue}>{pred.currentStock}</div>
                          </div>
                          <div style={modalStyles.statBox}>
                            <div style={modalStyles.statLabel}>GAP</div>
                            <div style={{
                              ...modalStyles.statValue,
                              color: pred.gap > 0 ? '#dc2626' : '#10b981'
                            }}>
                              {pred.gap > 0 ? '+' : ''}{pred.gap}
                            </div>
                          </div>
                        </div>

                        <div style={modalStyles.recommendation}>
                          <strong style={{ color: '#0f172a' }}>Recommendation:</strong>
                          <br />
                          {pred.recommendation}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div style={modalStyles.footer}>
            <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
              Last Updated: {new Date().toLocaleTimeString()}
            </div>
            <button style={modalStyles.refreshBtn} onClick={fetchPredictions} disabled={loading}>
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BloodPredictionModal;