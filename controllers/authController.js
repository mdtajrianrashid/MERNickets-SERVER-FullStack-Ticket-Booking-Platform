import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const registerUser = async (req, res) => {
  const { name, email, role } = req.body;

  let user = await User.findOne({ email });
  if (!user) {
    user = await User.create({ name, email, role: role || "user" });
  }

  res.send(user);
};

export const issueJWT = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ message: "User not found for token" });

  const token = jwt.sign(
    { email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "2h" }
  );

  res.send({ token });
};