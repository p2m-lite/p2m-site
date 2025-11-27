import React from "react";

export default function Header() {
  return (
    <div className="topbar card glow-hover" role="banner">
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div
          style={{
            width: 42,
            height: 42,
            background: "linear-gradient(135deg,var(--accent),var(--accent-2))",
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
          }}
        >
          PD
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>
            <span className="hdr-title-full">
              Pollutant Particulate Monitoring Dashboard
            </span>
            <span className="hdr-title-short">P2M Dashboard</span>
          </div>
          <div className="muted" style={{ fontSize: 12 }}>
            Overview & analytics
          </div>
        </div>
      </div>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <input
          aria-label="search"
          placeholder="Search logs, widgets..."
          className="searchInput"
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.03)",
            padding: "8px 10px",
            borderRadius: 10,
            color: "inherit",
          }}
        />
        {/* Mobile search icon (visible when input hidden) */}
        <button
          className="searchIcon card glow-hover"
          aria-label="Open search"
          title="Search"
          style={{
            display: "none",
            width: 36,
            height: 36,
            borderRadius: 10,
            background: "linear-gradient(90deg,var(--accent),#4fd1c5)",
            color: "#02121b",
            padding: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
              stroke="currentColor"
              strokeWidth="2"
            />
            <line
              x1="16.65"
              y1="16.65"
              x2="22"
              y2="22"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </button>
        <button
          className="card glow-hover"
          style={{
            padding: "8px 10px",
            borderRadius: 10,
            background: "linear-gradient(90deg,var(--accent),#4fd1c5)",
            color: "#02121b",
            fontWeight: 600,
          }}
        >
          Action
        </button>
      </div>
    </div>
  );
}
