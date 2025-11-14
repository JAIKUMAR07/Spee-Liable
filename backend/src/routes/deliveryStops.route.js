import express from "express";

import {
  getDeliveryStops,
  createDeliveryStop,
  updateDeliveryStopAvailability,
  deleteDeliveryStop,
} from "../controllers/deliveryStops.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes protected
router.use(protect);

router
  .route("/")
  .get(getDeliveryStops)
  .post(authorize("admin", "manager", "driver"), createDeliveryStop);

router
  .route("/:id")
  .patch(
    authorize("admin", "manager", "driver"),
    updateDeliveryStopAvailability
  )
  .delete(authorize("admin", "manager"), deleteDeliveryStop);

export default router;
