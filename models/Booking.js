// server/models/Booking.js
import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // optional if available
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  ticketTitle: { type: String }, // denormalized for quick UI display
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, default: 0 },
  departure: { type: Date }, // store the departure datetime at booking time
  status: { type: String, default: "pending" }, // pending, accepted, rejected, paid
  paid: { type: Boolean, default: false },
  transactionId: { type: String },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);