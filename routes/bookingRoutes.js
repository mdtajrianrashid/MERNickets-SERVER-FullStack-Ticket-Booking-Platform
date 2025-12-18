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
  getVendorRequestedBookings,
  getVendorRevenue,
} from "../controllers/bookingController.js";

const router = express.Router();

/* ===============================
   USER ROUTES
================================ */

router.post("/", verifyToken, verifyUser, createBooking);
router.get("/", verifyToken, verifyUser, getUserBookings);
router.patch("/confirm", verifyToken, verifyUser, confirmBookingPayment);
router.get("/transactions", verifyToken, verifyUser, getTransactionHistory);

/* ===============================
   VENDOR ROUTES
================================ */

// ONLY pending booking requests
router.get(
  "/vendor",
  verifyToken,
  verifyVendor,
  getVendorRequestedBookings
);

// Accept / Reject
router.patch("/accept/:id", verifyToken, verifyVendor, acceptBooking);
router.patch("/reject/:id", verifyToken, verifyVendor, rejectBooking);

// ✅ Vendor revenue
router.get(
  "/vendor/revenue",
  verifyToken,
  verifyVendor,
  getVendorRevenue
);

export default router;