import express from "express";
import {
  deleteAllDeliveryStops,
  deleteDeliveryStop,
} from "../controllers/deliveryMarks.controller.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
// All routes protected - only admin can delete all
router.use(protect);
router.route("/").delete(deleteAllDeliveryStops);
router.route("/:id").delete(deleteDeliveryStop);

export default router;
