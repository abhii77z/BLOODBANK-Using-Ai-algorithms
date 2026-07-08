import React, { useState, useEffect } from 'react';
import Sidebar from '../component/sidebar.jsx';
import Navbar from '../component/navbar.jsx';
import Footer from '../component/footer.jsx';
import { 
  Calendar, RefreshCw, Download, FileText, ArrowRight, ChevronDown, Loader2
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  getDonationTrends, 
  getBloodTypeDistribution, 
  getRequestsVsDonations,
  getTotalDonorCount,
  getAdminTotalStats,
  getInventorySummary
} from '../../../services/api.jsx';

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('analytics');
  const [loading, setLoading] = useState(true);

  // State for charts
  const [trendData, setTrendData] = useState([]);
  const [pieData, setPieData] = useState([]);
  const [gapData, setGapData] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalDonations: 0,
    inventoryHealth: 0,
    unmetRequests: 0,
    activeDonors: 0
  });

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    try {
      const [trends, distribution, gapAnalysis, donorCount, inventory] = await Promise.all([
        getDonationTrends(),
        getBloodTypeDistribution(),
        getRequestsVsDonations(),
        getTotalDonorCount(),
        getInventorySummary()
      ]);

      // Set trend data
      setTrendData(trends.data || []);

      // Set pie data
      setPieData(distribution.data || []);

      // Set gap data
      setGapData(gapAnalysis.data || []);

      // Calculate KPIs
      const totalDonations = (trends.data || []).reduce((sum, month) => sum + (month.successful || 0), 0);
      const inventoryItems = inventory.data || [];
      const healthyItems = inventoryItems.filter(item => item.status === 'good' || item.status === 'medium').length;
      const inventoryHealth = inventoryItems.length > 0 ? Math.round((healthyItems / inventoryItems.length) * 100) : 0;
      const unmetRequests = inventoryItems.filter(item => item.status === 'critical').length;

      setKpiData({
        totalDonations,
        inventoryHealth,
        unmetRequests,
        activeDonors: donorCount.data?.totalDonors || 0
      });

    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
    content: { flex: 1, display: 'flex', flexDirection: 'column' },
    main: { flex: 1, padding: '32px', overflowY: 'auto' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' },
    title: { fontSize: '2rem', fontWeight: '700', color: '#0f172a', marginBottom: '4px' },
    lastUpdated: { color: '#64748b', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '6px' },
    headerActions: { display: 'flex', gap: '12px' },
    dateButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#334155', fontWeight: '500', cursor: 'pointer' },
    refreshButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#0e7490', border: 'none', borderRadius: '8px', color: '#fff', fontWeight: '500', cursor: 'pointer', boxShadow: '0 2px 4px rgba(14, 116, 144, 0.2)' },

    kpiGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '24px' },
    kpiCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
    kpiLabel: { fontSize: '0.875rem', color: '#64748b', marginBottom: '8px' },
    kpiRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '12px' },
    kpiValue: { fontSize: '2rem', fontWeight: '700', color: '#0f172a', lineHeight: '1' },
    kpiBadge: (isPositive) => ({
      padding: '4px 8px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '600',
      backgroundColor: isPositive ? '#dcfce7' : '#fee2e2', color: isPositive ? '#166534' : '#991b1b'
    }),
    progressBarBg: { height: '4px', backgroundColor: '#f1f5f9', borderRadius: '2px', width: '100%' },
    progressBarFill: (color, width) => ({ height: '100%', backgroundColor: color, borderRadius: '2px', width: width }),

    chartsRow: { display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' },
    chartCard: { backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' },
    cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' },
    cardTitle: { fontSize: '1.25rem', fontWeight: '700', color: '#0f172a' },
    cardSubtitle: { fontSize: '0.875rem', color: '#64748b', marginTop: '4px' },
    
    donutContainer: { position: 'relative', height: '250px', display: 'flex', justifyContent: 'center', alignItems: 'center' },
    donutCenter: { position: 'absolute', textAlign: 'center' },
    donutTotal: { fontSize: '1.5rem', fontWeight: '700', color: '#0f172a' },
    donutLabel: { fontSize: '0.75rem', color: '#64748b' },
    legend: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '20px' },
    legendItem: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', color: '#64748b' },
    dot: (color) => ({ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: color }),

    requestsRow: { display: 'grid', gridTemplateColumns: '1fr', gap: '24px', marginBottom: '24px' },
    
    gapRow: { marginBottom: '20px' },
    gapHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.75rem', fontWeight: '600', color: '#94a3b8', textTransform: 'uppercase' },
    barContainer: { height: '32px', backgroundColor: '#f1f5f9', borderRadius: '4px', position: 'relative', overflow: 'hidden' },
    barFill: (width) => ({ height: '100%', width: width, backgroundColor: '#0e7490', position: 'absolute', left: 0 }),
  };

  if (loading) {
    return (
      <div style={styles.layout}>
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div style={styles.content}>
          <Navbar />
          <main style={styles.main}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
              <Loader2 className="animate-spin" size={48} color="#0e7490" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  const totalPieValue = pieData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={styles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div style={styles.content}>
        <Navbar />
        
        <main style={styles.main}>
          <div style={styles.container}>
            
            <div style={styles.header}>
              <div>
                <h1 style={styles.title}>Analytics & Reports Summary</h1>
                <span style={styles.lastUpdated}>
                  <RefreshCw size={14} /> Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>
              <div style={styles.headerActions}>
                <button style={styles.dateButton}>
                  <Calendar size={16} /> Last 6 Months
                </button>
                <button style={styles.refreshButton} onClick={fetchAnalyticsData}>
                  <RefreshCw size={16} />
                  Refresh Data
                </button>
              </div>
            </div>

            {/* KPI Cards */}
            <div style={styles.kpiGrid}>
              {[
                { label: 'Total Donations (6mo)', value: kpiData.totalDonations, badge: '', pos: true, color: '#0e7490', pct: '75%' },
                { label: 'Inventory Health', value: `${kpiData.inventoryHealth}%`, badge: '', pos: true, color: '#10b981', pct: `${kpiData.inventoryHealth}%` },
                { label: 'Critical Stock Items', value: kpiData.unmetRequests, badge: '', pos: false, color: '#ef4444', pct: '15%' },
                { label: 'Active Donors', value: kpiData.activeDonors, badge: '', pos: true, color: '#3b82f6', pct: '60%' },
              ].map((kpi, i) => (
                <div key={i} style={styles.kpiCard}>
                  <p style={styles.kpiLabel}>{kpi.label}</p>
                  <div style={styles.kpiRow}>
                    <span style={styles.kpiValue}>{kpi.value}</span>
                  </div>
                  <div style={styles.progressBarBg}>
                    <div style={styles.progressBarFill(kpi.color, kpi.pct)}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Section */}
            <div style={styles.chartsRow}>
              {/* Donation Trends */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Donation Trends</h3>
                    <p style={styles.cardSubtitle}>Monthly breakdown of collection performance</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={styles.dot('#0e7490')}></div> Total</span>
                    <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}><div style={styles.dot('#2dd4bf')}></div> Successful</span>
                  </div>
                </div>
                <div style={{ height: '300px', width: '100%' }}>
                  {trendData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={trendData}>
                        <defs>
                          <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0e7490" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#0e7490" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                        <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                        <Area type="monotone" dataKey="total" stroke="#0e7490" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                        <Area type="monotone" dataKey="successful" stroke="#2dd4bf" strokeWidth={3} fillOpacity={0} fill="transparent" />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
                      No trend data available
                    </div>
                  )}
                </div>
              </div>

              {/* Inventory Mix */}
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Inventory Mix</h3>
                    <p style={styles.cardSubtitle}>Stock levels by blood type</p>
                  </div>
                </div>
                <div style={styles.donutContainer}>
                  {pieData.length > 0 ? (
                    <>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            innerRadius={80}
                            outerRadius={100}
                            paddingAngle={5}
                            dataKey="value"
                            startAngle={90}
                            endAngle={-270}
                          >
                            {pieData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div style={styles.donutCenter}>
                        <div style={styles.donutTotal}>{totalPieValue}%</div>
                        <div style={styles.donutLabel}>TOTAL</div>
                      </div>
                    </>
                  ) : (
                    <div style={{ color: '#64748b' }}>No distribution data</div>
                  )}
                </div>
                <div style={styles.legend}>
                  {pieData.map((item, i) => (
                    <div key={i} style={styles.legendItem}>
                      <div style={styles.dot(item.color)}></div>
                      <span>{item.name} • {item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Requests vs Donations */}
            <div style={styles.requestsRow}>
              <div style={styles.chartCard}>
                <div style={styles.cardHeader}>
                  <div>
                    <h3 style={styles.cardTitle}>Requests vs. Donations</h3>
                    <p style={styles.cardSubtitle}>Volume gap analysis per month</p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px', fontSize: '12px' }}>
                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={styles.dot('#f1f5f9')}></div> Requested</span>
                    <span style={{display: 'flex', alignItems: 'center', gap: '4px'}}><div style={styles.dot('#0e7490')}></div> Donated</span>
                  </div>
                </div>
                <div>
                  {gapData.length > 0 ? gapData.map((item, i) => (
                    <div key={i} style={styles.gapRow}>
                      <div style={styles.gapHeader}>
                        <span>{item.month}</span>
                        <span style={{ color: item.status === 'deficit' ? '#ef4444' : '#0e7490' }}>{item.label}</span>
                      </div>
                      <div style={styles.barContainer}>
                         <div style={styles.barFill(`${Math.min((item.donated / (item.requested || 1)) * 100, 100)}%`)}></div>
                      </div>
                    </div>
                  )) : (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                      No comparison data available
                    </div>
                  )}
                </div>
              </div>
            </div>

          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default AnalyticsDashboard;