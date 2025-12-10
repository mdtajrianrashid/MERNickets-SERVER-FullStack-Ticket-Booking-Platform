// server/routes/bookings.js
const express = require('express');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// POST /bookings - create booking (user)
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const bookingReq = req.body;
    const userEmail = req.user.email;
    if (!userEmail || bookingReq.userEmail !== userEmail) {
      return res.status(403).send({ message: 'forbidden access' });
    }

    const ticket = await Ticket.findById(bookingReq.ticketId);
    if (!ticket) return res.status(404).send({ message: 'Ticket not found' });

    // prevent booking after departure
    if (new Date(ticket.departureTime) <= new Date()) {
      return res.status(400).send({ message: 'Cannot book after departure time' });
    }

    // check quantity
    if (bookingReq.quantity <= 0) return res.status(400).send({ message: 'Invalid quantity' });
    if (ticket.quantity < bookingReq.quantity) {
      return res.status(400).send({ message: 'Not enough seats' });
    }

    // Compose booking data with ticket snapshot
    const bookingData = {
      ticketId: ticket._id,
      ticketTitle: ticket.title,
      ticketImage: ticket.image,
      from: ticket.from,
      to: ticket.to,
      departureTime: ticket.departureTime,
      userId: bookingReq.userId,
      userEmail: userEmail,
      quantity: bookingReq.quantity,
      totalPrice: ticket.price * bookingReq.quantity,
      bookingStatus: 'pending'
    };

    const created = await Booking.create(bookingData);
    res.send(created);
  } catch (err) { next(err); }
});

// GET /bookings/my-bookings/:email - user bookings
router.get('/my-bookings/:email', verifyToken, async (req, res, next) => {
  try {
    if (req.user.email !== req.params.email) return res.status(403).send({ message: 'forbidden access' });
    const bookings = await Booking.find({ userEmail: req.params.email }).sort({ createdAt: -1 });
    res.send(bookings);
  } catch (err) { next(err); }
});

// GET /bookings/vendor-bookings/:email - bookings for vendor's tickets
router.get('/vendor-bookings/:email', verifyToken, async (req, res, next) => {
  try {
    if (req.user.email !== req.params.email) return res.status(403).send({ message: 'forbidden access' });
    const vendorTickets = await Ticket.find({ vendorEmail: req.params.email }).select('_id');
    const ticketIds = vendorTickets.map(t => t._id);
    const result = await Booking.find({ ticketId: { $in: ticketIds } }).sort({ createdAt: -1 });
    res.send(result);
  } catch (err) { next(err); }
});

// PATCH /bookings/status/:id - vendor accepts/rejects booking
router.patch('/status/:id', verifyToken, async (req, res, next) => {
  try {
    const bookingId = req.params.id;
    const { status } = req.body; // accepted | rejected
    if (!['accepted', 'rejected'].includes(status)) return res.status(400).send({ message: 'Invalid status' });

    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).send({ message: 'Booking not found' });

    // Verify requester is vendor who owns the ticket or admin
    const requester = await User.findOne({ email: req.user.email });
    const ticket = await Ticket.findById(booking.ticketId);
    if (!ticket) return res.status(404).send({ message: 'Ticket not found' });

    if (requester.role !== 'admin' && ticket.vendorEmail !== requester.email) {
      return res.status(403).send({ message: 'forbidden access' });
    }

    booking.bookingStatus = status;
    await booking.save();
    res.send(booking);
  } catch (err) { next(err); }
});

module.exports = router;