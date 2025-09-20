// backend/routes/deliveryStops.js
import express from "express";

const router = express.Router(); // Router lets us define routes in a separate file
// Import the Mongoose model
import DeliveryStop from "../models/deliveryStops.model.js";
// ==========================
// @desc    Get all delivery stops
// @route   GET /api/delivery-stops
// @access  Public (for now, add auth later)
// ==========================

// ==========================
// @desc    Create a new delivery stop
// @route   POST /api/delivery-stops
// @access  Public
// ==========================

// ==========================
// @desc    Delete a delivery stop
// @route   DELETE /api/delivery-stops/:id
// @access  Public
// ==========================
router.delete("/", async (req, res) => {
  try {
    // Delete all delivery stops
    const result = await DeliveryStop.deleteMany({});

    // Send success message with count of deleted items
    res.json({
      message: "All delivery stops deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    // Server error (500)
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// Export router to use in server.js (app.use("/api/delivery-stops", router))
// ==========================
export default router;
