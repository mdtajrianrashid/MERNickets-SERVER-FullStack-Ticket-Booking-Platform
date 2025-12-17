import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    from: { type: String, required: true },
    to: { type: String, required: true },
    transportType: { type: String, required: true },

    price: { type: Number, required: true },
    ticketQuantity: { type: Number, required: true },

    departure: { type: Date, required: true },

    image: String,

    vendorEmail: String,
    vendorFraud: { type: Boolean, default: false },

    status: { type: String, default: "pending" }, // pending, approved, rejected
    advertised: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.model("Ticket", ticketSchema);