"use client"

import { useMemo, useState } from "react"
import DepartmentSidebar from "../../components/DepartmentSidebar.jsx"
import ChatWindow from "../../components/ChatWindow.jsx"
import { departments } from "../../data/departments.js"

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
        gridTemplateColumns: "380px 1fr",
        height: "100vh",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        overflow: "hidden",
      }}
    >
      {/* Sidebar - Modern Glass Morphism */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(20px)",
          borderRight: "1px solid rgba(255, 255, 255, 0.2)",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 20px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
            padding: "24px 20px",
            color: "white",
            fontWeight: "700",
            fontSize: "1.25rem",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div style={{
            width: "40px",
            height: "40px",
            background: "rgba(255, 255, 255, 0.2)",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem",
          }}>
            💼
          </div>
          <div>
            <div style={{ fontSize: "1rem", opacity: 0.9 }}>Admin Control</div>
            <div style={{ fontSize: "0.875rem", opacity: 0.7, fontWeight: "500" }}>Department Communications</div>
          </div>
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
          background: active 
            ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" 
            : "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
          transition: "all 0.3s ease-in-out",
          position: "relative",
        }}
      >
        {active ? (
          <>
            {/* Chat Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
                padding: "20px 24px",
                borderBottom: "1px solid #e2e8f0",
                boxShadow: "0 2px 15px rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2 style={{
                  margin: "0",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "#1e293b",
                  background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}>
                  {headerTitle}
                </h2>
                <p style={{
                  margin: "4px 0 0 0",
                  fontSize: "0.875rem",
                  color: "#64748b",
                  fontWeight: "500",
                }}>
                  Real-time communication channel
                </p>
              </div>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                background: "rgba(255, 255, 255, 0.8)",
                padding: "8px 16px",
                borderRadius: "12px",
                border: "1px solid #e2e8f0",
                fontSize: "0.875rem",
                color: "#475569",
                fontWeight: "500",
              }}>
                <div style={{
                  width: "8px",
                  height: "8px",
                  background: "#10b981",
                  borderRadius: "50%",
                  animation: "pulse 2s infinite",
                }}></div>
                Active Now
              </div>
            </div>

            {/* Chat Body */}
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "24px",
                backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23f1f5f9\" fill-opacity=\"0.4\"%3E%3Ccircle cx=\"30\" cy=\"30\" r=\"2\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')",
                backgroundSize: "30px 30px",
                position: "relative",
              }}
            >
              <div style={{
                position: "absolute",
                top: "0",
                left: "0",
                right: "0",
                bottom: "0",
                background: "linear-gradient(135deg, rgba(248, 250, 252, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%)",
                pointerEvents: "none",
              }}></div>
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
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              color: "#475569",
              padding: "48px 24px",
              background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
            }}
          >
            <div style={{
              width: "120px",
              height: "120px",
              background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "32px",
              boxShadow: "0 10px 30px rgba(79, 70, 229, 0.3)",
            }}>
              <span style={{ fontSize: "3rem", filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.1))" }}>💬</span>
            </div>
            <h2 style={{
              fontSize: "2rem",
              fontWeight: "700",
              margin: "0 0 12px 0",
              background: "linear-gradient(135deg, #1e293b 0%, #475569 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              Welcome to Admin Control
            </h2>
            <p style={{
              fontSize: "1.125rem",
              lineHeight: "1.6",
              margin: "0 0 32px 0",
              maxWidth: "480px",
              color: "#64748b",
              fontWeight: "500",
            }}>
              Choose a department and head from the sidebar to begin secure, real-time communication and coordination.
            </p>
            <div style={{
              display: "flex",
              gap: "12px",
              alignItems: "center",
              background: "rgba(255, 255, 255, 0.8)",
              padding: "16px 24px",
              borderRadius: "16px",
              border: "1px solid #e2e8f0",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.05)",
            }}>
              <div style={{
                width: "12px",
                height: "12px",
                background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                borderRadius: "50%",
              }}></div>
              <span style={{
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#059669",
              }}>
                All communications are encrypted and secure
              </span>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  )
}