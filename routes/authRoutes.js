import express from "express";
import {
  registerUser,
  issueJWT,
  getMe,
} from "../controllers/authController.js";

const router = express.Router();

// Register user (called on login)
router.post("/register", registerUser);

// Issue JWT
router.post("/jwt", issueJWT);

// ✅ GET logged-in DB user (ROLE SOURCE)
router.get("/me", getMe);

export default router;