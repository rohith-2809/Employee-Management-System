
---

# Employee Management System (EMS)

> **AI-Enhanced Workforce, Task & Performance Management**

![React](https://img.shields.io/badge/Frontend-React-blue?style=for-the-badge\&logo=react)
![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge\&logo=node.js)
![MongoDB](https://img.shields.io/badge/Database-MongoDB-darkgreen?style=for-the-badge\&logo=mongodb)
![Auth](https://img.shields.io/badge/Auth-JWT-lightgrey?style=for-the-badge\&logo=jsonwebtokens)
![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)

**EMS** is a modern workforce management application built on the **MERN stack**, designed to automate employee handling, optimize task assignment, and deliver real-time performance insights. It empowers organizations with a centralized, efficient, and scalable employee tracking ecosystem.

---

## 🚀 Features

* **🧑‍💼 Admin Dashboard**: Complete control for creating, updating, and removing employees.
* **📋 Task Assignment Engine**: Assign tasks with title, description, category, priority & deadlines.
* **📊 Real-Time Task Tracking**: Monitor task states — New, Active, Completed, Failed.
* **👨‍🏭 Employee Portal**: Employees can view tasks and update progress seamlessly.
* **🔐 Secure Authentication**: JWT-based login with role-based access control (Admin / Employee).
* **📈 Performance Insights**: Dynamic statistics on individual and organizational productivity.

---

## 🛠️ Tech Stack

* **Frontend**: React (Vite), Tailwind CSS
* **Backend**: Node.js, Express
* **Database**: MongoDB (Atlas Ready)
* **Authentication**: JWT (Role-based Access Control)
* **Deployment**: Vercel / Render Ready

---

## 📦 Project Structure

```bash
EMS/
├── Client/                   # React Frontend
│   ├── src/
│   │   ├── config.js         # Centralized API configuration
│   │   └── ...
│   └── ...
├── Server/                   # Node.js Backend 
│   ├── Server.js             # Main Entry Point (Port 5000)
│   ├── controllers/          # Business Logic
│   ├── models/               # Employee & Task Schema
│   ├── routes/               # API Endpoints
│   └── ...
└── package.json              # Root deployment script
```

---

## ⚡ Quick Start

### Prerequisites

* Node.js (v16+)
* MongoDB URI
* JWT Secret Key

### 1. Clone & Install

```bash
git clone https://github.com/your-username/ems.git
cd ems
npm run install-all   # Installs dependencies for both Client and Server
```

### 2. Configure Environment Variables

Create a `.env` file inside the `Server/` directory:

```properties
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

### 3. Run Locally (Production Mode)

```bash
npm run build   # Builds Client
npm start       # Starts Server on http://localhost:5000
```

---

## ☁️ Deployment Guide (Render)

EMS is optimized for **one-click deployment** on Render.

1. **Connect GitHub Repository**
2. **Create Web Service**
3. **Configure Settings**

   * **Environment**: Node
   * **Build Command**: `npm run install-all && npm run build`
   * **Start Command**: `npm start`
4. **Add Environment Variables**

   * `MONGO_URI`
   * `JWT_SECRET`
   * `PORT`

Your EMS system is now live and scalable globally. 🌍

---

## 🛡️ License

This project is licensed under the **ISC License**.

---

*Built with precision and passion — EMS Development Team.*

---
