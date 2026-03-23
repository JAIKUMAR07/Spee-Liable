import express from "express";
import {
  getPersonalStops,
  createPersonalStop,
  deletePersonalStop,
} from "../controllers/personalStops.controller.js";
import { protect, authorize } from "../middleware/auth.js";

const router = express.Router();

router.use(protect); // All routes protected

router
  .route("/")
  .get(authorize("driver"), getPersonalStops)
  .post(authorize("driver"), createPersonalStop);

router
  .route("/:id")
  .delete(authorize("driver", "admin"), deletePersonalStop);

export default router;
