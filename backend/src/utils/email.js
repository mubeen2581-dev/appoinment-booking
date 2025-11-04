import nodemailer from 'nodemailer'

let cachedTransporter

const createTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter
  }

  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    cachedTransporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })
  } else {
    cachedTransporter = nodemailer.createTransport({
      jsonTransport: true,
    })
  }

  return cachedTransporter
}

export const sendBookingConfirmation = async (appointment) => {
  const transporter = createTransporter()

  const mailOptions = {
    from: process.env.EMAIL_FROM || 'Scheduler <no-reply@example.com>',
    to: appointment.customer.email,
    subject: `Your appointment is confirmed for ${appointment.date} at ${appointment.timeSlot}`,
    text: [
      `Hi ${appointment.customer.name},`,
      '',
      'Thanks for booking with us!',
      `Appointment details:`,
      `• Date: ${appointment.date}`,
      `• Time: ${appointment.timeSlot}`,
      appointment.service ? `• Service: ${appointment.service}` : null,
      appointment.notes ? `• Notes: ${appointment.notes}` : null,
      '',
      'We look forward to seeing you.',
    ]
      .filter(Boolean)
      .join('\n'),
    html: `<p>Hi ${appointment.customer.name},</p>
<p>Thanks for booking with us! Here are your appointment details:</p>
<ul>
  <li><strong>Date:</strong> ${appointment.date}</li>
  <li><strong>Time:</strong> ${appointment.timeSlot}</li>
  ${appointment.service ? `<li><strong>Service:</strong> ${appointment.service}</li>` : ''}
  ${appointment.notes ? `<li><strong>Notes:</strong> ${appointment.notes}</li>` : ''}
</ul>
<p>We look forward to seeing you.</p>`,
  }

  const info = await transporter.sendMail(mailOptions)

  if (transporter.options?.jsonTransport) {
    console.log('[Mock email]', info.message)
  }

  return info
}
