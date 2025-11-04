import path from "node:path"
import { fileURLToPath } from "node:url"

import dayjs from "dayjs"
import dotenv from "dotenv"

import { connectDB } from "../src/config/db.js"
import { Appointment } from "../src/models/Appointment.js"
import { Service } from "../src/models/Service.js"
import { Location } from "../src/models/Location.js"
import { User } from "../src/models/User.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.resolve(__dirname, "../.env") })

const createSeedData = async () => {
  await Service.deleteMany({})
  await Location.deleteMany({})
  await Appointment.deleteMany({})
  await User.deleteMany({})

  const services = await Service.insertMany([
    {
      name: "Haircut",
      description: "Classic wash and cut",
      durationMinutes: 60,
      price: 45,
      category: "Salon",
    },
    {
      name: "Personal Training",
      description: "One-on-one coaching session",
      durationMinutes: 90,
      price: 85,
      category: "Fitness",
    },
  ])

  const locations = await Location.insertMany([
    {
      name: "Downtown Studio",
      address: "123 Main St",
      slotIntervalMinutes: 30,
    },
    {
      name: "Uptown Gym",
      address: "456 Center Ave",
      slotIntervalMinutes: 60,
    },
  ])

  const adminUser = await User.create({
    name: "Admin User",
    email: "admin@example.com",
    password: "password123",
    role: "admin",
  })

  const appointments = [1, 2, 3].map((index) => {
    const date = dayjs().add(index, "day")
    const service = services[index % services.length]
    const location = locations[index % locations.length]

    return {
      customer: {
        name: `Sample Client ${index}`,
        email: `client${index}@example.com`,
        phone: "+1 555 000 0000",
      },
      user: adminUser.id,
      service: service.id,
      serviceSnapshot: {
        name: service.name,
        durationMinutes: service.durationMinutes,
        price: service.price,
      },
      location: location.id,
      date: date.format("YYYY-MM-DD"),
      timeSlot: `${9 + index}:00`,
      durationMinutes: service.durationMinutes,
      notes: index === 1 ? "First-time visitor" : "",
      payment: {
        status: "not_required",
        amount: service.price,
        currency: process.env.PAYMENT_CURRENCY ?? "usd",
      },
    }
  })

  await Appointment.insertMany(appointments)
}

const run = async () => {
  try {
    await connectDB(process.env.MONGODB_URI)
    await createSeedData()
    console.log("Seed data inserted")
    process.exit(0)
  } catch (error) {
    console.error("Failed to seed data", error)
    process.exit(1)
  }
}

run()
