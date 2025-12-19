import dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
import Booking from "../models/Booking.js";

// Safety check for STRIPE_SECRET_KEY
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment variables");
}

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
});

// Payment Intent creation function
export const createPaymentIntent = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({ message: "bookingId is required" });
    }

    // Fetch booking with ticket details
    const booking = await Booking.findById(bookingId).populate("ticketId");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status !== "accepted") {
      return res
        .status(400)
        .json({ message: "Booking must be accepted before payment" });
    }

    if (booking.status === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    // Prevent payment after departure
    const departureTime = new Date(booking.ticketId.departure);
    if (departureTime <= new Date()) {
      return res
        .status(400)
        .json({ message: "Cannot pay after departure time" });
    }

    // Calculate total amount securely
    const unitPrice = booking.ticketId.price;
    const quantity = booking.quantity;
    const totalAmount = unitPrice * quantity;
    const amountCents = Math.round(totalAmount * 100);

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: "usd",
      metadata: {
        bookingId: booking._id.toString(),
        ticketTitle: booking.ticketId.title,
        userEmail: req.decoded.email,
      },
    });

    // Send client secret back to frontend
    res.status(200).json({
      clientSecret: paymentIntent.client_secret,
      totalAmount,
    });
  } catch (err) {
    console.error("Stripe Payment Error:", err.message);
    res.status(500).json({ message: "Payment initialization failed" });
  }
};