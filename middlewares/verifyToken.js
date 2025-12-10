const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    // Check if the authorization header exists
    if (!req.headers.authorization) {
        return res.status(401).send({ message: 'unauthorized access' });
    }

    // Extract the token (format: "Bearer <token>")
    const token = req.headers.authorization.split(' ')[1];

    // Verify the token using your secret key
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(401).send({ message: 'unauthorized access' });
        }
        req.user = decoded; // Add the decoded user info to the request object
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = verifyToken;