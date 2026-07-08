# 🩸 AI BLOOD BANK MANAGEMENT SYSTEM - IMPLEMENTATION GUIDE

## 📋 Overview

The **AI Blood Bank Management System** is a full-stack application designed to connect **Donors**, **Hospitals**, and **Administrators** to streamline blood donation schedules, direct peer-to-peer donor matching, hospital request fulfillment, and AI-driven blood inventory demand predictions.

This guide provides the complete setup, architecture details, database schema design, and execution guidelines for both the backend (Flask) and frontend (React + Vite) components.

---

## 🏗️ System Architecture

```
                       ┌──────────────────────┐
                       │    React Frontend    │
                       │    (Vite / CSS)      │
                       └──────────┬───────────┘
                                  │
                                  │ Axios API Calls
                                  ▼
                       ┌──────────────────────┐
                       │    Flask Backend     │
                       │     (Python API)     │
                       └──────────┬───────────┘
                                  │
                                  │ PyMongo Driver
                                  ▼
                       ┌──────────────────────┐
                       │   MongoDB Database   │
                       │    (AIbloodbank)     │
                       └──────────────────────┘
```

---

## 🔧 Step 1: Backend Setup (Flask)

The backend is built with Python 3.9+ and Flask. It uses PyMongo to interact with MongoDB.

### A. Environment Configuration (`config.py`)
Ensure your MongoDB service is running locally on port `27017` or configured via env variables.
The database name defaults to `AIbloodbank`.
A custom `MongoJSONProvider` handles automatic JSON serialization of MongoDB `ObjectId` types.

### B. Installation Steps
1. Navigate to the backend folder:
   ```bash
   cd back
   ```
2. Create and activate a Python virtual environment:
   ```bash
   # On Windows:
   python -m venv venv
   venv\Scripts\activate

   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate
   ```
3. Install required dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run the development server:
   ```bash
   python app.py
   ```
   The Flask server will start at `http://127.0.0.1:5000`.

5. Verify Database connectivity by navigating to:
   `http://127.0.0.1:5000/test-db`
   Expected response:
   ```json
   {
     "status": "success",
     "message": "MongoDB connected successfully!"
   }
   ```

---

## 🎨 Step 2: Frontend Setup (React)

The frontend is built using React 19, Vite, React Router DOM v7, Framer Motion, and Recharts.

### A. Configuration (`src/services/api.jsx`)
All API calls are centralized in `src/services/api.jsx`. It targets `http://localhost:5000` as the API base URL.

### B. Installation Steps
1. Open a second terminal window and navigate to the frontend folder:
   ```bash
   cd blood
   ```
2. Install the Node packages:
   ```bash
   npm install
   ```
3. Start the Vite React development server:
   ```bash
   npm run dev
   ```
   The frontend will run at `http://localhost:5173`.

---

## 📊 Step 3: MongoDB Database Schema

The database name is `AIbloodbank`. The system tracks data across the following main collections:

### 1. `login`
Contains credentials and roles for all system users (admins, hospitals, donors).
```json
{
  "_id": ObjectId,
  "username": "john_doe",
  "password": "hashed_or_plain_password",
  "usertype": "donor | hospital | admin"
}
```

### 2. `users`
Profiles for individual users (donors and administrators), linked to the login collection.
```json
{
  "_id": ObjectId,
  "name": "John Doe",
  "email": "john@example.com",
  "contact": "1234567890",
  "address": "123 Main St, New York",
  "usertype": ObjectId  // References login._id
}
```

### 3. `donors`
Extended medical profile details for donors.
```json
{
  "_id": ObjectId,
  "userId": ObjectId,   // References users._id
  "bloodGroup": "O+",
  "age": 28,
  "gender": "Male",
  "eligible": true
}
```

### 4. `hospitals`
Registered hospital profiles that can request or stock blood units.
```json
{
  "_id": ObjectId,
  "loginId": ObjectId,  // References login._id
  "name": "General Hospital",
  "email": "general@hospitals.org",
  "phone": "9876543210",
  "address": "456 Healthcare Blvd",
  "licenseNumber": "HOSP-991",
  "hasBloodBank": true,
  "fridgeCapacity": "500L",
  "createdAt": ISODate
}
```

### 5. `blood_inventory`
Details on current blood stock batches.
```json
{
  "_id": ObjectId,
  "bloodGroup": "O+",
  "volume_ml": 700,             // 350ml = 1 Unit
  "status": "available | used",
  "hospitalId": ObjectId,       // Owner hospital (if applicable)
  "collectionDate": ISODate,
  "expiryDate": ISODate,
  "createdAt": ISODate
}
```

### 6. `requesthospital`
Blood replenishment requests placed by hospitals to the system admin.
```json
{
  "_id": ObjectId,
  "hospitalLoginId": ObjectId,  // References login._id
  "hospitalName": "General Hospital",
  "bloodGroup": "A-",
  "units": 5,
  "urgency": "Normal | Critical",
  "notes": "Emergency surgeries scheduled",
  "status": "pending | approved | fulfilled",
  "createdAt": ISODate
}
```

### 7. `donation_schedule`
Donation bookings scheduled by donors at donation camp locations.
```json
{
  "_id": ObjectId,
  "donorLoginId": ObjectId,     // References login._id
  "donorName": "John Doe",
  "locationId": "loc_123",
  "locationName": "Central Blood Camp",
  "bloodGroup": "O+",
  "date": "2026-07-20",
  "time": "10:30 AM",
  "status": "scheduled | completed | no-show",
  "completedAt": ISODate
}
```

### 8. `direct_donations`
Peer-to-peer direct blood request listings created by donors for emergencies.
```json
{
  "_id": ObjectId,
  "donorLoginId": ObjectId,     // Request creator references login._id
  "recipientName": "Jane Patient",
  "recipientBloodGroup": "AB-",
  "recipientContact": "555-0199",
  "requestReason": "Accident trauma surgery",
  "urgency": "Critical",
  "status": "pending | accepted | completed",
  "acceptedBy": ObjectId,       // References login._id (donor who accepted)
  "createdAt": ISODate
}
```

### 9. `locations`
Locations of donation camps or blood centers managed by the admin.
```json
{
  "_id": ObjectId,
  "name": "Downtown Community Center",
  "address": "789 Broadway",
  "city": "New York",
  "coordinates": {
    "lat": 40.7128,
    "lng": -74.0060
  },
  "critical_needs": ["O-", "A-"], // Blood types camps need urgently
  "isActive": true,
  "createdAt": ISODate
}
```

### 10. `notifications`
Alerts triggered for donors based on critical local demands or requests.
```json
{
  "_id": ObjectId,
  "donorId": ObjectId,          // References donors._id
  "message": "URGENT: A- blood needed at General Hospital",
  "type": "blood_request | direct_donation",
  "requestId": ObjectId,        // References requesthospital._id or direct_donations._id
  "isRead": false,
  "createdAt": ISODate
}
```

---

## 🔮 Step 4: AI & Core Algorithm Implementation

The system features two key intelligent components:

### A. Blood Compatibility Matching Algorithm
Determines compatibility between donors and recipients.
```python
BLOOD_COMPATIBILITY = {
    "A+": ["A+", "A-", "O+", "O-"],
    "A-": ["A-", "O-"],
    "B+": ["B+", "B-", "O+", "O-"],
    "B-": ["B-", "O-"],
    "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],  # Universal recipient
    "AB-": ["A-", "B-", "AB-", "O-"],
    "O+": ["O+", "O-"],
    "O-": ["O-"]  # Universal donor
}
```

### B. AI-Driven Blood Demand Forecasting Algorithm
Runs on the backend route `GET /admin/blood-demand/predict`.
1. **Analyze Historical Usage**: Fetches all fulfilled requests over the last 90 days.
2. **Calculate Daily & Monthly Averages**: Computes average monthly consumption per blood type.
3. **Seasonal Demand Modeling**: Multiplies demand by a factor of `1.2x` in high-accident/influenza seasons (November, December, January, February).
4. **Incorporate Pipeline Factors**: Adds active pending hospital requests.
5. **Formulate Recommended Action & Status**:
   - `predicted_demand = (monthly_average * seasonal_factor) + pending_requests`
   - `inventory_gap = predicted_demand - current_stock`
   - Generates prioritized warnings: `"CRITICAL SHORTAGE"`, `"SHORTAGE WARNING"`, `"LOW STOCK"`, `"ADEQUATE"`, or `"SURPLUS"`.

---

## 🧪 Step 5: End-to-End Testing Checklist

### 1. Registration & Authentication
- [ ] Sign up a new donor on the frontend (`/signup`).
- [ ] Check MongoDB collections `login`, `users`, and `donors` to ensure all 3 linked documents were created properly.
- [ ] Log in as Admin, Hospital, and Donor to verify that the credentials match and direct each user type to their correct dashboard.

### 2. Admin Workflows
- [ ] Open the Admin Dashboard and verify that the KPI metrics load correctly.
- [ ] Access the "AI Prediction" tool. Ensure recommendations and priority flags show up based on mock database records.
- [ ] Create a blood donation camp location (`/admin/inventory`) and list specific critical blood needs.
- [ ] Verify that a pending hospital blood request shows up on the requests table. Click "Process", select eligible matching donors, and send alerts.

### 3. Hospital Workflows
- [ ] Submit a new blood request (`/hospital/request`) with high urgency.
- [ ] Check that it is successfully added to the `requesthospital` collection.
- [ ] Verify that the request is updated in real-time on the status tracker.
- [ ] Log inventory updates when units are transfused or stored in the local fridge.

### 4. Donor Workflows
- [ ] Verify that scheduled alerts are triggered when matching blood type requests are approved by the admin.
- [ ] Navigate to "Schedule Donation" and confirm that the donor only sees camps looking for their compatible blood group.
- [ ] Schedule a camp appointment and verify it saves to the database.
- [ ] Create a peer-to-peer direct request (`/donor/direct-requests`) and verify that other compatible donors can view and accept it.

---

## 💡 Troubleshooting & FAQs

* **Issue: "Object of type ObjectId is not JSON serializable"**
  * *Fix*: Ensure Flask uses the custom JSON encoder registered in `app.py`: `app.json_provider_class = MongoJSONProvider`. Do not convert ObjectIds to string manually inside search routines if they are used as references in query inputs.
* **Issue: CORS Block on API Requests**
  * *Fix*: Check that `flask-cors` configuration allows origin `http://localhost:5173` with credentials support.
* **Issue: Camps not appearing on Donor schedule page**
  * *Fix*: The donor scheduler filters camp locations based on the donor's compatibility. Check if the camp's `critical_needs` list includes the donor's blood type.