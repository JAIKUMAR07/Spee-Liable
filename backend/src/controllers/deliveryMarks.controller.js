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
