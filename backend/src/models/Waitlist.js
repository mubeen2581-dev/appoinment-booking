import mongoose from "mongoose"

const waitlistSchema = new mongoose.Schema(
  {
    customer: {
      name: {
        type: String,
        required: true,
      },
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
      },
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    date: {
      type: String,
      required: true,
    },
    preferredTimeSlot: {
      type: String,
      required: true,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
)

export const Waitlist = mongoose.model("Waitlist", waitlistSchema)
