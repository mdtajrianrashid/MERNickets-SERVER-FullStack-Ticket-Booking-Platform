// server/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

// Creates JWT for client. Only sign minimal data (email).
router.post('/jwt', async (req, res) => {
  try {
    const user = req.body;
    if (!user?.email) return res.status(400).send({ message: 'Email required' });

    const payload = { email: user.email };
    const token = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } catch (err) {
    res.status(500).send({ message: 'Could not create token' });
  }
});

module.exports = router;