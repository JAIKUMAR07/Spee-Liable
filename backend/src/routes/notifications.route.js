import express from "express";
import {
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  deleteNotification,
  getUnreadCount,
} from "../controllers/notification.controller.js";
import { protect, authorize } from "../middleware/auth.js"; // ✅ ADD authorize import

const router = express.Router();

// All routes protected
router.use(protect);

router
  .route("/")
  .get(getUserNotifications)
  .post(authorize("driver", "admin"), createNotification); // ✅ Only drivers/admin can create

router.get("/unread-count", getUnreadCount);
router.patch("/read-all", markAllAsRead);
router.route("/:id").patch(markAsRead).delete(deleteNotification);

export default router;
