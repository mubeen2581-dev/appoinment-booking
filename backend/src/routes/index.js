import appointmentsRouter from "./appointments.js"
import authRouter from "./auth.js"
import servicesRouter from "./services.js"
import locationsRouter from "./locations.js"
import analyticsRouter from "./analytics.js"
import waitlistRouter from "./waitlist.js"
import feedbackRouter from "./feedback.js"
import paymentsRouter from "./payments.js"

export const registerRoutes = (app) => {
  app.use("/api/auth", authRouter)
  app.use("/api/appointments", appointmentsRouter)
  app.use("/api/services", servicesRouter)
  app.use("/api/locations", locationsRouter)
  app.use("/api/analytics", analyticsRouter)
  app.use("/api/waitlist", waitlistRouter)
  app.use("/api/feedback", feedbackRouter)
  app.use("/api/payments", paymentsRouter)
}
