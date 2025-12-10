// server/models/Ticket.js
const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
  title: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  transportType: { 
    type: String, 
    enum: ['bus', 'train', 'launch', 'plane'], 
    required: true 
  },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
  departureTime: { type: Date, required: true },
  perks: [String],
  image: { type: String, required: true },
  vendorEmail: { type: String, required: true },
  vendorName: { type: String, required: true },
  verificationStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  isAdvertised: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Ticket', TicketSchema);