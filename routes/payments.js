// server/routes/payments.js
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// POST /payments/create-payment-intent
router.post('/create-payment-intent', verifyToken, async (req, res, next) => {
  try {
    const { price } = req.body;
    if (typeof price !== 'number' || price <= 0) return res.status(400).send({ message: 'Invalid price' });
    const amount = Math.round(price * 100);
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      payment_method_types: ['card']
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) { next(err); }
});

// PATCH /payments/confirm/:id - confirm booking payment, atomic-ish updates
router.patch('/confirm/:id', verifyToken, async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { transactionId } = req.body;
    if (!transactionId) return res.status(400).send({ message: 'transactionId required' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).send({ message: 'Booking not found' });

    // Only the user who made the booking can confirm payment
    if (booking.userEmail !== req.user.email) return res.status(403).send({ message: 'forbidden access' });

    const ticket = await Ticket.findById(booking.ticketId);
    if (!ticket) return res.status(404).send({ message: 'Ticket not found' });

    // Prevent payment after departure
    if (new Date(ticket.departureTime) <= new Date()) {
      return res.status(400).send({ message: 'Cannot pay after departure time' });
    }

    // Ensure enough seats remain
    if (ticket.quantity < booking.quantity) {
      return res.status(400).send({ message: 'Not enough seats available' });
    }

    // Update booking status & transaction info
    booking.bookingStatus = 'paid';
    booking.transactionId = transactionId;
    booking.paymentDate = new Date();
    await booking.save();

    // Decrement ticket quantity
    ticket.quantity = ticket.quantity - booking.quantity;
    if (ticket.quantity < 0) ticket.quantity = 0;
    await ticket.save();

    res.send({ booking, ticket });
  } catch (err) { next(err); }
});

module.exports = router;