import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
  userEmail: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  ticketId: { type: mongoose.Schema.Types.ObjectId, ref: "Ticket", required: true },
  ticketTitle: { type: String },
  quantity: { type: Number, default: 1 },
  totalPrice: { type: Number, default: 0 },
  departure: { type: Date },
  status: { type: String, default: "pending" },
  paid: { type: Boolean, default: false },
  transactionId: { type: String },
  date: { type: Date, default: Date.now },
});

export default mongoose.model("Booking", bookingSchema);