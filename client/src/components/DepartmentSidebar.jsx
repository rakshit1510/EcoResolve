"use client"
import { Link } from "react-router-dom"
import { departments } from "@/data/departments.js"

export default function DepartmentSidebar({ active, onSelect, showHeadLinks = true }) {
  return (
    <aside
      role="navigation"
      aria-label="Departments"
      style={{
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px 16px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
        height: "100%",
        overflowY: "auto",
      }}
    >
      <p
        style={{
          fontWeight: 700,
          fontSize: "1.1rem",
          color: "#111827",
          marginBottom: "16px",
          letterSpacing: "0.3px",
        }}
      >
        🏢 Departments
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {departments.map((d) => (
          <div key={d.id}>
            <div
              style={{
                fontWeight: 600,
                fontSize: "1rem",
                color: "#1f2937",
                marginBottom: "6px",
              }}
            >
              {d.name}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {d.heads.map((h) => {
                const isActive = active?.deptId === d.id && active?.headId === h.id
                return (
                  <div
                    key={h.id}
                    onClick={() => onSelect?.(d.id, h.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === "Enter" && onSelect?.(d.id, h.id)}
                    aria-pressed={isActive}
                    style={{
                      cursor: "pointer",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      background: isActive ? "#e0f2fe" : "#f9fafb",
                      border: isActive ? "1px solid #0284c7" : "1px solid transparent",
                      transition: "all 0.2s ease-in-out",
                      display: "flex",
                      flexDirection: "column",
                      gap: "2px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          fontWeight: 500,
                          color: isActive ? "#0369a1" : "#374151",
                        }}
                      >
                        {h.name}
                      </span>

                      {showHeadLinks && (
                        <Link
                          to={`/head/${d.id}/${h.id}`}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            fontSize: "0.85rem",
                            color: "#0284c7",
                            textDecoration: "none",
                            fontWeight: 500,
                          }}
                          onMouseOver={(e) => (e.target.style.textDecoration = "underline")}
                          onMouseOut={(e) => (e.target.style.textDecoration = "none")}
                        >
                          open
                        </Link>
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                      }}
                    >
                      {h.title}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}
