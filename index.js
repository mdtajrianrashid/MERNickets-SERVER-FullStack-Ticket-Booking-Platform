// server/index.js
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// CORS - allow origins via env or sensible defaults
const allowedOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173').split(',');
app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const ticketRoutes = require('./routes/tickets');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');

// ---------------------------------------------
// ✔ FIXED: Mongoose v7/v8 correct connection
// ---------------------------------------------
mongoose.connect(process.env.DB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully via Mongoose");
  })
  .catch((err) => {
    console.error("❌ MongoDB Connection Error:", err);
    process.exit(1);
  });

// Use routes
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/tickets', ticketRoutes);
app.use('/bookings', bookingRoutes);
app.use('/payments', paymentRoutes);

// Root health-check
app.get('/', (req, res) => res.send('Ticket Booking Server is Running'));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).send({ message: err.message || 'Internal Server Error' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});