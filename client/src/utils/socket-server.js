// Run this alongside your Vite dev server. It broadcasts to all clients in a room.
import express from "express"
import { createServer } from "http"
import { Server } from "socket.io"

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Tighten for production (e.g., ["http://localhost:5173"])
  },
})

// Optional health endpoint
app.get("/", (_req, res) => res.send("Socket server running"))

io.on("connection", (socket) => {
  console.log("[socket] connected:", socket.id)

  socket.on("join", (payload) => {
    const roomId = typeof payload === "string" ? payload : payload?.roomId
    const name = typeof payload === "object" ? payload?.identity?.name : undefined
    if (!roomId) return
    socket.join(roomId)
    console.log(`[socket] ${socket.id} joined room ${roomId}`)
    
    // Debug: Show how many clients are in this room now
    const room = io.sockets.adapter.rooms.get(roomId)
    console.log(`👥 Room ${roomId} now has ${room ? room.size : 0} clients`)
    
    // notify others in the room
    socket.to(roomId).emit("system", { roomId, text: `${name || "Someone"} joined the chat` })
  })

  socket.on("leave", (payload) => {
    const roomId = typeof payload === "string" ? payload : payload?.roomId
    const name = typeof payload === "object" ? payload?.identity?.name : undefined
    if (!roomId) return
    socket.leave(roomId)
    console.log(`[socket] ${socket.id} left room ${roomId}`)
    
    // Debug: Show how many clients remain
    const room = io.sockets.adapter.rooms.get(roomId)
    console.log(`👥 Room ${roomId} now has ${room ? room.size : 0} clients`)
    
    socket.to(roomId).emit("system", { roomId, text: `${name || "Someone"} left the chat` })
  })

  socket.on("chat:message", (payload) => {
    console.log("📨 Received message:", {
      roomId: payload?.roomId,
      text: payload?.text,
      sender: payload?.sender,
      from: socket.id
    })
    
    if (!payload?.roomId) {
      console.log("❌ No roomId, ignoring message")
      return
    }
    
    // Debug: Check how many clients will receive this
    const room = io.sockets.adapter.rooms.get(payload.roomId)
    const clientCount = room ? room.size : 0
    console.log(`📤 Broadcasting to room: ${payload.roomId} (${clientCount - 1} other clients)`)
    
    socket.to(payload.roomId).emit("chat:message", payload)
  })

  socket.on("chat:typing", (payload) => {
    console.log("⌨️ Typing event:", {
      roomId: payload?.roomId,
      typing: payload?.typing,
      from: socket.id
    })
    
    if (!payload?.roomId) return
    
    const room = io.sockets.adapter.rooms.get(payload.roomId)
    console.log(`⌨️ Sending typing indicator to ${room ? room.size - 1 : 0} other clients`)
    
    socket.to(payload.roomId).emit("chat:typing", payload)
  })

  socket.on("disconnect", (reason) => {
    console.log("[socket] disconnected:", socket.id, reason)
  })
})

// Room monitoring for debugging
setInterval(() => {
  console.log("\n=== ROOM STATUS ===")
  const rooms = io.sockets.adapter.rooms
  rooms.forEach((clients, roomId) => {
    if (!roomId.startsWith('civic:')) return // Only show our chat rooms
    console.log(`🏠 ${roomId}: ${clients.size} clients`)
  })
  console.log("==================\n")
}, 10000) // Log every 10 seconds

const PORT = 3001
httpServer.listen(PORT, () => {
  console.log(`[socket] server listening on http://localhost:${PORT}`)
})