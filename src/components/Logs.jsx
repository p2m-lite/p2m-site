import React, { useEffect, useRef, useState } from "react";

const initial = [
  { id: 1, t: "12:01", m: "User login successful" },
  { id: 2, t: "12:10", m: "API: /orders fetched 120 items" },
  { id: 3, t: "12:21", m: "Warning: High memory usage detected" },
  { id: 4, t: "12:30", m: "Background job completed in 2.1s" },
  { id: 5, t: "12:45", m: "New user signup: alice@example.com" },
  { id: 6, t: "12:55", m: "Error: Failed to send email to bob@example.com" },
  { id: 7, t: "13:02", m: "Cache cleared by system" },
  { id: 8, t: "13:18", m: "Report generated: revenue_q4.pdf" },
];

export default function Logs() {
  const [logs, setLogs] = useState(initial);
  const listRef = useRef(null);
  const idRef = useRef(initial.length + 1);

  useEffect(() => {
    const makeTime = () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, "0")}:${String(
        d.getMinutes()
      ).padStart(2, "0")}`;
    };

    const pool = [
      () => ({ t: makeTime(), m: "Heartbeat OK" }),
      () => ({
        t: makeTime(),
        m: "New order received #" + Math.floor(Math.random() * 9999),
      }),
      () => ({ t: makeTime(), m: "Cache warmup completed" }),
      () => ({ t: makeTime(), m: "Warning: CPU spike for 3s" }),
      () => ({ t: makeTime(), m: "Email sent to user" }),
    ];

    const interval = setInterval(() => {
      const next = pool[Math.floor(Math.random() * pool.length)]();
      const nextWithId = { id: idRef.current++, ...next, __enter: true };
      setLogs((prev) => {
        const updated = [nextWithId, ...prev].slice(0, 50).map((item, idx) => ({
          ...item,
          __enter: idx === 0,
        }));
        return updated;
      });

      // Auto-scroll to top smoothly when new item arrives
      if (listRef.current) {
        listRef.current.scrollTo({ top: 0, behavior: "smooth" });
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card logs glow-hover" aria-live="polite" ref={listRef}>
      {logs.map((s) => (
        <div
          key={s.id}
          className={`logItem glow-hover ${s.__enter ? "enter" : ""}`}
        >
          <div className="logTime">{s.t}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{s.m}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              system
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
