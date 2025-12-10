const express = require('express');
const Ticket = require('../models/Ticket');
const User = require('../models/User'); // To check fraud status
const verifyToken = require('../middlewares/verifyToken');
const router = express.Router();

// 1. Get All Approved Tickets (Public page) [cite: 362]
// Challenge: Search, Filter, Sort, Pagination [cite: 511, 512, 514]
router.get('/', async (req, res) => {
    const { search, transport, sort } = req.query;
    let query = { verificationStatus: 'approved' };

    // Filter out fraud vendors
    // (Complex logic: simple version is to filter active vendors first, then get tickets)
    
    if (search) {
        query.to = { $regex: search, $options: 'i' }; // Search by destination
    }
    if (transport) {
        query.transportType = transport;
    }

    let sortOptions = {};
    if (sort === 'asc') sortOptions.price = 1;
    if (sort === 'desc') sortOptions.price = -1;

    const result = await Ticket.find(query).sort(sortOptions);
    res.send(result);
});

// 2. Get 6 Advertised Tickets (For Home Page) [cite: 342]
router.get('/advertised', async (req, res) => {
    const result = await Ticket.find({ isAdvertised: true }).limit(6);
    res.send(result);
});

// 3. Vendor: Add Ticket [cite: 422]
router.post('/', verifyToken, async (req, res) => {
    const ticket = req.body;
    // Check if vendor is fraud
    const vendor = await User.findOne({ email: ticket.vendorEmail });
    if(vendor?.status === 'fraud') {
        return res.status(403).send({ message: "You are restricted from adding tickets." });
    }
    
    const result = await Ticket.create(ticket);
    res.send(result);
});

// 4. Vendor: Get My Added Tickets [cite: 437]
router.get('/my-tickets/:email', verifyToken, async (req, res) => {
    const email = req.params.email;
    const result = await Ticket.find({ vendorEmail: email });
    res.send(result);
});

// 5. Vendor: Delete Ticket [cite: 444]
router.delete('/:id', verifyToken, async (req, res) => {
    const result = await Ticket.findByIdAndDelete(req.params.id);
    res.send(result);
});

// 6. Vendor: Update Ticket [cite: 443]
router.patch('/update/:id', verifyToken, async (req, res) => {
    const item = req.body;
    const result = await Ticket.findByIdAndUpdate(req.params.id, item);
    res.send(result);
});

// 7. Admin: Manage Tickets (Approve/Reject) [cite: 466, 467]
router.patch('/status/:id', verifyToken, async (req, res) => {
    const { status } = req.body; // 'approved' or 'rejected'
    const result = await Ticket.findByIdAndUpdate(req.params.id, { 
        $set: { verificationStatus: status } 
    });
    res.send(result);
});

// 8. Admin: Advertise Toggle 
router.patch('/advertise/:id', verifyToken, async (req, res) => {
    const { isAdvertised } = req.body;
    
    // Constraint: Cannot advertise more than 6 [cite: 479]
    if (isAdvertised) {
        const count = await Ticket.countDocuments({ isAdvertised: true });
        if (count >= 6) {
            return res.send({ message: "limit_reached" });
        }
    }
    
    const result = await Ticket.findByIdAndUpdate(req.params.id, { 
        $set: { isAdvertised: isAdvertised } 
    });
    res.send(result);
});

module.exports = router;