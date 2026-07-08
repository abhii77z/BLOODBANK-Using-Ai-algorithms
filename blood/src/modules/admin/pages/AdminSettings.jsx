import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../component/sidebar.jsx'; 
import Navbar from '../component/navbar.jsx';
import Footer from '../component/footer.jsx';
import { 
  User, Building2, Bell, Shield, Phone, Siren, Mail, 
  ShieldCheck, MapPin, CheckCircle, Camera, Loader2 
} from 'lucide-react';

import { 
  getAdminProfile, 
  getHospitalSettings, 
  updateHospitalSettings,
  updateAdminProfile
} from '../../../services/api.jsx';

const AdminSettings = () => {
  const [activeTab, setActiveTab] = useState('profile'); 
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const navigate = useNavigate();

  // STATE
  const [formData, setFormData] = useState({
    hospitalName: '', licenseNumber: '', bbId: '', address: '', 
    city: '', postalCode: '', phone: '', emergencyHotline: '', adminEmail: ''
  });

  const [adminProfile, setAdminProfile] = useState({
    fullName: '', username: '', email: '', phone: '', address: ''
  });
  const [originalProfile, setOriginalProfile] = useState({});

  const getUserId = () => localStorage.getItem("login_id");

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      const userId = getUserId();
      if(!userId) return;

      setFetching(true);
      try {
        if (activeTab === 'hospital') {
          const res = await getHospitalSettings(userId);
          setFormData(res.data);
        }
        
        if (activeTab === 'profile') {
          const res = await getAdminProfile(userId);
          setAdminProfile(res.data);
          setOriginalProfile(res.data); // Save original for comparison
        }
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [activeTab]);

  // HANDLERS
  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const handleProfileChange = (e) => setAdminProfile({ ...adminProfile, [e.target.name]: e.target.value });

  const handleSave = async () => {
    const userId = getUserId();
    if(!userId) return alert("Please log in.");
    
    setLoading(true);
    try {
      if(activeTab === 'hospital') {
        await updateHospitalSettings(userId, formData);
        alert("Hospital settings saved successfully!");
      } else if (activeTab === 'profile') {
        await updateAdminProfile(userId, adminProfile);
        alert("Profile updated successfully!");
        setOriginalProfile(adminProfile); // Update original after save
      } else {
        alert("This section is view-only at the moment.");
      }
    } catch (err) {
      console.error("Save error:", err);
      alert("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const hasChanges = () => {
    if (activeTab === 'profile') {
      return JSON.stringify(adminProfile) !== JSON.stringify(originalProfile);
    }
    return true; // For hospital tab, always enable save
  };

  const colors = {
    primary: '#0f758a', accentRed: '#dc2626', bgLight: '#f9fafb', bgDark: '#111827'
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'hospital', label: 'Hospital Info', icon: Building2 },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  const styles = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
    main: { flex: 1, padding: '32px', overflowY: 'auto' },
    container: { maxWidth: '1200px', margin: '0 auto', paddingBottom: '80px' },
    header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' },
    title: { fontSize: '2.25rem', fontWeight: '900', color: '#0f172a', margin: 0, letterSpacing: '-0.025em' },
    subtitle: { fontSize: '1.125rem', color: '#64748b', marginTop: '8px' },
    headerActions: { display: 'flex', gap: '12px' },
    btnCancel: { padding: '10px 24px', borderRadius: '8px', border: '1px solid #e2e8f0', backgroundColor: 'transparent', fontWeight: '700', color: '#475569', cursor: 'pointer' },
    btnSave: (disabled) => ({ 
      padding: '10px 24px', borderRadius: '8px', border: 'none', 
      backgroundColor: disabled ? '#94a3b8' : colors.accentRed, 
      color: '#fff', fontWeight: '700', 
      boxShadow: disabled ? 'none' : `0 10px 15px -3px ${colors.accentRed}33`, 
      cursor: disabled ? 'not-allowed' : 'pointer', 
      display: 'flex', alignItems: 'center', gap: '8px', 
      opacity: loading ? 0.7 : 1 
    }),
    tabContainer: { display: 'flex', gap: '24px', borderBottom: '1px solid #e2e8f0', marginBottom: '32px', overflowX: 'auto' },
    tabBtn: (isActive) => ({ padding: '16px 8px', background: 'none', border: 'none', borderBottom: isActive ? `2px solid ${colors.primary}` : '2px solid transparent', color: isActive ? colors.primary : '#64748b', fontWeight: '700', fontSize: '0.875rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }),
    grid: { display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '32px' },
    colLeft: { gridColumn: 'span 7', display: 'flex', flexDirection: 'column', gap: '32px' },
    colRight: { gridColumn: 'span 5', display: 'flex', flexDirection: 'column', gap: '32px' },
    fullWidth: { gridColumn: '1 / -1' },
    card: { backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '32px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    cardTitle: { fontSize: '1.25rem', fontWeight: '700', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', color: '#0f172a' },
    pill: { width: '6px', height: '24px', borderRadius: '99px', backgroundColor: colors.primary },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
    formGroup: (fullWidth) => ({ gridColumn: fullWidth ? 'span 2' : 'span 1', display: 'flex', flexDirection: 'column', gap: '8px' }),
    label: { fontSize: '0.875rem', fontWeight: '700', color: '#334155' },
    inputWrapper: { position: 'relative' },
    inputIcon: { position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' },
    input: (hasIcon, readOnly) => ({ 
      width: '100%', padding: hasIcon ? '12px 16px 12px 48px' : '12px 16px', 
      borderRadius: '8px', border: '1px solid #e2e8f0', 
      backgroundColor: readOnly ? '#f8fafc' : '#fff', 
      fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box',
      cursor: readOnly ? 'not-allowed' : 'text'
    }),
    profileHeader: { display: 'flex', alignItems: 'center', gap: '24px', paddingBottom: '32px', borderBottom: '1px solid #f1f5f9', marginBottom: '32px' },
    avatarLarge: { width: '100px', height: '100px', borderRadius: '50%', backgroundColor: colors.primary, color: '#fff', fontSize: '2.5rem', fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
    avatarBadge: { position: 'absolute', bottom: '0', right: '0', backgroundColor: '#fff', padding: '6px', borderRadius: '50%', border: '1px solid #e2e8f0', cursor: 'pointer', color: '#64748b' },
    profileInfo: { display: 'flex', flexDirection: 'column', gap: '4px' },
    profileName: { fontSize: '1.5rem', fontWeight: '800', color: '#0f172a', margin: 0 },
    profileRole: { fontSize: '0.875rem', fontWeight: '600', color: colors.primary, backgroundColor: '#e0f2f1', padding: '4px 12px', borderRadius: '99px', width: 'fit-content' },
    stickyFooter: { position: 'sticky', bottom: '32px', marginTop: '48px', backgroundColor: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(12px)', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }
  };

  const renderContent = () => {
    if (fetching) {
        return <div style={{padding: '100px', textAlign: 'center'}}><Loader2 className="animate-spin" size={48} color={colors.primary} style={{margin:'0 auto'}} /></div>
    }

    if (activeTab === 'profile') {
        return (
            <div style={styles.fullWidth}>
                <div style={styles.card}>
                   <div style={styles.profileHeader}>
                        <div style={styles.avatarLarge}>
                            {adminProfile?.fullName?.charAt(0) || 'A'}
                            <div style={styles.avatarBadge}><Camera size={16}/></div>
                        </div>
                        <div style={styles.profileInfo}>
                            <h3 style={styles.profileName}>{adminProfile?.fullName || 'N/A'}</h3>
                            <span style={styles.profileRole}>{adminProfile?.role || 'Admin'}</span>
                            <span style={{color: '#64748b', fontSize: '0.9rem'}}>{adminProfile?.email}</span>
                        </div>
                   </div>

                   <h3 style={{...styles.cardTitle, fontSize: '1.1rem'}}>Personal Information</h3>
                   <div style={styles.formGrid}>
                        <div style={styles.formGroup(false)}>
                            <label style={styles.label}>Full Name</label>
                            <input 
                              name="fullName"
                              style={styles.input(false, false)} 
                              value={adminProfile?.fullName || ''} 
                              onChange={handleProfileChange}
                            />
                        </div>
                        <div style={styles.formGroup(false)}>
                            <label style={styles.label}>Username</label>
                            <input 
                              name="username"
                              style={styles.input(false, false)} 
                              value={adminProfile?.username || ''} 
                              onChange={handleProfileChange}
                            />
                        </div>
                        <div style={styles.formGroup(false)}>
                            <label style={styles.label}>Email Address</label>
                            <input 
                              name="email"
                              type="email"
                              style={styles.input(false, false)} 
                              value={adminProfile?.email || ''} 
                              onChange={handleProfileChange}
                            />
                        </div>
                        <div style={styles.formGroup(false)}>
                            <label style={styles.label}>Phone Number</label>
                            <input 
                              name="phone"
                              style={styles.input(false, false)} 
                              value={adminProfile?.phone || ''} 
                              onChange={handleProfileChange}
                            />
                        </div>
                        <div style={styles.formGroup(true)}>
                            <label style={styles.label}>Address</label>
                            <input 
                              name="address"
                              style={styles.input(false, false)} 
                              value={adminProfile?.address || ''} 
                              onChange={handleProfileChange}
                            />
                        </div>
                   </div>
                </div>
            </div>
        );
    }

    if (activeTab === 'hospital') {
        return (
            <div style={styles.grid}>
                 <div style={styles.colLeft}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}><span style={styles.pill}></span>Facility Identity</h3>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup(true)}>
                                <label style={styles.label}>Hospital Name</label>
                                <input name="hospitalName" value={formData.hospitalName} onChange={handleChange} style={styles.input(false, false)} />
                            </div>
                            <div style={styles.formGroup(false)}>
                                <label style={styles.label}>License Number</label>
                                <input name="licenseNumber" value={formData.licenseNumber} onChange={handleChange} style={styles.input(false, false)} />
                            </div>
                            <div style={styles.formGroup(false)}>
                                <label style={styles.label}>Blood Bank ID</label>
                                <input name="bbId" value={formData.bbId} onChange={handleChange} style={styles.input(false, false)} />
                            </div>
                        </div>
                    </div>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}><span style={styles.pill}></span>Physical Address</h3>
                        <div style={styles.formGrid}>
                            <div style={styles.formGroup(true)}>
                                <label style={styles.label}>Street Address</label>
                                <input name="address" value={formData.address} onChange={handleChange} style={styles.input(false, false)} />
                            </div>
                            <div style={styles.formGroup(false)}>
                                <label style={styles.label}>City</label>
                                <input name="city" value={formData.city} onChange={handleChange} style={styles.input(false, false)} />
                            </div>
                            <div style={styles.formGroup(false)}>
                                <label style={styles.label}>Postal Code</label>
                                <input name="postalCode" value={formData.postalCode} onChange={handleChange} style={styles.input(false, false)} />
                            </div>
                        </div>
                    </div>
                 </div>

                 <div style={styles.colRight}>
                    <div style={styles.card}>
                        <h3 style={styles.cardTitle}><span style={styles.pill}></span>Contact Details</h3>
                        <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                            <div style={styles.formGroup(true)}>
                                <label style={styles.label}>Primary Phone</label>
                                <div style={styles.inputWrapper}>
                                    <Phone size={20} style={styles.inputIcon} />
                                    <input name="phone" value={formData.phone} onChange={handleChange} style={styles.input(true, false)} />
                                </div>
                            </div>
                            <div style={styles.formGroup(true)}>
                                <label style={styles.label}>Emergency Hotline</label>
                                <div style={styles.inputWrapper}>
                                    <Siren size={20} style={{...styles.inputIcon, color: colors.accentRed}} />
                                    <input name="emergencyHotline" value={formData.emergencyHotline} onChange={handleChange} style={{...styles.input(true, false), backgroundColor: '#fef2f2', borderColor: '#fee2e2', color: colors.accentRed, fontWeight: '700'}} />
                                </div>
                            </div>
                            <div style={styles.formGroup(true)}>
                                <label style={styles.label}>Admin Email</label>
                                <div style={styles.inputWrapper}>
                                    <Mail size={20} style={styles.inputIcon} />
                                    <input name="adminEmail" value={formData.adminEmail} onChange={handleChange} style={styles.input(true, false)} />
                                </div>
                            </div>
                        </div>
                    </div>
                 </div>
            </div>
        );
    }
    
    if (activeTab === 'notifications') {
      return (
        <div style={styles.fullWidth}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><Bell size={24} color={colors.primary} /> Notification Preferences</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Configure how you receive alerts and updates from the system.
            </p>
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Bell size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <p>Notification settings will be available soon.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                Email notifications are enabled by default for critical system alerts.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    if (activeTab === 'security') {
      return (
        <div style={styles.fullWidth}>
          <div style={styles.card}>
            <h3 style={styles.cardTitle}><Shield size={24} color={colors.primary} /> Security Settings</h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Manage your password, two-factor authentication, and security preferences.
            </p>
            <div style={{ padding: '40px', textAlign: 'center', color: '#64748b', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
              <Shield size={48} color="#94a3b8" style={{ margin: '0 auto 16px' }} />
              <p>Security features are coming soon.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '8px' }}>
                Contact system administrator for password reset requests.
              </p>
            </div>
          </div>
        </div>
      );
    }
    
    return <div style={{padding: '40px', textAlign: 'center', color: '#64748b'}}>Additional settings are coming soon.</div>;
  };

  return (
    <div style={styles.layout}>
      <Sidebar />
      <div style={styles.content}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.container}>
            <header style={styles.header}>
              <div>
                <h2 style={styles.title}>System Settings</h2>
                <p style={styles.subtitle}>Configure profile details and facility identity.</p>
              </div>
              <div style={styles.headerActions}>
                <button style={styles.btnCancel} onClick={() => navigate(-1)}>Cancel</button>
                <button 
                  style={styles.btnSave(!hasChanges())} 
                  onClick={handleSave} 
                  disabled={loading || fetching || !hasChanges()}
                >
                   {loading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                   {loading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </header>

            <div style={styles.tabContainer}>
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={styles.tabBtn(activeTab === tab.id)}
                  >
                    <Icon size={20} />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {renderContent()}

            <div style={styles.stickyFooter}>
              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                <ShieldCheck size={20} color={colors.primary} />
                <span style={{fontSize: '0.875rem', fontStyle: 'italic', color: '#64748b'}}>
                  Authenticated Secure Session • Settings last modified: {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AdminSettings;