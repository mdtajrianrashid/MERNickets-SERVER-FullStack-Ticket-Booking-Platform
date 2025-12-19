import Ticket from "../models/Ticket.js";
import User from "../models/User.js";

/* CREATE */
export const createTicket = async (req, res) => {
  const vendor = await User.findOne({ email: req.decoded.email });
  if (vendor.isFraud) {
    return res.status(403).json({ message: "Fraud vendors cannot add tickets" });
  }

  const ticket = await Ticket.create({
    title: req.body.title,
    from: req.body.from,
    to: req.body.to,
    transportType: req.body.transportType,
    price: Number(req.body.price),
    ticketQuantity: Number(req.body.ticketQuantity),
    departure: new Date(req.body.departure),
    image: req.body.image,
    perks: req.body.perks || [],
    vendorEmail: req.decoded.email,
    vendorFraud: vendor.isFraud,
  });

  res.send(ticket);
};

/* DELETE  */
export const deleteTicket = async (req, res) => {
  const ticket = await Ticket.findOneAndDelete({
    _id: req.params.id,
    vendorEmail: req.decoded.email,
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  res.send({ message: "Ticket deleted successfully" });
};

/* PUBLIC */
export const getApprovedTickets = async (req, res) => {
  const tickets = await Ticket.find({
    status: "approved",
    vendorFraud: false,
  });
  res.send(tickets);
};

/* ADMIN */
export const getAllTicketsAdmin = async (req, res) => {
  const tickets = await Ticket.find();
  res.send(tickets);
};

export const approveTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true }
  );
  res.send(ticket);
};

export const rejectTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(
    req.params.id,
    { status: "rejected", advertised: false },
    { new: true }
  );
  res.send(ticket);
};

export const toggleAdvertise = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);
  if (!ticket) return res.status(404).json({ message: "Ticket not found" });

  if (!ticket.advertised) {
    const count = await Ticket.countDocuments({ advertised: true });
    if (count >= 6) {
      return res.status(400).json({ message: "Max 6 advertised tickets allowed" });
    }
  }

  ticket.advertised = !ticket.advertised;
  await ticket.save();
  res.send(ticket);
};

/* VENDOR */
export const getVendorTickets = async (req, res) => {
  const tickets = await Ticket.find({ vendorEmail: req.decoded.email });
  res.send(tickets);
};

export const updateTicket = async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    vendorEmail: req.decoded.email,
  });

  if (!ticket) return res.status(404).json({ message: "Ticket not found" });
  if (ticket.status === "rejected") {
    return res.status(403).json({ message: "Rejected tickets cannot be edited" });
  }

  Object.assign(ticket, {
    ...req.body,
    perks: req.body.perks || [],
    ticketQuantity: Number(req.body.ticketQuantity),
    price: Number(req.body.price),
    departure: new Date(req.body.departure),
    status: "pending",
  });

  await ticket.save();
  res.send(ticket);
};

/* VENDOR: SINGLE */
export const getSingleVendorTicket = async (req, res) => {
  const ticket = await Ticket.findOne({
    _id: req.params.id,
    vendorEmail: req.decoded.email,
  });

  if (!ticket) {
    return res.status(404).json({ message: "Ticket not found" });
  }

  res.send(ticket);
};