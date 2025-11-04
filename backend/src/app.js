import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"
import rateLimit from "express-rate-limit"
import "express-async-errors"

import { registerRoutes } from "./routes/index.js"
import { errorHandler } from "./middleware/errorHandler.js"

const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())

export const createApp = () => {
  const app = express()

  app.set("trust proxy", 1)

  app.use(
    cors({
      origin: allowedOrigins,
      credentials: true,
    })
  )
  app.use(express.json({ limit: "1mb" }))
  app.use(cookieParser())

  const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
  })
  app.use(limiter)

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" })
  })

  registerRoutes(app)

  app.use(errorHandler)

  return app
}
