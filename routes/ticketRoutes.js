import express from "express";
import verifyToken from "../middleware/verifyToken.js";
import { verifyAdmin, verifyVendor } from "../middleware/verifyRoles.js";
import {
  createTicket,
  getApprovedTickets,
  getAllTicketsAdmin,
  approveTicket,
  rejectTicket,
  toggleAdvertise,
  getVendorTickets,
  getSingleVendorTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController.js";

const router = express.Router();

router.get("/", getApprovedTickets);

router.get("/admin", verifyToken, verifyAdmin, getAllTicketsAdmin);
router.patch("/approve/:id", verifyToken, verifyAdmin, approveTicket);
router.patch("/reject/:id", verifyToken, verifyAdmin, rejectTicket);
router.patch("/advertise/:id", verifyToken, verifyAdmin, toggleAdvertise);

router.post("/", verifyToken, verifyVendor, createTicket);
router.get("/vendor", verifyToken, verifyVendor, getVendorTickets);
router.get("/vendor/:id", verifyToken, verifyVendor, getSingleVendorTicket);
router.patch("/:id", verifyToken, verifyVendor, updateTicket);
router.delete("/:id", verifyToken, verifyVendor, deleteTicket);

export default router;