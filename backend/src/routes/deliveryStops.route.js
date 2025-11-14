import express from "express";
import {
  getDeliveryStops,
  getAllDeliveryStops, // ✅ New route
  createDeliveryStop,
  updateDeliveryStopAvailability,
  deleteDeliveryStop,
  getDeliveryStats, // ✅ New route
} from "../controllers/deliveryStops.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes protected
router.use(protect);

router
  .route("/")
  .get(getDeliveryStops) // ✅ User sees only their stops
  .post(createDeliveryStop);

// ✅ New route for admin/manager to see all stops
router.route("/all").get(authorize("admin", "manager"), getAllDeliveryStops);

// ✅ New route for user stats
router.route("/stats").get(getDeliveryStats);

router
  .route("/:id")
  .patch(updateDeliveryStopAvailability)
  .delete(deleteDeliveryStop);

export default router;
