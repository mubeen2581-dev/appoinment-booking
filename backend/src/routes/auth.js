import { Router } from "express"
import rateLimit from "express-rate-limit"

import { login, me, register } from "../controllers/authController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
})

router.post("/register", authLimiter, register)
router.post("/login", authLimiter, login)
router.get("/me", requireAuth(), me)

export default router
