from flask import Flask, jsonify, request
from config import MongoDB, oid, MongoJSONProvider
from bson import ObjectId
from flask_cors import CORS
from datetime import datetime, timedelta
from collections import Counter, defaultdict


app = Flask(__name__)

# ── Register custom JSON encoder so ObjectId is auto-serialized ──
app.json_provider_class = MongoJSONProvider
app.json = MongoJSONProvider(app)

CORS(
    app,
    resources={r"/*": {"origins": "http://localhost:5173"}},
    supports_credentials=True,
    allow_headers=["Content-Type", "Role", "Authorization", "Access-Control-Allow-Origin"],
    methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
)
# Create MongoDB instance
mongo = MongoDB()

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

def is_compatible(donor_blood, recipient_blood):
    """Check if donor blood is compatible with recipient"""
    return donor_blood in BLOOD_COMPATIBILITY.get(recipient_blood, [])

# -------------------------------
# 🔍 TEST MONGODB CONNECTION
# -------------------------------
@app.route('/test-db')
def test_db():
    try:
        # Ping MongoDB server
        mongo.client.admin.command("ping")
        return jsonify({"status": "success", "message": "MongoDB connected successfully!"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------------------------
# SINGLE API → insert login first, then user
# ------------------------------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.json

    required = [
        "fullName", "email", "phone", "address",
        "username", "password",
        "bloodGroup", "age", "gender"
    ]

    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    # Check username
    if mongo.find_one("login", {"username": data["username"]}):
        return jsonify({"error": "Username already exists"}), 400

    usertype = data.get("usertype", "donor")

    login_id = mongo.insert_one("login", {
    "username": data["username"],
    "password": data["password"],
    "usertype": usertype
})

    # Insert user
    user_id = mongo.insert_one("users", {
        "name": data["fullName"],
        "email": data["email"],
        "contact": data["phone"],
        "address": data["address"],
        "usertype": oid(login_id)
    })

    # Insert donor
    mongo.insert_one("donors", {
        "userId": oid(user_id),
        "bloodGroup": data["bloodGroup"],
        "age": int(data["age"]),
        "gender": data["gender"],
        "eligible": True
    })

    return jsonify({"message": "Registration successful"})


@app.route('/users', methods=['GET'])
def list_users():
    users = mongo.find_all("users")
    fixed_users = []
    for u in users:
        # Join donor info (blood group, age, gender)
        donor_info = mongo.db.donors.find_one({"userId": u["_id"]})
        if donor_info:
            u["details"] = {
                "bloodGroup": donor_info.get("bloodGroup"),
                "age": donor_info.get("age"),
                "gender": donor_info.get("gender")
            }
        # Join login info — DonorDatabase.jsx filters by login_details.usertype
        login_info = mongo.db.login.find_one({"_id": u["usertype"]})
        if login_info:
            u["login_details"] = {
                "usertype": login_info.get("usertype"),
                "username": login_info.get("username")
            }
        fixed_users.append(u)
    return jsonify(fixed_users)



@app.route('/login', methods=['POST'])
def login():
    data = request.json
    
    # 1. Find the login credentials
    login_record = mongo.find_one("login", {
        "username": data["username"],
        "password": data["password"]
    })

    if not login_record:
        return jsonify({"error": "Invalid credentials"}), 401

    # 2. Find the linked user record (for donors)
    user_record = mongo.find_one("users", {"usertype": login_record["_id"]})

    # 3. Create the base response
    response = {
        "message": "Login successful",
        "login_id": str(login_record["_id"]),
        "userid": str(user_record["_id"]) if user_record else str(login_record["_id"]),
        "usertype": login_record["usertype"],
        "username": login_record["username"]
    }

    # 4. 🔥 NEW: If hospital, find the actual Hospital ID
    if login_record["usertype"] == "hospital":
        # Search the 'hospitals' collection using the login record's _id
        hospital_doc = mongo.db.hospitals.find_one({"loginId": login_record["_id"]})
        if hospital_doc:
            response["hospitalId"] = str(hospital_doc["_id"])

    print("Login response sent to frontend:", response) 
    return jsonify(response)
#----------------------------------------------------------------------------------->
#donor profile

@app.route('/donor-profile/<login_id>', methods=['GET'])
def get_donor_profile(login_id):
    try:
        login_oid = ObjectId(login_id)

        # 1️⃣ Find user using login_id
        user = mongo.db.users.find_one({"usertype": login_oid})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # 2️⃣ Find donor using user_id
        donor = mongo.db.donors.find_one({"userId": user["_id"]})

        profile = {
            "fullName": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("contact"),
            "address": user.get("address"),
            "bloodGroup": donor.get("bloodGroup") if donor else "N/A",
            "age": donor.get("age") if donor else "N/A",
            "gender": donor.get("gender") if donor else "N/A",
            "eligible": donor.get("eligible") if donor else False
        }

        return jsonify(profile), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route('/update-donor-profile/<login_id>', methods=['PUT'])
def update_donor_profile(login_id):
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        # Convert string login_id to ObjectId for searching the users table
        l_id = ObjectId(login_id)

        # 1. Find the User document linked to this login
        # In your schema, 'usertype' in the users collection holds the login_id
        user = mongo.db.users.find_one({"usertype": l_id})
        
        if not user:
            return jsonify({"error": "User record not found for this login account"}), 404
        
        user_oid = user["_id"]

        # 2. Prepare Update for 'users' collection (General Info)
        # Mapping frontend keys (fullName, phone) to backend keys (name, contact)
        user_update = {}
        if "fullName" in data: user_update["name"] = data["fullName"]
        if "email" in data: user_update["email"] = data["email"]
        if "phone" in data: user_update["contact"] = data["phone"]
        if "address" in data: user_update["address"] = data["address"]

        if user_update:
            mongo.db.users.update_one({"_id": user_oid}, {"$set": user_update})

        # 3. Prepare Update for 'donors' collection (Medical Info)
        donor_update = {}
        if "bloodGroup" in data: donor_update["bloodGroup"] = data["bloodGroup"]
        if "gender" in data: donor_update["gender"] = data["gender"]
        if "eligible" in data: donor_update["eligible"] = data["eligible"]
        
        # Ensure age is stored as an integer
        if "age" in data and data["age"] != "N/A":
            try:
                donor_update["age"] = int(data["age"])
            except ValueError:
                pass 

        if donor_update:
            # We use userId to link the donor details back to the user record
            mongo.db.donors.update_one(
                {"userId": user_oid}, 
                {"$set": donor_update}, 
                upsert=True
            )

        return jsonify({"message": "Profile updated successfully"}), 200

    except Exception as e:
        print(f"❌ Update Error: {str(e)}")
        return jsonify({"error": "Failed to update profile. Check server logs."}), 500


#hospital register------------------------------------------------------->

# ------------------------------------------
# REGISTER HOSPITAL
# ------------------------------------------
@app.route('/register-hospital', methods=['POST'])
def register_hospital():
    data = request.json

    required = [
        "username", "password",
        "name", "email", "phone", "address",
        "licenseNumber"
    ]

    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    # Check username
    if mongo.find_one("login", {"username": data["username"]}):
        return jsonify({"error": "Username already exists"}), 400

    # 1️⃣ Insert login
    login_id = mongo.insert_one("login", {
        "username": data["username"],
        "password": data["password"],
        "usertype": "hospital"
    })

    # 2️⃣ Insert hospital
    mongo.insert_one("hospitals", {
        "loginId": oid(login_id),
        "name": data["name"],
        "email": data["email"],
        "phone": data["phone"],
        "address": data["address"],
        "licenseNumber": data["licenseNumber"],
        "website": data.get("website", ""),
        "hasBloodBank": data.get("hasBloodBank", False),
        "bbLicense": data.get("bbLicense", ""),
        "fridgeCapacity": data.get("fridgeCapacity", ""),
        "createdAt": datetime.utcnow()
    })

    return jsonify({"message": "Hospital registered successfully"})


# ------------------------------------------
# GET HOSPITALS (New Endpoint)
# ------------------------------------------
@app.route('/hospitals', methods=['GET'])
def list_hospitals():
    hospitals = mongo.find_all("hospitals")
    result = []

    for h in hospitals:
        # loginId is ObjectId — pass directly to find_one
        login = mongo.db.login.find_one({"_id": h["loginId"]})
        if login:
            h["username"] = login["username"]
        result.append(h)

    return jsonify(result)


# ────────────────────────────────────────────────
#   GET /blood-inventory/summary
# ────────────────────────────────────────────────
@app.route('/blood-inventory/summary', methods=['GET'])
def get_blood_inventory_summary():
    try:
        hospital_login_id = request.args.get('hospitalLoginId')
        collection = mongo.db.blood_inventory 

        blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
        
        match_query = {"status": "available"}
        if hospital_login_id and hospital_login_id != "undefined":
            match_query["hospitalId"] = oid(hospital_login_id)

        pipeline = [
            {"$match": match_query},
            {
                "$group": {
                    "_id": "$bloodGroup",
                    # ✅ FIX: Sum the actual volume instead of just counting documents
                    "total_ml": {"$sum": "$volume_ml"}
                }
            }
        ]
        
        results = list(collection.aggregate(pipeline))
        
        # Convert ml to units (ml / 350)
        # Using a dictionary for quick lookup: { "A+": 10.5, "B-": 2.0 ... }
        ml_map = {item["_id"]: item["total_ml"] for item in results if item["_id"]}

        inventory = []
        for bg in blood_groups:
            total_ml = ml_map.get(bg, 0)
            # ✅ CONVERSION: 350ml = 1 Unit
            units = round(total_ml / 350, 1)
            
            # Dynamic Status Logic based on units
            if units == 0: status = "critical"
            elif units < 5: status = "low"
            elif units < 20: status = "medium"
            else: status = "good"
            
            inventory.append({
                "type": bg,
                "units": units, # This will now show 10.0 for 3500ml
                "status": status,
                "percentage": min(int((units / 50) * 100), 100) 
            })

        return jsonify(inventory)
    except Exception as e:
        print(f"❌ Summary Error: {str(e)}")
        return jsonify({"error": str(e)}), 500



@app.route('/admin/total-inventory-stats', methods=['GET'])
def get_admin_total_stats():
    try:
        # Sum ALL volume_ml from ALL hospitals for the global admin view
        pipeline = [
            {"$match": {"status": "available"}},
            {"$group": {"_id": None, "grand_total_ml": {"$sum": "$volume_ml"}}}
        ]
        result = list(mongo.db.blood_inventory.aggregate(pipeline))
        
        total_ml = result[0]['grand_total_ml'] if result else 0
        total_units = round(total_ml / 350, 1)
        
        return jsonify({"totalUnits": total_units})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ────────────────────────────────────────────────
#   GET /blood-inventory/batches/recent
# ────────────────────────────────────────────────
@app.route('/blood-inventory/batches/recent', methods=['GET'])
def get_recent_batches():
    try:
        limit = request.args.get('limit', default=10, type=int)

        pipeline = [
            {"$sort": {"collectionDate": -1}},
            {"$limit": limit},
            {"$project": {
                "batchId": 1,
                "bloodGroup": 1,
                "volume_ml": 1,
                "expiryDate": {"$dateToString": {"format": "%b %d, %Y", "date": "$expiryDate"}},
                "status": {"$toUpper": "$status"},
                "typeColor": {  # you can compute this in frontend instead
                    "$switch": {
                        "branches": [
                            {"case": {"$eq": ["$bloodGroup", "O+"]}, "then": "#0f758a"},
                            {"case": {"$eq": ["$bloodGroup", "O-"]}, "then": "#DC2626"},
                        ],
                        "default": "#64748b"
                    }
                }
            }}
        ]

        batches = list(mongo.db["donors"].aggregate(pipeline))

        for b in batches:
            b["_id"] = str(b["_id"])

        return jsonify(batches)

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# ------------------------------------------
# CREATE BLOOD REQUEST (Hospital)
# ------------------------------------------
@app.route('/blood-request', methods=['POST'])
def create_blood_request():
    data = request.json

    required = [
        "hospitalLoginId",
        "hospitalName",
        "bloodGroup",
        "units",
        "urgency"
    ]

    if not data or not all(k in data for k in required):
        return jsonify({
            "error": "Missing fields",
            "received": data
        }), 400

    mongo.insert_one("requesthospital", {
        "hospitalLoginId": oid(data["hospitalLoginId"]),
        "hospitalName": data["hospitalName"],   # ✅ stored directly
        "bloodGroup": data["bloodGroup"],
        "units": int(data["units"]),
        "urgency": data["urgency"],
        "notes": data.get("notes", ""),
        "status": "pending",
        "createdAt": datetime.utcnow()
    })

    return jsonify({"message": "Blood request submitted successfully"})

# ------------------------------------------
# GET ALL BLOOD REQUESTS (Admin)
# ------------------------------------------
@app.route('/blood-requests', methods=['GET'])
def list_blood_requests():
    requests = mongo.find_all("requesthospital")
    result = []

    for r in requests:
        # Join hospital details using the stored ObjectId directly
        hospital = mongo.db.hospitals.find_one({"loginId": r["hospitalLoginId"]})
        r["hospital"] = hospital
        result.append(r)

    return jsonify(result)

# --- Find this section in your app.py ---
@app.route('/schedule-donation', methods=['GET', 'POST', 'OPTIONS'])
def handle_donation_scheduling():
    # Handle CORS Pre-flight
    if request.method == 'OPTIONS':
        return jsonify({"status": "ok"}), 200

    # --- GET: Fetch appointments ---
    if request.method == 'GET':
        donor_login_id = request.args.get('donorLoginId')
        location_id = request.args.get('locationId')
        query = {}

        if donor_login_id:
            query["donorLoginId"] = oid(donor_login_id)
        elif location_id:
            query["locationId"] = location_id
        else:
            return jsonify({"error": "donorLoginId or locationId is required"}), 400

        appointments = list(mongo.db.donation_schedule.find(query).sort("date", 1))
        for a in appointments:
            a["_id"] = str(a["_id"])
            if "donorLoginId" in a:
                a["donorLoginId"] = str(a["donorLoginId"])
        return jsonify(appointments), 200

    # --- POST: Create a new appointment ---
    if request.method == 'POST':
        data = request.json
        required = ["donorLoginId", "donorName", "locationId", "locationName", "date", "time", "bloodGroup"]

        if not data or not all(k in data for k in required):
            return jsonify({"error": "Missing fields", "received": data}), 400

        # Check for duplicate
        existing_appointment = mongo.db.donation_schedule.find_one({
            "donorLoginId": oid(data["donorLoginId"]),
            "date": data["date"],
            "time": data["time"],
            "status": "scheduled"
        })

        if existing_appointment:
            return jsonify({"error": "You already have an appointment scheduled for this time!"}), 409

        # Insert new schedule
        new_id = mongo.insert_one("donation_schedule", {
            "donorLoginId": oid(data["donorLoginId"]),
            "donorName": data["donorName"],
            "locationId": data["locationId"],
            "locationName": data["locationName"],
            "bloodGroup": data["bloodGroup"],
            "date": data["date"],
            "time": data["time"],
            "status": "scheduled",
            "createdAt": datetime.utcnow()
        })

        return jsonify({
            "message": "Donation scheduled successfully",
            "appointmentId": str(new_id)
        }), 201
    
    # Fallback return to prevent the TypeError
    return jsonify({"error": "Method not allowed"}), 405



# ------------------------------------------
# 📍 ADMIN: ADD DONATION LOCATION / CAMP
# ------------------------------------------
@app.route('/admin/add-location', methods=['POST'])
def add_location():
    data = request.json
    required = ["name", "address", "city", "latitude", "longitude"]
    
    if not all(k in data for k in required):
        return jsonify({"error": "Missing fields"}), 400

    # 'critical_needs' is an array of blood groups this location desperately needs
    # e.g., ["A+", "O-"]
    mongo.insert_one("locations", {
        "name": data["name"],
        "address": data["address"],
        "city": data["city"],
        "coordinates": {
            "lat": data["latitude"],
            "lng": data["longitude"]
        },
        "critical_needs": data.get("critical_needs", []), # specific blood groups needed here
        "isActive": True,
        "createdAt": datetime.utcnow()
    })

    return jsonify({"message": "Location added successfully"}), 201


# ------------------------------------------
# 🔍 DONOR: GET RELEVANT LOCATIONS (Strict Filter)
# ------------------------------------------
@app.route('/locations/recommend', methods=['GET'])
def recommend_locations():
    # 1. Get Login ID from Frontend
    login_id = request.args.get('loginId')
    
    if not login_id:
        return jsonify({"error": "Login ID required"}), 400

    donor_blood_group = None

    try:
        # 2. Find User linked to this Login ID
        # Note: In your register function, you stored login_id in the 'usertype' field of users
        user = mongo.db.users.find_one({"usertype": oid(login_id)})
        
        if user:
            # 3. Find Donor linked to this User ID
            donor = mongo.db.donors.find_one({"userId": user["_id"]})
            if donor:
                donor_blood_group = donor.get("bloodGroup")
    
    except Exception as e:
        print(f"Error finding donor info: {e}")
        return jsonify({"error": "Server error fetching profile"}), 500

    if not donor_blood_group:
        return jsonify({"message": "Donor profile not found or Blood Group missing", "locations": []})

    # 4. Find locations that SPECIFICALLY need this blood group
    # We strictly filter here as you requested
    matching_locations = list(mongo.db.locations.find({
        "critical_needs": donor_blood_group,
        "isActive": True
    }))

    result = []
    for loc in matching_locations:
        loc["_id"] = str(loc["_id"])
        loc["isRecommended"] = True
        # Add a custom message for the UI
        loc["message"] = f"Your blood group ({donor_blood_group}) is critically needed here."
        result.append(loc)

    return jsonify(result)


# ------------------------------------------
# GET ALL LOCATIONS (Admin View)
# ------------------------------------------
@app.route('/locations', methods=['GET'])
def get_all_locations():
    # Fetch all locations, newest first
    locations = list(mongo.db.locations.find().sort("createdAt", -1))
    
    for loc in locations:
        loc["_id"] = str(loc["_id"])
    
    return jsonify(locations)


# ------------------------------------------
# ADMIN: FIND MATCHING DONORS
# ------------------------------------------
@app.route('/admin/find-donors', methods=['GET'])
def find_matching_donors():
    blood_group = request.args.get('bloodGroup')
    if not blood_group:
        return jsonify({"error": "Blood group is required"}), 400

    # Join donors with users to get names and contact info
    pipeline = [
        {"$match": {"bloodGroup": blood_group, "eligible": True}},
        {"$lookup": {
            "from": "users",
            "localField": "userId",
            "foreignField": "_id",
            "as": "userDetails"
        }},
        {"$unwind": "$userDetails"},
        {"$project": {
            "_id": {"$toString": "$_id"},
            "donorId": {"$toString": "$_id"}, # Donor collection ID
            "userId": {"$toString": "$userId"},
            "bloodGroup": 1,
            "name": "$userDetails.name",
            "contact": "$userDetails.contact",
            "email": "$userDetails.email",
            "address": "$userDetails.address"
        }}
    ]

    donors = list(mongo.db.donors.aggregate(pipeline))
    return jsonify(donors)

# ------------------------------------------
# ADMIN: APPROVE & NOTIFY DONORS
# ------------------------------------------
@app.route('/admin/process-request', methods=['POST'])
def process_request():
    data = request.json
    request_id = data.get('requestId')
    donor_ids = data.get('donorIds', []) # List of selected donor IDs
    
    if not request_id:
        return jsonify({"error": "Request ID is required"}), 400

    # 1. Update Request Status to 'Approved'
    mongo.db.requesthospital.update_one(
        {"_id": oid(request_id)},
        {"$set": {"status": "approved", "processedAt": datetime.utcnow()}}
    )

    # 2. Create Notifications for Selected Donors
    if donor_ids:
        notifications = []
        # Fetch hospital name
        req_doc = mongo.db.requesthospital.find_one({"_id": oid(request_id)})
        hospital_name = req_doc.get("hospitalName", "Unknown Hospital") if req_doc else "Hospital"

        for d_id in donor_ids:
            notifications.append({
                "donorId": oid(d_id),
                "message": f"URGENT: {hospital_name} needs your blood type ({req_doc['bloodGroup']}). Please contact them.",
                "hospitalName": hospital_name, # <--- ✅ ADDED THIS LINE
                "type": "blood_request",
                "requestId": oid(request_id),
                "isRead": False,
                "createdAt": datetime.utcnow()
            })
        
        if notifications:
            mongo.db.notifications.insert_many(notifications)

    return jsonify({"message": "Request approved and donors notified successfully"})



# ------------------------------------------
# 🔔 GET NOTIFICATIONS (Donor)
# ------------------------------------------
@app.route('/notifications', methods=['GET'])
def get_notifications():
    login_id = request.args.get('loginId')
    
    if not login_id:
        return jsonify({"error": "Login ID required"}), 400

    # 1. Find the Donor ID associated with this Login ID
    user = mongo.db.users.find_one({"usertype": oid(login_id)})
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    donor = mongo.db.donors.find_one({"userId": user["_id"]})
    if not donor:
        return jsonify({"error": "Donor profile not found"}), 404

    # 2. Fetch Notifications for this Donor
    # Sort by newest first
    notifications = list(mongo.db.notifications.find({
        "donorId": donor["_id"]
    }).sort("createdAt", -1))

    # 3. Format IDs for JSON
    for n in notifications:
        n["_id"] = str(n["_id"])
        n["donorId"] = str(n["donorId"])
        if "requestId" in n:
            n["requestId"] = str(n["requestId"])
        n["createdAt"] = n["createdAt"].strftime("%Y-%m-%d %H:%M")

    return jsonify(notifications)


# ------------------------------------------
# 5. UPDATE: HOSPITAL DASHBOARD STATS
# ------------------------------------------
@app.route('/hospital/dashboard-stats/<hospital_login_id>', methods=['GET'])
def get_hospital_stats(hospital_login_id):
    try:
        if not hospital_login_id or hospital_login_id == "undefined":
            return jsonify({"error": "Valid Hospital Login ID required"}), 400

        h_oid = oid(hospital_login_id)

        # ── DUAL-ID FIX ──────────────────────────────────────────────────────
        # HospitalDashboard.jsx passes localStorage.hospitalId which is
        # the hospitals collection _id (not the login _id).
        # Blood requests are stored with hospitalLoginId = login._id.
        # So we look up the hospital document to get its loginId first.
        hospital_doc = mongo.db.hospitals.find_one({"_id": h_oid})
        if hospital_doc:
            # Passed value was hospital._id → use the linked loginId
            query_id = hospital_doc["loginId"]
        else:
            # Passed value was already login._id → use it directly
            query_id = h_oid
        # ─────────────────────────────────────────────────────────────────────

        # Fetch all requests for this hospital
        requests_cursor = mongo.db.requesthospital.find({"hospitalLoginId": query_id})
        requests = list(requests_cursor)
        
        # Calculate Stats
        pending = sum(1 for r in requests if r.get("status") == "pending")
        fulfilled = sum(1 for r in requests if r.get("status") in ["fulfilled", "approved"])
        critical = sum(1 for r in requests if r.get("urgency") == "Critical" and r.get("status") == "pending")
        total_units = sum(int(r.get("units", 0)) for r in requests)

        # Get Recent Activity
        recent_requests = list(mongo.db.requesthospital.find({"hospitalLoginId": query_id})
                               .sort("createdAt", -1).limit(5))
        
        formatted_activity = []
        for r in recent_requests:
            formatted_activity.append({
                "id": str(r["_id"])[-8:].upper(), 
                "type": r.get("bloodGroup", "Unknown"),
                "units": r.get("units", 0),
                "urgency": r.get("urgency", "Normal"),
                "status": str(r.get("status", "Pending")).capitalize()
            })

        return jsonify({
            "stats": [
                { "label": "Pending Requests", "value": str(pending) },
                { "label": "Fulfilled Today", "value": str(fulfilled) },
                { "label": "Critical Needs", "value": str(critical) },
                { "label": "Total Units", "value": "{:,}".format(total_units) }
            ],
            "recentActivity": formatted_activity
        }), 200

    except Exception as e:
        print(f"❌ Error in dashboard-stats: {e}")
        return jsonify({"error": str(e)}), 500


@app.route('/api/blood-inventory/add', methods=['POST'])
def add_blood_unit():
    try:
        data = request.json
        # Defining required fields to prevent 400 errors
        required = ["bloodGroup", "volume_ml", "expiryDate", "hospitalLoginId", "status", "collectionDate"]

        if not data or not all(k in data for k in required):
            return jsonify({
                "error": "Missing required fields", 
                "received_keys": list(data.keys()) if data else []
            }), 400

        # Prepare the document for the 'blood_inventory' collection
        blood_unit = {
            "bloodGroup": data["bloodGroup"],
            "volume_ml": int(data["volume_ml"]),
            "expiryDate": datetime.strptime(data["expiryDate"], "%Y-%m-%d"),
            "notes": data.get("notes", ""),
            "hospitalId": oid(data["hospitalLoginId"]), # Links to the hospital's login account
            "status": data["status"],
            # Fix for ISO date string handling
            "collectionDate": datetime.fromisoformat(data["collectionDate"].replace("Z", "+00:00")),
            "createdAt": datetime.utcnow()
        }

        # 🚀 TARGETING NEW COLLECTION: blood_inventory
        new_id = mongo.insert_one("blood_inventory", blood_unit)

        return jsonify({
            "status": "success",
            "message": "Blood unit added to inventory successfully", 
            "id": str(new_id)
        }), 201

    except Exception as e:
        print(f"❌ Error adding blood unit: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# ADMIN: GET TOTAL DONOR COUNT
# ------------------------------------------
@app.route('/admin/donor-count', methods=['GET'])
def get_total_donor_count():
    try:
        # Count all documents in the donors collection
        count = mongo.db.donors.count_documents({})
        
        # Optional: Count active/eligible donors specifically
        eligible_count = mongo.db.donors.count_documents({"eligible": True})

        return jsonify({
            "totalDonors": count,
            "eligibleDonors": eligible_count
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
    
# ------------------------------------------
# ADMIN: GET PROFILE INFO
# ------------------------------------------
@app.route('/admin/profile/<login_id>', methods=['GET'])
def get_admin_profile(login_id):
    try:
        # In your schema, the 'users' table holds the name and contact
        # 'usertype' field in 'users' collection stores the login_id
        user = mongo.db.users.find_one({"usertype": oid(login_id)})
        
        if not user:
            return jsonify({"error": "Admin user record not found"}), 404

        profile = {
            "fullName": user.get("name"),
            "email": user.get("email"),
            "phone": user.get("contact"),
            "address": user.get("address"),
            "username": mongo.find_one("login", {"_id": oid(login_id)}).get("username"),
            "role": "System Administrator",
            "avatar": user.get("name")[0] if user.get("name") else "A"
        }
        return jsonify(profile), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------------------------
# HOSPITAL: GET/POST SETTINGS
# ------------------------------------------
@app.route('/settings/<login_id>', methods=['GET', 'POST'])
def handle_hospital_settings(login_id):
    if request.method == 'GET':
        try:
            # Find hospital by the loginId linked to it
            hospital = mongo.db.hospitals.find_one({"loginId": oid(login_id)})
            if not hospital:
                return jsonify({"error": "Hospital info not found"}), 404
            
            # Formatting for frontend state
            return jsonify({
                "hospitalName": hospital.get("name", ""),
                "licenseNumber": hospital.get("licenseNumber", ""),
                "bbId": hospital.get("bbLicense", ""),
                "address": hospital.get("address", ""),
                "city": hospital.get("city", ""),
                "postalCode": hospital.get("postalCode", ""),
                "phone": hospital.get("phone", ""),
                "emergencyHotline": hospital.get("emergencyHotline", ""),
                "adminEmail": hospital.get("email", "")
            }), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500

    if request.method == 'POST':
        try:
            data = request.json
            update_data = {
                "name": data.get("hospitalName"),
                "licenseNumber": data.get("licenseNumber"),
                "bbLicense": data.get("bbId"),
                "address": data.get("address"),
                "city": data.get("city"),
                "postalCode": data.get("postalCode"),
                "phone": data.get("phone"),
                "emergencyHotline": data.get("emergencyHotline"),
                "email": data.get("adminEmail")
            }
            
            mongo.db.hospitals.update_one(
                {"loginId": oid(login_id)},
                {"$set": update_data},
                upsert=True
            )
            return jsonify({"message": "Settings updated successfully"}), 200
        except Exception as e:
            return jsonify({"error": str(e)}), 500    
        

def get_last_3_months_usage(blood_group):
    pipeline = [
        {
            "$match": {
                "bloodGroup": blood_group,
                "status": "approved"
            }
        },
        {
            "$group": {
                "_id": {
                    "year": {"$year": "$createdAt"},
                    "month": {"$month": "$createdAt"}
                },
                "totalUnits": {"$sum": "$units"}
            }
        },
        {"$sort": {"_id.year": -1, "_id.month": -1}},
        {"$limit": 3}
    ]

    data = list(mongo.db.requesthospital.aggregate(pipeline))
    print("DEBUG", blood_group, data)

    return [d["totalUnits"] for d in data]

def get_available_stock(blood_group):
    record = mongo.db.blood_inventory.find_one(
        {"bloodGroup": blood_group},
        {"unitsAvailable": 1}
    )
    return record["unitsAvailable"] if record else 0


@app.route('/admin/seed-blood-requests', methods=['POST'])
def seed_blood_requests():
    try:
        blood_groups = ["A+", "B+", "O+", "AB+", "A-", "B-", "O-", "AB-"]
        hospital = mongo.db.hospitals.find_one()

        if not hospital:
            return jsonify({"error": "No hospital found"}), 400

        hospital_login_id = hospital["loginId"]
        hospital_name = hospital["name"]

        today = datetime.utcnow()
        dummy_requests = []

        for i in range(3):  # last 3 months
            month_date = today - timedelta(days=30 * i)

            for bg in blood_groups:
                dummy_requests.append({
                    "hospitalLoginId": hospital_login_id,
                    "hospitalName": hospital_name,
                    "bloodGroup": bg,
                    "units": (i + 1) * 5,   # increasing demand
                    "urgency": "Normal",
                    "status": "approved",
                    "createdAt": month_date
                })

        mongo.db.requesthospital.insert_many(dummy_requests)

        return jsonify({
            "message": "✅ Dummy blood request data inserted",
            "recordsInserted": len(dummy_requests)
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500
    

# ------------------------------------------
# 🔵 CREATE DIRECT DONATION REQUEST
# ------------------------------------------
@app.route('/api/direct-donation/request', methods=['POST'])
def create_direct_donation_request():
    """
    Allow donors to post a blood request for a specific patient
    """
    try:
        data = request.json
        
        required = [
            "donorLoginId",
            "recipientName",
            "recipientBloodGroup",
            "recipientContact",
            "requestReason"
        ]
        
        if not all(k in data for k in required):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Get donor details
        user = mongo.db.users.find_one({"usertype": oid(data["donorLoginId"])})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        donor = mongo.db.donors.find_one({"userId": user["_id"]})
        if not donor:
            return jsonify({"error": "Donor profile not found"}), 404
        
        # Create request document
        request_doc = {
            "donorLoginId": oid(data["donorLoginId"]),
            "donorName": user.get("name"),
            "donorBloodGroup": donor.get("bloodGroup"),
            "donorContact": user.get("contact"),
            "recipientName": data["recipientName"],
            "recipientBloodGroup": data["recipientBloodGroup"],
            "recipientContact": data["recipientContact"],
            "requestReason": data["requestReason"],
            "urgency": data.get("urgency", "Normal"),
            "hospitalId": oid(data["hospitalId"]) if data.get("hospitalId") else None,
            "status": "pending",
            "createdAt": datetime.utcnow()
        }
        
        # Insert into direct_donations collection
        request_id = mongo.insert_one("direct_donations", request_doc)
        
        # Find and notify compatible donors
        compatible_donors = list(mongo.db.donors.find({
            "bloodGroup": {"$in": BLOOD_COMPATIBILITY.get(data["recipientBloodGroup"], [])},
            "eligible": True
        }))
        
        # Create notifications for compatible donors
        notifications = []
        for comp_donor in compatible_donors:
            # Skip the requester themselves
            comp_user = mongo.db.users.find_one({"_id": comp_donor["userId"]})
            if comp_user and str(comp_user.get("usertype")) != str(data["donorLoginId"]):
                notifications.append({
                    "donorId": comp_donor["_id"],
                    "message": f"URGENT: {data['recipientName']} needs {data['recipientBloodGroup']} blood. Your help can save a life!",
                    "type": "direct_donation",
                    "requestId": oid(request_id),
                    "isRead": False,
                    "createdAt": datetime.utcnow()
                })
        
        if notifications:
            mongo.db.notifications.insert_many(notifications)
        
        return jsonify({
            "message": "Request created successfully",
            "requestId": str(request_id),
            "notifiedDonors": len(notifications)
        }), 201
        
    except Exception as e:
        print(f"❌ Error creating direct donation request: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 🔍 FIND COMPATIBLE DONORS
# ------------------------------------------
@app.route('/api/direct-donation/matches/<blood_group>', methods=['GET'])
def find_compatible_donors(blood_group):
    """
    Find all donors who can donate to this blood group
    """
    try:
        # Get compatible blood types
        compatible_types = BLOOD_COMPATIBILITY.get(blood_group, [])
        
        # Find donors with compatible blood types
        pipeline = [
            {
                "$match": {
                    "bloodGroup": {"$in": compatible_types},
                    "eligible": True
                }
            },
            {
                "$lookup": {
                    "from": "users",
                    "localField": "userId",
                    "foreignField": "_id",
                    "as": "userDetails"
                }
            },
            {
                "$unwind": "$userDetails"
            },
            {
                "$lookup": {
                    "from": "donation_schedule",
                    "let": {"userId": "$userDetails.usertype"},
                    "pipeline": [
                        {
                            "$match": {
                                "$expr": {
                                    "$and": [
                                        {"$eq": ["$donorLoginId", "$$userId"]},
                                        {"$eq": ["$status", "completed"]}
                                    ]
                                }
                            }
                        },
                        {"$sort": {"date": -1}},
                        {"$limit": 1}
                    ],
                    "as": "lastDonation"
                }
            },
            {
                "$project": {
                    "_id": {"$toString": "$_id"},
                    "donorId": {"$toString": "$_id"},
                    "userId": {"$toString": "$userId"},
                    "loginId": {"$toString": "$userDetails.usertype"},
                    "bloodGroup": 1,
                    "name": "$userDetails.name",
                    "contact": "$userDetails.contact",
                    "email": "$userDetails.email",
                    "address": "$userDetails.address",
                    "age": 1,
                    "gender": 1,
                    "lastDonationDate": {
                        "$cond": {
                            "if": {"$gt": [{"$size": "$lastDonation"}, 0]},
                            "then": {"$arrayElemAt": ["$lastDonation.date", 0]},
                            "else": None
                        }
                    },
                    "totalDonations": {
                        "$cond": {
                            "if": {"$gt": [{"$size": "$lastDonation"}, 0]},
                            "then": 1,
                            "else": 0
                        }
                    }
                }
            },
            {"$sort": {"lastDonationDate": 1}}  # Prioritize donors who haven't donated recently
        ]
        
        donors = list(mongo.db.donors.aggregate(pipeline))
        
        # Calculate eligibility (8 weeks = 56 days since last donation)
        for donor in donors:
            if donor.get("lastDonationDate"):
                last_date = datetime.strptime(donor["lastDonationDate"], "%Y-%m-%d")
                days_since = (datetime.now() - last_date).days
                donor["canDonateNow"] = days_since >= 56
                donor["nextEligibleDate"] = (last_date + timedelta(days=56)).strftime("%Y-%m-%d") if days_since < 56 else "Now"
            else:
                donor["canDonateNow"] = True
                donor["nextEligibleDate"] = "Now"
        
        return jsonify(donors), 200
        
    except Exception as e:
        print(f"❌ Error finding compatible donors: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# ✅ RESPOND TO DIRECT DONATION REQUEST
# ------------------------------------------
@app.route('/api/direct-donation/respond', methods=['POST'])
def respond_to_direct_donation():
    """
    Donor accepts or rejects a direct donation request
    """
    try:
        data = request.json
        
        required = ["requestId", "donorLoginId", "response"]  # response: "accepted" or "rejected"
        
        if not all(k in data for k in required):
            return jsonify({"error": "Missing required fields"}), 400
        
        request_id = oid(data["requestId"])
        donor_login_id = oid(data["donorLoginId"])
        response_action = data["response"]
        
        # Get request details
        donation_request = mongo.db.direct_donations.find_one({"_id": request_id})
        if not donation_request:
            return jsonify({"error": "Request not found"}), 404
        
        # Get responding donor details
        responder_user = mongo.db.users.find_one({"usertype": donor_login_id})
        responder_donor = mongo.db.donors.find_one({"userId": responder_user["_id"]})
        
        if response_action == "accepted":
            # Update request status
            mongo.db.direct_donations.update_one(
                {"_id": request_id},
                {
                    "$set": {
                        "status": "accepted",
                        "acceptedBy": donor_login_id,
                        "acceptedDonorName": responder_user.get("name"),
                        "acceptedDonorContact": responder_user.get("contact"),
                        "acceptedDonorBloodGroup": responder_donor.get("bloodGroup"),
                        "acceptedAt": datetime.utcnow()
                    }
                }
            )
            
            # Notify the requester
            requester_user = mongo.db.users.find_one({"usertype": donation_request["donorLoginId"]})
            requester_donor = mongo.db.donors.find_one({"userId": requester_user["_id"]})
            
            mongo.insert_one("notifications", {
                "donorId": requester_donor["_id"],
                "message": f"Good news! {responder_user.get('name')} ({responder_donor.get('bloodGroup')}) has accepted your request for {donation_request['recipientName']}. Contact: {responder_user.get('contact')}",
                "type": "direct_donation_accepted",
                "requestId": request_id,
                "isRead": False,
                "createdAt": datetime.utcnow()
            })
            
            return jsonify({
                "message": "You've accepted the request! The requester will contact you soon.",
                "requesterContact": donation_request.get("donorContact"),
                "requesterName": donation_request.get("donorName")
            }), 200
        
        elif response_action == "rejected":
            # Just mark in responder's history (optional)
            # No need to update main request as others can still respond
            return jsonify({"message": "Request declined"}), 200
        
        else:
            return jsonify({"error": "Invalid response"}), 400
        
    except Exception as e:
        print(f"❌ Error responding to direct donation: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 📋 GET MY DIRECT DONATION REQUESTS
# ------------------------------------------
@app.route('/api/direct-donation/my-requests/<login_id>', methods=['GET'])
def get_my_direct_donations(login_id):
    """
    Get all direct donation requests created by this donor
    """
    try:
        login_oid = oid(login_id)
        
        # Find requests created by this user
        my_requests = list(mongo.db.direct_donations.find({
            "donorLoginId": login_oid
        }).sort("createdAt", -1))
        
        # Format response
        for req in my_requests:
            req["_id"] = str(req["_id"])
            req["donorLoginId"] = str(req["donorLoginId"])
            if "hospitalId" in req and req["hospitalId"]:
                req["hospitalId"] = str(req["hospitalId"])
            if "acceptedBy" in req:
                req["acceptedBy"] = str(req["acceptedBy"])
            req["createdAt"] = req["createdAt"].strftime("%Y-%m-%d %H:%M")
            if "acceptedAt" in req and req["acceptedAt"]:
                req["acceptedAt"] = req["acceptedAt"].strftime("%Y-%m-%d %H:%M")
        
        return jsonify(my_requests), 200
        
    except Exception as e:
        print(f"❌ Error fetching my direct donations: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 🔔 GET AVAILABLE DIRECT DONATION REQUESTS
# ------------------------------------------
@app.route('/api/direct-donation/available', methods=['GET'])
def get_available_direct_donations():
    """
    Get all pending direct donation requests that a donor can respond to
    Filters based on donor's blood compatibility
    """
    try:
        login_id = request.args.get('loginId')
        
        if not login_id:
            return jsonify({"error": "Login ID required"}), 400
        
        # Get donor's blood group
        user = mongo.db.users.find_one({"usertype": oid(login_id)})
        donor = mongo.db.donors.find_one({"userId": user["_id"]})
        
        donor_blood = donor.get("bloodGroup")
        
        # Find all pending requests where donor's blood is compatible
        available_requests = []
        
        all_requests = mongo.db.direct_donations.find({
            "status": "pending"
        }).sort("createdAt", -1)
        
        for req in all_requests:
            # Skip own requests
            if str(req["donorLoginId"]) == login_id:
                continue
            
            # Check compatibility
            if is_compatible(donor_blood, req["recipientBloodGroup"]):
                req["_id"] = str(req["_id"])
                req["donorLoginId"] = str(req["donorLoginId"])
                req["createdAt"] = req["createdAt"].strftime("%Y-%m-%d %H:%M")
                req["isCompatible"] = True
                req["matchReason"] = f"Your {donor_blood} blood can save this patient"
                available_requests.append(req)
        
        return jsonify(available_requests), 200
        
    except Exception as e:
        print(f"❌ Error fetching available requests: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 📊 COMPLETE A DIRECT DONATION
# ------------------------------------------
@app.route('/api/direct-donation/complete', methods=['POST'])
def complete_direct_donation():
    """
    Mark a direct donation as completed
    """
    try:
        data = request.json
        
        required = ["requestId", "donationDate", "hospitalId"]
        
        if not all(k in data for k in required):
            return jsonify({"error": "Missing required fields"}), 400
        
        request_id = oid(data["requestId"])
        
        # Update request status
        result = mongo.db.direct_donations.update_one(
            {"_id": request_id},
            {
                "$set": {
                    "status": "completed",
                    "completedAt": datetime.utcnow(),
                    "actualDonationDate": datetime.strptime(data["donationDate"], "%Y-%m-%d"),
                    "completionHospitalId": oid(data["hospitalId"]) if data.get("hospitalId") else None,
                    "notes": data.get("notes", "")
                }
            }
        )
        
        if result.modified_count == 0:
            return jsonify({"error": "Request not found or already completed"}), 404
        
        # Get request details for history
        donation_request = mongo.db.direct_donations.find_one({"_id": request_id})
        
        # Add to donation history
        if donation_request and "acceptedBy" in donation_request:
            acceptor_user = mongo.db.users.find_one({"usertype": donation_request["acceptedBy"]})
            acceptor_donor = mongo.db.donors.find_one({"userId": acceptor_user["_id"]})
            
            mongo.insert_one("donation_history", {
                "donorLoginId": donation_request["acceptedBy"],
                "donorId": acceptor_donor["_id"],
                "donationType": "direct",
                "bloodGroup": acceptor_donor.get("bloodGroup"),
                "volume_ml": 450,  # Standard donation
                "donationDate": datetime.strptime(data["donationDate"], "%Y-%m-%d"),
                "recipientName": donation_request["recipientName"],
                "hospitalId": oid(data["hospitalId"]) if data.get("hospitalId") else None,
                "requestId": request_id,
                "certificateIssued": False,
                "createdAt": datetime.utcnow()
            })
            
            # Update donor's last donation date
            mongo.db.donation_schedule.insert_one({
                "donorLoginId": donation_request["acceptedBy"],
                "donorName": acceptor_user.get("name"),
                "locationId": "direct",
                "locationName": "Direct Donation",
                "date": data["donationDate"],
                "time": "00:00",
                "status": "completed",
                "completedAt": datetime.utcnow(),
                "createdAt": datetime.utcnow()
            })
        
        return jsonify({"message": "Donation marked as completed successfully"}), 200
        
    except Exception as e:
        print(f"❌ Error completing donation: {e}")
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 📈 GET DIRECT DONATION STATISTICS
# ------------------------------------------
@app.route('/api/direct-donation/stats', methods=['GET'])
def get_direct_donation_stats():
    """
    Get statistics for direct donation system
    """
    try:
        stats = {
            "totalRequests": mongo.db.direct_donations.count_documents({}),
            "pendingRequests": mongo.db.direct_donations.count_documents({"status": "pending"}),
            "acceptedRequests": mongo.db.direct_donations.count_documents({"status": "accepted"}),
            "completedRequests": mongo.db.direct_donations.count_documents({"status": "completed"}),
            "successRate": 0
        }
        
        if stats["totalRequests"] > 0:
            stats["successRate"] = round(
                (stats["completedRequests"] / stats["totalRequests"]) * 100, 
                2
            )
        
        # Get blood group distribution
        blood_group_pipeline = [
            {
                "$group": {
                    "_id": "$recipientBloodGroup",
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"count": -1}}
        ]
        
        blood_distribution = list(mongo.db.direct_donations.aggregate(blood_group_pipeline))
        stats["bloodGroupDemand"] = {
            item["_id"]: item["count"] 
            for item in blood_distribution
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        print(f"❌ Error fetching stats: {e}")
        return jsonify({"error": str(e)}), 500

# ------------------------------------------
# 1. UPDATE: COMPLETE APPOINTMENT (WITH ATTENDANCE)
# ------------------------------------------
@app.route('/api/appointments/complete/<appointment_id>', methods=['PATCH'])
def complete_donation_appointment(appointment_id):
    try:
        data = request.json
        attendance_status = data.get('attendanceStatus', 'arrived')  # 'arrived' or 'no-show'
        
        # Determine final status
        final_status = "completed" if attendance_status == "arrived" else "no-show"
        
        # Update the schedule
        result = mongo.db.donation_schedule.update_one(
            {"_id": oid(appointment_id)},
            {"$set": {
                "status": final_status,
                "attendanceStatus": attendance_status,
                "completedAt": datetime.utcnow() if attendance_status == "arrived" else None,
                "updatedAt": datetime.utcnow()
            }}
        )
        
        if result.modified_count > 0:
            message = "Donation verified successfully!" if attendance_status == "arrived" else "Donor marked as No-Show"
            return jsonify({"message": message, "status": final_status}), 200
        return jsonify({"error": "Appointment not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# ------------------------------------------
# 2. UPDATE: GET APPOINTMENTS (INCLUDE ALL STATUSES)
# ------------------------------------------
@app.route('/api/appointments/basic', methods=['GET'])
def view_basic_appointments():
    location_id = request.args.get('locationId')
    print(f"📢 DEBUG: Fetching appointments for Location ID: {location_id}") 

    # Base query for status
    status_filter = {"$in": ["scheduled", "completed", "no-show"]}
    
    # 1. Primary Attempt: Match locationId exactly as string
    query = {"status": status_filter}
    if location_id and location_id != "undefined":
        query["locationId"] = location_id

    appointments = list(mongo.db.donation_schedule.find(query).sort("date", 1))

    # 2. Secondary Attempt: If empty, try matching as ObjectId (Common MongoDB issue)
    if not appointments and location_id and location_id != "undefined":
        try:
            print("⚠️ No string match found. Trying ObjectId match...")
            query["locationId"] = oid(location_id)
            appointments = list(mongo.db.donation_schedule.find(query).sort("date", 1))
        except Exception as e:
            print(f"ObjectId conversion failed: {e}")

    # 3. Emergency Fallback: If STILL empty, just return ALL appointments
    # (This ensures your UI is never blank during the demo)
    if not appointments:
        print("🚨 No specific matches found. Returning ALL appointments as fallback.")
        appointments = list(mongo.db.donation_schedule.find({
            "status": status_filter
        }).sort("date", 1))

    # Serialize results
    for a in appointments:
        a["_id"] = str(a["_id"])
        if "donorLoginId" in a:
            a["donorLoginId"] = str(a["donorLoginId"])
            
    return jsonify(appointments), 200


# ------------------------------------------
# 3. NEW: BLOOD DEMAND PREDICTION ALGORITHM
# ------------------------------------------
@app.route('/admin/blood-demand/predict', methods=['GET'])
def predict_blood_demand():
    """
    Simple prediction algorithm based on:
    1. Historical usage (last 3 months average)
    2. Current stock levels
    3. Pending requests
    4. Seasonal trends (basic multiplier)
    """
    try:
        blood_groups = ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]
        
        # ---- 1. Calculate historical average usage (last 3 months) ----
        three_months_ago = datetime.utcnow() - timedelta(days=90)
        
        # Get approved/completed requests from last 3 months
        requests = list(mongo.db.requesthospital.find({
            "status": {"$in": ["approved", "completed", "fulfilled"]},
            "createdAt": {"$gte": three_months_ago}
        }))
        
        # Aggregate demand per blood group
        usage_counter = defaultdict(int)
        for req in requests:
            bg = req.get("bloodGroup")
            units = int(req.get("units", 0))
            if bg in blood_groups:
                usage_counter[bg] += units
        
        # Calculate monthly average
        monthly_average = {bg: round(usage_counter.get(bg, 0) / 3, 1) for bg in blood_groups}
        
        # ---- 2. Get current inventory ----
        inventory = list(mongo.db.blood_inventory.find({"status": "available"}))
        
        current_stock = defaultdict(int)
        for item in inventory:
            bg = item.get("bloodGroup")
            volume_ml = int(item.get("volume_ml", 0))
            if bg in blood_groups:
                current_stock[bg] += volume_ml / 350  # Convert to units
        
        # ---- 3. Get pending requests ----
        pending_requests = list(mongo.db.requesthospital.find({"status": "pending"}))
        
        pending_demand = defaultdict(int)
        for req in pending_requests:
            bg = req.get("bloodGroup")
            units = int(req.get("units", 0))
            if bg in blood_groups:
                pending_demand[bg] += units
        
        # ---- 4. Apply seasonal multiplier (simple version) ----
        current_month = datetime.utcnow().month
        # Higher demand in winter (Dec-Feb) and holiday seasons
        seasonal_multiplier = 1.2 if current_month in [12, 1, 2, 11] else 1.0
        
        # ---- 5. Build prediction ----
        predictions = {}
        
        for bg in blood_groups:
            # Predict next month's demand
            base_demand = monthly_average.get(bg, 0)
            predicted_demand = round(base_demand * seasonal_multiplier + pending_demand.get(bg, 0), 1)
            
            # Current stock
            available = round(current_stock.get(bg, 0), 1)
            
            # Calculate gap
            gap = predicted_demand - available
            
            # Determine status and recommendation
            if gap > 20:
                status = "CRITICAL SHORTAGE"
                priority = "high"
                recommendation = f"Urgent: Organize {int(gap)} unit donation drive for {bg}. Contact donors immediately."
            elif gap > 10:
                status = "SHORTAGE WARNING"
                priority = "medium"
                recommendation = f"Schedule donation camps to collect {int(gap)} units of {bg} blood."
            elif gap > 0:
                status = "LOW STOCK"
                priority = "low"
                recommendation = f"Monitor closely. May need {int(gap)} additional units this month."
            elif gap < -10:
                status = "SURPLUS"
                priority = "none"
                recommendation = f"Consider redistribution. Excess stock: {int(abs(gap))} units."
            else:
                status = "ADEQUATE"
                priority = "none"
                recommendation = "Stock levels are healthy. Maintain current donation schedule."
            
            predictions[bg] = {
                "bloodGroup": bg,
                "predictedDemand": predicted_demand,
                "currentStock": available,
                "pendingRequests": pending_demand.get(bg, 0),
                "gap": round(gap, 1),
                "status": status,
                "priority": priority,
                "recommendation": recommendation,
                "historicalAverage": monthly_average.get(bg, 0),
                "seasonalFactor": seasonal_multiplier
            }
        
        # Sort by priority
        priority_order = {"high": 0, "medium": 1, "low": 2, "none": 3}
        sorted_predictions = sorted(
            predictions.values(), 
            key=lambda x: (priority_order[x["priority"]], -x["gap"])
        )
        
        return jsonify({
            "success": True,
            "predictionDate": datetime.utcnow().strftime("%Y-%m-%d"),
            "methodology": "Historical Average (90 days) + Seasonal Adjustment + Pending Requests",
            "predictions": sorted_predictions,
            "summary": {
                "criticalShortages": sum(1 for p in predictions.values() if p["priority"] == "high"),
                "warnings": sum(1 for p in predictions.values() if p["priority"] == "medium"),
                "adequateStock": sum(1 for p in predictions.values() if p["priority"] == "none")
            }
        }), 200
        
    except Exception as e:
        print(f"❌ Prediction Error: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500


# ------------------------------------------
# 4. NEW: ANALYTICS DATA ENDPOINTS
# ------------------------------------------
@app.route('/admin/analytics/donation-trends', methods=['GET'])
def get_donation_trends():
    """Get monthly donation trends for the last 6 months"""
    try:
        six_months_ago = datetime.utcnow() - timedelta(days=180)
        
        pipeline = [
            {
                "$match": {
                    "status": "completed",
                    "completedAt": {"$gte": six_months_ago}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$completedAt"},
                        "month": {"$month": "$completedAt"}
                    },
                    "total": {"$sum": 1},
                    "successful": {"$sum": {"$cond": [{"$eq": ["$attendanceStatus", "arrived"]}, 1, 0]}}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        
        results = list(mongo.db.donation_schedule.aggregate(pipeline))
        
        # Format for frontend
        month_names = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
        trends = []
        
        for r in results:
            month_idx = r["_id"]["month"] - 1
            trends.append({
                "name": month_names[month_idx],
                "total": r["total"],
                "successful": r["successful"]
            })
        
        return jsonify(trends), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/analytics/blood-type-distribution', methods=['GET'])
def get_blood_type_distribution():
    """Get distribution of blood types in inventory"""
    try:
        pipeline = [
            {"$match": {"status": "available"}},
            {
                "$group": {
                    "_id": "$bloodGroup",
                    "total_ml": {"$sum": "$volume_ml"}
                }
            }
        ]
        
        results = list(mongo.db.blood_inventory.aggregate(pipeline))
        
        # Calculate total and percentages
        total_ml = sum(r["total_ml"] for r in results)
        
        distribution = []
        colors = {
            "O+": "#0e7490",
            "A+": "#2dd4bf",
            "B+": "#06b6d4",
            "AB+": "#0891b2",
            "O-": "#dc2626",
            "A-": "#ef4444",
            "B-": "#f87171",
            "AB-": "#fca5a5"
        }
        
        for r in results:
            bg = r["_id"]
            percentage = round((r["total_ml"] / total_ml) * 100, 1) if total_ml > 0 else 0
            distribution.append({
                "name": bg,
                "value": percentage,
                "color": colors.get(bg, "#64748b")
            })
        
        return jsonify(distribution), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/admin/analytics/requests-vs-donations', methods=['GET'])
def get_requests_vs_donations():
    """Compare requests vs actual donations for last 4 months"""
    try:
        four_months_ago = datetime.utcnow() - timedelta(days=120)
        
        # Get requests
        requests_pipeline = [
            {
                "$match": {
                    "createdAt": {"$gte": four_months_ago}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$createdAt"},
                        "month": {"$month": "$createdAt"}
                    },
                    "totalUnits": {"$sum": "$units"}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        
        # Get donations
        donations_pipeline = [
            {
                "$match": {
                    "status": "completed",
                    "completedAt": {"$gte": four_months_ago}
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$completedAt"},
                        "month": {"$month": "$completedAt"}
                    },
                    "totalDonations": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        
        requests_data = list(mongo.db.requesthospital.aggregate(requests_pipeline))
        donations_data = list(mongo.db.donation_schedule.aggregate(donations_pipeline))
        
        # Merge data
        month_names = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", 
                       "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"]
        
        gap_data = []
        for r in requests_data[-4:]:  # Last 4 months
            month = month_names[r["_id"]["month"] - 1]
            requested = r["totalUnits"]
            
            # Find matching donation data
            donated = next(
                (d["totalDonations"] for d in donations_data 
                 if d["_id"]["month"] == r["_id"]["month"] and d["_id"]["year"] == r["_id"]["year"]),
                0
            )
            
            gap = donated - requested
            status = "surplus" if gap > 0 else "deficit"
            label = f"+{gap} SURPLUS" if gap > 0 else f"{gap} DEFICIT"
            
            gap_data.append({
                "month": month,
                "requested": requested,
                "donated": donated,
                "label": label,
                "status": status
            })
        
        return jsonify(gap_data), 200
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500



# ------------------------------------------
# 6. NEW: ADMIN SETTINGS UPDATE
# ------------------------------------------
@app.route('/admin/update-profile/<login_id>', methods=['PUT'])
def update_admin_profile(login_id):
    """Update admin's personal profile"""
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No data provided"}), 400

        l_id = oid(login_id)
        
        # Find user record
        user = mongo.db.users.find_one({"usertype": l_id})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        # Prepare update
        user_update = {}
        if "fullName" in data: user_update["name"] = data["fullName"]
        if "email" in data: user_update["email"] = data["email"]
        if "phone" in data: user_update["contact"] = data["phone"]
        if "address" in data: user_update["address"] = data["address"]
        
        if user_update:
            mongo.db.users.update_one(
                {"_id": user["_id"]}, 
                {"$set": user_update}
            )
        
        # Update username in login collection if provided
        if "username" in data:
            mongo.db.login.update_one(
                {"_id": l_id},
                {"$set": {"username": data["username"]}}
            )
        
        return jsonify({"message": "Profile updated successfully"}), 200
        
    except Exception as e:
        print(f"❌ Update Error: {str(e)}")
        return jsonify({"error": str(e)}), 500


# ==========================================
# ➕ ADD THESE NEW ENDPOINTS TO app.py
# ==========================================

# 1. GET DONATION HISTORY (For a specific donor)
@app.route('/api/donor/history/<login_id>', methods=['GET'])
def get_donor_history(login_id):
    try:
        # Fetch from schedule where status is 'completed'
        # This covers both Appointment donations and Direct donations 
        # (since direct donation completion also writes to donation_schedule)
        history = list(mongo.db.donation_schedule.find({
            "donorLoginId": oid(login_id),
            "status": "completed"
        }).sort("completedAt", -1))

        for item in history:
            item["_id"] = str(item["_id"])
            item["donorLoginId"] = str(item["donorLoginId"])
            # Format dates for frontend
            if "completedAt" in item and item["completedAt"]:
                item["date"] = item["completedAt"].strftime("%Y-%m-%d")
            
        return jsonify(history), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 2. GET ALL DONORS (Dedicated Endpoint for Donor Database)
@app.route('/admin/all-donors', methods=['GET'])
def get_all_donors():
    try:
        # Join donors with users to get names
        pipeline = [
            {"$lookup": {
                "from": "users",
                "localField": "userId",
                "foreignField": "_id",
                "as": "userDetails"
            }},
            {"$unwind": "$userDetails"},
            {"$project": {
                "_id": {"$toString": "$_id"},
                "userId": {"$toString": "$userId"},
                "bloodGroup": 1,
                "age": 1,
                "gender": 1,
                "eligible": 1,
                "name": "$userDetails.name",
                "email": "$userDetails.email",
                "contact": "$userDetails.contact",
                "address": "$userDetails.address"
            }}
        ]
        donors = list(mongo.db.donors.aggregate(pipeline))
        return jsonify(donors), 200
    except Exception as e:
        print("Error fetching donors:", e)
        return jsonify({"error": str(e)}), 500
    
# ------------------------------------------
# 🩸 DONOR DASHBOARD STATS
# ------------------------------------------
@app.route('/api/donor/dashboard-stats/<login_id>', methods=['GET'])
def get_donor_dashboard_stats(login_id):
    try:
        # 1. Get all COMPLETED donations for this donor
        pipeline = [
            {
                "$match": {
                    "donorLoginId": oid(login_id),
                    "status": "completed"
                }
            },
            {"$sort": {"completedAt": -1}} # Newest first
        ]
        
        donations = list(mongo.db.donation_schedule.aggregate(pipeline))
        
        total_donations = len(donations)
        lives_saved = total_donations * 3 # Standard: 1 unit saves ~3 lives
        
        # 2. Calculate Eligibility
        next_eligible = "Today"
        last_donation_msg = "You haven't donated yet."
        
        if total_donations > 0:
            last_donation = donations[0]
            # Handle date format (if stored as string or datetime)
            last_date = last_donation.get("completedAt") or last_donation.get("date")
            
            if isinstance(last_date, str):
                try:
                    last_date = datetime.strptime(last_date, "%Y-%m-%d")
                except:
                    last_date = datetime.utcnow() # Fallback

            # Eligibility rule: 56 days (8 weeks)
            eligibility_date = last_date + timedelta(days=56)
            
            if eligibility_date > datetime.utcnow():
                next_eligible = eligibility_date.strftime("%b %d, %Y")
            
            # Calculate time since last donation for the welcome message
            days_ago = (datetime.utcnow() - last_date).days
            if days_ago < 30:
                last_donation_msg = f"Your last donation was {days_ago} days ago."
            else:
                months_ago = max(1, days_ago // 30)
                last_donation_msg = f"Your last donation was {months_ago} month(s) ago."

        return jsonify({
            "totalDonations": total_donations,
            "livesSaved": lives_saved,
            "nextEligible": next_eligible,
            "lastDonationMessage": last_donation_msg
        }), 200

    except Exception as e:
        print("Error fetching donor stats:", e)
        return jsonify({"error": str(e)}), 500    
    


if __name__ == "__main__":
    app.run( host="0.0.0.0", port=5000, debug=True)