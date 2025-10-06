"use client"

import { useMemo } from "react"
import { useParams, Link } from "react-router-dom"
import ChatWindow from "@/components/ChatWindow.jsx"
import { departments } from "@/data/departments.js"

export default function HeadChat() {
  const { dept, head } = useParams()

  const data = useMemo(() => {
    const d = departments.find((x) => x.id === dept)
    const h = d?.heads.find((y) => y.id === head)
    return { dept: d, head: h }
  }, [dept, head])

  // ❌ Invalid department or head fallback
  if (!data.dept || !data.head) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
          background: "#f9fafb",
        }}
      >
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "32px 40px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
            textAlign: "center",
            maxWidth: "420px",
          }}
        >
          <h2
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              color: "#111827",
              marginBottom: "8px",
            }}
          >
            ⚠️ Invalid Department or Head
          </h2>
          <p style={{ fontSize: "0.95rem", color: "#6b7280", marginBottom: "16px" }}>
            We couldn’t find the chat for the provided URL:
          </p>
          <code
            style={{
              background: "#f3f4f6",
              borderRadius: "6px",
              padding: "6px 10px",
              fontSize: "0.85rem",
              color: "#374151",
              display: "block",
              marginBottom: "12px",
            }}
          >
            /head/{dept}/{head}
          </code>
          <p style={{ fontSize: "0.9rem", color: "#9ca3af", marginBottom: "20px" }}>
            Expected format: <br />
            <span style={{ color: "#2563eb" }}>
              /head/electricity/chief-electrical-engineer
            </span>
          </p>

          <Link
            to="/"
            style={{
              background: "#0284c7",
              color: "#fff",
              textDecoration: "none",
              padding: "10px 18px",
              borderRadius: "8px",
              fontWeight: 500,
              transition: "background 0.2s ease-in-out",
            }}
            onMouseOver={(e) => (e.target.style.background = "#0369a1")}
            onMouseOut={(e) => (e.target.style.background = "#0284c7")}
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // ✅ Valid room
  const headerTitle = `${data.dept.name} • ${data.head.name} (${data.head.title})`

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr",
        minHeight: "85vh",
        background: "#f9fafb",
        padding: "20px",
        borderRadius: "16px",
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <ChatWindow
          room={{ deptId: data.dept.id, headId: data.head.id }}
          identity={{ role: "head", name: data.head.name }}
          headerTitle={headerTitle}
        />
      </div>
    </div>
  )
}
