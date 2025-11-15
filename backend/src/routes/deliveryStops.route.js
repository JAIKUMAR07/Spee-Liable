import express from "express";
import {
  getDeliveryStops,
  getAllDeliveryStops, // ✅ New route
  createDeliveryStop,
  updateDeliveryStopAvailability,
  deleteDeliveryStop,
  getDeliveryStats, // ✅ New route
  getCustomerPackages, // ✅ ADD THIS
  updatePackageAvailability, // ✅ ADD THIS
} from "../controllers/deliveryStops.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

// All routes protected
router.use(protect);

router
  .route("/")
  .get(getDeliveryStops) // ✅ User sees only their stops
  .post(authorize("driver", "admin"), createDeliveryStop); // ✅ Only drivers can create;

// ✅ ADD CUSTOMER ROUTES
router
  .route("/customer/my-packages")
  .get(authorize("customer"), getCustomerPackages);

// ✅ ADD THIS ROUTE FOR PACKAGE AVAILABILITY UPDATES
router.route("/:id/availability").patch(updatePackageAvailability);

// ✅ New route for admin/manager to see all stops
router.route("/all").get(authorize("admin"), getAllDeliveryStops);

// ✅ New route for user stats
router.route("/stats").get(getDeliveryStats);

router
  .route("/:id")
  .patch(updateDeliveryStopAvailability)
  .delete(deleteDeliveryStop);

export default router;
