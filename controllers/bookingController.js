// server/controllers/bookingController.js
import Booking from "../models/Booking.js";
import Ticket from "../models/Ticket.js";

/* ================================
   Create Booking (User)
================================ */
export const createBooking = async (req, res) => {
  try {
    const { ticketId, quantity } = req.body;

    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid booking quantity" });
    }

    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.quantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough tickets available" });
    }

    const already = await Booking.findOne({
      userEmail: req.decoded.email,
      ticketId,
    });

    if (already) {
      return res
        .status(400)
        .json({ message: "You already booked this ticket" });
    }

    const booking = await Booking.create({
      userEmail: req.decoded.email,
      ticketId,
      quantity,
      status: "pending",
    });

    res.send(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Get User Bookings (User)
================================ */
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      userEmail: req.decoded.email,
    }).populate("ticketId");

    // reshape response for frontend
    const formatted = bookings.map((b) => ({
      _id: b._id,
      quantity: b.quantity,
      status: b.status,
      transactionId: b.transactionId,
      ticket: b.ticketId,
    }));

    res.send(formatted);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Vendor: Accept Booking
================================ */
export const acceptBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id).populate("ticketId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "accepted";
    await booking.save();

    res.send(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Vendor: Reject Booking
================================ */
export const rejectBooking = async (req, res) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    booking.status = "rejected";
    await booking.save();

    res.send(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Confirm Payment (Stripe)
================================ */
export const confirmBookingPayment = async (req, res) => {
  try {
    const { bookingId, transactionId } = req.body;

    const booking = await Booking.findById(bookingId).populate("ticketId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    // prevent late payment
    if (new Date(booking.ticketId.departure) < new Date()) {
      return res
        .status(400)
        .json({ message: "Departure time already passed" });
    }

    // reduce ticket quantity
    booking.ticketId.quantity -= booking.quantity;
    await booking.ticketId.save();

    booking.status = "paid";
    booking.transactionId = transactionId;
    await booking.save();

    res.send(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Transaction History (User)
================================ */
export const getTransactionHistory = async (req, res) => {
  try {
    const transactions = await Booking.find({
      userEmail: req.decoded.email,
      status: "paid",
    }).populate("ticketId");

    res.send(transactions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};