import React from "react";

export default function Widget({
  title,
  value,
  muted,
  hideOnSmall,
  className = "",
}) {
  return (
    <div
      className={`widget ${
        hideOnSmall ? "hide-on-small" : ""
      } card glow-hover ${className}`}
    >
      <div className="title">{title}</div>
      <div className="value">{value}</div>
      {muted && (
        <div className="muted" style={{ marginTop: 8, fontSize: 13 }}>
          {muted}
        </div>
      )}
    </div>
  );
}
