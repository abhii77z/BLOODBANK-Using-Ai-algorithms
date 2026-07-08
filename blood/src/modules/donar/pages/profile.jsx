import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, MapPin, Droplets, Calendar, ShieldCheck, Edit3, X, Save } from 'lucide-react';
import { getDonorProfile, updateDonorProfile } from '../../../services/api'; 

const DonorProfile = ({ userId }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const loginId = userId || localStorage.getItem("login_id");

  useEffect(() => {
    if (!loginId || loginId === "null") {
        setLoading(false);
        return;
    }
    fetchProfile();
  }, [loginId]);

  const fetchProfile = () => {
    getDonorProfile(loginId)
      .then(res => {
        setProfile(res.data);
        setEditFormData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("❌ Fetch failed:", err);
        setLoading(false);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await updateDonorProfile(loginId, editFormData);
      
      // 🔥 UPDATE LOCAL STORAGE so Navbar updates immediately
      localStorage.setItem("username", editFormData.fullName);
      window.dispatchEvent(new Event("storage")); 

      alert("Profile updated successfully!");
      setIsEditModalOpen(false);
      fetchProfile(); 
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update profile.");
    }
  };

  // ... (styles same as before)
  const styles = {
    pageWrapper: { padding: '40px 32px', marginLeft: '260px', width: 'calc(100% - 260px)', minHeight: '100vh', backgroundColor: '#f9fafb' },
    container: { maxWidth: '1000px', margin: '0 auto' },
    profileHeader: {
      background: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
      borderRadius: '24px', padding: '40px', color: 'white', display: 'flex', alignItems: 'center', gap: '32px', marginBottom: '32px', boxShadow: '0 10px 25px -5px rgba(220, 38, 38, 0.3)'
    },
    avatarCircle: { width: '120px', height: '120px', borderRadius: '60px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(10px)', border: '4px solid rgba(255,255,255,0.3)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
    modalContent: { backgroundColor: 'white', padding: '32px', borderRadius: '20px', width: '100%', maxWidth: '500px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' },
    inputGroup: { marginBottom: '16px' },
    input: { width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #ddd', marginTop: '4px' },
    label: { fontSize: '0.85rem', fontWeight: '600', color: '#4b5563' }
  };

  if (loading) return <div style={styles.pageWrapper}>Loading Profile...</div>;
  if (!profile) return <div style={styles.pageWrapper}>User profile not found.</div>;

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={styles.profileHeader}>
          <div style={styles.avatarCircle}><User size={60} color="white" /></div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{profile.fullName}</h1>
                {profile.eligible && <span style={{ padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: '700', backgroundColor: '#dcfce7', color: '#166534' }}>Active Donor</span>}
            </div>
            <p style={{ opacity: 0.9, fontSize: '1.1rem', marginTop: '8px' }}>
                Blood Group: <span style={{ fontWeight: '800' }}>{profile.bloodGroup}</span>
            </p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            onClick={() => setIsEditModalOpen(true)}
            style={{ padding: '12px 24px', borderRadius: '12px', border: 'none', backgroundColor: 'white', color: '#dc2626', fontWeight: '700', cursor: 'pointer', display: 'flex', gap: '8px' }}
          >
            <Edit3 size={18} /> Edit Profile
          </motion.button>
        </motion.div>

        <div style={styles.grid}>
          <InfoItem icon={<Mail />} label="Email Address" value={profile.email} />
          <InfoItem icon={<Phone />} label="Phone Number" value={profile.phone} />
          <InfoItem icon={<Calendar />} label="Age & Gender" value={`${profile.age} years / ${profile.gender}`} />
          <InfoItem icon={<MapPin />} label="Residential Address" value={profile.address} />
          <InfoItem icon={<Droplets />} label="Blood Type" value={`${profile.bloodGroup}`} />
          <InfoItem icon={<ShieldCheck />} label="Eligibility Status" value={profile.eligible ? "Eligible to Donate" : "On Standby"} />
        </div>

        <AnimatePresence>
          {isEditModalOpen && (
            <div style={styles.modalOverlay}>
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} style={styles.modalContent}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0 }}>Edit Profile</h2>
                  <X cursor="pointer" onClick={() => setIsEditModalOpen(false)} />
                </div>
                
                <form onSubmit={handleUpdate}>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Full Name</label>
                    <input style={styles.input} name="fullName" value={editFormData.fullName} onChange={handleInputChange} />
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Phone Number</label>
                    <input style={styles.input} name="phone" value={editFormData.phone} onChange={handleInputChange} />
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                      <label style={styles.label}>Age</label>
                      <input style={styles.input} type="number" name="age" value={editFormData.age} onChange={handleInputChange} />
                    </div>
                    <div style={{ ...styles.inputGroup, flex: 1 }}>
                      <label style={styles.label}>Gender</label>
                      <select style={styles.input} name="gender" value={editFormData.gender} onChange={handleInputChange}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div style={styles.inputGroup}>
                    <label style={styles.label}>Address</label>
                    <textarea style={{ ...styles.input, height: '80px' }} name="address" value={editFormData.address} onChange={handleInputChange} />
                  </div>
                  
                  <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '10px' }}>
                    <Save size={18} /> Save Changes
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <motion.div whileHover={{ y: -5 }} style={{ backgroundColor: 'white', padding: '24px', borderRadius: '20px', border: '1px solid #f3f4f6', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
    <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#fff1f2', color: '#dc2626' }}>{icon}</div>
    <div>
      <div style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '4px' }}>{label}</div>
      <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#1f2937' }}>{value}</div>
    </div>
  </motion.div>
);

export default DonorProfile;