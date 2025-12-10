const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Import Routes (These match the files in your /routes folder)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

// Connect to MongoDB using Mongoose (Requirement #18)
// This enables your Models (User.js, Ticket.js) to work
mongoose.connect(process.env.DB_URI)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully via Mongoose");
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
    });

// Use Routes
// When a user visits /auth/jwt, it goes to auth.js
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);

// Root Route (To check if server is running)
app.get('/', (req, res) => {
    res.send('Ticket Booking Server is Running');
});

// Global Error Handler (Optional but good for debugging)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
});