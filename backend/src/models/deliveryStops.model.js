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
    // ✅ ADD THIS: Link delivery stops to specific users
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ✅ ADD THIS: Assign delivery stops to specific drivers
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
DeliveryStopSchema.index({ location: "2dsphere" });
DeliveryStopSchema.index({ createdBy: 1 }); // ✅ For user-specific queries
DeliveryStopSchema.index({ assignedTo: 1 }); // ✅ For driver-specific queries

export default mongoose.model("DeliveryStop", DeliveryStopSchema);
