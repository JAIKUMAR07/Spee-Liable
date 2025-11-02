import DeliveryStop from "../models/deliveryStops.model.js";
import asyncHandler from "../middleware/asyncHandler.js";

// @desc    Delete all delivery stops
// @route   DELETE /api/delivery-marks
// @access  Public
export const deleteAllDeliveryStops = asyncHandler(async (req, res, next) => {
  const result = await DeliveryStop.deleteMany({});

  res.status(200).json({
    success: true,
    message: "All delivery stops deleted successfully",
    deletedCount: result.deletedCount,
  });
});

// @desc    Delete a delivery stop
// @route   DELETE /api/delivery-stops/:id
// @access  Public
export const deleteDeliveryStop = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const stop = await DeliveryStop.findById(id);
  if (!stop) {
    return next(new AppError("Delivery stop not found", 404));
  }

  await stop.deleteOne();

  res.status(200).json({
    success: true,
    message: "Delivery stop deleted successfully",
  });
});
