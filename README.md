# Appointment Booking Platform

Full-stack appointment scheduling platform for service businesses with user accounts, real-time availability, multi-location support, payments, analytics, and automated notifications.

## Technology

- **Frontend:** React + Vite, React Router, Tailwind CSS, React Calendar, Stripe Elements, Socket.IO client
- **Backend:** Node.js, Express, MongoDB (Mongoose), Zod validation, Socket.IO, Nodemailer, Twilio (optional), Stripe
- **Analytics & Visualization:** Chart.js + react-chartjs-2

## Structure

```
appoinment-app/
+- backend/        # Express API, auth, scheduling logic
+- frontend/       # React SPA (booking flow + dashboards)
+- README.md
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (Atlas or local)
- Stripe test account (for online payments)

---

## Backend Setup

1. Install dependencies and copy the env template:
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
2. Edit `.env` with at least:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `ADMIN_API_KEY` (optional fallback for legacy admin scripts)
   - Optional integrations: Stripe (`STRIPE_SECRET_KEY`), Twilio, Google Calendar OAuth, SMTP credentials
3. Start the API in dev mode:
   ```bash
   npm run dev
   ```
4. (Optional) Seed demo data (admin user, services, locations, sample bookings):
   ```bash
   npm run seed
   ```

### Key Endpoints

| Method | Endpoint                       | Description                                     |
| ------ | ------------------------------ | ----------------------------------------------- |
| POST   | `/api/auth/register`           | Create user account                             |
| POST   | `/api/auth/login`              | Authenticate and receive JWT                    |
| GET    | `/api/services`                | List active services                            |
| GET    | `/api/locations`               | List active locations                           |
| GET    | `/api/appointments/slots`      | Real-time booked slots for date/location        |
| POST   | `/api/appointments`            | Create appointment (optional JWT)               |
| GET    | `/api/appointments`            | User appointments or all (admin/staff)          |
| PUT    | `/api/appointments/:id`        | Update/reschedule (owner or admin)              |
| DELETE | `/api/appointments/:id`        | Delete appointment (admin/staff)                |
| POST   | `/api/payments/intent`         | Create Stripe payment intent (authenticated)    |
| GET    | `/api/analytics`               | Admin analytics (totals, revenue, ratings)      |
| GET    | `/api/waitlist`                | Admin waitlist overview                         |
| POST   | `/api/feedback/:appointmentId` | Submit rating for completed appointment         |

> Admin/staff routes require a JWT with the proper role. Legacy `ADMIN_API_KEY` header is still accepted for read-only email integrations.

---

## Frontend Setup

1. Install dependencies and copy env template:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   ```
2. Configure `.env`:
   - `VITE_API_BASE_URL` (default `http://localhost:5000/api`)
   - `VITE_SOCKET_URL` (default `http://localhost:5000`)
   - `VITE_STRIPE_PUBLIC_KEY` (only if Stripe is configured)
3. Launch the dev server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:5173](http://localhost:5173).

### Frontend Highlights

- **Authentication & Roles:** JWT-based login/register, protected routes, role-aware navigation, loyalty points tracking.
- **Booking Flow:** Service + location selectors, real-time slot availability via Socket.IO, loyalty redemption, waitlist opt-in, Stripe payments (optional).
- **Notifications:** Toast system, email + optional SMS confirmations (served by backend).
- **Admin Dashboard:** Appointment management (reschedule/cancel/delete), analytics cards, service popularity chart, waitlist administration, feedback feed, dark mode support.
- **User Portal:** "My Appointments" dashboard with rescheduling, cancellation, and post-visit feedback.

---

## Validation & Testing

- Backend unit tests (`node --test`) cover core validation schemas.
- `npm run build` in `frontend/` ensures production build succeeds.
- Health check at `GET /api/health` confirms server status.

---

## Feature Summary

- ? JWT auth with role-based access (user/admin/staff)
- ? Multi-location scheduling with configurable slot intervals
- ? Service catalog (duration, pricing, categories)
- ? Real-time slot updates via Socket.IO
- ? Waitlist with notifications when slots reopen
- ? Stripe payments (fallback to on-site payment when disabled)
- ? Loyalty program (earn & redeem points)
- ? Email + optional SMS confirmations
- ? Google Calendar sync (optional)
- ? Admin analytics (totals, revenue, ratings, loyalty leaders)
- ? Ratings & feedback collection
- ? Dark / light theme toggle

---

## Suggested Next Steps

- Configure CI for automated testing and linting
- Extend analytics with custom date filters and exports
- Add staff scheduling (resource calendars) and capacity planning
- Implement public booking widgets for embeddable forms
- Deploy backend (Render/Railway/Heroku) and frontend (Vercel/Netlify)

