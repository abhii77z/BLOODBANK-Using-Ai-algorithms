import React, { useState, useEffect } from 'react';
import Sidebar from '../component/sidebar.jsx';
import Navbar from '../component/navbar.jsx';
import Footer from '../component/footer.jsx';
import { 
  Database, PlusCircle, RefreshCw, Droplet, Clock, Bookmark, 
  Activity, MoreHorizontal, MapPin, X, Save, Building2 
} from 'lucide-react';

// Integrated your API services
import { 
  getInventorySummary, 
  getRecentBloodBatches, 
  getAllLocations, 
  addLocation 
} from '../../../services/api.jsx';

const BloodInventory = () => {
  // --- STATE ---
  const [summary, setSummary] = useState({
    totalUnits: 0, criticalExpiry: 0, reserved: 0, healthStatus: "Stable", byBloodGroup: []
  });
  const [recentBatches, setRecentBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [locations, setLocations] = useState([]); 
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locForm, setLocForm] = useState({
    name: '', address: '', city: '', latitude: '', longitude: '', critical_needs: []
  });

  // --- CONSTANTS ---
  const colors = { primary: '#0f758a', red: '#DC2626', amber: '#f59e0b', green: '#16a34a' };
  const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

  // --- FETCH DATA ---
  const loadPageData = async () => {
    setLoading(true);
    try {
      const [sumRes, batchRes, locRes] = await Promise.all([
        getInventorySummary(),
        getRecentBloodBatches(8),
        getAllLocations()
      ]);
      
      // Transform backend summary array into the specific object format expected by the UI
      const backendData = sumRes.data;
      const transformedSummary = {
        totalUnits: backendData.reduce((acc, curr) => acc + curr.units, 0),
        criticalExpiry: 0, // Logic for this can be added later based on dates
        reserved: 0,
        healthStatus: backendData.length > 0 ? "Stable" : "Empty",
        byBloodGroup: backendData.map(item => ({
          _id: item.type,
          totalUnits: item.units,
          nearExpiry: 0,
          reserved: 0
        }))
      };

      setSummary(transformedSummary);
      setRecentBatches(batchRes.data || []);
      setLocations(locRes.data || []);

    } catch (err) {
      console.error("API Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPageData();
  }, []);

  // --- FORM FUNCTIONS ---
  const toggleBloodGroup = (bg) => {
    setLocForm(prev => {
      const exists = prev.critical_needs.includes(bg);
      return {
        ...prev,
        critical_needs: exists 
          ? prev.critical_needs.filter(x => x !== bg)
          : [...prev.critical_needs, bg]
      };
    });
  };

  const handleLocationSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use your imported addLocation service
      await addLocation({
        name: locForm.name,
        address: locForm.address,
        city: locForm.city,
        latitude: parseFloat(locForm.latitude),
        longitude: parseFloat(locForm.longitude),
        critical_needs: locForm.critical_needs
      });
      
      alert("Location added successfully!");
      setLocForm({ name: '', address: '', city: '', latitude: '', longitude: '', critical_needs: [] });
      setShowLocationModal(false);
      loadPageData(); // Refresh all data

    } catch (err) {
      alert("Error adding location");
      console.error(err);
    }
  };

  // --- HELPER: Color Mapping ---
  const getColorForGroup = (group) => {
    const map = {
      "O+": "#0f758a", "O-": "#DC2626", "A+": "#2563eb", "A-": "#1e40af",
      "B+": "#7c3aed", "B-": "#6d28d9", "AB+": "#ea580c", "AB-": "#c2410c",
    };
    return map[group] || "#64748b";
  };

  // --- TRANSFORM DATA FOR CARDS ---
  const inventoryCards = summary.byBloodGroup.map(item => {
    const totalColor = getColorForGroup(item._id);
    let status = "Healthy";
    let statusColor = colors.green;
    let statusBg = "#f0fdf4";

    if (item.totalUnits < 5) {
        status = "Critical"; statusColor = colors.red; statusBg = "#fef2f2";
    } else if (item.totalUnits < 15) {
        status = "Low"; statusColor = colors.amber; statusBg = "#fffbeb";
    }

    return {
      type: item._id, count: item.totalUnits, status, statusBg, statusColor, totalColor,
      nearExpiry: item.nearExpiry, reserved: item.reserved
    };
  });

  // --- STYLES (Identical to your provided design) ---
  const styles = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
    main: { flex: 1, padding: '32px', overflowY: 'auto', position: 'relative' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    headerContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
    title: { fontSize: '1.875rem', fontWeight: '800', color: '#0f172a', margin: 0 },
    subtitle: { color: '#64748b', fontSize: '0.875rem', marginTop: '4px' },
    headerActions: { display: 'flex', gap: '12px' },
    actionBtn: (bgColor) => ({ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: bgColor, color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', transition: 'opacity 0.2s' }),
    summaryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' },
    summaryCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    iconBox: (color) => ({ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${color}1a`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center' }),
    summaryLabel: { fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase', color: '#64748b', marginBottom: '4px' },
    summaryValue: (color) => ({ fontSize: '1.5rem', fontWeight: '900', color: color, margin: 0 }),
    inventoryGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px', marginBottom: '32px' },
    inventoryCard: (color) => ({ backgroundColor: '#fff', borderRadius: '16px', padding: '24px', border: '1px solid #e2e8f0', borderTop: `4px solid ${color}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', gap: '16px', cursor: 'pointer' }),
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    bloodTypeBox: (color) => ({ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: `${color}1a`, color: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: '900' }),
    statusBadge: (bgColor, textColor) => ({ padding: '4px 10px', borderRadius: '99px', fontSize: '0.65rem', fontWeight: '800', textTransform: 'uppercase', backgroundColor: bgColor, color: textColor }),
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', marginBottom: '32px' },
    tableHeader: { padding: '24px', borderBottom: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px 24px', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: '#64748b' },
    td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', color: '#334155' },
    locationGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
    locationCard: { backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' },
    locBadge: { fontSize: '0.7rem', backgroundColor: '#fee2e2', color: '#dc2626', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold', marginRight: '6px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' },
    modalContent: { backgroundColor: 'white', borderRadius: '16px', padding: '32px', width: '90%', maxWidth: '600px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', position: 'relative', maxHeight: '90vh', overflowY: 'auto' },
    closeBtn: { position: 'absolute', top: '24px', right: '24px', background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' },
    input: { width: '100%', padding: '12px', marginBottom: '16px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '1rem' },
    chip: (active) => ({ padding: '8px 16px', borderRadius: '20px', cursor: 'pointer', fontWeight: 'bold', backgroundColor: active ? '#dc2626' : '#f3f4f6', color: active ? 'white' : '#374151', border: 'none', marginRight: '8px', marginBottom: '8px' }),
    saveBtn: { width: '100%', padding: '14px', background: '#0f758a', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.content}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.container}>
            
            <div style={styles.headerContainer}>
              <div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8, color: colors.primary, fontWeight: 700, fontSize: '0.875rem', marginBottom: 4}}>
                  <Database size={16} /> Inventory Status
                </div>
                <h2 style={styles.title}>Blood Stock Details</h2>
                <p style={styles.subtitle}>Real-time tracking of units and locations.</p>
              </div>
              <div style={styles.headerActions}>
                <button style={styles.actionBtn(colors.primary)} onClick={() => setShowLocationModal(true)}>
                  <MapPin size={20} /> Add Donation Center
                </button>
                <button style={styles.actionBtn(colors.red)} onClick={loadPageData}>
                  <RefreshCw size={20} /> Refresh Data
                </button>
              </div>
            </div>

            {/* Summary Cards */}
            <div style={styles.summaryGrid}>
              <div style={styles.summaryCard}>
                <div style={styles.iconBox(colors.primary)}><Droplet size={24}/></div>
                <div>
                  <p style={styles.summaryLabel}>Total Units</p>
                  <p style={styles.summaryValue('#0f172a')}>{summary.totalUnits}</p>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.iconBox(colors.red)}><Clock size={24}/></div>
                <div>
                  <p style={styles.summaryLabel}>Shortage Alerts</p>
                  <p style={styles.summaryValue(colors.red)}>{summary.byBloodGroup.filter(i => i.totalUnits < 10).length}</p>
                </div>
              </div>
              <div style={styles.summaryCard}>
                <div style={styles.iconBox(colors.green)}><Activity size={24}/></div>
                <div>
                  <p style={styles.summaryLabel}>System Status</p>
                  <p style={styles.summaryValue(colors.green)}>{summary.healthStatus}</p>
                </div>
              </div>
            </div>

            {/* Inventory Grid */}
            <div style={styles.inventoryGrid}>
              {inventoryCards.map((item, index) => (
                <div key={index} style={styles.inventoryCard(item.totalColor)}>
                  <div style={styles.cardHeader}>
                    <div style={styles.bloodTypeBox(item.totalColor)}>{item.type}</div>
                    <span style={styles.statusBadge(item.statusBg, item.statusColor)}>{item.status}</span>
                  </div>
                  <div>
                    <p style={{fontSize: '2.5rem', fontWeight: 900, color: '#0f172a', margin: 0}}>{item.count}</p>
                    <p style={styles.summaryLabel}>Units Available</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Locations Section */}
            <div style={{marginTop: '40px'}}>
              <div style={{marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                 <Building2 color="#0f172a" />
                 <h3 style={{fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a'}}>Registered Donation Centers</h3>
              </div>
              <div style={styles.locationGrid}>
                {locations.map((loc) => (
                  <div key={loc._id} style={styles.locationCard}>
                    <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
                      <div>
                        <h4 style={{margin: '0 0 4px 0', fontSize: '1rem', color: '#0f172a'}}>{loc.name}</h4>
                        <span style={{fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems:'center', gap:'4px'}}>
                          <MapPin size={14} /> {loc.city}
                        </span>
                      </div>
                      <span style={styles.statusBadge('#dcfce7', '#166534')}>Active</span>
                    </div>
                    {loc.critical_needs?.length > 0 && (
                      <div style={{marginTop: 'auto', borderTop: '1px solid #f1f5f9', paddingTop: '10px'}}>
                        <span style={{fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', display: 'block', marginBottom: '6px'}}>CRITICAL NEEDS:</span>
                        {loc.critical_needs.map(bg => <span key={bg} style={styles.locBadge}>{bg}</span>)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>

        {/* Modal for adding location */}
        {showLocationModal && (
          <div style={styles.modalOverlay} onClick={() => setShowLocationModal(false)}>
            <div style={styles.modalContent} onClick={e => e.stopPropagation()}>
              <button style={styles.closeBtn} onClick={() => setShowLocationModal(false)}><X size={24} /></button>
              <h2 style={{display:'flex', alignItems:'center', gap:'10px', marginTop: 0}}><MapPin color="#dc2626"/> Add Center</h2>
              <form onSubmit={handleLocationSubmit}>
                <input placeholder="Center Name" style={styles.input} value={locForm.name} onChange={e => setLocForm({...locForm, name: e.target.value})} required />
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                  <input placeholder="City" style={styles.input} value={locForm.city} onChange={e => setLocForm({...locForm, city: e.target.value})} required />
                  <input placeholder="Address" style={styles.input} value={locForm.address} onChange={e => setLocForm({...locForm, address: e.target.value})} required />
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
                  <input placeholder="Lat" style={styles.input} value={locForm.latitude} onChange={e => setLocForm({...locForm, latitude: e.target.value})} required />
                  <input placeholder="Lng" style={styles.input} value={locForm.longitude} onChange={e => setLocForm({...locForm, longitude: e.target.value})} required />
                </div>
                <div style={{marginBottom:'24px', display:'flex', flexWrap:'wrap'}}>
                  {bloodGroups.map(bg => (
                    <button type="button" key={bg} onClick={() => toggleBloodGroup(bg)} style={styles.chip(locForm.critical_needs.includes(bg))}>{bg}</button>
                  ))}
                </div>
                <button type="submit" style={styles.saveBtn}><Save size={18} /> Save Center</button>
              </form>
            </div>
          </div>
        )}
        <Footer />
      </div>
    </div>
  );
};

export default BloodInventory;