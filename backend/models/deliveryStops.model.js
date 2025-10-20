// backend/models/DeliveryStop.js

import mongoose from "mongoose";
const DeliveryStopSchema = new mongoose.Schema(
  {
    name: {
      type: String,

      trim: true,
    },
    location: {
      // Using an array for [longitude, latitude] is common for GeoJSON, but we'll use an object for clarity with Google Maps.
      type: {
        lat: { type: Number },
        lng: { type: Number },
      },
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
      enum: ["available", "unavailable"],
      default: "unknown",
    },
  },
  {
    timestamps: true, // Adds `createdAt` and `updatedAt` fields automatically
  }
);

// Create an index on the location field for potential geospatial queries later
DeliveryStopSchema.index({ location: "2dsphere" });

export default mongoose.model("DeliveryStop", DeliveryStopSchema);
