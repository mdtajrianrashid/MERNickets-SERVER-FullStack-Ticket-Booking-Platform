// server/middlewares/verifyToken.js
const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).send({ message: 'Unauthorized access' });

    const token = authHeader.split(' ')[1];
    if (!token) return res.status(401).send({ message: 'Unauthorized access' });

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
      if (err) return res.status(401).send({ message: 'Unauthorized access' });
      // decoded should contain at least { email: '...' }
      req.user = decoded;
      next();
    });
  } catch (err) {
    next(err);
  }
};

module.exports = verifyToken;