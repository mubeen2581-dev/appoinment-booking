import dayjs from "dayjs"

import { Appointment } from "../models/Appointment.js"
import { Feedback } from "../models/Feedback.js"
import { User } from "../models/User.js"

export const getAnalytics = async (req, res) => {
  const totalAppointments = await Appointment.countDocuments()
  const upcomingAppointments = await Appointment.countDocuments({
    date: { $gte: dayjs().format("YYYY-MM-DD") },
    status: "scheduled",
  })

  const servicesBreakdown = await Appointment.aggregate([
    { $match: { status: { $ne: "cancelled" } } },
    {
      $group: {
        _id: "$service",
        total: { $sum: 1 },
        revenue: { $sum: "$serviceSnapshot.price" },
      },
    },
    {
      $lookup: {
        from: "services",
        localField: "_id",
        foreignField: "_id",
        as: "service",
      },
    },
    { $unwind: "$service" },
    {
      $project: {
        _id: 0,
        serviceId: "$service._id",
        name: "$service.name",
        total: 1,
        revenue: 1,
      },
    },
  ])

  const averageRatingData = await Feedback.aggregate([
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        total: { $sum: 1 },
      },
    },
  ])

  const loyaltyLeaders = await User.find({ loyaltyPoints: { $gt: 0 } })
    .sort({ loyaltyPoints: -1 })
    .limit(5)
    .select("name email loyaltyPoints")

  res.json({
    totals: {
      totalAppointments,
      upcomingAppointments,
    },
    services: servicesBreakdown,
    feedback: {
      averageRating: averageRatingData[0]?.avgRating ?? 0,
      responses: averageRatingData[0]?.total ?? 0,
    },
    loyaltyLeaders,
  })
}
