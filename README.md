# Trinetra – Safe Route Navigation for Women & Vulnerable Groups

<div align="center">

🚨 Smart Safety Navigation Platform for Women and Vulnerable Groups

Built with ❤️ using React, Node.js, Firebase & PostgreSQL

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-green?logo=node.js)](https://nodejs.org/)
[![Firebase](https://img.shields.io/badge/Firebase-Authentication-orange?logo=firebase)](https://firebase.google.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>

---

# 📌 Overview

**Trinetra** is an intelligent safety and navigation platform designed to help women and vulnerable groups travel more safely using real-time safety analytics, incident reporting, live tracking, and AI-powered safe route recommendations.

The platform combines:

* 📍 Real-time safety scoring
* 🛣️ Smart safe route suggestions
* 🚨 Emergency alert systems
* 👥 Community-driven safety reports
* 📡 Live location sharing
* 📊 Admin analytics dashboard

---

# ✨ Key Features

## 🔐 Safety Score System

* Real-time safety rating (0–100)
* Risk level indicators
* Area-based safety insights
* Emergency response tracking
* Personalized safety recommendations

---

## 🛣️ Smart Route Recommendations

Provides 3 intelligent route options:

| Route Type        | Description              | Safety Rating |
| ----------------- | ------------------------ | ------------- |
| 🟢 Safest Route   | Well-lit & crowded roads | 95%           |
| 🟡 Balanced Route | Safety + Time optimized  | 78%           |
| 🔴 Fastest Route  | Shortest possible path   | 65%           |

Features include:

* Distance & ETA
* CCTV coverage
* Police patrol zones
* Busy/safe streets
* Turn-by-turn navigation

---

## 🚨 Incident Reporting System

Users can report:

* Harassment
* Theft
* Accident
* Suspicious activity
* Other emergencies

Additional capabilities:

* Photo upload
* GPS location capture
* Severity levels
* Anonymous reporting
* Auto-generated tracking ID

---

## 📡 Live Location Sharing

* Share live location with trusted contacts
* Real-time tracking timer
* Emergency stop sharing
* Multiple contact support
* Custom duration selection

---

## 🔔 Real-Time Alerts

* Crime alerts
* Nearby incident notifications
* Safety warnings
* Emergency announcements
* Area-wise alert management

---

## 👥 Community Forum

* Community safety discussions
* Awareness sharing
* Safety recommendations
* User experiences
* Local safety tips

---

## 📊 Admin Dashboard

Authorities/Admins can:

* Monitor incidents
* View hotspot analytics
* Track response times
* Manage divisions
* Analyze safety trends

---

# 🛠️ Tech Stack

## Frontend

* React.js
* React Router
* Leaflet Maps
* MapBox GL
* React Icons
* React Leaflet

## Backend

* Node.js
* Express.js
* PostgreSQL
* Firebase
* Nodemailer

## Mobile Support

* Capacitor
* Android & iOS support

---

# 📂 Project Structure

```bash
safe-route-app/
│
├── client/                 # React Frontend
│   ├── src/
│   ├── public/
│
├── server/                 # Node.js Backend
│   ├── index.js
│   ├── db.js
│
├── README.md
└── update_db.sql
```

---

# ⚙️ Installation

## 1️⃣ Clone Repository

```bash
git clone https://github.com/ansh09876711/Trinetra---Safe-Route-Navigation-for-Women-and-Vulnerable-Groups.git
```

---

## 2️⃣ Navigate to Project

```bash
cd safe-route-app
```

---

## 3️⃣ Install Dependencies

### Root Dependencies

```bash
npm install
```

### Client Dependencies

```bash
cd client
npm install
```

### Server Dependencies

```bash
cd server
npm install
```

---

# 🔑 Environment Variables

## Server `.env`

```env
PORT=5000
DATABASE_URL=your_database_url
FIREBASE_API_KEY=your_firebase_api_key
NODE_ENV=development
SMTP_USER=your_email
SMTP_PASSWORD=your_password
```

---

## Client `.env`

```env
REACT_APP_FIREBASE_API_KEY=your_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_DATABASE_URL=your_database_url
REACT_APP_API_URL=http://localhost:5000
```

---

# ▶️ Run the Project

## Start Frontend

```bash
npm run start-client
```

## Start Backend

```bash
npm run start-server
```

---

# 🌐 Application Routes

| Route                 | Description           |
| --------------------- | --------------------- |
| `/login`              | User Login            |
| `/dashboard`          | User Dashboard        |
| `/enhanced-dashboard` | Main Dashboard        |
| `/analytics`          | Safety Analytics      |
| `/admin-dashboard`    | Admin Panel           |
| `/division-dashboard` | Division Management   |
| `/community-forum`    | Community Discussions |

---

# 🔒 Security Features

* Firebase Authentication
* Role-Based Access Control
* Anonymous Reporting
* Encrypted Data Transmission
* HTTPS/TLS Support
* Secure API Configuration
* Input Validation & Sanitization

---

# 📱 Mobile Deployment

## Android Build

```bash
ionic capacitor build android
```

## iOS Build

```bash
ionic capacitor build ios
```

---

# 🚀 Future Enhancements

* AI-powered threat detection
* Multi-language support
* Emergency services integration
* Wearable device connectivity
* ML-based route optimization
* Government safety integrations

---

# 🤝 Contributing

1. Fork the repository
2. Create a feature branch

```bash
git checkout -b feature-name
```

3. Commit changes

```bash
git commit -m "Added new feature"
```

4. Push code

```bash
git push origin feature-name
```

5. Create Pull Request

---

# 📸 Screenshots

*Add your project screenshots here.*

---

# 📄 License

This project is licensed under the **MIT License**.

---

# 🙌 Acknowledgements

* Built for Hackathons & Social Safety Initiatives
* Inspired by the need for safer public spaces
* Dedicated to empowering women and vulnerable communities

---

<div align="center">

## ⭐ Support the Project

If you found this project useful:

⭐ Star the repository
🍴 Fork the project
📢 Share it with others

### “Empowering Safety, One Route at a Time.”

</div>
