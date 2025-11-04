import mongoose from "mongoose"

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false }
)

const paymentSchema = new mongoose.Schema(
  {
    status: {
      type: String,
      enum: ["pending", "requires_payment_method", "requires_action", "succeeded", "refunded", "failed", "not_required"],
      default: "not_required",
    },
    amount: {
      type: Number,
      default: 0,
    },
    currency: {
      type: String,
      default: "usd",
    },
    intentId: {
      type: String,
      trim: true,
    },
    receiptUrl: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
)

const notificationSchema = new mongoose.Schema(
  {
    confirmationSentAt: Date,
    reminderSentAt: Date,
    followUpSentAt: Date,
    waitlistNotifiedAt: Date,
  },
  { _id: false }
)

const appointmentSchema = new mongoose.Schema(
  {
    customer: {
      type: customerSchema,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },
    serviceSnapshot: {
      name: String,
      durationMinutes: Number,
      price: Number,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    durationMinutes: {
      type: Number,
      required: true,
      min: 15,
      max: 480,
    },
    status: {
      type: String,
      enum: ["scheduled", "cancelled", "completed"],
      default: "scheduled",
    },
    payment: {
      type: paymentSchema,
      default: () => ({ status: "not_required" }),
    },
    loyaltyPointsAwarded: {
      type: Number,
      default: 0,
    },
    googleEventId: {
      type: String,
      trim: true,
    },
    notifications: {
      type: notificationSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
)

appointmentSchema.index({ date: 1, timeSlot: 1, location: 1 })
appointmentSchema.index({ user: 1 })

export const Appointment = mongoose.model("Appointment", appointmentSchema)
