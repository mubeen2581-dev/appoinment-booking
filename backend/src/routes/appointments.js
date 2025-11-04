import { Router } from "express"

import {
  createAppointment,
  deleteAppointment,
  getAppointments,
  getBookedSlots,
  updateAppointment,
} from "../controllers/appointmentController.js"
import { requireAuth } from "../middleware/auth.js"
import { optionalAuth } from "../middleware/optionalAuth.js"
import { validateBody } from "../middleware/validate.js"
import { createAppointmentSchema, updateAppointmentSchema } from "../utils/validators.js"

const router = Router()

router.post("/", optionalAuth, validateBody(createAppointmentSchema), createAppointment)
router.get("/slots", optionalAuth, getBookedSlots)
router.get("/", requireAuth(["admin", "staff", "user"]), getAppointments)
router.put("/:id", requireAuth(["admin", "staff", "user"]), validateBody(updateAppointmentSchema), updateAppointment)
router.delete("/:id", requireAuth(["admin", "staff"]), deleteAppointment)

export default router
