import express from "express";
import { deleteAllDeliveryStops } from "../controllers/deliveryMarks.controller.js";

const router = express.Router();

router.route("/").delete(deleteAllDeliveryStops);

export default router;
