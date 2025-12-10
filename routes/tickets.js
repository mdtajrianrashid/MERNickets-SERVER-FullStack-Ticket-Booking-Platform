// server/routes/tickets.js
const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// GET /tickets - approved tickets with search(from/to), filter, sort, pagination
router.get('/', async (req, res, next) => {
  try {
    const { search, transport, sort, page = 1, limit = 6 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const perPage = Math.max(1, Math.min(50, parseInt(limit)));
    const skip = (pageNum - 1) * perPage;

    // Base: approved tickets
    const query = { verificationStatus: 'approved' };

    // Exclude tickets belonging to fraud vendors
    const fraudVendors = await User.find({ status: 'fraud' }).select('email');
    const fraudEmails = fraudVendors.map(u => u.email);
    if (fraudEmails.length) {
      query.vendorEmail = { $nin: fraudEmails };
    }

    // Search across 'from' and 'to'
    if (search) {
      query.$or = [
        { from: { $regex: search, $options: 'i' } },
        { to: { $regex: search, $options: 'i' } }
      ];
    }

    if (transport) {
      query.transportType = transport.toLowerCase();
    }

    let sortOptions = {};
    if (sort === 'asc') sortOptions.price = 1;
    if (sort === 'desc') sortOptions.price = -1;
    if (!Object.keys(sortOptions).length) sortOptions = { createdAt: -1 };

    const [items, total] = await Promise.all([
      Ticket.find(query).sort(sortOptions).skip(skip).limit(perPage),
      Ticket.countDocuments(query)
    ]);

    res.send({ items, total, page: pageNum, perPage });
  } catch (err) { next(err); }
});

// GET /tickets/advertised - up to 6 advertised tickets
router.get('/advertised', async (req, res, next) => {
  try {
    // ensure advertised tickets are approved and not from fraud vendors
    const fraudVendors = await User.find({ status: 'fraud' }).select('email');
    const fraudEmails = fraudVendors.map(u => u.email);
    const filter = { isAdvertised: true, verificationStatus: 'approved' };
    if (fraudEmails.length) filter.vendorEmail = { $nin: fraudEmails };

    const result = await Ticket.find(filter).limit(6);
    res.send(result);
  } catch (err) { next(err); }
});

// POST /tickets - vendor adds ticket
router.post('/', verifyToken, async (req, res, next) => {
  try {
    const ticket = req.body;
    const requesterEmail = req.user?.email;
    if (!requesterEmail) return res.status(401).send({ message: 'Unauthorized' });

    const requester = await User.findOne({ email: requesterEmail });
    if (!requester) return res.status(401).send({ message: 'User not found' });
    if (requester.status === 'fraud') return res.status(403).send({ message: 'You are restricted from adding tickets.' });
    if (requester.role !== 'vendor' && requester.role !== 'admin') {
      return res.status(403).send({ message: 'Only vendors or admins can add tickets' });
    }

    // Ensure vendorEmail matches requester
    if (ticket.vendorEmail && ticket.vendorEmail !== requesterEmail) {
      return res.status(400).send({ message: 'vendorEmail must match your account' });
    }
    ticket.vendorEmail = requesterEmail;
    ticket.vendorName = requester.name || requesterEmail;

    const created = await Ticket.create(ticket);
    res.send(created);
  } catch (err) { next(err); }
});

// GET /tickets/my-tickets/:email - vendor gets own tickets
router.get('/my-tickets/:email', verifyToken, async (req, res, next) => {
  try {
    const requestedEmail = req.params.email;
    if (req.user.email !== requestedEmail) return res.status(403).send({ message: 'forbidden access' });
    const result = await Ticket.find({ vendorEmail: requestedEmail }).sort({ createdAt: -1 });
    res.send(result);
  } catch (err) { next(err); }
});

// DELETE /tickets/:id - vendor or admin delete ticket
router.delete('/:id', verifyToken, async (req, res, next) => {
  try {
    const id = req.params.id;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).send({ message: 'Ticket not found' });

    // Only vendor who owns or admin can delete
    const requester = await User.findOne({ email: req.user.email });
    if (!requester) return res.status(401).send({ message: 'Unauthorized' });
    if (requester.role !== 'admin' && ticket.vendorEmail !== requester.email) {
      return res.status(403).send({ message: 'forbidden access' });
    }
    await Ticket.findByIdAndDelete(id);
    res.send({ message: 'deleted' });
  } catch (err) { next(err); }
});

// PATCH /tickets/update/:id - vendor update
router.patch('/update/:id', verifyToken, async (req, res, next) => {
  try {
    const id = req.params.id;
    const item = req.body;
    const ticket = await Ticket.findById(id);
    if (!ticket) return res.status(404).send({ message: 'Ticket not found' });

    const requester = await User.findOne({ email: req.user.email });
    if (!requester) return res.status(401).send({ message: 'Unauthorized' });
    if (requester.role !== 'admin' && ticket.vendorEmail !== requester.email) {
      return res.status(403).send({ message: 'forbidden access' });
    }

    // Prevent vendor from directly approving their ticket
    if (item.verificationStatus && requester.role !== 'admin') {
      delete item.verificationStatus;
    }

    const updated = await Ticket.findByIdAndUpdate(id, { $set: item }, { new: true });
    res.send(updated);
  } catch (err) { next(err); }
});

// PATCH /tickets/status/:id - admin approve/reject
router.patch('/status/:id', verifyToken, async (req, res, next) => {
  try {
    // Only admin
    const requester = await User.findOne({ email: req.user.email });
    if (!requester || requester.role !== 'admin') return res.status(403).send({ message: 'forbidden access' });

    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) return res.status(400).send({ message: 'Invalid status' });
    const updated = await Ticket.findByIdAndUpdate(req.params.id, { $set: { verificationStatus: status } }, { new: true });
    res.send(updated);
  } catch (err) { next(err); }
});

// PATCH /tickets/advertise/:id - toggle advertise (admin)
router.patch('/advertise/:id', verifyToken, async (req, res, next) => {
  try {
    const requester = await User.findOne({ email: req.user.email });
    if (!requester || requester.role !== 'admin') return res.status(403).send({ message: 'forbidden access' });

    const { isAdvertised } = req.body;
    const ticketId = req.params.id;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) return res.status(404).send({ message: 'Ticket not found' });
    if (ticket.verificationStatus !== 'approved') {
      return res.status(400).send({ message: 'Only approved tickets can be advertised' });
    }

    if (isAdvertised) {
      const count = await Ticket.countDocuments({ isAdvertised: true, verificationStatus: 'approved' });
      // If this ticket is already advertised, allow toggle off/on without counting it twice
      if (!ticket.isAdvertised && count >= 6) {
        return res.status(400).send({ message: 'advertise_limit_reached' });
      }
    }

    ticket.isAdvertised = !!isAdvertised;
    await ticket.save();
    res.send(ticket);
  } catch (err) { next(err); }
});

module.exports = router;