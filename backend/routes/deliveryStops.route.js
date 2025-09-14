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
router.get("/", async (req, res) => {
  try {
    // Fetch all delivery stops, newest first (because of createdAt field from schema timestamps)
    const stops = await DeliveryStop.find().sort({ createdAt: -1 });
    res.json(stops); // Send stops back as JSON
  } catch (error) {
    // If something goes wrong with DB, return 500 error
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// @desc    Create a new delivery stop
// @route   POST /api/delivery-stops
// @access  Public
// ==========================
router.post("/", async (req, res) => {
  // Extract fields from request body
  const { name, location, address, mobile_number, available } = req.body;

  // Basic validation: ensure required fields exist
  if (!name || !location || !address) {
    return res
      .status(400)
      .json({ message: "Please provide name, location, and address" });
  }

  try {
    // Create a new instance of DeliveryStop
    const newStop = new DeliveryStop({
      name,
      location, // Expects { lat: 12.97, lng: 77.59 }
      address,
      mobile_number: mobile_number || "N/A", // Default if not provided
      available: available || "unknown", // Default if not provided
    });

    // Save to MongoDB
    const savedStop = await newStop.save();

    // Return saved document with status 201 (Created)
    res.status(201).json(savedStop);
  } catch (error) {
    // If validation fails or schema mismatch, return 400 (Bad Request)
    res.status(400).json({ message: error.message });
  }
});

// ==========================
// @desc    Delete a delivery stop
// @route   DELETE /api/delivery-stops/:id
// @access  Public
// ==========================
router.delete("/:id", async (req, res) => {
  try {
    // Find stop by ID
    const stop = await DeliveryStop.findById(req.params.id);

    // If not found, return 404
    if (!stop) {
      return res.status(404).json({ message: "Delivery stop not found" });
    }

    // Delete the stop
    await stop.deleteOne();

    // Send success message
    res.json({ message: "Delivery stop deleted" });
  } catch (error) {
    // Server error (500)
    res.status(500).json({ message: error.message });
  }
});

// ==========================
// Export router to use in server.js (app.use("/api/delivery-stops", router))
// ==========================
export default router;
