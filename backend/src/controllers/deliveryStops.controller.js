import DeliveryStop from "../models/deliveryStops.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Get user's delivery stops (only their own)
// @route   GET /api/delivery-stops
// @access  Private
export const getDeliveryStops = asyncHandler(async (req, res, next) => {
  // ✅ Only return stops assigned to the current user
  const stops = await DeliveryStop.find({
    assignedTo: req.user.id,
  }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stops.length,
    data: stops,
  });
});

// @desc    Get all delivery stops (Admin/Manager only - for overview)
// @route   GET /api/delivery-stops/all
// @access  Private (Admin/Manager)
export const getAllDeliveryStops = asyncHandler(async (req, res, next) => {
  // ✅ Only admin and manager can see all stops
  if (req.user.role !== "admin" && req.user.role !== "manager") {
    return next(new AppError("Not authorized to view all delivery stops", 403));
  }

  const stops = await DeliveryStop.find()
    .populate("createdBy", "name email")
    .populate("assignedTo", "name email role")
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stops.length,
    data: stops,
  });
});

// @desc    Create a new delivery stop
// @route   POST /api/delivery-stops
// @access  Private
export const createDeliveryStop = asyncHandler(async (req, res, next) => {
  const { name, location, address, mobile_number, available, assignedTo } =
    req.body;

  // Validation
  if (!name || !location || !address) {
    return next(
      new AppError("Please provide name, location, and address", 400)
    );
  }

  // ✅ Auto-assign to current user if no specific assignment
  const assignedUserId = assignedTo || req.user.id;

  const newStop = new DeliveryStop({
    name,
    location,
    address,
    mobile_number: mobile_number || "N/A",
    available: available || "unknown",
    createdBy: req.user.id, // ✅ Track who created it
    assignedTo: assignedUserId, // ✅ Assign to specific user
  });

  const savedStop = await newStop.save();

  res.status(201).json({
    success: true,
    data: savedStop,
  });
});

// @desc    Update a delivery stop's availability
// @route   PATCH /api/delivery-stops/:id
// @access  Private
export const updateDeliveryStopAvailability = asyncHandler(
  async (req, res, next) => {
    const { available } = req.body;
    const { id } = req.params;

    if (!available) {
      return next(new AppError("Please provide availability status", 400));
    }

    const validStatuses = ["available", "unavailable", "unknown"];
    if (!validStatuses.includes(available)) {
      return next(
        new AppError(
          "Availability must be one of: available, unavailable, unknown",
          400
        )
      );
    }

    const stop = await DeliveryStop.findById(id);
    if (!stop) {
      return next(new AppError("Delivery stop not found", 404));
    }

    // ✅ Check if user owns this stop or is admin/manager
    if (
      stop.assignedTo.toString() !== req.user.id &&
      req.user.role !== "admin" &&
      req.user.role !== "manager"
    ) {
      return next(
        new AppError("Not authorized to update this delivery stop", 403)
      );
    }

    stop.available = available;
    const updatedStop = await stop.save();

    res.status(200).json({
      success: true,
      data: updatedStop,
    });
  }
);

// @desc    Delete a delivery stop
// @route   DELETE /api/delivery-stops/:id
// @access  Private
export const deleteDeliveryStop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const stop = await DeliveryStop.findById(id);
  if (!stop) {
    return next(new AppError("Delivery stop not found", 404));
  }

  // ✅ UPDATED: Allow drivers to delete their own stops
  const canDelete =
    // Admin/manager can delete anything
    req.user.role === "admin" ||
    req.user.role === "manager" ||
    // Driver can delete stops assigned to them
    stop.assignedTo.toString() === req.user.id;

  if (!canDelete) {
    return next(
      new AppError("Not authorized to delete this delivery stop", 403)
    );
  }

  await stop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Delivery stop deleted successfully",
  });
});

// @desc    Get delivery stops statistics for current user
// @route   GET /api/delivery-stops/stats
// @access  Private
export const getDeliveryStats = asyncHandler(async (req, res, next) => {
  const stats = await DeliveryStop.aggregate([
    {
      $match: { assignedTo: req.user._id }, // ✅ User-specific stats
    },
    {
      $group: {
        _id: "$available",
        count: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: stats,
  });
});
