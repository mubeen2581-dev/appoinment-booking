import jwt from "jsonwebtoken"

const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error("JWT_SECRET not configured")
  }
  return secret
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN ?? "7d"

export const signToken = (payload, options = {}) => {
  const JWT_SECRET = getJWTSecret()
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN, ...options })
}

export const verifyToken = (token) => {
  const JWT_SECRET = getJWTSecret()
  return jwt.verify(token, JWT_SECRET)
}
