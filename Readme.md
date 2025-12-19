# 🚀 (SERVER) - MERNickets — A Modern Online Ticket Booking Platform

The **MERNickets Server** is the backend REST API for the **MERNickets – Modern Full‑Stack Online Ticket Booking Platform**. It is built using **Node.js, Express, MongoDB**, and **JWT**, and powers all core business logic including authentication, role-based access control, ticket management, bookings, payments, and analytics.

This server strictly follows the **B12‑A11 (Category‑17) Assignment Requirements** and is fully integrated with the MERNickets client application.

---

## 🌐 Live API

**🔗 Server URL:**
👉 [https://mernickets-server.vercel.app/](https://mernickets-server.vercel.app/)

---

## 🔗 Connected Client

**Frontend Repository:**
👉 [https://github.com/mdtajrianrashid/MERNickets-CLIENT-FullStack-Ticket-Booking-Platform](https://github.com/mdtajrianrashid/MERNickets-CLIENT-FullStack-Ticket-Booking-Platform)

**Live Client:**
👉 [https://mernickets.netlify.app/](https://mernickets.netlify.app/)

---

## 🎯 Core Responsibilities

The backend handles:

* Secure **JWT-based authentication**
* **Role-based authorization** (User, Vendor, Admin)
* Ticket CRUD & approval workflow
* Booking lifecycle management
* Stripe payment processing
* Revenue & analytics APIs
* Advertisement control

---

## 🧑‍🤝‍🧑 Role-Based Access Control

### 👤 User (Traveler)

* View **admin-approved tickets only**
* Search & filter tickets
* Create bookings
* Complete payments via Stripe
* View booking status & transaction history

### 🏪 Vendor (Service Provider)

* Add / update / delete tickets
* View tickets added by themselves
* Accept or reject booking requests
* View **Revenue Overview**:

  * Total Revenue
  * Tickets Sold
  * Tickets Added

### 🛡️ Admin (Platform Manager)

* Approve / reject vendor tickets
* Control ticket advertisements (max 6)
* Manage user roles (Admin / Vendor)
* Mark fraudulent vendors

---

## 🛠️ Tech Stack

### **Backend**

* **Node.js** — JavaScript runtime
* **Express.js** — REST API framework
* **MongoDB** — NoSQL database
* **Mongoose** — ODM for MongoDB
* **JWT** — Secure API authorization
* **Stripe** — Payment intent handling

### **Security & Middleware**

* CORS configuration
* JWT verification middleware
* Role-based route protection

---

## 📁 Project Structure

```bash
server/
│
├── index.js                # Server entry point
├── .env                    # Environment variables
│
├── config/
│   └── db.js               # MongoDB connection
│
├── models/
│   ├── User.js             # User schema (roles)
│   ├── Ticket.js           # Ticket schema
│   └── Booking.js          # Booking & payment schema
│
├── routes/
│   ├── authRoutes.js       # Auth & user management
│   ├── ticketRoutes.js     # Ticket CRUD & approval
│   ├── bookingRoutes.js    # Booking lifecycle
│   └── paymentRoutes.js    # Stripe payment intents
│
├── controllers/
│   ├── authController.js        # Login + Register logic
│   ├── ticketController.js      # Ticket CRUD logic
│   ├── bookingController.js     # Booking creation + updates
│   └── paymentController.js     # Create payment intent with Stripe
│
└── middleware/
    ├── verifyToken.js      # JWT verification
    └── verifyRoles.js      # Role-based access control
```

---

## 🔐 Environment Variables

Create a `.env` file in the **server root**:

```env
PORT=5000
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
JWT_SECRET=YOUR_JWT_SECRET
JWT_EXPIRES_IN=JWT_EXPIRATION_TIME
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY
```

> ⚠️ Never commit `.env` files to GitHub.

---

## 📡 API Highlights

### 🔑 Authentication

* JWT issued after Firebase-authenticated login
* Token required for all protected routes

### 🎟️ Tickets

* Vendors can add tickets
* Admin approval required before public visibility
* Advertised tickets capped at **6 (enforced)**

### 📦 Bookings

* Users create bookings
* Vendors approve/reject
* Booking status tracked

### 💳 Payments

* Stripe Payment Intents
* Payment verification
* Transaction history storage

### 📊 Revenue Analytics

* Vendor-specific revenue aggregation
* Tickets sold count
* Tickets added count

---

## 🏃 Run Locally

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/mdtajrianrashid/MERNickets-SERVER-FullStack-Ticket-Booking-Platform.git
cd MERNickets-SERVER-FullStack-Ticket-Booking-Platform
npm install
```

### 2️⃣ Start the Server

```bash
npm run dev
```

Server will run on:

```
http://localhost:5000
```

---

## ☁️ Deployment

* **Server Hosting:** Vercel
* **Database:** MongoDB Atlas
* **Client Hosting:** Netlify

CORS is configured to allow the deployed Netlify client.

---

## 👨‍💻 Author

**MD Tajrian Rashid**
Frontend & Full‑Stack Developer

🔗 GitHub: [https://github.com/mdtajrianrashid](https://github.com/mdtajrianrashid)
🔗 LinkedIn: [https://www.linkedin.com/in/mdtajrianrashid/](https://www.linkedin.com/in/mdtajrianrashid/)

---

## ⭐ Final Note

If you find this project helpful or inspiring, feel free to ⭐ the repository.

**MERNickets — A Modern Online Ticket Booking Platform.**