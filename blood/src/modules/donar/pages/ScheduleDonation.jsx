import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom'; 
import { Calendar, Clock, MapPin, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import { scheduleDonation, getRecommendedLocations, getDonorProfile } from '../../../services/api';

const ScheduleDonation = () => {
  const { state } = useLocation();
  const [locations, setLocations] = useState([]); 
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState('Today');
  const [selectedTime, setSelectedTime] = useState('09:00 AM');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true); 
  const [message, setMessage] = useState({ type: '', text: '' });

  const dates = ['Today', 'Tomorrow', 'Fri, 24 Oct'];
  const times = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM'];

  useEffect(() => {
    const fetchLocations = async () => {
      const loginId = localStorage.getItem("login_id");
      if (!loginId) {
        setDataLoading(false);
        return; 
      }
      try {
        const res = await getRecommendedLocations(loginId);
        let availableLocations = res.data || [];
        if (state?.preSelectedHospital) {
          const targetName = state.preSelectedHospital;
          const existingLocation = availableLocations.find(l => 
            l.name.toLowerCase().includes(targetName.toLowerCase())
          );
          if (existingLocation) {
            setSelectedLocation(existingLocation._id);
          } else {
            const customOption = {
                _id: 'urgent_request_id',
                name: targetName,
                city: "Urgent Request",
                address: "Verified Hospital Source",
                message: "This location was selected from your notification."
            };
            availableLocations = [customOption, ...availableLocations];
            setSelectedLocation('urgent_request_id');
          }
        } else if (availableLocations.length > 0) {
            setSelectedLocation(availableLocations[0]._id);
        }
        setLocations(availableLocations);
      } catch (err) {
        console.error("Failed to load locations", err);
      } finally {
        setDataLoading(false);
      }
    };
    fetchLocations();
  }, [state]);

  const handleConfirm = async () => {
    const donorLoginId = localStorage.getItem("login_id");
    const donorName = localStorage.getItem("username");

    if (!selectedLocation) {
       setMessage({ type: 'error', text: 'Please select a location.' });
       return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
        // 1. Fetch donor profile
        const profileRes = await getDonorProfile(donorLoginId);
        const bloodGroup = profileRes.data.bloodGroup;

        if (!bloodGroup || bloodGroup === "N/A") {
            throw new Error("Please complete your medical profile with a blood group first.");
        }

        const locationObj = locations.find(l => l._id === selectedLocation);

        const payload = {
            donorLoginId,
            donorName,
            locationId: selectedLocation,
            locationName: locationObj?.name || "Unknown",
            bloodGroup: bloodGroup, 
            date: selectedDate,
            time: selectedTime
        };

        await scheduleDonation(payload);
        
        setMessage({ type: 'success', text: 'Appointment Scheduled Successfully!' });
        setSelectedLocation(null); 
        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        const errMsg = error.response?.data?.error || error.message || "Failed to schedule appointment.";
        setMessage({ type: 'error', text: errMsg });
    } finally {
        setLoading(false);
    }
  };
  
  // ... (Keep your existing styles object)
  const styles = {
    pageWrapper: { width: '100%', minHeight: '100vh', padding: '40px 24px', display: 'flex', justifyContent: 'center', backgroundColor: '#f8fafc', marginLeft: '260px', width: 'calc(100% - 260px)' },
    container: { width: '100%', maxWidth: '800px' },
    header: { textAlign: 'center', marginBottom: '40px' },
    h1: { fontSize: '2.25rem', fontWeight: '800', color: '#111827', marginBottom: '12px' },
    p: { color: '#6b7280', fontSize: '1.1rem' },
    formCard: { backgroundColor: 'white', padding: '40px', borderRadius: '24px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)', border: '1px solid #f3f4f6' },
    section: { marginBottom: '32px' },
    sectionLabel: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.95rem', fontWeight: '700', color: '#374151', marginBottom: '16px' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '16px' },
    optionBox: (isSelected, isUrgent) => ({
      padding: '16px', borderRadius: '16px', border: isSelected ? '2px solid #dc2626' : isUrgent ? '1px dashed #ef4444' : '1px solid #e5e7eb',
      backgroundColor: isSelected ? '#fef2f2' : isUrgent ? '#fff1f2' : 'white', cursor: 'pointer', textAlign: 'center', position: 'relative', transition: 'all 0.2s ease-in-out', transform: isSelected ? 'scale(1.02)' : 'scale(1)',
    }),
    optionText: (isSelected) => ({ fontWeight: '700', color: isSelected ? '#dc2626' : '#4b5563', display: 'block', marginBottom: '4px', fontSize: '0.95rem' }),
    locationRow: { display: 'flex', alignItems: 'center', gap: '16px', justifyContent: 'flex-start', textAlign: 'left' },
    btn: { width: '100%', padding: '18px', backgroundColor: loading ? '#fca5a5' : '#dc2626', color: 'white', border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginTop: '24px' },
    messageBox: { padding: '16px', borderRadius: '12px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px', fontWeight: '500', backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#991b1b' : '#166534' },
    emptyState: { padding: '40px', textAlign: 'center', color: '#6b7280', backgroundColor: '#f9fafb', borderRadius: '16px', border: '1px dashed #d1d5db' }
  };

  return (
    <div style={styles.pageWrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1 style={styles.h1}>Schedule Donation</h1>
          <p style={styles.p}>Help save lives by booking your next appointment.</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={styles.formCard}>
          {message.text && (
            <div style={styles.messageBox}>
                {message.type === 'error' ? <AlertCircle size={20}/> : <CheckCircle size={20}/>}
                {message.text}
            </div>
          )}
          
          <div style={styles.section}>
            <label style={styles.sectionLabel}><MapPin size={18} color="#dc2626" /> Recommended Centers</label>
            {dataLoading ? <p>Loading compatible centers...</p> : locations.length === 0 ? (
                <div style={styles.emptyState}><p>No centers found.</p></div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {locations.map((loc) => (
                    <div key={loc._id} style={styles.optionBox(selectedLocation === loc._id, loc._id === 'urgent_request_id')} onClick={() => setSelectedLocation(loc._id)}>
                        <div style={styles.locationRow}>
                          <MapPin size={24} color={selectedLocation === loc._id ? '#dc2626' : '#9ca3af'} />
                          <div>
                              <span style={styles.optionText(selectedLocation === loc._id)}>{loc.name}</span>
                              <span style={{fontSize: '0.85rem', color: '#6b7280'}}>{loc.city} • {loc.address}</span>
                          </div>
                        </div>
                    </div>
                ))}
                </div>
            )}
          </div>

          <div style={styles.section}>
            <label style={styles.sectionLabel}><Calendar size={18} color="#dc2626" /> Select Date</label>
            <div style={styles.grid}>
              {dates.map((date) => (
                <div key={date} style={styles.optionBox(selectedDate === date, false)} onClick={() => setSelectedDate(date)}>
                  <span style={styles.optionText(selectedDate === date)}>{date}</span>
                </div>
              ))}
            </div>
          </div>

          <div style={styles.section}>
            <label style={styles.sectionLabel}><Clock size={18} color="#dc2626" /> Select Time</label>
            <div style={styles.grid}>
              {times.map((time) => (
                <div key={time} style={styles.optionBox(selectedTime === time, false)} onClick={() => setSelectedTime(time)}>
                  <span style={styles.optionText(selectedTime === time)}>{time}</span>
                </div>
              ))}
            </div>
          </div>

          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} style={styles.btn} onClick={handleConfirm} disabled={loading}>
            {loading ? "Processing..." : "Confirm Appointment"}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
};

export default ScheduleDonation;