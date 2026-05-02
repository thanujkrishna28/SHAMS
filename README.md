# 🏫 Smart HMS: The Ultimate Hostel Management Ecosystem

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

A high-performance, enterprise-grade MERN stack ecosystem designed for modern university residences. **Smart HMS** transcends traditional management by integrating AI-driven insights, biometric security, and real-time synchronization to create a seamless living experience for students and a powerful command center for administrators.

---

## 🌟 Visionary Features

### 🤖 Intelligence & Automation
- **✨ Hybrid AI Notification Engine**: Leveraging **Google Gemini 1.5 Pro**, the system delivers precise structured alerts enhanced by context-aware AI summaries.
- **✨ AI Complaint Intelligence**: Auto-categorization, priority detection, and generated resolution strategies for incoming grievances.
- **✨ Smart Room Recommendations**: Personalized suggestion engine based on occupancy metrics, student preferences, and historical data.

### 🔐 Security & Identity
- **✨ Biometric & Passkey Auth**: Integrated **WebAuthn** support for hardware-based, passwordless login security (Fingerprint/FaceID).
- **✨ Dynamic QR Identity**: Real-time rotating QR codes for student entry/exit verification with instant security logging.
- **✨ Digital ID Cards**: High-fidelity virtual ID cards with embedded QR technology and instant status verification.

### 💳 Financial & Operational
- **✨ Razorpay Integration**: Seamless digital fee payments with instant ledger updates and automated receipt generation.
- **✨ Command Center (Chief Warden)**: A real-time monitoring hub with live attendance heatmaps, occupancy trends, and broadcast capabilities.
- **✨ Mess Management 2.0**: Predictive diner analytics, weekly menu configuration, and separate Veg/Non-Veg tracking systems.

---

## 👥 Role-Specific Portals

### 👨‍🎓 Student Experience
- **Digital Command Center**: Real-time overview of attendance, mess schedules, and active alerts.
- **Infrastructure Services**: Apply for room allocations, track laundry status, and manage parcel pickups.
- **Life Management**: Seamless leave applications, visitor pre-registration, and interactive feedback systems.

### 🧑‍💼 Chief Warden (Command Center)
- **High-Level Oversight**: Approve/Reject room allocations and monitor overarching hostel health.
- **Financial Ledger**: Track billing, invoices, and offline payment verifications.
- **Staff Management**: Monitor Warden performance and handle escalated complaints.

### 🧑‍🔧 Warden (Operational Desk)
- **Daily Rounds**: Fast-action mobile interface for night attendance verification.
- **Local Resolution**: Level 1 complaint handling and block-level announcement broadcasting.
- **Gatekeeper Services**: Verify student movements and log incoming packages.

### 🛡️ Security & Staff
- **QR Scanning Hub**: Instant verification for student entry/exit and visitor logging.
- **Movement Analytics**: Real-time logs of student presence and late-entry flags.

---

## 🛠️ Technology Stack

| Category | Technologies |
| :--- | :--- |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Framer Motion, React Query, Zustand |
| **Backend** | Node.js, Express.js, TypeScript, Socket.io, Node-Cron, Nodemailer |
| **Database** | MongoDB, Mongoose ODM |
| **AI/ML** | Google Generative AI (Gemini 1.5), Custom NLP Pipelines |
| **Integration** | Razorpay SDK, WebAuthn (Passkeys), Cloudinary (Assets) |

---

## 📂 Project Architecture

```bash
smart-hms/
├── client/                     # Frontend React Ecosystem
│   ├── src/
│   │   ├── api/                # Standardized Axios interfaces
│   │   ├── components/         # Premium UI Components & Role Layouts
│   │   ├── pages/              # Role-Based Modular Pages
│   │   │   ├── admin/          # Shared Administrative Modules
│   │   │   ├── chief-warden/   # Exclusive Chief Warden Command Pages
│   │   │   ├── warden/         # Warden Operational Modules
│   │   │   └── student/        # Student Self-Service Portal
│   │   ├── store/              # Global State (Zustand)
│   │   └── types/              # Centralized TypeScript Definitions
├── server/                     # Backend API & WebSocket Engine
│   ├── src/
│   │   ├── controllers/        # Enterprise Request Logic
│   │   ├── models/             # Mongoose Schemas & Middleware
│   │   ├── routes/             # RBAC Protected API Endpoints
│   │   └── socket/             # Real-time Event Handlers
```

---

## 🚀 Getting Started

### 1. Repository Setup
```bash
git clone https://github.com/your-org/smart-hms.git
cd smart-hms
```

### 2. Backend Configuration
```bash
cd server
npm install
# Create .env with:
# PORT=5000, MONGO_URI, JWT_SECRET, GEMINI_API_KEY, RAZORPAY_KEY, etc.
npm run dev
```

### 3. Frontend Initialization
```bash
cd ../client
npm install
npm run dev
```

### 4. Database Seeding (Optional)
```bash
# In server directory
npm run seed  # Populates sample buildings, staff, and a test student
```

---

## 🎓 Academic Integration
Optimized for **Vignan University** standards, supporting:
- **Biogas Sustainability Tracking**
- **SLA-Based Complaint Resolution**
- **Hybrid Mess Preferences** (Veg/Non-Veg/Special)

## 📝 License
Distributed under the **MIT License**. See `LICENSE` for more information.

---

<p align="center">
  Built with ❤️ by the Antigravity Team
</p>
