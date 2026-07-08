import React, { useState, useEffect } from 'react';
import Sidebar from '../component/sidebar.jsx';
import Navbar from '../component/navbar.jsx';
import Footer from '../component/footer.jsx';
import BloodPredictionModal from './BloodPredictionModal.jsx';
import { 
  Droplet, Users, Activity, AlertCircle, TrendingUp, TrendingDown, 
  Clock, X, Calendar, FileText, Loader, BarChart3, Sparkles
} from 'lucide-react';

import { 
  getAllBloodRequests, 
  findMatchingDonors, 
  processBloodRequest, 
  getInventorySummary,
  getTotalDonorCount,
  getAdminTotalStats 
} from '../../../services/api.jsx';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [requests, setRequests] = useState([]);
  const [bloodInventory, setBloodInventory] = useState([]); 
  const [totalUnitsCount, setTotalUnitsCount] = useState(0);
  const [donorCount, setDonorCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPredictionModal, setShowPredictionModal] = useState(false);

  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchingDonors, setMatchingDonors] = useState([]);
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [processingStep, setProcessingStep] = useState('list');

  // Fetch Live Data from Backend
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        const [requestsRes, inventoryRes, donorRes, totalStatsRes] = await Promise.all([
          getAllBloodRequests(),
          getInventorySummary(),
          getTotalDonorCount(),
          getAdminTotalStats()
        ]);

        setRequests(requestsRes.data || []);
        setBloodInventory(inventoryRes.data || []);
        setDonorCount(donorRes.data.totalDonors || donorRes.data.count || 0);
        setTotalUnitsCount(totalStatsRes.data.totalUnits || 0);

      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // === HANDLERS ===
  const handleProcessClick = async (req) => {
    setSelectedRequest(req);
    setProcessingStep('loading');
    try {
      const response = await findMatchingDonors(req.bloodGroup);
      setMatchingDonors(response.data || []);
      setSelectedDonorIds(response.data.map(d => d.donorId));
      setProcessingStep('select_donors');
    } catch (error) {
      console.error("Error finding donors:", error);
      alert("Failed to fetch matching donors.");
      setProcessingStep('list');
    }
  };

  const toggleDonorSelection = (donorId) => {
    setSelectedDonorIds(prev => 
      prev.includes(donorId) ? prev.filter(id => id !== donorId) : [...prev, donorId]
    );
  };

  const handleSubmitApproval = async () => {
    setProcessingStep('processing');
    try {
      await processBloodRequest({
        requestId: selectedRequest._id,
        donorIds: selectedDonorIds
      });
      const res = await getAllBloodRequests();
      setRequests(res.data || []);
      setProcessingStep('list');
      setSelectedRequest(null);
      alert("Request approved and donors notified!");
    } catch (error) {
      console.error("Error processing request:", error);
      alert("Failed to process request.");
      setProcessingStep('select_donors');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setProcessingStep('list');
    setSelectedRequest(null);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'good': return '#22c55e';
      case 'medium': return '#eab308';
      case 'low': return '#f97316';
      case 'critical': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusBadge = (status) => {
    const badgeStyles = {
      good: { backgroundColor: '#dcfce7', color: '#166534' },
      medium: { backgroundColor: '#fef9c3', color: '#854d0e' },
      low: { backgroundColor: '#ffedd5', color: '#9a3412' },
      critical: { backgroundColor: '#fee2e2', color: '#991b1b' },
    };
    return (
      <span style={{ ...styles.badge, ...badgeStyles[status] }}>
        {status?.toUpperCase()}
      </span>
    );
  };

  const styles = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' },
    content: { flex: 1, display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '24px', overflowY: 'auto' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' },
    title: { fontSize: '1.875rem', fontWeight: 'bold', color: '#1e293b' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px', marginBottom: '24px' },
    card: { backgroundColor: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' },
    inventoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' },
    inventoryCard: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px' },
    progressBar: { width: '100%', height: '8px', backgroundColor: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' },
    badge: { padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '500' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column' },
    requestCard: { border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' },
    predictionBtn: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '12px 24px',
      backgroundColor: '#0e7490',
      color: '#fff',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '0.875rem',
      cursor: 'pointer',
      boxShadow: '0 4px 6px -1px rgba(14, 116, 144, 0.3)',
      transition: 'all 0.2s'
    }
  };

  const statsCards = [
    { title: 'Total Blood Units', value: loading ? '...' : totalUnitsCount.toLocaleString(), icon: Droplet, color: '#dc2626', bg: '#fee2e2' },
    { title: 'Active Donors', value: loading ? '...' : donorCount.toLocaleString(), icon: Users, color: '#2563eb', bg: '#dbeafe' },
    { title: 'Pending Requests', value: loading ? '...' : requests.length.toString(), icon: Clock, color: '#f59e0b', bg: '#fef3c7', isInteractive: true, onClick: () => setShowModal(true) },
    { title: 'Critical Alerts', value: bloodInventory.filter(b => b.status === 'critical').length.toString(), icon: AlertCircle, color: '#ea580c', bg: '#ffedd5' },
  ];

  return (
    <div style={styles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <div style={styles.content}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Welcome Back, Admin</h1>
                <p style={{color: '#64748b'}}>Tracking inventory, donors, and urgent requests.</p>
              </div>
              <button 
                style={styles.predictionBtn}
                onClick={() => setShowPredictionModal(true)}
                onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
                onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
              >
                <Sparkles size={20} />
                View Predictions
              </button>
            </div>

            <div style={styles.statsGrid}>
              {statsCards.map((stat, i) => (
                <div key={i} style={{...styles.card, cursor: stat.isInteractive ? 'pointer' : 'default'}} onClick={stat.onClick}>
                  <div style={{display: 'flex', justifyContent: 'space-between'}}>
                    <div>
                      <p style={{fontSize: '0.875rem', color: '#64748b'}}>{stat.title}</p>
                      <h3 style={{fontSize: '1.875rem', fontWeight: 'bold'}}>{stat.value}</h3>
                    </div>
                    <div style={{width: '48px', height: '48px', borderRadius: '8px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      <stat.icon style={{color: stat.color}} />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{...styles.card, marginBottom: '24px'}}>
              <h2 style={{fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '20px'}}>Blood Inventory Status</h2>
              <div style={styles.inventoryGrid}>
                {loading ? (
                  <div style={{gridColumn: '1/-1', textAlign: 'center', padding: '20px'}}><Loader className="animate-spin" /></div>
                ) : bloodInventory.length > 0 ? (
                  bloodInventory.map((blood, index) => (
                    <div key={index} style={styles.inventoryCard}>
                      <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '12px'}}>
                        <span style={{fontWeight: 'bold'}}>{blood.type}</span>
                        {getStatusBadge(blood.status)}
                      </div>
                      <p style={{fontSize: '1.5rem', fontWeight: 'bold'}}>{blood.units} units</p>
                      <div style={styles.progressBar}>
                        <div style={{height: '100%', width: `${blood.percentage}%`, backgroundColor: getStatusColor(blood.status)}} />
                      </div>
                    </div>
                  ))
                ) : (
                  <p style={{textAlign: 'center', gridColumn: '1/-1', color: '#64748b'}}>No inventory data available.</p>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* Requests Modal */}
        {showModal && (
          <div style={styles.modalOverlay} onClick={handleCloseModal}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
                <div style={{padding: '24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                   <h2 style={{margin: 0}}>{processingStep === 'select_donors' ? 'Compatible Donors' : 'Pending Requests'}</h2>
                   <X onClick={handleCloseModal} style={{cursor: 'pointer', color: '#64748b'}} />
                </div>
                <div style={{padding: '24px', overflowY: 'auto'}}>
                   {processingStep === 'list' && (
                    requests.length > 0 ? requests.map((req, i) => (
                      <div key={i} style={styles.requestCard}>
                        <div>
                          <strong>{req.bloodGroup}</strong> • {req.units} Units 
                          <div style={{fontSize: '0.85rem', color: '#64748b'}}>{req.hospitalName}</div>
                        </div>
                        <button 
                          style={{backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer'}} 
                          onClick={() => handleProcessClick(req)}
                        >
                          Process
                        </button>
                      </div>
                    )) : <p>No pending requests.</p>
                  )}
                  {processingStep === 'select_donors' && (
                    <div>
                      <p style={{marginBottom: '12px', fontSize: '0.9rem'}}>Select donors to notify for <strong>{selectedRequest.bloodGroup}</strong>:</p>
                      {matchingDonors.length > 0 ? matchingDonors.map(d => (
                        <div key={d.donorId} style={{display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', borderBottom: '1px solid #f1f5f9'}}>
                          <input 
                            type="checkbox" 
                            checked={selectedDonorIds.includes(d.donorId)} 
                            onChange={() => toggleDonorSelection(d.donorId)} 
                            style={{width: '18px', height: '18px'}}
                          />
                          <div>
                            <div style={{fontWeight: '500'}}>{d.name}</div>
                            <div style={{fontSize: '0.8rem', color: '#64748b'}}>{d.contact} • {d.address}</div>
                          </div>
                        </div>
                      )) : <p>No matching donors found in the database.</p>}
                      <button 
                        onClick={handleSubmitApproval} 
                        disabled={selectedDonorIds.length === 0}
                        style={{
                          backgroundColor: selectedDonorIds.length > 0 ? '#16a34a' : '#94a3b8', 
                          color: 'white', border: 'none', padding: '12px', width: '100%', 
                          borderRadius: '8px', marginTop: '20px', fontWeight: 'bold', cursor: 'pointer'
                        }}
                      >
                        Approve & Send Alerts
                      </button>
                    </div>
                  )}
                  {processingStep === 'loading' && (
                    <div style={{textAlign: 'center', padding: '20px'}}><Loader className="animate-spin" /></div>
                  )}
                </div>
            </div>
          </div>
        )}

        {/* Prediction Modal */}
        <BloodPredictionModal 
          isOpen={showPredictionModal} 
          onClose={() => setShowPredictionModal(false)} 
        />

        <Footer />
      </div>
    </div>
  );
};

export default AdminDashboard;