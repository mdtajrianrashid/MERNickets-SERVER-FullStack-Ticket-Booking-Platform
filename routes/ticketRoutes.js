import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { verifyAdmin, verifyVendor } from "../middleware/verifyRoles.js";
import {
  createTicket,
  getApprovedTickets,
  vendorTickets,
  approveTicket,
  rejectTicket,
  advertiseTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getApprovedTickets);

router.get("/vendor", verifyToken, verifyVendor, vendorTickets);

router.post("/", verifyToken, verifyVendor, createTicket);

router.patch("/approve/:id", verifyToken, verifyAdmin, approveTicket);
router.patch("/reject/:id", verifyToken, verifyAdmin, rejectTicket);
router.patch("/advertise/:id", verifyToken, verifyAdmin, advertiseTicket);

router.patch("/:id", verifyToken, verifyVendor, updateTicket);
router.delete("/:id", verifyToken, verifyVendor, deleteTicket);

export default router;