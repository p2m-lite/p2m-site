import React from "react";

const NavItem = ({ label }) => (
  <div
    style={{ padding: "10px 8px", borderRadius: 8, marginBottom: 6 }}
    className="muted glow-hover"
  >
    {label}
  </div>
);

export default function Sidebar() {
  return (
    <aside className="sidebar card glow-hover" aria-label="sidebar">
      <nav>
        <NavItem label="Dashboard" />
        <NavItem label="Logs" />
        <NavItem label="Settings" />
      </nav>
      <div style={{ marginTop: 18 }} className="card glow-hover">
        <div style={{ fontSize: 13, color: "var(--muted)" }}>Account</div>
        <div style={{ marginTop: 8, fontWeight: 700 }}>Jane Doe</div>
        <div className="muted" style={{ fontSize: 12 }}>
          Premium
        </div>
      </div>
    </aside>
  );
}
