import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { verifyUser } from "../middleware/verifyRoles.js";
import { createPaymentIntent } from "../controllers/paymentController.js";

const router = express.Router();

// Create Stripe payment intent (User only)
router.post(
  "/create-payment-intent",
  verifyToken,
  verifyUser,
  createPaymentIntent
);

export default router;