import axios from "axios";

/* ---------------------------------------
   Axios Instance
--------------------------------------- */
const api = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

/* ---------------------------------------
   Interceptor (Attach Role)
--------------------------------------- */
// api.interceptors.request.use(
//   (config) => {
//     const role = localStorage.getItem("role");
//     if (role) {
//       config.headers.Role = role;
//     }
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

/* ---------------------------------------
   AUTH APIs
--------------------------------------- */


export const loginUser = (data) => api.post("/login", data);


export const registerDonor = (data) => api.post("/register", data);

export const registerHospital = (data) => api.post("/register-hospital", data);

/* ---------------------------------------
   ADMIN APIs
--------------------------------------- */

// 👤 Get all users (Admin)
export const getAllUsers = () => api.get("/users");


// ────────────────────────────────────────────────
// Blood Bank / Inventory
// ────────────────────────────────────────────────



export const getBloodInventorySummary = () => api.get("/blood-inventory/summary");

export const getRecentBloodBatches = (limit = 10) =>
  api.get(`/blood-inventory/batches/recent?limit=${limit}`);





export const createBloodRequest = (data) =>
  api.post("/blood-request", data);

export const getAllBloodRequests = () =>

  api.get("/blood-requests");

  


// Get all registered donation centers
export const getAllLocations = () => api.get("/locations");

// Add a new donation center (Admin)
export const addLocation = (data) => api.post("/admin/add-location", data);


// 🔍 Recommend locations based on donor's blood group
export const getRecommendedLocations = (loginId) => 
  api.get(`/locations/recommend?loginId=${loginId}`);




// ... existing imports

// Find donors matching a blood group
export const findMatchingDonors = (bloodGroup) => 
  api.get(`/admin/find-donors?bloodGroup=${encodeURIComponent(bloodGroup)}`);

// Approve request and notify selected donors
export const processBloodRequest = (data) => 
  api.post("/admin/process-request", data);


// ... existing imports

// 🔔 Get Notifications for Donor
export const getNotifications = (loginId) =>
  api.get("/notifications", {
    params: { loginId },
  });


// 👤 Get Donor Profile
export const getDonorProfile = (loginId) =>
  api.get(`/donor-profile/${loginId}`);


// 📝 Update Donor Profile
export const updateDonorProfile = (loginId, data) => 
  api.put(`/update-donor-profile/${loginId}`, data);


// 🏥 Hospital – View Donation Appointments
// export const getDonationAppointments = (locationId) => {
//   if (!locationId) {
//     console.warn("⚠️ locationId missing in getDonationAppointments");
//     return Promise.resolve({ data: [] });
//   }

//   return api.get("/api/hospital/appointments", {
//     params: { locationId }
//   });
// };

// 1. Create a new donation appointment
export const scheduleDonation = (data) => api.post("/schedule-donation", data);

// 2. Get appointments (used by BOTH Donors and Hospitals)
export const getDonationAppointments = (params) => {
  // params should be { donorLoginId: '...' } OR { locationId: '...' }
  return api.get("/schedule-donation", { params });
};

// 📊 Get simplified appointments for a specific location
// Calls backend: @app.route('/api/appointments/basic')
// 📊 Get simplified appointments for a specific location
export const getBasicAppointments = (locationId) => {
  // Make sure you use backticks ( ` ) here, not single quotes ( ' )
  return api.get(`/api/appointments/basic`, {
    params: { locationId }
  });
};

// 🏥 Hospital Dashboard Data
export const getHospitalDashboardData = (hospitalLoginId) => 
  api.get(`/hospital/dashboard-stats/${hospitalLoginId}`);


export const addBloodUnit = async (data) => {
  try {
    const response = await api.post('/api/blood-inventory/add', data);
    return response.data;
  } catch (error) {
    console.error('Error adding blood unit:', error);
    throw error; // Throw to handle in frontend
  }
};

/* ---------------------------------------
   BLOOD BANK / INVENTORY
--------------------------------------- */
export const getInventorySummary = () => api.get("/blood-inventory/summary");



// Get total count of donors for dashboard stats
export const getTotalDonorCount = () => api.get("/admin/donor-count");


/* ---------------------------------------
   ADMIN & DASHBOARD APIs
--------------------------------------- */


// Fetch Admin Personal Profile
export const getAdminProfile = (loginId) => 
  api.get(`/admin/profile/${loginId}`);

// Handle Hospital Settings (Identity, Address, Contact)
export const getHospitalSettings = (loginId) => 
  api.get(`/settings/${loginId}`);

export const updateHospitalSettings = (loginId, data) => 
  api.post(`/settings/${loginId}`, data);



export const completeAppointment = (id) => api.patch(`/api/appointments/complete/${id}`);// ... existing code ...

/* ---------------------------------------
   NEW INVENTORY & VERIFICATION APIs
--------------------------------------- */

// 📊 Get global inventory units calculated from volume (for Admin Stats Card)
export const getAdminTotalStats = () => api.get("/admin/total-inventory-stats");


// Add this near your completeAppointment export
// export const noShowAppointment = (id) => api.patch(`/api/appointments/no-show/${id}`);



// Attendance Tracking
export const completeAppointmentWithAttendance = (id, attendanceStatus) => 
  api.patch(`/api/appointments/complete/${id}`, { attendanceStatus });

// Predictions
export const getBloodPredictions = () => 
  api.get("/admin/blood-demand/predict");

// Analytics
export const getDonationTrends = () => 
  api.get("/admin/analytics/donation-trends");

export const getBloodTypeDistribution = () => 
  api.get("/admin/analytics/blood-type-distribution");

export const getRequestsVsDonations = () => 
  api.get("/admin/analytics/requests-vs-donations");

// Admin Profile Update
export const updateAdminProfile = (loginId, data) => 
  api.put(`/admin/update-profile/${loginId}`, data);


// Get available requests for a donor (Based on compatibility)
export const getAvailableDirectRequests = (loginId) => 
  api.get(`/api/direct-donation/available?loginId=${loginId}`);

// Respond to a request (Accept/Reject)
export const respondToDirectRequest = (data) => 
  api.post('/api/direct-donation/respond', data);

// Create a new direct request
export const createDirectRequest = (data) => 
  api.post('/api/direct-donation/request', data);


// Get history for a specific donor
export const getDonorHistory = (loginId) => 
  api.get(`/api/donor/history/${loginId}`);

// Get all donors for Admin Database
export const getAllDonors = () => api.get("/admin/all-donors");


// ... existing imports

// 📊 Get Donor Dashboard Stats (Total, Lives Saved, Eligibility)
export const getDonorStats = (loginId) => 
  api.get(`/api/donor/dashboard-stats/${loginId}`);

// ... existing exports
export default api;