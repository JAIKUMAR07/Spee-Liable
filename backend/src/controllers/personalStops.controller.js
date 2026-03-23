import PersonalStop from "../models/personalStop.model.js";
import asyncHandler from "../middleware/asyncHandler.js";
import AppError from "../utils/AppError.js";

// @desc    Get driver's personal stops
// @route   GET /api/personal-stops
// @access  Private
export const getPersonalStops = asyncHandler(async (req, res, next) => {
  const stops = await PersonalStop.find({ driver: req.user.id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: stops.length,
    data: stops,
  });
});

// @desc    Create a new personal stop
// @route   POST /api/personal-stops
// @access  Private
export const createPersonalStop = asyncHandler(async (req, res, next) => {
  const { reason, location, address } = req.body;

  if (!reason || !location || !address) {
    return next(new AppError("Please provide reason, location, and address", 400));
  }

  const newStop = new PersonalStop({
    name: "Personal Stop - " + reason,
    reason,
    location,
    address,
    driver: req.user.id,
  });

  const savedStop = await newStop.save();

  res.status(201).json({
    success: true,
    data: savedStop,
  });
});

// @desc    Delete a personal stop
// @route   DELETE /api/personal-stops/:id
// @access  Private
export const deletePersonalStop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const stop = await PersonalStop.findById(id);
  if (!stop) {
    return next(new AppError("Personal stop not found", 404));
  }

  // Ensure only the driver who created it can delete it
  if (stop.driver.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new AppError("Not authorized to delete this personal stop", 403));
  }

  await stop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Personal stop deleted successfully",
  });
});
