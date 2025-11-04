import { Service } from "../models/Service.js"

export const listServices = async (req, res) => {
  const services = await Service.find({ isActive: true }).sort({ name: 1 })
  res.json({ services })
}

export const createService = async (req, res) => {
  const service = await Service.create(req.body)
  res.status(201).json({ service })
}

export const updateService = async (req, res) => {
  const { id } = req.params
  const service = await Service.findByIdAndUpdate(id, req.body, { new: true, runValidators: true })
  if (!service) {
    return res.status(404).json({ error: "Service not found" })
  }
  res.json({ service })
}

export const deleteService = async (req, res) => {
  const { id } = req.params
  const service = await Service.findById(id)
  if (!service) {
    return res.status(404).json({ error: "Service not found" })
  }
  await service.deleteOne()
  res.status(204).send()
}
