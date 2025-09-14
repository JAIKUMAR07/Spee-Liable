// backend/models/DeliveryStop.js
const mongoose = require("mongoose");

const DeliveryStopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      // Using an array for [longitude, latitude] is common for GeoJSON, but we'll use an object for clarity with Google Maps.
      type: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
      },
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    mobile_number: {
      type: String,
      default: "N/A",
    },
    available: {
      type: String,
      enum: ["available", "unavailable", "unknown"],
      default: "unknown",
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

// Create an index on the location field for potential geospatial queries later
DeliveryStopSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("DeliveryStop", DeliveryStopSchema);
