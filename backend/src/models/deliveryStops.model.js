import mongoose from "mongoose";

const DeliveryStopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
    },
    location: {
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
      enum: ["available", "unavailable", "unknown"],
      default: "unknown",
    },
  },
  {
    timestamps: true,
  }
);

// Create an index on the location field for potential geospatial queries later
DeliveryStopSchema.index({ location: "2dsphere" });

export default mongoose.model("DeliveryStop", DeliveryStopSchema);
