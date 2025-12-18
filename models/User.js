import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, default: "user" },
  isFraud: { type: Boolean, default: false },
});

export default mongoose.model("User", userSchema);