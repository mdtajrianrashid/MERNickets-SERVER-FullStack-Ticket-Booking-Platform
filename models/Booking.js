const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket', required: true },
    ticketTitle: String,
    ticketImage: String,
    from: String,
    to: String,
    departureTime: Date,
    
    // User Info
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userEmail: { type: String, required: true },
    
    // Transaction Details
    quantity: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    bookingStatus: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'paid'],
        default: 'pending'
    },
    transactionId: { type: String }, // From Stripe
    paymentDate: { type: Date }

}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);