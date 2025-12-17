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

    // Check ticket availability
    if (ticket.ticketQuantity < quantity) {
      return res
        .status(400)
        .json({ message: "Not enough tickets available" });
    }

    // Prevent duplicate booking
    const already = await Booking.findOne({
      userEmail: req.decoded.email,
      ticketId,
    });

    if (already) {
      return res
        .status(400)
        .json({ message: "You already booked this ticket" });
    }

    // ✅ CALCULATE TOTAL PRICE HERE
    const totalPrice = ticket.price * quantity;

    const booking = await Booking.create({
      userEmail: req.decoded.email,
      ticketId,
      ticketTitle: ticket.title,
      quantity,
      totalPrice, // ✅ FIX
      departure: ticket.departure,
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

    const formatted = bookings.map((b) => ({
      _id: b._id,
      quantity: b.quantity,
      totalPrice: b.totalPrice,
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

    const booking = await Booking.findById(id);
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
   Vendor: Requested Bookings
================================ */
export const getVendorRequestedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "pending" })
      .populate("ticketId");

    const vendorBookings = bookings.filter(
      b => b.ticketId?.vendorEmail === req.decoded.email
    );

    res.send(vendorBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================================
   Vendor: Revenue Overview
================================ */
export const getVendorRevenue = async (req, res) => {
  try {
    const bookings = await Booking.find({ status: "paid" })
      .populate("ticketId");

    const vendorPaid = bookings.filter(
      b => b.ticketId?.vendorEmail === req.decoded.email
    );

    const revenue = vendorPaid.reduce(
      (sum, b) => sum + b.totalPrice,
      0
    );

    res.send({
      revenue,
      ticketsSold: vendorPaid.length,
    });
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

    if (!bookingId || !transactionId) {
      return res.status(400).json({ message: "Missing payment data" });
    }

    const booking = await Booking.findById(bookingId).populate("ticketId");
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (booking.status === "paid") {
      return res.status(400).json({ message: "Booking already paid" });
    }

    if (new Date(booking.ticketId.departure) <= new Date()) {
      return res
        .status(400)
        .json({ message: "Departure time already passed" });
    }

    if (booking.ticketId.ticketQuantity < booking.quantity) {
      return res
        .status(400)
        .json({ message: "Not enough tickets available" });
    }

    // ✅ RECONFIRM TOTAL PRICE (SECURITY)
    booking.totalPrice = booking.ticketId.price * booking.quantity;

    // Reduce ticket quantity
    booking.ticketId.ticketQuantity -= booking.quantity;
    await booking.ticketId.save();

    booking.status = "paid";
    booking.paid = true;
    booking.transactionId = transactionId;

    await booking.save();

    res.send({
      message: "Payment confirmed & total price saved",
      booking,
    });
  } catch (err) {
    console.error("Confirm Payment Error:", err);
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