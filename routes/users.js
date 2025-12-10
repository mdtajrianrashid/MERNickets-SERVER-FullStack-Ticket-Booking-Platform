const express = require('express');
const User = require('../models/User');
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// Get all users (Admin only)
router.get('/', verifyToken, async (req, res) => {
    // In a real app, check if req.user.email is admin here
    const result = await User.find();
    res.send(result);
});

// Save or Update User (Social Login/Register)
router.post('/', async (req, res) => {
    const user = req.body;
    const query = { email: user.email };
    const existingUser = await User.findOne(query);
    if (existingUser) {
        return res.send({ message: 'user already exists', insertedId: null });
    }
    const result = await User.create(user);
    res.send(result);
});

// Update Role (Make Admin / Vendor) 
router.patch('/admin/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const { role } = req.body; // { role: 'admin' } or { role: 'vendor' }
    const filter = { _id: id }; // Note: Ensure you convert ID to ObjectId if not using Mongoose auto-casting
    const updateDoc = {
        $set: { role: role }
    };
    const result = await User.findByIdAndUpdate(id, updateDoc);
    res.send(result);
});

// Mark Vendor as Fraud 
// "Once clicked, all of the vendor’s tickets are hidden" - You must handle hiding logic in the GET tickets route
router.patch('/fraud/:id', verifyToken, async (req, res) => {
    const id = req.params.id;
    const updateDoc = {
        $set: { status: 'fraud' }
    };
    const result = await User.findByIdAndUpdate(id, updateDoc);
    res.send(result);
});

module.exports = router;