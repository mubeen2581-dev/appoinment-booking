import { io } from "socket.io-client"

const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:5000"

let socket

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_BASE_URL, {
      withCredentials: true,
    })
  }
  return socket
}

export const getSocket = () => socket
