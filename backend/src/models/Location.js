import mongoose from "mongoose"

const locationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    address: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    slotIntervalMinutes: {
      type: Number,
      default: 60,
      min: 15,
      max: 240,
    },
    timezone: {
      type: String,
      default: "America/New_York",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

export const Location = mongoose.model("Location", locationSchema)
