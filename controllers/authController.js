import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

/* ================================
   Register User (MongoDB)
================================ */
export const registerUser = async (req, res) => {
  const { name, email } = req.body;

  let user = await User.findOne({ email });

  if (!user) {
    user = await User.create({
      email,
      name,
    });
  }

  res.send(user);
};

/* ================================
   Issue JWT
================================ */
export const issueJWT = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.send({ token });
};

/* ================================
   Get Current User
================================ */
export const getMe = async (req, res) => {
  const user = await User.findOne({ email: req.query.email });
  res.send(user);
};

/* ================================
   ADMIN: Get All Users
================================ */
export const getAllUsers = async (req, res) => {
  res.send(await User.find());
};

/* ================================
   ADMIN: Update User Role
================================ */
export const updateUserRole = async (req, res) => {
  const { role } = req.body;

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );

  res.send(user);
};

/* ================================
   ADMIN: Mark Vendor Fraud
================================ */
export const markVendorFraud = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isFraud: true },
    { new: true }
  );

  await Ticket.updateMany(
    { vendorEmail: user.email },
    { vendorFraud: true, advertised: false }
  );

  res.send(user);
};