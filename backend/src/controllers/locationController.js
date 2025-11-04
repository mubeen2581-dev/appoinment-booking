import { Location } from "../models/Location.js"

export const listLocations = async (req, res) => {
  const locations = await Location.find({ isActive: true }).sort({ name: 1 })
  res.json({ locations })
}

export const createLocation = async (req, res) => {
  const location = await Location.create(req.body)
  res.status(201).json({ location })
}

export const updateLocation = async (req, res) => {
  const { id } = req.params
  const location = await Location.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
  if (!location) {
    return res.status(404).json({ error: "Location not found" })
  }
  res.json({ location })
}

export const deleteLocation = async (req, res) => {
  const { id } = req.params
  const location = await Location.findById(id)
  if (!location) {
    return res.status(404).json({ error: "Location not found" })
  }
  await location.deleteOne()
  res.status(204).send()
}
