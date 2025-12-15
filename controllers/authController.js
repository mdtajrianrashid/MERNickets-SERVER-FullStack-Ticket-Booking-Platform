import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Ticket from "../models/Ticket.js";

export const registerUser = async (req, res) => {
  const { name, email } = req.body;
  let user = await User.findOne({ email });
  if (!user) user = await User.create({ name, email });
  res.send(user);
};

export const issueJWT = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );
  res.send({ token });
};

export const getMe = async (req, res) => {
  const user = await User.findOne({ email: req.query.email });
  res.send(user);
};

/* ---------- ADMIN ---------- */
export const getAllUsers = async (req, res) => {
  res.send(await User.find());
};

export const updateUserRole = async (req, res) => {
  const { role } = req.body;
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { role },
    { new: true }
  );
  res.send(user);
};

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