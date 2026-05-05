# 🏫 SHAMS: Smart Hostel Management System
### *The Ultimate Enterprise-Grade Hostel Management Ecosystem*

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![Render](https://img.shields.io/badge/Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://render.com/)

**SHAMS** (Smart Hostel Management System) is a high-performance, production-ready MERN stack ecosystem designed for modern university residences. It transcends traditional management by integrating AI-driven insights, biometric security, and real-time synchronization to create a seamless living experience for students and a powerful command center for administrators.

---

## 🌟 Visionary Features

### 🔐 Security & Identity 2.0
- **✨ Biometric & Passkey Auth**: Integrated **WebAuthn** support for hardware-based, passwordless login security using Fingerprint, FaceID, or Device PIN.
- **✨ Dynamic QR Identity**: Real-time rotating QR codes for student entry/exit verification with instant security logging and anti-spoofing logic.
- **✨ Digital ID Cards**: High-fidelity virtual ID cards with embedded QR technology and instant status verification for campus services.

### 🤖 Intelligence & Automation
- **✨ Hybrid AI Notification Engine**: Leveraging **Google Gemini 1.5 Pro**, the system delivers precise structured alerts enhanced by context-aware AI summaries.
- **✨ AI Complaint Intelligence**: Auto-categorization, priority detection, and generated resolution strategies for incoming student grievances.
- **✨ Smart Room Selection**: A "BookMyShow" style interactive room picker allowing students to view occupancy and select roommates in real-time.

### 💳 Financial & Operational
- **✨ Razorpay Integration**: Seamless digital fee payments with instant ledger updates, automated receipt generation, and transaction tracking.
- **✨ Multi-Cloud Deployment**: Frontend optimized for **Vercel Edge** with reverse-proxying, and Backend hosted on **Render** for high-availability.
- **✨ Mess Management**: Predictive diner analytics, weekly menu configuration, and separate tracking for Veg/Non-Veg/Special diets.

---

## 👥 Role-Specific Portals

### 👨‍🎓 Student Experience
- **Digital Command Center**: Real-time overview of attendance, fee status, and active hostel announcements.
- **Infrastructure Services**: Apply for room allocations, track laundry status, and manage parcel pickups.
- **Life Management**: Seamless leave applications with parent notification and visitor pre-registration.

### 🧑‍💼 Chief Warden (Command Center)
- **High-Level Oversight**: Real-time monitoring hub with live attendance heatmaps and occupancy trends.
- **Global Management**: Manage staff (Wardens), broadcast global announcements, and handle escalated grievances.
- **Finance Hub**: Track total revenue, verify offline payments, and generate monthly financial reports.

### 🧑‍🔧 Warden (Operational Desk)
- **Daily Operations**: Manage block-specific attendance, verify student movements, and handle local complaints.
- **Resource Management**: Assign/Reassign rooms at the block level and monitor student document verification status.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, Zustand |
| **Backend** | Node.js, Express.js, TypeScript, Mongoose ODM |
| **Cloud** | Vercel (Frontend), Render (Backend), MongoDB Atlas (Database) |
| **Security** | WebAuthn (Passkeys), JWT, Argon2 Hashing, HTTPS |
| **Integration** | Razorpay SDK, Google Gemini AI API, Cloudinary |

---

## 🚀 Deployment & Installation

### 🏗️ Architecture
The system is designed for a decoupled deployment:
- **Frontend**: Deployed on Vercel (`client/` root). Uses `vercel.json` to proxy `/api` requests to the backend.
- **Backend**: Deployed on Render (`server/` root).

### 1. Clone & Install
```bash
git clone https://github.com/thanujkrishna28/SHAMS.git
cd SHAMS
```

### 2. Backend Setup (`/server`)
```bash
cd server
npm install
# Create .env with MONGO_URI, JWT_SECRET, GEMINI_API_KEY, etc.
npm run build
npm start
```

### 3. Frontend Setup (`/client`)
```bash
cd client
npm install
npm run build
# Ensure vercel.json points to your backend URL
```

### 4. Admin Credentials
The system comes with default master credentials for initialization:
- **Chief Warden**: `warden@university.edu` / `warden123`
- **System Admin**: `admin@university.edu` / `admin123`

---

## 📂 Project Structure
```bash
SHAMS/
├── client/                 # Frontend React (Vite + TypeScript)
│   ├── src/
│   │   ├── pages/          # Modular role-based pages (Student, Warden, Chief)
│   │   ├── components/     # Glassmorphic UI components
│   │   └── store/          # Zustand auth and state management
├── server/                 # Backend API (Node + Express + TS)
│   ├── src/
│   │   ├── controllers/    # Business logic & AI integration
│   │   ├── models/         # Mongoose relational schemas
│   │   └── scripts/        # Database maintenance & seeding tools
```

---

## 📝 License
Distributed under the **MIT License**.

<p align="center">
  Built with ❤️ by <b>Antigravity Team</b>
</p>
