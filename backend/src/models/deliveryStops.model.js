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
    // ✅ Link delivery stops to customer (package owner)
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // ✅ Assign delivery stops to specific drivers
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    // ✅ Track who scanned the package
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes for better performance
DeliveryStopSchema.index({ location: "2dsphere" });
DeliveryStopSchema.index({ customer: 1 });
DeliveryStopSchema.index({ assignedTo: 1 });
DeliveryStopSchema.index({ available: 1 });

export default mongoose.model("DeliveryStop", DeliveryStopSchema);
