// server/routes/bookingRoutes.js
import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import {
  verifyUser,
  verifyVendor,
} from "../middleware/verifyRoles.js";

import {
  createBooking,
  getUserBookings,
  acceptBooking,
  rejectBooking,
  confirmBookingPayment,
  getTransactionHistory,
} from "../controllers/bookingController.js";

const router = express.Router();

/* ===============================
   USER ROUTES
================================ */

// Create booking
router.post("/", verifyToken, verifyUser, createBooking);

// Get my bookings
router.get("/", verifyToken, verifyUser, getUserBookings);

// Confirm Stripe payment
router.patch("/confirm", verifyToken, verifyUser, confirmBookingPayment);

// Transaction history
router.get("/transactions", verifyToken, verifyUser, getTransactionHistory);

/* ===============================
   VENDOR ROUTES
================================ */

// Accept booking request
router.patch("/accept/:id", verifyToken, verifyVendor, acceptBooking);

// Reject booking request
router.patch("/reject/:id", verifyToken, verifyVendor, rejectBooking);

export default router;