import dotenv from "dotenv"
dotenv.config()

import http from "node:http"
import { Server as SocketIOServer } from "socket.io"

import { createApp } from "./app.js"
import { connectDB } from "./config/db.js"
import { registerSocketHandlers } from "./sockets/index.js"

const port = process.env.PORT || 5000

const start = async () => {
  try {
    await connectDB(process.env.MONGODB_URI)

    const app = createApp()
    const server = http.createServer(app)

    const io = new SocketIOServer(server, {
      cors: {
        origin: (process.env.CORS_ORIGINS ?? "http://localhost:5173").split(","),
        credentials: true,
      },
    })

    registerSocketHandlers(io)

    server.listen(port, () => {
      console.log(`Server listening on http://localhost:${port}`)
    })
  } catch (error) {
    console.error("Failed to start server", error)
    process.exit(1)
  }
}

start()
