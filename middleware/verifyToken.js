// server/middleware/verifyToken.js
import jwt from "jsonwebtoken";

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized: Invalid token format" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }

    req.decoded = decoded;
    next();
  });
};

export default verifyToken;