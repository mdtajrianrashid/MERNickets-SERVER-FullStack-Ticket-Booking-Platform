import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { verifyAdmin, verifyVendor } from "../middleware/verifyRoles.js";
import {
  createTicket,
  getApprovedTickets,
  getAllTicketsAdmin,
  getVendorTickets,
  approveTicket,
  rejectTicket,
  toggleAdvertise,
} from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getApprovedTickets);

router.get("/admin", verifyToken, verifyAdmin, getAllTicketsAdmin);
router.patch("/approve/:id", verifyToken, verifyAdmin, approveTicket);
router.patch("/reject/:id", verifyToken, verifyAdmin, rejectTicket);
router.patch("/advertise/:id", verifyToken, verifyAdmin, toggleAdvertise);

router.post("/", verifyToken, verifyVendor, createTicket);
router.get("/vendor", verifyToken, verifyVendor, getVendorTickets);

export default router;