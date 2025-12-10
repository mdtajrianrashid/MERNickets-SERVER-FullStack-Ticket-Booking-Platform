// server/routes/users.js
const express = require('express');
const User = require('../models/User');
const Ticket = require('../models/Ticket');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// Helper: ensure requester is admin
async function ensureAdmin(req, res) {
  const requesterEmail = req.user?.email;
  if (!requesterEmail) return res.status(401).send({ message: 'Unauthorized' });
  const requester = await User.findOne({ email: requesterEmail });
  if (!requester || requester.role !== 'admin') {
    return res.status(403).send({ message: 'forbidden access' });
  }
  return null;
}

// GET /users - Admin only
router.get('/', verifyToken, async (req, res, next) => {
  try {
    const forbidden = await ensureAdmin(req, res);
    if (forbidden) return;
    const users = await User.find().sort({ createdAt: -1 });
    res.send(users);
  } catch (err) { next(err); }
});

// POST /users - create or upsert user (social login / register)
router.post('/', async (req, res, next) => {
  try {
    const user = req.body;
    if (!user?.email) return res.status(400).send({ message: 'Email is required' });

    const result = await User.findOneAndUpdate(
      { email: user.email },
      { $set: { name: user.name || 'No Name', photo: user.photo || '', role: user.role || 'user' } },
      { upsert: true, new: true }
    );
    res.send(result);
  } catch (err) { next(err); }
});

// PATCH /users/admin/:id - make Admin / Vendor (Admin only)
router.patch('/admin/:id', verifyToken, async (req, res, next) => {
  try {
    const forbidden = await ensureAdmin(req, res);
    if (forbidden) return;
    const id = req.params.id;
    const { role } = req.body;
    if (!['admin', 'vendor', 'user'].includes(role)) {
      return res.status(400).send({ message: 'Invalid role' });
    }
    const updated = await User.findByIdAndUpdate(id, { $set: { role } }, { new: true });
    res.send(updated);
  } catch (err) { next(err); }
});

// PATCH /users/fraud/:id - mark vendor as fraud (admin only) and hide their tickets
router.patch('/fraud/:id', verifyToken, async (req, res, next) => {
  try {
    const forbidden = await ensureAdmin(req, res);
    if (forbidden) return;
    const id = req.params.id;

    const user = await User.findById(id);
    if (!user) return res.status(404).send({ message: 'User not found' });

    // mark user as fraud
    user.status = 'fraud';
    await user.save();

    // hide the vendor's tickets by setting verificationStatus to 'rejected'
    await Ticket.updateMany({ vendorEmail: user.email }, { $set: { verificationStatus: 'rejected', isAdvertised: false } });

    res.send({ message: 'Vendor marked as fraud and tickets hidden' });
  } catch (err) { next(err); }
});

module.exports = router;