import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Loader, Calendar, Clock, Droplet, ClipboardList, Activity, CheckCircle, UserCheck, UserMinus } from 'lucide-react';
import { getAllBloodRequests, getBasicAppointments, completeAppointmentWithAttendance } from '../../../services/api';

const RequestStatus = () => {
  const [activeTab, setActiveTab] = useState('requests');
  const [requests, setRequests] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Track attendance selection per row: { appointmentId: 'arrived' | 'no-show' }
  const [attendance, setAttendance] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const reqRes = await getAllBloodRequests();
      setRequests(reqRes.data || []);

      // 🔥 CRITICAL FIX: Use login_id for fetching appointments
      // The backend filters by 'locationId' which we've linked to hospitalLoginId
      const locationId = localStorage.getItem("login_id");

      if (locationId && locationId !== "undefined") {
        const appRes = await getBasicAppointments(locationId);
        const sanitized = (appRes.data || []).map(app => ({
          ...app,
          bloodGroup: app.bloodGroup || "O+",
          date: app.date || "Scheduled",
          time: app.time || "TBD",
          id: app._id || app.id,
          status: (app.status || "scheduled").toLowerCase()
        }));
        setAppointments(sanitized);
      }
    } catch (e) {
      console.error("❌ Data fetch failed:", e);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleAttendanceChange = (appId, value) => {
    setAttendance(prev => ({ ...prev, [appId]: value }));
  };

  const handleConfirmAction = async (appId) => {
    const status = attendance[appId];
    if (!status) {
      alert("Please select attendance status first");
      return;
    }

    const confirmMessage = status === 'no-show'
      ? "Mark this donor as No-Show? This will move the appointment to history."
      : "Verify this donation as completed?";

    if (!window.confirm(confirmMessage)) return;

    try {
      await completeAppointmentWithAttendance(appId, status);
      alert(status === 'arrived' ? "Donation Verified Successfully!" : "Donor marked as No-Show");
      fetchData(); // Refresh list
      // Clear the selection for this appointment
      setAttendance(prev => {
        const updated = { ...prev };
        delete updated[appId];
        return updated;
      });
    } catch (err) {
      console.error("❌ Verification failed:", err);
      alert("Verification failed. Please try again.");
    }
  };

  const filteredData = activeTab === "requests"
    ? requests.filter(r => (r.bloodGroup || "").toLowerCase().includes(searchTerm.toLowerCase()))
    : appointments.filter(a => (a.bloodGroup || "").toLowerCase().includes(searchTerm.toLowerCase()));

  const styles = {
    container: { paddingBottom: '32px' },
    header: { marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    tabContainer: { display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#f1f5f9', padding: '4px', borderRadius: '12px', width: 'fit-content' },
    tab: (active) => ({
      padding: '10px 24px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem', fontWeight: '600',
      backgroundColor: active ? 'white' : 'transparent', color: active ? '#dc2626' : '#64748b',
      boxShadow: active ? '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none', transition: 'all 0.2s ease',
      display: 'flex', alignItems: 'center', gap: '8px'
    }),
    tableCard: { backgroundColor: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden' },
    th: { textAlign: 'left', padding: '16px 24px', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
    td: { padding: '18px 24px', borderBottom: '1px solid #f1f5f9', color: '#334155', fontSize: '0.875rem' },
    badge: (status) => ({
      padding: '4px 12px', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700',
      backgroundColor: status === 'scheduled' || status === 'pending' ? '#dbeafe' :
        status === 'completed' ? '#dcfce7' :
          status === 'no-show' ? '#fee2e2' : '#f1f5f9',
      color: status === 'scheduled' || status === 'pending' ? '#2563eb' :
        status === 'completed' ? '#15803d' :
          status === 'no-show' ? '#991b1b' : '#475569',
      textTransform: 'capitalize'
    }),
    radioGroup: { display: 'flex', gap: '12px' },
    radioLabel: (isSelected, type) => ({
      display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px',
      cursor: 'pointer', fontSize: '0.75rem', fontWeight: '600', transition: '0.2s',
      backgroundColor: isSelected ? (type === 'arrived' ? '#dcfce7' : '#fee2e2') : '#f8fafc',
      color: isSelected ? (type === 'arrived' ? '#15803d' : '#b91c1c') : '#64748b',
      border: `1px solid ${isSelected ? (type === 'arrived' ? '#15803d' : '#b91c1c') : '#e2e8f0'}`
    }),
    updateBtn: (isDisabled) => ({
      padding: '8px 16px', borderRadius: '8px', border: 'none', fontWeight: 'bold', fontSize: '0.75rem',
      backgroundColor: isDisabled ? '#f1f5f9' : '#dc2626', color: isDisabled ? '#94a3b8' : 'white',
      cursor: isDisabled ? 'not-allowed' : 'pointer', transition: '0.2s'
    })
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: '800', color: '#1e293b', margin: 0 }}>Logistics Overview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'white', padding: '10px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <Search size={18} color="#94a3b8" />
          <input type="text" placeholder="Filter blood type..." style={{ border: 'none', outline: 'none', fontSize: '0.875rem', width: '220px' }} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div style={styles.tabContainer}>
        <div style={styles.tab(activeTab === 'requests')} onClick={() => { setActiveTab('requests'); setSearchTerm(''); }}>
          <Droplet size={16} /> Blood Requests
        </div>
        <div style={styles.tab(activeTab === 'appointments')} onClick={() => { setActiveTab('appointments'); setSearchTerm(''); }}>
          <Calendar size={16} /> Scheduled Appointments
        </div>
      </div>

      <div style={styles.tableCard}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            {activeTab === 'requests' ? (
              <tr>
                <th style={styles.th}>Blood Type</th>
                <th style={styles.th}>Quantity</th>
                <th style={styles.th}>Urgency</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Date</th>
              </tr>
            ) : (
              <tr>
                <th style={styles.th}>Donor Name</th>
                <th style={styles.th}>Blood Type</th>
                <th style={styles.th}>Schedule</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Attendance Verification</th>
                <th style={styles.th}>Action</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}><Loader className="animate-spin" size={32} style={{ margin: '0 auto' }} /></td></tr>
            ) : filteredData.length === 0 ? (
              <tr><td colSpan="6" style={{ textAlign: 'center', padding: '60px' }}><ClipboardList size={40} style={{ margin: '0 auto 8px' }} color="#94a3b8" /><p>No records found.</p></td></tr>
            ) : (
              filteredData.map((item, i) => (
                <motion.tr key={item.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  {activeTab === 'requests' ? (
                    <>
                      <td style={styles.td}><b>{item.bloodGroup}</b></td>
                      <td style={styles.td}>{item.units} Units</td>
                      <td style={{ ...styles.td, color: item.urgency === 'Critical' ? '#dc2626' : '#334155' }}>{item.urgency}</td>
                      <td style={styles.td}><span style={styles.badge(item.status)}>{item.status}</span></td>
                      <td style={styles.td}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "-"}</td>
                    </>
                  ) : (
                    <>
                      <td style={styles.td}><b>{item.donorName || 'N/A'}</b></td>
                      <td style={styles.td}><b>{item.bloodGroup}</b></td>
                      <td style={styles.td}>
                        <div style={{ fontSize: '0.8rem' }}>{item.date}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.time}</div>
                      </td>
                      <td style={styles.td}><span style={styles.badge(item.status)}>{item.status}</span></td>
                      <td style={styles.td}>
                        {item.status === 'scheduled' ? (
                          <div style={styles.radioGroup}>
                            <label style={styles.radioLabel(attendance[item.id] === 'arrived', 'arrived')}>
                              <input type="radio" name={`attend-${item.id}`} value="arrived" hidden onChange={() => handleAttendanceChange(item.id, 'arrived')} />
                              <UserCheck size={14} /> Arrived
                            </label>
                            <label style={styles.radioLabel(attendance[item.id] === 'no-show', 'no-show')}>
                              <input type="radio" name={`attend-${item.id}`} value="no-show" hidden onChange={() => handleAttendanceChange(item.id, 'no-show')} />
                              <UserMinus size={14} /> No Show
                            </label>
                          </div>
                        ) : item.status === 'completed' ? (
                          <div style={{ color: '#15803d', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold' }}>
                            <CheckCircle size={16} /> Verified
                          </div>
                        ) : (
                          <div style={{ color: '#991b1b', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 'bold', fontSize: '0.75rem' }}>
                            <UserMinus size={16} /> Did Not Show
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        {item.status === 'scheduled' && (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            disabled={!attendance[item.id]}
                            style={styles.updateBtn(!attendance[item.id])}
                            onClick={() => handleConfirmAction(item.id)}
                          >
                            Update
                          </motion.button>
                        )}
                      </td>
                    </>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RequestStatus;