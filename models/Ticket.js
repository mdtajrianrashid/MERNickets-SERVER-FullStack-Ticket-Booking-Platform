import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    price: Number,
    from: String,
    to: String,
    transportType: String,
    image: String,

    vendorEmail: String,
    vendorFraud: { type: Boolean, default: false },

    status: { type: String, default: "pending" }, // pending, approved, rejected
    advertised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);