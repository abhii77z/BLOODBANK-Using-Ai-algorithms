import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from '../component/sidebar.jsx';
import Navbar from '../component/navbar.jsx';
import Footer from '../component/footer.jsx';
import {
  Search, Filter, ArrowUpDown, Download, UserPlus, MoreHorizontal,
  ChevronLeft, ChevronRight, Users, Heart, Activity, Clock,
  X, Building2, Edit
} from 'lucide-react';

const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
});

const ManageUsers = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- Modals State ---
  const [isHospitalModalOpen, setIsHospitalModalOpen] = useState(false);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // --- FORMS STATE ---
  const [hospitalForm, setHospitalForm] = useState({
    username: '', password: '', name: '', email: '', phone: '', address: '',
    licenseNumber: '', website: '', hasBloodBank: false, bbLicense: '', fridgeCapacity: ''
  });

  const [userForm, setUserForm] = useState({
    username: '', password: '', fullName: '', email: '', phone: '', address: '',
    bloodGroup: '', age: '', gender: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      let endpoint = activeTab === 'users' ? '/users' : '/hospitals';
      const res = await api.get(endpoint);
      setTableData(res.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleEditClick = (item) => {
    setEditingItem(item);
    if (activeTab === 'users') {
      setUserForm({
        fullName: item.name || item.fullName,
        email: item.email,
        phone: item.contact || item.phone,
        address: item.address,
        bloodGroup: item.details?.bloodGroup || '',
        age: item.details?.age || '',
        gender: item.details?.gender || ''
      });
    } else {
      setHospitalForm({
        name: item.name,
        email: item.email,
        phone: item.phone,
        address: item.address,
        licenseNumber: item.licenseNumber,
        website: item.website || '',
        hasBloodBank: item.hasBloodBank || false,
        bbLicense: item.bbLicense || '',
        fridgeCapacity: item.fridgeCapacity || ''
      });
    }
    setIsEditModalOpen(true);
  };

  const handleAddHospital = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register-hospital', hospitalForm);
      alert("Hospital Registered Successfully!");
      setIsHospitalModalOpen(false);
      setHospitalForm({
        username: '', password: '', name: '', email: '', phone: '', address: '',
        licenseNumber: '', website: '', hasBloodBank: false, bbLicense: '', fridgeCapacity: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const handleAddDonor = async (e) => {
    e.preventDefault();
    try {
      await api.post('/register', userForm);
      alert("Donor Registered Successfully!");
      setIsUserModalOpen(false);
      setUserForm({
        username: '', password: '', fullName: '', email: '', phone: '', address: '',
        bloodGroup: '', age: '', gender: ''
      });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || "Registration failed");
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      if (activeTab === 'users') {
        const payload = { ...userForm };
        await api.put(`/update-donor-profile/${editingItem.usertype}`, payload);
        alert("Donor Updated Successfully!");
      } else {
        await api.post(`/settings/${editingItem.loginId}`, hospitalForm);
        alert("Hospital Updated Successfully!");
      }
      setIsEditModalOpen(false);
      setEditingItem(null);
      fetchData();
    } catch (err) {
      alert("Update failed. Please check console.");
    }
  };

  // Reuse your existing handlers
  const handleHospitalChange = (e) => {
    const { name, value, type, checked } = e.target;
    setHospitalForm({ ...hospitalForm, [name]: type === 'checkbox' ? checked : value });
  };

  const handleUserChange = (e) => {
    const { name, value } = e.target;
    setUserForm({ ...userForm, [name]: value });
  };

  const styles = {
    layout: { display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: 'Inter, sans-serif' },
    content: { flex: 1, display: 'flex', flexDirection: 'column', overflowX: 'hidden' },
    main: { flex: 1, padding: '32px', overflowY: 'auto' },
    container: { maxWidth: '1400px', margin: '0 auto' },
    headerTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' },
    title: { fontSize: '1.875rem', fontWeight: '800', color: '#0f172a' },
    tabContainer: { display: 'flex', gap: '20px', borderBottom: '1px solid #e2e8f0', marginBottom: '24px' },
    tabBtn: (isActive) => ({
      padding: '12px 20px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', background: 'none',
      color: isActive ? '#0f172a' : '#64748b', borderBottom: isActive ? '3px solid #0f172a' : '3px solid transparent',
      border: 'none', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: '8px'
    }),
    actionButtons: { display: 'flex', gap: '12px' },
    btnBase: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', border: 'none', borderRadius: '12px', cursor: 'pointer', color: '#fff', fontWeight: '700' },
    tableCard: { backgroundColor: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
    th: { padding: '16px 24px', backgroundColor: '#f8fafc', fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' },
    td: { padding: '16px 24px', borderBottom: '1px solid #f1f5f9' },
    modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
    modalContent: { backgroundColor: '#fff', borderRadius: '20px', width: '100%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', width: '100%' },
    submitBtn: { width: '100%', padding: '14px', backgroundColor: '#0f172a', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: '700', cursor: 'pointer', marginTop: '20px' }
  };

  return (
    <div style={styles.layout}>
      <Sidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab)} />
      <div style={styles.content}>
        <Navbar />
        <main style={styles.main}>
          <div style={styles.container}>
            <div style={styles.headerTop}>
              <div>
                <h2 style={styles.title}>System Management</h2>
                <p style={{ color: '#64748b' }}>Manage donors, hospitals, and access.</p>
              </div>
              <div style={styles.actionButtons}>
                <button style={{ ...styles.btnBase, backgroundColor: '#0f172a' }} onClick={() => setIsHospitalModalOpen(true)}><Building2 size={20} /> Add Hospital</button>
                <button style={{ ...styles.btnBase, backgroundColor: '#dc2626' }} onClick={() => setIsUserModalOpen(true)}><UserPlus size={20} /> Add Donor</button>
              </div>
            </div>

            <div style={styles.tabContainer}>
              <button style={styles.tabBtn(activeTab === 'users')} onClick={() => setActiveTab('users')}><Users size={18} /> Donors</button>
              <button style={styles.tabBtn(activeTab === 'hospitals')} onClick={() => setActiveTab('hospitals')}><Building2 size={18} /> Hospitals</button>
            </div>

            <section style={styles.tableCard}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Name</th>
                    <th style={styles.th}>Email</th>
                    <th style={styles.th}>Phone</th>
                    {activeTab === 'users' ? (<><th style={styles.th}>Blood</th><th style={styles.th}>Age</th></>) : (<><th style={styles.th}>License</th><th style={styles.th}>Bank?</th></>)}
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (<tr><td colSpan="6" style={{ textAlign: 'center', padding: '20px' }}>Loading...</td></tr>) :
                    tableData.map((item) => (
                      <tr key={item._id}>
                        <td style={styles.td}><strong>{item.name || item.fullName}</strong></td>
                        <td style={styles.td}>{item.email}</td>
                        <td style={styles.td}>{item.phone || item.contact}</td>
                        {activeTab === 'users' ? (
                          <><td style={{ ...styles.td, color: '#dc2626' }}>{item.details?.bloodGroup || 'N/A'}</td><td style={styles.td}>{item.details?.age || 'N/A'}</td></>
                        ) : (
                          <><td style={styles.td}>{item.licenseNumber}</td><td style={styles.td}>{item.hasBloodBank ? 'Yes' : 'No'}</td></>
                        )}
                        <td style={styles.td}>
                          <button onClick={() => handleEditClick(item)} style={{ border: 'none', background: '#f1f5f9', padding: '8px', borderRadius: '8px', cursor: 'pointer' }}><Edit size={16} /></button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </section>
          </div>
        </main>
        <Footer />
      </div>

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
              <h3>Edit {activeTab === 'users' ? 'Donor' : 'Hospital'}</h3>
              <X onClick={() => setIsEditModalOpen(false)} style={{ cursor: 'pointer' }} />
            </div>
            <form style={{ padding: '32px' }} onSubmit={handleUpdate}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {activeTab === 'users' ? (
                  <>
                    <input name="fullName" value={userForm.fullName} style={styles.input} onChange={handleUserChange} placeholder="Name" />
                    <input name="phone" value={userForm.phone} style={styles.input} onChange={handleUserChange} placeholder="Phone" />
                    <input name="bloodGroup" value={userForm.bloodGroup} style={styles.input} onChange={handleUserChange} placeholder="Blood Group" />
                    <input name="age" value={userForm.age} style={styles.input} onChange={handleUserChange} placeholder="Age" />
                  </>
                ) : (
                  <>
                    <input name="name" value={hospitalForm.name} style={styles.input} onChange={handleHospitalChange} placeholder="Hospital Name" />
                    <input name="licenseNumber" value={hospitalForm.licenseNumber} style={styles.input} onChange={handleHospitalChange} placeholder="License" />
                    <input name="phone" value={hospitalForm.phone} style={styles.input} onChange={handleHospitalChange} placeholder="Phone" />
                    <input name="address" value={hospitalForm.address} style={styles.input} onChange={handleHospitalChange} placeholder="Address" />
                  </>
                )}
              </div>
              <button type="submit" style={styles.submitBtn}>Update Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD HOSPITAL MODAL --- */}
      <RegisterHospitalModal
        isOpen={isHospitalModalOpen}
        onClose={() => setIsHospitalModalOpen(false)}
        form={hospitalForm}
        onChange={handleHospitalChange}
        onSubmit={handleAddHospital}
        styles={styles}
      />

      {/* --- ADD DONOR MODAL --- */}
      <RegisterDonorModal
        isOpen={isUserModalOpen}
        onClose={() => setIsUserModalOpen(false)}
        form={userForm}
        onChange={handleUserChange}
        onSubmit={handleAddDonor}
        styles={styles}
      />
    </div>
  );
};

// --- SUBSIDIARY MODAL COMPONENTS ---

const RegisterHospitalModal = ({ isOpen, onClose, form, onChange, onSubmit, styles }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <h3>Register New Hospital</h3>
          <X onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        <form style={{ padding: '32px' }} onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <input name="username" value={form.username} style={styles.input} onChange={onChange} placeholder="Username" required />
            <input name="password" type="password" value={form.password} style={styles.input} onChange={onChange} placeholder="Password" required />
            <input name="name" value={form.name} style={styles.input} onChange={onChange} placeholder="Hospital Name" required />
            <input name="email" type="email" value={form.email} style={styles.input} onChange={onChange} placeholder="Email" required />
            <input name="phone" value={form.phone} style={styles.input} onChange={onChange} placeholder="Phone" required />
            <input name="licenseNumber" value={form.licenseNumber} style={styles.input} onChange={onChange} placeholder="License Number" required />
            <input name="address" value={form.address} style={styles.input} onChange={onChange} placeholder="Address" required />
            <input name="website" value={form.website} style={styles.input} onChange={onChange} placeholder="Website (Optional)" />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
            <input type="checkbox" name="hasBloodBank" checked={form.hasBloodBank} onChange={onChange} id="hbb" />
            <label htmlFor="hbb">Has dedicated blood bank?</label>
          </div>
          {form.hasBloodBank && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <input name="bbLicense" value={form.bbLicense} style={styles.input} onChange={onChange} placeholder="Blood Bank License" />
              <input name="fridgeCapacity" value={form.fridgeCapacity} style={styles.input} onChange={onChange} placeholder="Fridge Capacity (L)" />
            </div>
          )}
          <button type="submit" style={styles.submitBtn}>Register Hospital</button>
        </form>
      </div>
    </div>
  );
};

const RegisterDonorModal = ({ isOpen, onClose, form, onChange, onSubmit, styles }) => {
  if (!isOpen) return null;
  return (
    <div style={styles.modalOverlay}>
      <div style={styles.modalContent}>
        <div style={{ padding: '24px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
          <h3>Register New Donor</h3>
          <X onClick={onClose} style={{ cursor: 'pointer' }} />
        </div>
        <form style={{ padding: '32px' }} onSubmit={onSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <input name="fullName" value={form.fullName} style={styles.input} onChange={onChange} placeholder="Full Name" required />
            <input name="username" value={form.username} style={styles.input} onChange={onChange} placeholder="Username" required />
            <input name="password" type="password" value={form.password} style={styles.input} onChange={onChange} placeholder="Password" required />
            <input name="email" type="email" value={form.email} style={styles.input} onChange={onChange} placeholder="Email" required />
            <input name="phone" value={form.phone} style={styles.input} onChange={onChange} placeholder="Phone" required />
            <input name="address" value={form.address} style={styles.input} onChange={onChange} placeholder="Address" required />
            <select name="bloodGroup" value={form.bloodGroup} style={styles.input} onChange={onChange} required>
              <option value="">Blood Group</option>
              {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
            <input name="age" type="number" value={form.age} style={styles.input} onChange={onChange} placeholder="Age" required />
            <select name="gender" value={form.gender} style={styles.input} onChange={onChange} required>
              <option value="">Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <button type="submit" style={styles.submitBtn}>Register Donor</button>
        </form>
      </div>
    </div>
  );
};

export default ManageUsers;