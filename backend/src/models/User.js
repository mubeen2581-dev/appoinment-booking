import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["user", "admin", "staff"],
      default: "user",
    },
    phone: {
      type: String,
      trim: true,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
    },
    calendarSyncEnabled: {
      type: Boolean,
      default: false,
    },
    calendarId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre("save", async function hashPassword(next) {
  if (!this.isModified("password")) {
    return next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  return next()
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  if (!this.password) {
    return false
  }
  return bcrypt.compare(candidate, this.password)
}

export const User = mongoose.model("User", userSchema)
