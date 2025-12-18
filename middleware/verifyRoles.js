export const verifyAdmin = (req, res, next) => {
  if (req.decoded.role !== "admin") {
    return res.status(403).json({ message: "Admin only access" });
  }
  next();
};

export const verifyVendor = (req, res, next) => {
  if (req.decoded.role !== "vendor" && req.decoded.role !== "admin") {
    return res.status(403).json({ message: "Vendor only access" });
  }
  next();
};

export const verifyUser = (req, res, next) => {
  if (
    req.decoded.role !== "user" &&
    req.decoded.role !== "vendor" &&
    req.decoded.role !== "admin"
  ) {
    return res.status(403).json({ message: "User only access" });
  }
  next();
};