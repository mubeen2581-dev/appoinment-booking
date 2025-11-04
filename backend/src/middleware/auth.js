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

export const requireAuth = (roles = []) => async (req, res, next) => {
  try {
    const token = extractToken(req)
    if (!token) {
      return res.status(401).json({ error: "Authentication required" })
    }

    const decoded = verifyToken(token)
    const user = await User.findById(decoded.sub)
    if (!user) {
      return res.status(401).json({ error: "Invalid token" })
    }

    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" })
    }

    req.user = user
    return next()
  } catch (error) {
    const status = error.name === "TokenExpiredError" ? 401 : 403
    return res.status(status).json({ error: "Unauthorized" })
  }
}
