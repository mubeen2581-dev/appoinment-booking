import { Waitlist } from "../models/Waitlist.js"
import { Service } from "../models/Service.js"
import { Location } from "../models/Location.js"
import { emitWaitlistUpdated } from "../sockets/index.js"

export const listWaitlist = async (req, res) => {
  const waitlist = await Waitlist.find().populate("service").populate("location").sort({ createdAt: 1 })
  res.json({ waitlist })
}

export const removeWaitlistEntry = async (req, res) => {
  const { id } = req.params
  const entry = await Waitlist.findById(id)
  if (!entry) {
    return res.status(404).json({ error: "Waitlist entry not found" })
  }

  await entry.deleteOne()
  emitWaitlistUpdated({ service: entry.service, location: entry.location, date: entry.date })
  res.status(204).send()
}
