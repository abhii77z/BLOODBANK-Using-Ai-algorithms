# 🩸 AI Blood Bank Management System

A full-stack web application that connects **Donors**, **Hospitals**, and **Administrators** to manage blood inventory, handle emergency requests, schedule donations, and predict blood demand using AI-driven analytics.

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Database Schema](#database-schema)
- [Installation & Setup](#installation--setup)
- [How It Works — Complete Flow](#how-it-works--complete-flow)
  - [1. Authentication Flow](#1-authentication-flow)
  - [2. Admin Flow](#2-admin-flow)
  - [3. Hospital Flow](#3-hospital-flow)
  - [4. Donor Flow](#4-donor-flow)
- [API Reference](#api-reference)
- [User Roles & Permissions](#user-roles--permissions)
- [Key Features](#key-features)
- [Troubleshooting](#troubleshooting)

---

## Project Overview

The AI Blood Bank system solves a critical real-world problem: connecting the right blood to the right patient at the right time. It provides:

- A **centralized blood inventory** visible to admins across all hospitals
- **Emergency request processing** where admins match hospital requests to eligible donors
- **Direct donor-to-patient matching** using blood compatibility logic
- **AI-powered blood demand prediction** based on 90-day historical usage + seasonal trends
- **Real-time notifications** pushed to donors when their blood type is urgently needed

---

## Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI framework |
| Vite (rolldown) | Build tool & dev server |
| React Router DOM v7 | Client-side routing |
| Axios | HTTP client for API calls |
| Framer Motion | Animations & transitions |
| Recharts | Analytics charts (Area, Pie charts) |
| Lucide React | Icon library |

### Backend
| Technology | Purpose |
|---|---|
| Python / Flask | REST API server |
| Flask-CORS | Cross-origin request handling |
| PyMongo | MongoDB driver |
| MongoDB | NoSQL database |

---

## Project Structure

```
AI_blood_bank/
│
├── back/                          # Flask Backend
│   ├── app.py                     # All API routes (single-file backend)
│   ├── config.py                  # MongoDB connection class + custom JSON encoder
│   └── requirements.txt           # Python dependencies
│
└── blood/                         # React Frontend
    ├── index.html
    ├── vite.config.js
    ├── package.json
    └── src/
        ├── main.jsx               # App entry point
        ├── App.jsx                # Root component
        ├── services/
        │   └── api.jsx            # All Axios API calls (single source of truth)
        ├── router/
        │   └── AppRouter.jsx      # All route definitions
        ├── auth/
        │   ├── home.jsx           # Public landing page
        │   ├── login.jsx          # Login page (all roles)
        │   └── signup.jsx         # Donor self-registration
        └── modules/
            ├── admin/
            │   ├── component/     # Sidebar, Navbar, Footer
            │   └── pages/
            │       ├── AdminDashboard.jsx       # Main admin control panel
            │       ├── ManageUsers.jsx          # User & hospital CRUD
            │       ├── BloodInventory.jsx       # Global inventory + donation camps
            │       ├── AnalyticsDashboard.jsx   # Charts & KPI metrics
            │       ├── AdminSettings.jsx        # Admin profile settings
            │       └── BloodPredictionModal.jsx # AI demand prediction modal
            ├── hospital/
            │   ├── component/     # Sidebar, Navbar, Footer, Layout
            │   └── pages/
            │       ├── HospitalDashboard.jsx    # Hospital stats overview
            │       ├── RequestBlood.jsx         # Submit blood request form
            │       ├── RequestStatus.jsx        # Track own requests
            │       ├── DonorDatabase.jsx        # Browse compatible donors
            │       └── BloodAdd.jsx             # Add blood units to inventory
            └── donar/
                ├── component/     # Sidebar, Navbar, Footer, Layout
                └── pages/
                    ├── DonorDashboard.jsx       # Donor stats + notifications
                    ├── ScheduleDonation.jsx     # Book a donation appointment
                    ├── DonationHistory.jsx      # Past donation records
                    ├── DirectRequests.jsx       # Accept peer blood requests
                    ├── HealthDetails.jsx        # Health info & certificates
                    └── profile.jsx             # Edit donor profile
```

---

## Database Schema

MongoDB database name: `AIbloodbank`

### Collections

**`login`** — Credentials for all user types
```json
{
  "_id": ObjectId,
  "username": "string",
  "password": "string",
  "usertype": "donor | hospital | admin"
}
```

**`users`** — Personal information for donors and admins
```json
{
  "_id": ObjectId,
  "name": "string",
  "email": "string",
  "contact": "string",
  "address": "string",
  "usertype": ObjectId  // → references login._id
}
```

**`donors`** — Medical profile for each donor
```json
{
  "_id": ObjectId,
  "userId": ObjectId,     // → references users._id
  "bloodGroup": "A+ | A- | B+ | B- | O+ | O- | AB+ | AB-",
  "age": Number,
  "gender": "string",
  "eligible": Boolean
}
```

**`hospitals`** — Hospital details
```json
{
  "_id": ObjectId,
  "loginId": ObjectId,    // → references login._id
  "name": "string",
  "email": "string",
  "phone": "string",
  "address": "string",
  "licenseNumber": "string",
  "hasBloodBank": Boolean,
  "fridgeCapacity": "string",
  "createdAt": DateTime
}
```

**`blood_inventory`** — Physical blood units in stock
```json
{
  "_id": ObjectId,
  "bloodGroup": "string",
  "volume_ml": Number,          // 350ml = 1 unit
  "status": "available | used",
  "hospitalId": ObjectId,       // → which hospital owns it
  "expiryDate": DateTime,
  "collectionDate": DateTime,
  "createdAt": DateTime
}
```

**`requesthospital`** — Blood requests from hospitals
```json
{
  "_id": ObjectId,
  "hospitalLoginId": ObjectId,
  "hospitalName": "string",
  "bloodGroup": "string",
  "units": Number,
  "urgency": "Normal | Critical",
  "notes": "string",
  "status": "pending | approved | fulfilled",
  "createdAt": DateTime
}
```

**`donation_schedule`** — Donor appointments
```json
{
  "_id": ObjectId,
  "donorLoginId": ObjectId,
  "donorName": "string",
  "locationId": "string",
  "locationName": "string",
  "bloodGroup": "string",
  "date": "string",
  "time": "string",
  "status": "scheduled | completed | no-show",
  "completedAt": DateTime
}
```

**`direct_donations`** — Peer-to-peer donation requests
```json
{
  "_id": ObjectId,
  "donorLoginId": ObjectId,
  "recipientName": "string",
  "recipientBloodGroup": "string",
  "recipientContact": "string",
  "requestReason": "string",
  "urgency": "string",
  "status": "pending | accepted | completed",
  "acceptedBy": ObjectId,
  "createdAt": DateTime
}
```

**`notifications`** — In-app alerts for donors
```json
{
  "_id": ObjectId,
  "donorId": ObjectId,         // → references donors._id
  "message": "string",
  "type": "blood_request | direct_donation | direct_donation_accepted",
  "requestId": ObjectId,
  "isRead": Boolean,
  "createdAt": DateTime
}
```

**`locations`** — Donation camps / blood centers
```json
{
  "_id": ObjectId,
  "name": "string",
  "address": "string",
  "city": "string",
  "coordinates": { "lat": Number, "lng": Number },
  "critical_needs": ["A+", "O-"],  // blood groups urgently needed here
  "isActive": Boolean,
  "createdAt": DateTime
}
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local install or Atlas)

### Step 1 — Start MongoDB

**Windows (run as Administrator):**
```bash
net start MongoDB
```

**macOS (Homebrew):**
```bash
brew services start mongodb-community
```

**Linux:**
```bash
sudo systemctl start mongod
```

### Step 2 — Start the Flask Backend

```bash
cd AI_blood_bank/back

# Create and activate a virtual environment (recommended)
python -m venv venv
venv\Scripts\activate        # Windows
source venv/bin/activate     # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Start the server
python app.py
```

Flask will start at: `http://127.0.0.1:5000`

Verify MongoDB connection by visiting: `http://127.0.0.1:5000/test-db`  
Expected response: `{"message": "MongoDB connected successfully!", "status": "success"}`

### Step 3 — Start the React Frontend

Open a **second terminal**:

```bash
cd AI_blood_bank/blood

# Install dependencies
npm install

# Start dev server
npm run dev
```

React app will start at: `http://localhost:5173`

---

## How It Works — Complete Flow

### 1. Authentication Flow

```
User visits http://localhost:5173
        │
        ▼
   Home Page (/)
        │
        ├──► /signup  — Donor self-registration
        │         │
        │         ▼
        │    Fills: fullName, username, password, email,
        │           phone, bloodGroup, age, gender, address
        │         │
        │         ▼
        │    POST /register
        │    Backend creates 3 linked documents:
        │      1. login     { username, password, usertype: "donor" }
        │      2. users     { name, email, contact, usertype → login._id }
        │      3. donors    { userId → users._id, bloodGroup, age, gender }
        │         │
        │         ▼
        │    Redirect → /login
        │
        └──► /login  — All roles (donor / hospital / admin)
                  │
                  ▼
             POST /login
             Backend returns:
               { login_id, userid, usertype, username, hospitalId? }
                  │
                  ▼
             Stored in localStorage:
               login_id, role, userid, username, fullName, hospitalId?
                  │
                  ├── usertype === "admin"    → /admin
                  ├── usertype === "hospital" → /hospital
                  └── usertype === "donor"   → /donor
```

---

### 2. Admin Flow

The Admin is the central controller of the entire system.

#### Admin Dashboard (`/admin`)

On load, 4 parallel API calls are made:
```
Promise.all([
  GET /blood-requests         → all hospital requests (pending/approved)
  GET /blood-inventory/summary → blood stock per blood group with status
  GET /admin/donor-count       → total registered donors
  GET /admin/total-inventory-stats → total blood units across all hospitals
])
```

The dashboard displays:
- **Stat cards**: Total blood units, total donors, pending requests, critical requests
- **Blood inventory grid**: Each of 8 blood groups with volume in units and status
  - `critical` = 0 units, `low` = < 5 units, `medium` = < 20, `good` = 20+
- **Request table**: All hospital blood requests with urgency badge

**Processing a Blood Request (core admin workflow):**
```
Admin clicks "Process" on a pending request
        │
        ▼
GET /admin/find-donors?bloodGroup=A+
Returns all eligible donors with compatible blood
        │
        ▼
Admin selects donors from the list (checkboxes)
        │
        ▼
POST /admin/process-request
  { requestId, donorIds: [...] }
        │
        ▼
Backend:
  1. Updates request status → "approved"
  2. Creates notification for EACH selected donor:
     { donorId, message: "URGENT: Hospital X needs A+ blood", type: "blood_request" }
        │
        ▼
Selected donors see alert on their dashboard
```

**AI Blood Demand Prediction (🔮 Prediction button):**
```
Admin clicks "AI Prediction" button
        │
        ▼
GET /admin/blood-demand/predict
        │
        ▼
Algorithm runs:
  Step 1: Fetch all approved requests from last 90 days
  Step 2: Calculate monthly average usage per blood group
  Step 3: Get current inventory stock per blood group
  Step 4: Count pending requests per blood group
  Step 5: Apply seasonal multiplier
           (1.2× in Dec/Jan/Feb/Nov, 1.0× otherwise)
  Step 6: predicted_demand = (monthly_avg × seasonal) + pending
  Step 7: gap = predicted_demand - current_stock
        │
        ▼
Returns per blood group:
  - predictedDemand, currentStock, gap
  - status: "CRITICAL SHORTAGE | SHORTAGE WARNING | LOW STOCK | ADEQUATE | SURPLUS"
  - recommendation: specific action text
  - priority: high | medium | low | none
```

#### Manage Users (`/admin/users`)

Two tabs — Users and Hospitals:
- **Users tab**: `GET /users` — shows all registered donors with their blood group (joined from donors collection)
- **Hospitals tab**: `GET /hospitals` — shows all hospitals with their username (joined from login collection)
- Admin can **Add Donor** (`POST /register`) or **Add Hospital** (`POST /register-hospital`)

#### Blood Inventory (`/admin/inventory`)

```
GET /blood-inventory/summary  → blood levels per group (volume in ml → units)
GET /blood-inventory/batches/recent → recently added blood batches
GET /locations → all donation camp locations
```

Admin can also **Add a Donation Camp** (location) with coordinates and mark which blood groups are critically needed there. This drives the donor's Schedule page — donors only see camps where THEIR blood type is needed.

#### Analytics Dashboard (`/admin/activity`)

```
Promise.all([
  GET /admin/analytics/donation-trends       → Area chart: monthly donations (6 months)
  GET /admin/analytics/blood-type-distribution → Pie chart: inventory split by blood group
  GET /admin/analytics/requests-vs-donations → Bar chart: request vs donation gap (4 months)
  GET /admin/donor-count                      → KPI: active donors
  GET /admin/total-inventory-stats            → KPI: total units
  GET /blood-inventory/summary                → KPI: inventory health score
])
```

---

### 3. Hospital Flow

Hospitals have their `hospitalLoginId` (login._id) stored in localStorage from login.

#### Hospital Dashboard (`/hospital`)

```
GET /hospital/dashboard-stats/<hospitalLoginId>
        │
        ▼
Returns:
  stats: [
    { label: "Pending Requests", value: N },
    { label: "Fulfilled Today",  value: N },
    { label: "Critical Needs",   value: N },
    { label: "Total Units",      value: N }
  ]
  recentActivity: last 5 requests with blood type, units, urgency, status
```

#### Request Blood (`/hospital/request`)

```
Hospital fills form:
  hospitalName (auto-filled from localStorage username)
  bloodGroup, units, urgency (Normal/Critical), notes
        │
        ▼
POST /blood-request
  { hospitalLoginId, hospitalName, bloodGroup, units, urgency, notes }
        │
        ▼
Creates document in "requesthospital" collection
Status: "pending" → waits for admin to process
```

#### Request Status (`/hospital/status`)

```
GET /blood-requests  (filtered by hospitalLoginId on frontend)
Shows all requests with current status badge:
  🟡 Pending → 🟢 Approved → ✅ Fulfilled
```

#### Add Blood to Inventory (`/hospital/AddBlood`)

When a donation is completed at the hospital:
```
Hospital fills:
  bloodGroup, volume_ml, collectionDate, expiryDate, status
        │
        ▼
POST /api/blood-inventory/add
  { bloodGroup, volume_ml, expiryDate, hospitalLoginId, status, collectionDate }
        │
        ▼
Creates document in "blood_inventory" collection
This unit now counts in the global inventory summary
```

#### Donor Database (`/hospital/donors`)

```
GET /admin/all-donors
Shows full donor list with bloodGroup, name, contact, eligibility
Hospital can search/filter to find specific blood types
```

---

### 4. Donor Flow

#### Donor Dashboard (`/donor`)

On load:
```
Promise.all([
  GET /api/donor/dashboard-stats/<login_id>
       → totalDonations, livesSaved (donations × 3),
          nextEligibleDate (last donation + 56 days),
          lastDonationMessage

  GET /notifications?loginId=<login_id>
       → urgent alerts from admin
       → direct donation acceptances
])
```

If a notification exists alerting the donor of a hospital need, the dashboard shows an "Urgent" banner with a direct "Schedule Now" button.

#### Schedule Donation (`/donor/schedule`)

```
GET /locations/recommend?loginId=<login_id>
        │
        ▼
Backend:
  1. Find user from login_id
  2. Find donor to get bloodGroup
  3. Find all locations where critical_needs includes donor's bloodGroup
        │
        ▼
Frontend shows ONLY relevant camps
(Donor only sees locations that specifically need their blood type)
        │
        ▼
Donor selects: location, date, time
        │
        ▼
POST /schedule-donation
  { donorLoginId, donorName, locationId, locationName, bloodGroup, date, time }
        │
        ▼
Status: "scheduled"
Visible to hospital staff for attendance tracking
```

#### Donation History (`/donor/history`)

```
GET /api/donor/history/<login_id>
Returns all donation_schedule records where:
  donorLoginId = login_id AND status = "completed"
Shows: date, location, blood group, status badge
```

#### Direct Requests (`/donor/DirectRequests`)

Peer-to-peer emergency blood matching:
```
GET /api/direct-donation/available?loginId=<login_id>
        │
        ▼
Backend:
  1. Gets donor's bloodGroup
  2. Fetches all pending direct_donations where status = "pending"
  3. Filters: only shows requests where donor's blood IS compatible
     (using BLOOD_COMPATIBILITY map)
  4. Excludes the donor's own requests
        │
        ▼
Donor sees a list of people who need blood that they CAN donate
        │
        ▼
Donor clicks "Accept"
        │
        ▼
POST /api/direct-donation/respond
  { requestId, donorLoginId, response: "accepted" }
        │
        ▼
Backend:
  1. Updates direct_donation status → "accepted"
  2. Records acceptedBy, acceptedDonorName, acceptedDonorContact
  3. Creates notification for the REQUESTER:
     "Good news! [Donor Name] (B+) has accepted your request.
      Contact: [phone number]"
```

#### Donor Profile (`/donor/profile`)

```
GET /donor-profile/<login_id>
  → Returns: fullName, email, phone, address, bloodGroup, age, gender, eligible

PUT /update-donor-profile/<login_id>
  → Updates both users collection (name, email, contact, address)
     AND donors collection (bloodGroup, age, gender, eligible)
```

---

## API Reference

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/register` | Register a new donor |
| POST | `/register-hospital` | Register a new hospital |
| POST | `/login` | Login (all roles) |
| GET | `/test-db` | Check MongoDB connection |

### Donor
| Method | Endpoint | Description |
|---|---|---|
| GET | `/donor-profile/<login_id>` | Get donor profile |
| PUT | `/update-donor-profile/<login_id>` | Update donor profile |
| GET | `/api/donor/dashboard-stats/<login_id>` | Donor stats (donations, eligibility) |
| GET | `/api/donor/history/<login_id>` | Completed donation history |
| GET | `/notifications?loginId=` | Get donor notifications |

### Blood Requests
| Method | Endpoint | Description |
|---|---|---|
| POST | `/blood-request` | Hospital submits blood request |
| GET | `/blood-requests` | Admin gets all requests |
| POST | `/admin/process-request` | Admin approves + notifies donors |

### Blood Inventory
| Method | Endpoint | Description |
|---|---|---|
| GET | `/blood-inventory/summary` | Inventory by blood group (units) |
| POST | `/api/blood-inventory/add` | Hospital adds blood unit |
| GET | `/admin/total-inventory-stats` | Global total units |
| GET | `/admin/donor-count` | Total registered donors |

### Donation Scheduling
| Method | Endpoint | Description |
|---|---|---|
| POST | `/schedule-donation` | Book a donation appointment |
| GET | `/schedule-donation?donorLoginId=` | Get donor's appointments |
| PATCH | `/api/appointments/complete/<id>` | Mark appointment completed/no-show |
| GET | `/api/appointments/basic?locationId=` | Get appointments for a location |

### Locations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/admin/add-location` | Admin adds donation camp |
| GET | `/locations` | All locations |
| GET | `/locations/recommend?loginId=` | Locations matching donor's blood group |

### Direct Donations
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/direct-donation/request` | Donor posts a request for a patient |
| GET | `/api/direct-donation/available?loginId=` | Compatible requests for a donor |
| POST | `/api/direct-donation/respond` | Accept or decline a request |
| GET | `/api/direct-donation/my-requests/<login_id>` | Donor's own posted requests |

### Admin Analytics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/admin/analytics/donation-trends` | Monthly donations (6 months) |
| GET | `/admin/analytics/blood-type-distribution` | Inventory pie chart data |
| GET | `/admin/analytics/requests-vs-donations` | Gap analysis (4 months) |
| GET | `/admin/blood-demand/predict` | AI demand prediction |
| GET | `/admin/find-donors?bloodGroup=` | Find eligible donors by blood group |

### Hospital
| Method | Endpoint | Description |
|---|---|---|
| GET | `/hospital/dashboard-stats/<login_id>` | Hospital KPI stats |
| GET | `/hospitals` | All hospitals (admin) |
| GET | `/admin/all-donors` | All donors for hospital database view |
| GET | `/settings/<login_id>` | Get hospital settings |
| POST | `/settings/<login_id>` | Update hospital settings |

---

## User Roles & Permissions

| Feature | Admin | Hospital | Donor |
|---|:---:|:---:|:---:|
| View global blood inventory | ✅ | ❌ | ❌ |
| Process blood requests | ✅ | ❌ | ❌ |
| AI demand prediction | ✅ | ❌ | ❌ |
| Manage users & hospitals | ✅ | ❌ | ❌ |
| View analytics dashboard | ✅ | ❌ | ❌ |
| Add donation camp locations | ✅ | ❌ | ❌ |
| Submit blood request | ❌ | ✅ | ❌ |
| Add blood units to inventory | ❌ | ✅ | ❌ |
| View donor database | ❌ | ✅ | ❌ |
| Track own requests | ❌ | ✅ | ❌ |
| Schedule a donation | ❌ | ❌ | ✅ |
| View donation history | ❌ | ❌ | ✅ |
| Accept direct blood requests | ❌ | ❌ | ✅ |
| Receive notifications | ❌ | ❌ | ✅ |
| Edit own profile | ❌ | ❌ | ✅ |

---

## Key Features

### Blood Compatibility Engine
The backend uses a compatibility map for all 8 blood types. When matching donors to hospital requests, or when filtering direct donation requests for a donor, only compatible donors are returned:

```python
BLOOD_COMPATIBILITY = {
  "AB+": ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"],  # Universal Recipient
  "O-":  ["O-"],                                                 # Universal Donor
  ...
}
```

### Eligibility Rule
Donors become eligible to donate again 56 days (8 weeks) after their last completed donation. The system auto-calculates `nextEligibleDate` and shows it on the donor dashboard.

### 350ml = 1 Unit Conversion
All blood is stored in `volume_ml` in the database. The frontend and backend both convert to **units** using the formula: `units = volume_ml / 350`. This provides a clinically standard measurement for all displays.

### Seasonal Demand Prediction
The AI prediction applies a `1.2×` multiplier in winter months (November through February) to account for historically higher blood demand during holiday seasons and cold weather.

---

## Troubleshooting

**404 errors on all API calls**
→ Flask is not running. Run `python app.py` inside the `back/` folder.

**"MongoDB connection failed"**
→ MongoDB service is not started. Run `net start MongoDB` (Windows Admin) or `brew services start mongodb-community` (macOS).

**Login succeeds but data doesn't load**
→ Was fixed in `config.py`. Make sure you are using the updated `config.py` where `find_one()` returns raw documents with ObjectId intact.

**CORS errors in browser console**
→ Flask is running but on a different port. Make sure Flask is on port 5000 and React is on port 5173. The CORS config in `app.py` is set to allow `http://localhost:5173`.

**Port 5000 already in use (macOS)**
→ macOS AirPlay Receiver uses port 5000. Disable it in System Settings → General → AirDrop & Handoff, or change Flask to port 5001 and update `baseURL` in `api.jsx`.

**"Object of type ObjectId is not JSON serializable"**
→ Make sure you have the updated `config.py` with `MongoJSONProvider` registered in `app.py`. The custom JSON encoder handles all ObjectId serialization automatically.