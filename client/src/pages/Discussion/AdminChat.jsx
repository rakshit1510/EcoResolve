"use client"

import { useMemo, useState } from "react"
import DepartmentSidebar from "@/components/DepartmentSidebar.jsx"
import ChatWindow from "@/components/ChatWindow.jsx"
import { departments } from "@/data/departments.js"

export default function AdminChat() {
  const [active, setActive] = useState(null)

  const headerTitle = useMemo(() => {
    if (!active) return "Select a department head to start"
    const dept = departments.find((d) => d.id === active.deptId)
    const head = dept?.heads.find((h) => h.id === active.headId)
    return head ? `${dept?.name} • ${head.name} (${head.title})` : "Chat"
  }, [active])

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "340px 1fr",
        height: "100vh", // Full viewport height
        background: "#eae6df",
        overflow: "hidden",
      }}
    >
      {/* Sidebar — WhatsApp style */}
      <div
        style={{
          background: "#fff",
          borderRight: "1px solid #ddd",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            background: "#f0f2f5",
            padding: "16px",
            fontWeight: 600,
            fontSize: "1.1rem",
            borderBottom: "1px solid #ddd",
          }}
        >
          Admin Control 💼
        </div>

        <DepartmentSidebar
          active={active ?? undefined}
          onSelect={(deptId, headId) => setActive({ deptId, headId })}
          showHeadLinks={true}
        />
      </div>

      {/* Chat Section */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          background: active ? "#efeae2" : "#f9fafb",
          transition: "background 0.2s ease-in-out",
        }}
      >
        {active ? (
          <>
          
            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "20px",
                backgroundImage: "url('https://i.imgur.com/dZ0KxQy.png')",
                backgroundSize: "contain",
              }}
            >
              <ChatWindow
                room={active}
                identity={{ role: "admin", name: "Admin Control" }}
                headerTitle={headerTitle}
              />
            </div>

    
          </>
        ) : (
          <div
            style={{
              flex: 1,
              display: "grid",
              placeItems: "center",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "1rem",
              lineHeight: 1.6,
              padding: "24px",
              background: "#f9fafb",
            }}
          >
            <p>💬 Choose a department and head from the sidebar to begin a conversation.</p>
          </div>
        )}
      </div>
    </div>
  )
}
