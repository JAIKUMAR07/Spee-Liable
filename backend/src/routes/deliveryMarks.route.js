import express from "express";
import {
  deleteAllDeliveryStops,
  deleteDeliveryStop,
} from "../controllers/deliveryMarks.controller.js";

const router = express.Router();

router.route("/").delete(deleteAllDeliveryStops);
router.route("/:id").delete(deleteDeliveryStop);

export default router;
