import mongoose from "mongoose";

const PersonalStopSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: "Personal Stop",
      trim: true,
    },
    reason: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: {
        lat: { type: Number },
        lng: { type: Number },
      },
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

PersonalStopSchema.index({ location: "2dsphere" });
PersonalStopSchema.index({ driver: 1 });

export default mongoose.model("PersonalStop", PersonalStopSchema);
