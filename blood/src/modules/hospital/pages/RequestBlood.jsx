import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Droplet, AlertTriangle, Save, Loader, Building2 } from 'lucide-react';
import { createBloodRequest } from '../../../services/api'; 

const RequestBlood = () => {
  // 1. State for form data
  const [formData, setFormData] = useState({
    hospitalName: '', // ✅ Added this so it can be edited/sent
    bloodGroup: '', 
    units: '',
    urgency: 'Normal',
    notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // 2. ✅ Auto-fill Hospital Name on Component Load
  useEffect(() => {
    const storedName = localStorage.getItem("username");
    if (storedName) {
      setFormData(prev => ({ ...prev, hospitalName: storedName }));
    }
  }, []);

  // 3. Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // 4. Handle Urgency Selection
  const handleUrgencyClick = (level) => {
    setFormData(prev => ({ ...prev, urgency: level }));
  };

  // 5. Handle Submission
  const handleSubmit = async () => {
    // A. Get SECURE ID from LocalStorage
    const hospitalLoginId = localStorage.getItem("login_id");

    // B. Validation
    if (!hospitalLoginId) {
      setMessage({ type: 'error', text: 'You are not logged in as a hospital.' });
      return;
    }

    // Ensure Hospital Name is filled in (either from auto-fill or manual input)
    if (!formData.hospitalName || !formData.bloodGroup || !formData.units) {
      setMessage({ type: 'error', text: 'Please fill in Hospital Name, Blood Group, and Units.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const payload = {
        hospitalLoginId,       // ✅ ID from LocalStorage (Hidden/Secure)
        hospitalName: formData.hospitalName, // ✅ Name from Input Field (Editable)
        bloodGroup: formData.bloodGroup,
        units: parseInt(formData.units, 10),
        urgency: formData.urgency,
        notes: formData.notes
      };

      await createBloodRequest(payload);
      
      setMessage({ type: 'success', text: 'Blood request submitted successfully!' });
      
      // Reset form (keep hospital name)
      setFormData(prev => ({ 
        ...prev, 
        bloodGroup: '', 
        units: '', 
        urgency: 'Normal', 
        notes: '' 
      }));
      
    } catch (error) {
      console.error("Failed to create request:", error);
      const errorMsg = error.response?.data?.message || 'Failed to submit request.';
      setMessage({ type: 'error', text: errorMsg });
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    container: { maxWidth: '800px', margin: '0 auto' },
    header: { marginBottom: '32px' },
    h1: { fontSize: '1.875rem', fontWeight: '700', color: '#1e293b', marginBottom: '8px' },
    p: { color: '#64748b' },
    form: { backgroundColor: 'white', padding: '32px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' },
    row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' },
    group: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '24px' },
    label: { fontSize: '0.875rem', fontWeight: '600', color: '#334155' },
    input: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none' },
    select: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', backgroundColor: 'white' },
    textarea: { padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '1rem', outline: 'none', minHeight: '100px', resize: 'vertical' },
    btn: {
      width: '100%',
      padding: '14px',
      backgroundColor: loading ? '#94a3b8' : '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1rem',
      fontWeight: '700',
      cursor: loading ? 'not-allowed' : 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '8px'
    },
    message: {
      padding: '12px',
      borderRadius: '8px',
      marginBottom: '24px',
      textAlign: 'center',
      backgroundColor: message.type === 'error' ? '#fef2f2' : '#f0fdf4',
      color: message.type === 'error' ? '#dc2626' : '#16a34a',
      border: `1px solid ${message.type === 'error' ? '#fca5a5' : '#86efac'}`
    }
  };

  const urgencyLevels = ['Normal', 'High', 'Critical'];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.h1}>New Blood Request</h1>
        <p style={styles.p}>Create a new request for blood units to the central database.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={styles.form}
      >
        {message.text && (
          <div style={styles.message}>
            {message.text}
          </div>
        )}

        {/* ✅ NEW: Hospital Name Input */}
        <div style={styles.group}>
            <label style={styles.label}>Hospital Name</label>
            <div style={{position: 'relative'}}>
                <input 
                  type="text" 
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  placeholder="Enter Hospital Name" 
                  style={{...styles.input, width: '100%', boxSizing: 'border-box', paddingLeft: '40px'}} 
                />
                <Building2 size={20} color="#94a3b8" style={{position: 'absolute', left: '10px', top: '12px'}}/>
            </div>
        </div>

        <div style={styles.row}>
          <div style={styles.group}>
            <label style={styles.label}>Blood Group</label>
            <select 
              name="bloodGroup"
              value={formData.bloodGroup}
              onChange={handleChange}
              style={styles.select}
            >
              <option value="">Select Group</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
            </select>
          </div>
          <div style={styles.group}>
            <label style={styles.label}>Units Required</label>
            <input 
              type="number" 
              name="units"
              value={formData.units}
              onChange={handleChange}
              placeholder="e.g. 5" 
              style={styles.input} 
            />
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Urgency Level</label>
          <div style={{ display: 'flex', gap: '16px' }}>
            {urgencyLevels.map((level) => {
              const isSelected = formData.urgency === level;
              const isCritical = level === 'Critical';
              
              let borderColor = '#e2e8f0';
              let bgColor = 'white';
              let textColor = '#64748b';

              if (isSelected) {
                if (isCritical) {
                    borderColor = '#ef4444';
                    bgColor = '#fef2f2';
                    textColor = '#dc2626';
                } else {
                    borderColor = '#2563eb';
                    bgColor = '#eff6ff';
                    textColor = '#2563eb';
                }
              }

              return (
                <div 
                  key={level} 
                  onClick={() => handleUrgencyClick(level)}
                  style={{
                    flex: 1,
                    padding: '12px',
                    borderRadius: '8px',
                    border: `2px solid ${borderColor}`,
                    backgroundColor: bgColor,
                    color: textColor,
                    textAlign: 'center',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {isCritical && <AlertTriangle size={16} />}
                  {level}
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.group}>
          <label style={styles.label}>Additional Notes</label>
          <textarea 
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any specific requirements or patient details..." 
            style={styles.textarea}
          ></textarea>
        </div>

        <motion.button 
          whileHover={!loading ? { scale: 1.02 } : {}}
          whileTap={!loading ? { scale: 0.98 } : {}}
          onClick={handleSubmit}
          disabled={loading}
          style={styles.btn}
        >
          {loading ? (
             <><Loader className="animate-spin" size={20} /> Processing...</>
          ) : (
             <><Save size={20} /> Submit Request</>
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RequestBlood;