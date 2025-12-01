import Notification from "../models/notification.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Get user's notifications
// @route   GET /api/notifications
// @access  Private
export const getUserNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const notifications = await Notification.find({ user: req.user.id })
    .populate("deliveryStop", "name address available")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments({ user: req.user.id });

  res.status(200).json({
    success: true,
    count: notifications.length,
    total,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      limit,
    },
    data: notifications,
  });
});

// @desc    Mark notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({
    success: true,
    data: notification,
  });
});

// @desc    Mark all notifications as read
// @route   PATCH /api/notifications/read-all
// @access  Private
export const markAllAsRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  const unreadCount = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    message: "All notifications marked as read",
    unreadCount,
  });
});

// @desc    Get unread notifications count
// @route   GET /api/notifications/unread-count
// @access  Private
export const getUnreadCount = asyncHandler(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    isRead: false,
  });

  res.status(200).json({
    success: true,
    count,
  });
});

// @desc    Create notification (internal use - for drivers scanning packages)
// @route   POST /api/notifications
// @access  Private
export const createNotification = asyncHandler(async (req, res, next) => {
  const { userId, title, message, type, deliveryStopId, actionRequired } =
    req.body;

  // Only drivers and admin can create notifications
  if (req.user.role !== "driver" && req.user.role !== "admin") {
    return next(new AppError("Not authorized to create notifications", 403));
  }

  const notification = await Notification.create({
    user: userId,
    title,
    message,
    type: type || "package_scanned",
    deliveryStop: deliveryStopId,
    actionRequired: actionRequired || false,
  });

  // Populate the notification for response
  await notification.populate("deliveryStop", "name address available");

  res.status(201).json({
    success: true,
    data: notification,
  });
});

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
// @access  Private
export const deleteNotification = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user.id,
  });

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  await notification.deleteOne();

  res.status(200).json({
    success: true,
    message: "Notification deleted successfully",
  });
});
