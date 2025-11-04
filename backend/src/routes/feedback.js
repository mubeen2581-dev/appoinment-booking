import { Router } from "express"

import { listFeedback, submitFeedback } from "../controllers/feedbackController.js"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { feedbackSchema } from "../utils/validators.js"

const router = Router()

router.get("/", requireAuth(["admin", "staff"]), listFeedback)
router.post("/:appointmentId", requireAuth(["user", "admin", "staff"]), validateBody(feedbackSchema), submitFeedback)

export default router
