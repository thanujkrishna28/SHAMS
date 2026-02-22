
# 🏫 Smart Hostel Management System

A comprehensive MERN stack web application for managing modern university hostels. Features role-based access for Students, Admins, and Security personnel, with digital ID cards, room allocation, attendance tracking, and complaint management.

## 🚀 Features

### 👨‍🎓 For Students
- **Dashboard**: Overview of attendance, room details, and recent announcements.
- **Profile**: 
  - Digital ID Card with QR Code.
  - Personal & Academic details.
  - Guardian info & Address management.
  - Document Upload (ID Proof, Admission Letter).
- **Room Allocation**:
  - View available blocks and rooms.
  - Request room allocation (Single/Double/Triple/Dorm).
  - View allocation status.
- **Attendance**:
  - Generate dynamic QR codes for Entry/Exit scanning.
  - View personal attendance history.
- **Complaints**:
  - Raise maintenance or other complaints.
  - Track complaint status.
- **Leave Management**:
  - Apply for leave (Sick/Personal/Academic/Emergency).
  - Track leave approval status.
- **Mess & Dining**:
  - View **Weekly Menu** (Veg & Non-Veg options).
  - One-time **Mess Style Selection** (Veg/Non-Veg).
  - Submit **Mess Feedback** (Rating, Category, Comments).
  - Option for anonymous feedback submission.
- **About Us**: 
  - Vignan University-specific hostel details.
  - Interactive **Infrastructure** & **Mess** showcases.
  - Sustainability highlights (Biogas Project).
- **Visitor Pass**: 
  - Pre-register visitors for faster entry.
  - Real-time status tracking (Pending/Approved/Checked-in).
  - Safety protocols & digital gate-pass system.

### 👮‍♂️ For Admins
- **Premium Admin Suite**: 
  - **High-Fidelity UI**: Completely modernized, SaaS-style interface with glassmorphic cards and motion transitions.
  - **Intelligent Filtering**: Advanced multi-layer filtering (by Building, Block, Status, Track, and type) across all modules.
  - **Dossier-Style Roster**: Comprehensive student management with profile image integration.
- **Dashboard**: 
  - Real-time stats on occupancy, pending requests, and performance KPIs.
  - **Advanced Analytics**: Attendance trends (last 7 days), complaint resolution time, and allocation processing time.
- **Student Management**: 
  - List all students.
  - Verify student profiles & documents.
- **Room Management**:
  - Create and manage Blocks and Rooms.
  - **Room Status Control**: Set rooms to Maintenance or Locked modes.
  - View room occupancy status.
- **Allocations**:
  - Review and Approve/Reject room allocation requests.
- **Complaints & Leaves**:
  - Manage and resolve student complaints.
  - Approve or Reject leave applications.
- **Notifications & Broadcasts**: Automated system alerts. **Emergency Broadcast** mode for urgent announcements.
- **Mess Management**:
  - Configure **Weekly Food Menu** for all days.
  - Separate Veg and Non-Veg item management.
  - Moderate student **Mess Feedback**.
- **Reports**: Generate automated **Weekly PDF Reports** with operational stats.
- **Visitor Management**:
  - Approve/Reject visitor pre-approval requests.
  - View visitor history and logs.
- **Mess Analytics**:
  - **Diner Insights**: Live visualization of student meal preferences (Veg/Non-Veg/etc.).
  - **Operational KPIs**: Real-time satisfaction ratings and mess attendance trends.
  - **Inventory Forecasting**: Predictive alerts for low stock based on the upcoming menu.
- **Advanced System Settings**:
  - **Operational Flags**: Global toggle for **Maintenance Mode** (locks student portal).
  - **Gate Protocol**: Enable/Disable QR scanning systems.
  - **Policy Configuration**: Customize Late Entry thresholds and Leave submission deadlines.
  - **Alert Routing**: Configure email webhooks and escalation paths for complaints.

### 🛡️ For Security
- **QR Scanner**: Scan student QR codes for verified Entry/Exit.
- **Visitor Check-in**: 
  - Verify pre-approved visitors.
  - Mark visitor Check-in and Check-out times.
- **Movements**: Log and track student movements.

---

## 🛠️ Technology Stack

- **Frontend**: 
  - React (Vite)
  - TypeScript
  - Tailwind CSS
  - Framer Motion (Animations)
  - React Query (State Management)
  - React Router DOM
  - React Hook Form
  - Lucide React (Icons)
  - Chart.js & React-Chartjs-2 (Data Visualization)
  
- **Backend**:
  - Node.js
  - Express.js
  - TypeScript
  - Mongoose (MongoDB ODM)
  - JSON Web Tokens (JWT) for Authentication
  - Multer (File Uploads)

- **Database**: MongoDB

---

## 📂 Project Structure

```
smart-hms/
├── client/                 # Frontend React App
│   ├── src/
│   │   ├── api/            # Axios instance and API calls
│   │   ├── components/     # Reusable components & Layouts
│   │   ├── hooks/          # Custom React Hooks (useAdmin, useLeaves, etc.)
│   │   ├── pages/          # Application Pages (Student, Admin, Auth)
│   │   ├── store/          # Zustand State Management (authStore)
│   │   └── types/          # TypeScript Interfaces
│   └── ...
├── server/                 # Backend Node/Express App
│   ├── src/
│   │   ├── config/         # DB Connection
│   │   ├── controllers/    # Request Handlers
│   │   ├── middleware/     # Auth & Error Middleware
│   │   ├── models/         # Mongoose Models (User, Room, Leave, etc.)
│   │   ├── routes/         # API Routes
│   │   └── utils/          # Helper functions
│   └── ...
└── ...
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MongoDB (Local or Atlas)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/smart-hms.git
    cd smart-hms
    ```

2.  **Setup Server:**
    ```bash
    cd server
    npm install
    ```
    *   Create a `.env` file in `server/`:
        ```env
        PORT=5000
        MONGO_URI=mongodb://localhost:27017/smarthms
        JWT_SECRET=your_jwt_secret_key_here
        NODE_ENV=development
        ```

3.  **Setup Client:**
    ```bash
    cd ../client
    npm install
    ```

### Running the App

1.  **Start Backend:**
    ```bash
    # In /server terminal
    npm run dev
    ```

2.  **Start Frontend:**
    ```bash
    # In /client terminal
    npm run dev
    ```

3.  Access the app at `http://localhost:5173`

### 🏗️ Database Seeding (Optional)
To quickly populate the system with dummy users, rooms, and a **Weekly Mess Menu**:
```bash
# In /server terminal
npm run seed
```
This will create:
- **Admin**: `admin@test.com` / `password`
- **Student**: `seed@test.com` / `password` (Verified with room SEED-01)
- **Weekly Menu**: High-fidelity Vignan University mess schedule.

---

## 🔑 Default Roles & Access

*   **Student**: Register a new account via the signup page.
*   **Admin**: Login via `/admin/login`. (You may need to seed an admin user in DB or change role manually in MongoDB).
*   **Security**: Dedicated login for security personnel.

---

## � User Workflows

### 👨‍🎓 Student Workflow

1.  **Registration & Profile Setup**:
    *   Sign up using the registration page.
    *   Navigate to **Profile** to update personal details (Guardian info, Address).
    *   Upload required documents: **ID Proof** and **Admission Letter**.
    *   Wait for **Admin Verification** (Profile badge changes to "Verified").

2.  **Room Allocation**:
    *   Once verified, go to **My Room**.
    *   View available Blocks and Room configurations.
    *   Select a preferred Room Type (e.g., Double Sharing) and Block.
    *   Submit an **Allocation Request**.
    *   Wait for Admin approval. Once approved, the room number is assigned and displayed on the Dashboard.

3.  **Daily Operations**:
    *   **Attendance**: Use the **Attendance** tab to generate a dynamic QR code. Scan this at the gate for Entry/Exit.
    *   **Notifications**: Check the bell icon 🔔 for real-time updates on your requests (Leave, Allocation, Complaints).
    *   **Complaints**: Face an issue? Go to **Complaints** > "New Complaint". Select category (Maintenance, WiFi, etc.) and submit.
    *   **Leaves**: Planning to go home? Go to **Leave** > "Apply for Leave". Enter dates and reason. Wait for approval.
    *   **Visitors**: Expecting a guest? Go to **Visitors** > "Register Visitor". Security will see the approval upon arrival.
    *   **Mess**: Check the **Mess** tab for today's menu. Use the feedback form to rate your meal quality.
    *   **About**: Visit the **About** page for support contact details and campus office locations.

### 👮‍♂️ Admin Workflow

1.  **Onboarding Students**:
    *   Go to **Students** tab.
    *   Review new registrations. Check uploaded documents.
    *   Click **Verify** to activate their student status.

2.  **Managing Infrastructure**:
    *   Go to **Rooms** tab.
    *   Create new Blocks (e.g., "Block A", "Block B").
    *   Add Rooms to these blocks with specific capacities (Single, Double, etc.).

3.  **Processing Requests**:
    *   **Allocations**: Navigate to **Allocations**. Review student room requests. Assign specific room numbers based on availability.
    *   **Complaints**: Check **Complaints** tab. Mark issues as "Resolved" when fixed.
    *   **Leaves**: Check **Leaves** tab. Approve or Reject student leave applications based on policy.

4.  **Monitoring & Communication**:
    *   Use **Dashboard** to view total occupancy, active complaints, and daily attendance stats.
    *   **Mess**: Navigate to **Mess** to update the weekly food schedule and review student ratings.
    *   **Broadcast**: Send important announcements (or Emergency Alerts) to all students or specific blocks.
    *   **Reports**: Download weekly operational reports for management review.

---

## 📈 Scalability & Performance
- **Pagination**: All listing APIs (Students, Complaints, Leaves) support pagination for scalable data handling.
- **Indexed Queries**: Database fields are indexed for fast retrieval.
- **Server-side Filtering**: Efficient filtering logic implemented on the backend.
- **API Standardization**: 
  - Standardized JSON response formats for successful and failed requests.
  - Unified error handling via custom global error middleware.
  - Consistent RESTful route patterns across all modules (Mess, Attendance, Visitors, etc.).
  - Centralized API configuration on the frontend using Axios interceptors.

## 🔒 Security Hardening
- **Rate Limiting**: API avenues protected against abuse.
- **Helmet**: Secure HTTP headers enabled.
- **Data Sanitization**: Input validation and Mongo injection prevention.
- **HPP**: Protection against HTTP Parameter Pollution.

## 🎓 University Standards
This system is optimized for **Vignan University** hostel policies:
- **Sustainability**: Integrated tracking for eco-initiatives like the Biogas Project.
- **Student Wellness**: 24/7 Medical Hub and biometric security integration.
- **Mess Excellence**: Standardized mess preferences (Veg/Non-Veg) aligned with campus dining standards.

## � Audit Logging
- **Action Tracking**: Critical admin actions (Allocations, Leaves, Complaints) are logged.
- **Traceability**: Logs include Admin ID, Action Type, Target ID, Timestamp, and IP Address.

## �📝 License
This project is licensed under the MIT License.
