import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  vendorEmail: String,
  status: { type: String, default: "pending" }, // pending, approved, rejected
  advertised: { type: Boolean, default: false },
});

export default mongoose.model("Ticket", ticketSchema);