const express = require('express');
const Booking = require('../models/Booking');
const Ticket = require('../models/Ticket');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// 1. User: Book a Ticket [cite: 378]
router.post('/', verifyToken, async (req, res) => {
    const booking = req.body;
    
    // Check ticket quantity
    const ticket = await Ticket.findById(booking.ticketId);
    if (ticket.quantity < booking.quantity) {
        return res.status(400).send({ message: "Not enough seats" });
    }

    const result = await Booking.create(booking);
    res.send(result);
});

// 2. User: My Booked Tickets [cite: 391]
router.get('/my-bookings/:email', verifyToken, async (req, res) => {
    const result = await Booking.find({ userEmail: req.params.email });
    res.send(result);
});

// 3. Vendor: Requested Bookings (For my tickets) [cite: 446]
// Finds bookings where the Ticket's vendorEmail matches
router.get('/vendor-bookings/:email', verifyToken, async (req, res) => {
    // This is a bit complex in NoSQL. 
    // Option 1: Find all tickets by this vendor, then find bookings for those ticketIds.
    const vendorTickets = await Ticket.find({ vendorEmail: req.params.email });
    const ticketIds = vendorTickets.map(t => t._id);
    
    const result = await Booking.find({ ticketId: { $in: ticketIds } });
    res.send(result);
});

// 4. Vendor: Accept/Reject Booking [cite: 452]
router.patch('/status/:id', verifyToken, async (req, res) => {
    const { status } = req.body; // 'accepted' or 'rejected'
    const result = await Booking.findByIdAndUpdate(req.params.id, {
        $set: { bookingStatus: status }
    });
    res.send(result);
});

module.exports = router;