import { Router } from "express"

import {
  createService,
  deleteService,
  listServices,
  updateService,
} from "../controllers/serviceController.js"
import { requireAuth } from "../middleware/auth.js"
import { validateBody } from "../middleware/validate.js"
import { serviceCreateSchema, serviceUpdateSchema } from "../utils/validators.js"

const router = Router()

router.get("/", listServices)
router.post("/", requireAuth(["admin", "staff"]), validateBody(serviceCreateSchema), createService)
router.put("/:id", requireAuth(["admin", "staff"]), validateBody(serviceUpdateSchema), updateService)
router.delete("/:id", requireAuth(["admin"]), deleteService)

export default router
