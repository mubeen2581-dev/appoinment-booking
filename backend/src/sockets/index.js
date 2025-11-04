const EVENTS = {
  APPOINTMENT_CREATED: "appointments:created",
  APPOINTMENT_UPDATED: "appointments:updated",
  APPOINTMENT_DELETED: "appointments:deleted",
  WAITLIST_UPDATED: "waitlist:updated",
}

let ioInstance

export const registerSocketHandlers = (io) => {
  ioInstance = io

  io.on("connection", (socket) => {
    socket.on("join", (room) => {
      if (room) {
        socket.join(room)
      }
    })
  })
}

export const emitAppointmentCreated = (appointment) => {
  ioInstance?.emit(EVENTS.APPOINTMENT_CREATED, appointment)
}

export const emitAppointmentUpdated = (appointment) => {
  ioInstance?.emit(EVENTS.APPOINTMENT_UPDATED, appointment)
}

export const emitAppointmentDeleted = (id) => {
  ioInstance?.emit(EVENTS.APPOINTMENT_DELETED, { id })
}

export const emitWaitlistUpdated = (payload) => {
  ioInstance?.emit(EVENTS.WAITLIST_UPDATED, payload)
}

export const SOCKET_EVENTS = EVENTS
