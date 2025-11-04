import { Feedback } from "../models/Feedback.js"
import { Appointment } from "../models/Appointment.js"

export const submitFeedback = async (req, res) => {
  const { appointmentId } = req.params
  const payload = req.body

  const appointment = await Appointment.findById(appointmentId)
  if (!appointment) {
    return res.status(404).json({ error: "Appointment not found" })
  }

  if (appointment.user?.toString() !== req.user?.id) {
    return res.status(403).json({ error: "You can only rate your own appointments" })
  }

  const feedback = await Feedback.findOneAndUpdate(
    { appointment: appointmentId, user: req.user.id },
    { rating: payload.rating, comments: payload.comments },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  )

  res.status(201).json({ feedback })
}

export const listFeedback = async (req, res) => {
  const feedback = await Feedback.find().populate("appointment").populate("user")
  res.json({ feedback })
}
