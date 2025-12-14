import Ticket from "../models/Ticket.js";

// Create ticket (Vendor Only)
export const createTicket = async (req, res) => {
  const data = req.body;
  data.vendorEmail = req.decoded.email;

  const ticket = await Ticket.create(data);
  res.send(ticket);
};

// Get ALL approved tickets
export const getApprovedTickets = async (req, res) => {
  const tickets = await Ticket.find({ status: "approved" });
  res.send(tickets);
};

// Vendor gets own tickets
export const vendorTickets = async (req, res) => {
  const tickets = await Ticket.find({ vendorEmail: req.decoded.email });
  res.send(tickets);
};

// Admin: Approve
export const approveTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, {
    status: "approved",
  });
  res.send(ticket);
};

// Admin: Reject
export const rejectTicket = async (req, res) => {
  const ticket = await Ticket.findByIdAndUpdate(req.params.id, {
    status: "rejected",
  });
  res.send(ticket);
};

// Admin: Advertise (max 6)
export const advertiseTicket = async (req, res) => {
  const count = await Ticket.countDocuments({ advertised: true });

  if (count >= 6)
    return res.status(400).json({ message: "Max 6 advertised tickets allowed" });

  const ticket = await Ticket.findByIdAndUpdate(req.params.id, {
    advertised: true,
  });

  res.send(ticket);
};

// Vendor: Update ticket
export const updateTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (ticket.vendorEmail !== req.decoded.email)
    return res.status(403).json({ message: "Not your ticket!" });

  const updated = await Ticket.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });

  res.send(updated);
};

// Vendor: Delete ticket
export const deleteTicket = async (req, res) => {
  const ticket = await Ticket.findById(req.params.id);

  if (ticket.vendorEmail !== req.decoded.email)
    return res.status(403).json({ message: "Not your ticket!" });

  await Ticket.findByIdAndDelete(req.params.id);

  res.send({ message: "Ticket deleted" });
};