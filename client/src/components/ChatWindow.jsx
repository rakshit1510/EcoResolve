"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { getSocket } from "@/utils/socket.js"
import { roomIdFor } from "@/utils/rooms.js"

export default function ChatWindow({ room, identity, headerTitle }) {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const typingTimeout = useRef(null)
  const scrollerRef = useRef(null)

  const roomId = useMemo(() => roomIdFor(room), [room])

  useEffect(() => {
    const el = scrollerRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  useEffect(() => {
    if (!roomId) return
    const socket = getSocket()

    const onMessage = (payload) => {
      if (payload.roomId !== roomId) return
      setMessages((prev) => [...prev, payload])
    }

    const onSystem = (payload) => {
      if (payload.roomId !== roomId) return
      setMessages((prev) => [...prev, { roomId, system: true, text: payload.text, ts: Date.now() }])
    }

    const onTyping = (payload) => {
      if (payload.roomId !== roomId) return
      setIsTyping(Boolean(payload.typing))
      if (payload.typing) {
        clearTimeout(typingTimeout.current)
        typingTimeout.current = setTimeout(() => setIsTyping(false), 1500)
      }
    }

    if (socket.connected) {
      socket.emit("join", { roomId, identity })
    } else {
      socket.on("connect", () => socket.emit("join", { roomId, identity }))
    }

    socket.on("chat:message", onMessage)
    socket.on("system", onSystem)
    socket.on("chat:typing", onTyping)

    return () => {
      socket.emit("leave", { roomId })
      socket.off("chat:message", onMessage)
      socket.off("system", onSystem)
      socket.off("chat:typing", onTyping)
    }
  }, [roomId, identity])

  const sendMessage = (e) => {
    e?.preventDefault?.()
    const text = input.trim()
    if (!text || !roomId) return
    const socket = getSocket()
    const payload = {
      roomId,
      text,
      sender: { role: identity?.role, name: identity?.name },
      ts: Date.now(),
    }
    setMessages((prev) => [...prev, { ...payload, optimistic: true }])
    setInput("")
    socket.emit("chat:message", payload)
  }

  const onInput = (e) => {
    setInput(e.target.value)
    const socket = getSocket()
    socket.emit("chat:typing", { roomId, typing: true })
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "#efeae2", // WhatsApp chat bg
        borderRadius: "12px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: "linear-gradient(90deg, #075E54, #128C7E)",
          color: "white",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          <div style={{ fontWeight: "600" }}>{headerTitle || "Chat"}</div>
          <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>
            You are {identity?.name} ({identity?.role})
          </div>
        </div>
        <div style={{ fontSize: "0.8rem", opacity: 0.85 }}>Online 🟢</div>
      </div>

      {/* Messages Section */}
      <div
        ref={scrollerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          backgroundImage:
            "url('https://i.imgur.com/dZ0KxQy.png')", // light WhatsApp pattern
          backgroundSize: "contain",
        }}
      >
        {messages.map((m, i) => {
          if (m.system) {
            return (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  color: "#888",
                  fontSize: "0.8rem",
                  margin: "8px 0",
                }}
              >
                {m.text}
              </div>
            )
          }

          const isMe =
            m.sender?.name === identity?.name && m.sender?.role === identity?.role

          return (
            <div
              key={i}
              style={{
                display: "flex",
                justifyContent: isMe ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  background: isMe ? "#DCF8C6" : "#fff",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  maxWidth: "65%",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  fontSize: "0.95rem",
                }}
              >
                <div>{m.text}</div>
                <div
                  style={{
                    fontSize: "0.7rem",
                    color: "#777",
                    textAlign: "right",
                    marginTop: "4px",
                  }}
                >
                  {new Date(m.ts).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
          )
        })}

        {isTyping && (
          <div
            style={{
              fontSize: "0.8rem",
              color: "#888",
              marginTop: "4px",
            }}
          >
            The other person is typing…
          </div>
        )}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={sendMessage}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "10px 16px",
          background: "#f0f2f5",
          borderTop: "1px solid #ddd",
        }}
      >
        <input
          aria-label="Message"
          value={input}
          onChange={onInput}
          placeholder="Type a message"
          style={{
            flex: 1,
            borderRadius: "20px",
            border: "1px solid #ccc",
            padding: "10px 14px",
            outline: "none",
            fontSize: "0.95rem",
            background: "#fff",
          }}
        />
        <button
          type="submit"
          style={{
            background: "#128C7E",
            color: "white",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            fontSize: "1.2rem",
          }}
        >
          ➤
        </button>
      </form>
    </div>
  )
}
