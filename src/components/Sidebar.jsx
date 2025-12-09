import React from "react";

const NavItem = ({ label, onClick, active }) => (
  <button
    type="button"
    onClick={onClick}
    className={`muted nav-item ${active ? "active" : ""}`}
    style={{
      padding: "10px 8px",
      borderRadius: 8,
      marginBottom: 6,
      width: "100%",
      textAlign: "left",
      background: "transparent",
    }}
    aria-pressed={active}
  >
    {label}
  </button>
);

export default function Sidebar({ activeView = "dashboard", onNavigate }) {
  return (
    <aside className="sidebar card glow-hover" aria-label="sidebar">
      <nav>
        <NavItem
          label="Dashboard"
          active={activeView === "dashboard"}
          onClick={() => onNavigate && onNavigate("dashboard")}
        />
        <NavItem
          label="Logs"
          active={activeView === "logs"}
          onClick={() => onNavigate && onNavigate("logs")}
        />
        <NavItem
          label="Settings"
          active={activeView === "settings"}
          onClick={() => onNavigate && onNavigate("settings")}
        />
      </nav>
      <div style={{ marginTop: 18 }} className="card glow-hover">
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Account</div>
        <div style={{ marginTop: 8, fontWeight: 700 }}>Dev User</div>
        <div className="muted" style={{ fontSize: 12 }}>
          Basic
        </div>
      </div>
    </aside>
  );
}
