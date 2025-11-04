import { User } from "../models/User.js"
import { signToken } from "../utils/jwt.js"

const buildAuthResponse = (user) => ({
  user: {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    loyaltyPoints: user.loyaltyPoints,
    phone: user.phone,
  },
  token: signToken({ sub: user.id, role: user.role }),
})

export const register = async (req, res) => {
  const { name, email, password, phone } = req.body
  if (!name || !email || !password) {
    return res.status(400).json({ error: "Name, email, and password are required" })
  }

  const exists = await User.findOne({ email })
  if (exists) {
    return res.status(409).json({ error: "Email already registered" })
  }

  const user = await User.create({ name, email, password, phone })
  res.status(201).json(buildAuthResponse(user))
}

export const login = async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" })
  }

  const user = await User.findOne({ email }).select("+password")
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const matches = await user.comparePassword(password)
  if (!matches) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  res.json(buildAuthResponse(user))
}

export const me = async (req, res) => {
  res.json({
    user: {
      id: req.user.id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      loyaltyPoints: req.user.loyaltyPoints,
      phone: req.user.phone,
    },
  })
}
