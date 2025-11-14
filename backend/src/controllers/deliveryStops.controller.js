import DeliveryStop from "../models/deliveryStops.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Get all delivery stops
// @route   GET /api/delivery-stops
// @access  Private (All authenticated users
export const getDeliveryStops = asyncHandler(async (req, res, next) => {
  const stops = await DeliveryStop.find().sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stops.length,
    data: stops,
  });
});

// @desc    Create a new delivery stop
// @route   POST /api/delivery-stops
//  @access  Private (Driver, Manager, Admin)
export const createDeliveryStop = asyncHandler(async (req, res, next) => {
  const { name, location, address, mobile_number, available } = req.body;

  // Validation
  if (!name || !location || !address) {
    return next(
      new AppError("Please provide name, location, and address", 400)
    );
  }

  const newStop = new DeliveryStop({
    name,
    location,
    address,
    mobile_number: mobile_number || "N/A",
    available: available || "unknown",
    createdBy: req.user.id, // Track who created this stop
  });

  const savedStop = await newStop.save();

  res.status(201).json({
    success: true,
    data: savedStop,
  });
});

// @desc    Update a delivery stop's availability
// @route   PATCH /api/delivery-stops/:id
// @access  Public

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
// @access  Private (Manager, Admin only)
export const deleteDeliveryStop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const stop = await DeliveryStop.findById(id);
  if (!stop) {
    return next(new AppError("Delivery stop not found", 404));
  }
  // Only admin/manager or the creator can delete
  if (
    req.user.role !== "admin" &&
    req.user.role !== "manager" &&
    stop.createdBy.toString() !== req.user.id
  ) {
    return next(new AppError("Not authorized to delete this stop", 403));
  }
  await stop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Delivery stop deleted successfully",
  });
});
