# 🏥 Hospital Management System (OP Management)

A modern, responsive full-stack Hospital Management Application featuring Patient Registration, automatic sequential Token Generation starting from 1, and Patient Records tracking with live search, sorting, and pagination.

---

## 🛠️ Technology Stack

- **Frontend**: HTML5, Vanilla JavaScript, Tailwind CSS, Custom CSS3 Animations
- **Backend**: Node.js, Express.js (MVC Architecture)
- **Database**: SQLite3 (`better-sqlite3`)
- **Dependencies**: `express`, `better-sqlite3`, `cors`, `dotenv`, `nodemon`

---

## 🚀 Features

1. **Patient Registration**
   - Real-time client-side validation & server-side validation.
   - Validation criteria:
     - **Patient Name**: Required, minimum 3 characters, alphabets & spaces only.
     - **Age**: Required, numeric, between 0 and 120.
     - **Mobile Number**: Required, exactly 10 digits.
     - **Issues / Symptoms**: Required, minimum 5 characters.
   - Error messages displayed directly below input fields.

2. **Token Generation**
   - Automatic sequential token generation starting from **1**.
   - Transactional SQLite safety ensuring unique incrementing numbers.
   - Prominent token result display modal/card upon successful registration.
   - Automatic form clearing while preserving the active token display on screen.

3. **Patient Records**
   - Interactive data table showing Token Number, Patient Name, Age, Mobile, Symptoms, and Registration Date.
   - Live Search by Patient Name or Token Number.
   - Dynamic Sorting (Newest First, Oldest First, Name A-Z).
   - Server-side Pagination with total record count and page indicators.

4. **Dashboard & UI Experience**
   - Metric cards displaying Total Patients Registered, Today's Tokens, and Latest Token Issued.
   - Responsive modern dark/teal healthcare aesthetic layout.
   - Toast notifications and loading state indicators.

---

## 📁 Directory Structure

```
op-management/
├── backend/
│   ├── server.js
│   ├── routes/
│   │   └── patientRoutes.js
│   ├── controllers/
│   │   └── patientController.js
│   ├── models/
│   │   └── patientModel.js
│   ├── database/
│   │   ├── db.js
│   │   ├── schema.sql
│   │   └── hospital.db (auto-created)
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── index.html (Dashboard)
│   ├── register.html (Patient Registration)
│   ├── patients.html (Patient Records)
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── api.js
│       ├── register.js
│       └── patients.js
│
├── README.md
└── .gitignore
```

---

## 🏁 Quick Start Guide

### 1. Install Dependencies
Navigate to the `backend` directory and install NPM packages:
```bash
cd backend
npm install
```

### 2. Start the Application
Run the Express server in development mode using `nodemon` or standard `node`:
```bash
npm run dev
```
*(or `npm start` for production mode)*

### 3. Access the Web App
Open your web browser and navigate to:
```
http://localhost:5000
```
- **Dashboard**: `http://localhost:5000/index.html`
- **Patient Registration**: `http://localhost:5000/register.html`
- **Patient Records**: `http://localhost:5000/patients.html`

---

## 📡 REST API Documentation

### Register Patient
- **URL**: `POST /api/patients`
- **Body**:
  ```json
  {
    "patient_name": "Sarah Connor",
    "age": 34,
    "mobile": "9876543210",
    "symptoms": "High fever and persistent cough"
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Patient registered successfully",
    "token": 1,
    "data": {
      "id": 1,
      "token": 1,
      "patient_name": "Sarah Connor",
      "age": 34,
      "mobile": "9876543210",
      "symptoms": "High fever and persistent cough",
      "created_at": "2026-08-05 18:46:00"
    }
  }
  ```

### Get Patient Records
- **URL**: `GET /api/patients`
- **Query Params**:
  - `search`: String (name or token)
  - `page`: Integer (default `1`)
  - `limit`: Integer (default `10`)
  - `sortBy`: String (`created_at`, `token`, `patient_name`, `age`)
  - `order`: String (`DESC` or `ASC`)

### Get Patient by Token
- **URL**: `GET /api/patients/:token`

### Dashboard Stats
- **URL**: `GET /api/stats`
