import express from "express";
import {
  deleteAllDeliveryStops,
  deleteDeliveryStop,
} from "../controllers/deliveryMarks.controller.js";

import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();
// All routes protected and admin-only
router.use(protect);
router.route("/").delete(authorize("admin", "driver"), deleteAllDeliveryStops);
router.route("/:id").delete(authorize("admin", "driver"), deleteDeliveryStop);

export default router;
