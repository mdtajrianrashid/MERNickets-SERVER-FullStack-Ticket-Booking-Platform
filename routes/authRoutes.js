import express from "express";
import { registerUser, issueJWT } from "../controllers/authController.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/jwt", issueJWT);

export default router;