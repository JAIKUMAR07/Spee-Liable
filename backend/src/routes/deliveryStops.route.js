import express from "express";
import {
  getDeliveryStops,
  createDeliveryStop,
  updateDeliveryStopAvailability,
  deleteDeliveryStop,
} from "../controllers/deliveryStops.controller.js";

const router = express.Router();

router.route("/").get(getDeliveryStops).post(createDeliveryStop);

router
  .route("/:id")
  .patch(updateDeliveryStopAvailability)
  .delete(deleteDeliveryStop);

export default router;
