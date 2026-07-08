import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Droplet, PlusCircle, Loader, ArrowLeft, ShieldCheck, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { addBloodUnit } from '../../../services/api'; 

const AddBlood = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: '',
    volume_ml: '350',
    expiryDate: '',
    notes: ''
  });

  const bloodGroups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"];

  // ✅ REAL-TIME UNIT CALCULATION (350ml = 1 Unit)
  const calculatedUnits = useMemo(() => {
    const ml = parseFloat(formData.volume_ml);
    if (isNaN(ml) || ml <= 0) return 0;
    return (ml / 350).toFixed(1); // Show 1 decimal place (e.g., 2.0)
  }, [formData.volume_ml]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const loginId = localStorage.getItem("login_id");

    if (!loginId || loginId === "null" || loginId === "undefined") {
      alert("Your session has expired. Please log in again.");
      setLoading(false);
      navigate('/login');
      return;
    }

    try {
      const payload = {
        ...formData,
        hospitalLoginId: loginId,
        status: "available",
        collectionDate: new Date().toISOString()
      };

      await addBloodUnit(payload);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/hospital');
      }, 1500);
      
    } catch (error) {
      console.error("Failed to add blood:", error);
      const errorMsg = error.response?.data?.error || "Error adding blood unit.";
      alert(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    pageWrapper: { minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px', fontFamily: "'Inter', sans-serif" },
    container: { width: '100%', maxWidth: '550px', marginTop: '20px' },
    card: { backgroundColor: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' },
    header: { textAlign: 'center', marginBottom: '28px' },
    iconCircle: { width: '56px', height: '56px', backgroundColor: success ? '#d1fae5' : '#fee2e2', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', color: success ? '#059669' : '#dc2626', transition: 'all 0.3s' },
    formGroup: { marginBottom: '18px' },
    label: { display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#4b5563', marginBottom: '6px' },
    input: { width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.2s' },
    unitBadge: {
      backgroundColor: '#f1f5f9',
      padding: '12px',
      borderRadius: '12px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '18px',
      border: '1px solid #e2e8f0'
    },
    button: { width: '100%', padding: '14px', backgroundColor: success ? '#059669' : '#dc2626', color: 'white', border: 'none', borderRadius: '12px', fontSize: '1rem', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '8px', transition: 'all 0.3s' },
    backBtn: { alignSelf: 'flex-start', background: 'none', border: 'none', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', marginBottom: '16px', fontSize: '0.9rem' }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={styles.card}>
          <div style={styles.header}>
            <div style={styles.iconCircle}>
              {success ? <CheckCircle size={28} /> : <Droplet size={28} fill="#dc2626" />}
            </div>
            <h2 style={{ margin: 0, color: '#1e293b', fontSize: '1.5rem' }}>
              {success ? "Unit Added!" : "Add Blood Unit"}
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.875rem', marginTop: '4px' }}>
              {success ? "Inventory updated successfully." : "Enter volume details to calculate units."}
            </p>
          </div>

          {!success && (
            <form onSubmit={handleSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} style={styles.input} required>
                  <option value="">Select blood type...</option>
                  {bloodGroups.map(bg => <option key={bg} value={bg}>{bg}</option>)}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Volume (ml)</label>
                  <input type="number" name="volume_ml" value={formData.volume_ml} onChange={handleChange} style={styles.input} placeholder="e.g. 700" required />
                </div>
                <div style={{ ...styles.formGroup, flex: 1 }}>
                  <label style={styles.label}>Expiry Date</label>
                  <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleChange} style={styles.input} required />
                </div>
              </div>

              {/* ✅ VISUAL CONVERSION FEEDBACK */}
              <div style={styles.unitBadge}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
                  <Info size={16} />
                  <span style={{ fontSize: '0.85rem' }}>Calculated Inventory Units</span>
                </div>
                <span style={{ fontWeight: '800', color: '#dc2626', fontSize: '1.1rem' }}>
                   {calculatedUnits} {parseFloat(calculatedUnits) === 1 ? 'Unit' : 'Units'}
                </span>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Batch/Reference Notes</label>
                <textarea name="notes" value={formData.notes} onChange={handleChange} placeholder="Optional batch details..." style={{ ...styles.input, height: '60px', resize: 'none' }} />
              </div>

              <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} type="submit" disabled={loading} style={styles.button}>
                {loading ? <Loader className="animate-spin" size={20} /> : <><PlusCircle size={18} /> Confirm Entry</>}
              </motion.button>
            </form>
          )}
        </motion.div>

        <div style={{ marginTop: '20px', padding: '12px 16px', backgroundColor: '#eff6ff', borderRadius: '12px', display: 'flex', gap: '10px', alignItems: 'center', border: '1px solid #dbeafe' }}>
          <ShieldCheck size={18} color="#2563eb" />
          <span style={{ fontSize: '0.75rem', color: '#1e40af', lineHeight: '1.4' }}>
            Standard conversion: <b>350ml = 1 unit</b>. Ensure the donor's weight and health allow for the entered volume.
          </span>
        </div>
      </div>
    </div>
  );
};

export default AddBlood;