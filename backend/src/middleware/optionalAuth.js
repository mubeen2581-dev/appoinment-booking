import { verifyToken } from "../utils/jwt.js"
import { User } from "../models/User.js"

const extractToken = (req) => {
  const header = req.headers.authorization
  if (header?.startsWith("Bearer ")) {
    return header.substring(7)
  }
  if (req.cookies?.token) {
    return req.cookies.token
  }
  return null
}

export const optionalAuth = async (req, res, next) => {
  try {
    const token = extractToken(req)
    if (!token) {
      return next()
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.sub)
    if (user) {
      req.user = user
    }
  } catch (error) {
    // ignore invalid tokens for optional auth
  }
  return next()
}
