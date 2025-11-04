import { Router } from "express"

import { listWaitlist, removeWaitlistEntry } from "../controllers/waitlistController.js"
import { requireAuth } from "../middleware/auth.js"

const router = Router()

router.get("/", requireAuth(["admin", "staff"]), listWaitlist)
router.delete("/:id", requireAuth(["admin", "staff"]), removeWaitlistEntry)

export default router
