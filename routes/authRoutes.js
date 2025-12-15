import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { verifyAdmin } from "../middleware/verifyRoles.js";
import {
  registerUser,
  issueJWT,
  getMe,
  getAllUsers,
  updateUserRole,
  markVendorFraud,
} from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/jwt", issueJWT);
router.get("/me", getMe);

/* ADMIN */
router.get("/users", verifyToken, verifyAdmin, getAllUsers);
router.patch("/users/role/:id", verifyToken, verifyAdmin, updateUserRole);
router.patch("/users/fraud/:id", verifyToken, verifyAdmin, markVendorFraud);

export default router;