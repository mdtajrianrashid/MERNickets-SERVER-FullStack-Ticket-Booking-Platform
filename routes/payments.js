const express = require('express');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const verifyToken = require('../middlewares/verifyToken');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const router = express.Router();

router.post('/create-payment-intent', verifyToken, async (req, res) => {
    const { price } = req.body;
    const amount = parseInt(price * 100); // Stripe uses cents

    const paymentIntent = await stripe.paymentIntents.create({
        amount: amount,
        currency: 'usd',
        payment_method_types: ['card']
    });

    res.send({
        clientSecret: paymentIntent.client_secret
    });
});

// After successful payment on Client, call this to update Status & Reduce Seat
router.patch('/confirm/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { transactionId, ticketId, quantity } = req.body;

    // 1. Update Booking Status to 'paid'
    const updateBooking = await Booking.findByIdAndUpdate(id, {
        $set: { 
            bookingStatus: 'paid',
            transactionId: transactionId,
            paymentDate: new Date()
        }
    });

    // 2. Reduce Ticket Quantity [cite: 405]
    const updateTicket = await Ticket.findByIdAndUpdate(ticketId, {
        $inc: { quantity: -quantity }
    });

    res.send({ updateBooking, updateTicket });
});

module.exports = router;