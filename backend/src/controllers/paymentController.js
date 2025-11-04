import Stripe from "stripe"

import { Service } from "../models/Service.js"

const stripeSecret = process.env.STRIPE_SECRET_KEY
const stripe = stripeSecret ? new Stripe(stripeSecret) : null

export const createPaymentIntent = async (req, res) => {
  if (!stripe) {
    return res.status(500).json({ error: "Stripe is not configured" })
  }

  const { serviceId } = req.body
  const service = await Service.findById(serviceId)
  if (!service) {
    return res.status(404).json({ error: "Service not found" })
  }

  const amountInCents = Math.round(service.price * 100)

  const intent = await stripe.paymentIntents.create({
    amount: amountInCents,
    currency: process.env.PAYMENT_CURRENCY ?? "usd",
    metadata: {
      serviceId: service.id,
      serviceName: service.name,
    },
  })

  res.json({ clientSecret: intent.client_secret })
}
