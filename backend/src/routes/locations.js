import { Router } from "express"

import {
  createLocation,
  deleteLocation,
  listLocations,
  updateLocation,
} from "../controllers/locationController.js"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { locationCreateSchema, locationUpdateSchema } from "../utils/validators.js"

const router = Router()

router.get("/", listLocations)
router.post("/", requireAuth(["admin", "staff"]), validateBody(locationCreateSchema), createLocation)
router.put("/:id", requireAuth(["admin", "staff"]), validateBody(locationUpdateSchema), updateLocation)
router.delete("/:id", requireAuth(["admin"]), deleteLocation)

export default router
