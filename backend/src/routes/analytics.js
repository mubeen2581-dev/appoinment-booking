import { Router } from "express"

import { getAnalytics } from "../controllers/analyticsController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.get("/", requireAuth(["admin", "staff"]), getAnalytics)

export default router
