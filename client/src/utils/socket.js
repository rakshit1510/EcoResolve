// In Vite, use VITE_ env vars. Set VITE_SOCKET_URL to your socket server if not same origin.
import { io } from "socket.io-client"

let socket

export function getSocket() {
  if (socket) return socket
  // For Vite: import.meta.env.VITE_SOCKET_URL
  // const url = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001"
  const url = "http://localhost:3001"
  // Force WebSocket transport for stability; you can remove transports to allow fallbacks
socket = io(url, { 
  transports: ["websocket", "polling"]  // Allow fallback
})
  return socket
}
