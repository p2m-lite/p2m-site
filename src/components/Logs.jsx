import React, { useEffect, useRef, useState } from "react";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const listRef = useRef(null);
  const idRef = useRef(1);
  const [selected, setSelected] = useState(null);
  const [connStatus, setConnStatus] = useState("idle"); // idle | connecting | connected | failed
  const [toast, setToast] = useState(null); // { message, type }

  const formatUnixToAMPM = (unixSeconds) => {
    if (!unixSeconds) return null;
    const ms = Number(unixSeconds) * 1000;
    if (!Number.isFinite(ms)) return null;
    const d = new Date(ms);
    const h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, "0");
    const ampm = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(d.getDate()).padStart(2, "0")}`;
    return `${dateStr} ${hour12}:${m} ${ampm}`;
  };

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connect = () => {
      setConnStatus("connecting");
      try {
        ws = new WebSocket("wss://p2m.040203.xyz/logs");
      } catch (e) {
        setConnStatus("failed");
        setToast({ message: "Logs connection failed", type: "error" });
        setTimeout(() => setToast(null), 3000);
        scheduleReconnect();
        return;
      }

      ws.onopen = () => {
        setConnStatus("connected");
        setToast({ message: "Connected to live logs", type: "success" });
        setTimeout(() => setToast(null), 3000);
      };

      ws.onmessage = (evt) => {
        const now = new Date();
        const t = `${String(now.getHours()).padStart(2, "0")}:${String(
          now.getMinutes()
        ).padStart(2, "0")}`;
        let payload;
        try {
          payload = JSON.parse(evt.data);
        } catch {
          payload = { m: String(evt.data) };
        }

        const entry = {
          id: idRef.current++,
          t,
          m: payload?.message || payload?.m || "Log event",
          recorder: payload?.recorder || payload?.address,
          timestamp: payload?.timestamp,
          turbidity: payload?.turbidity,
          phValue: payload?.phValue,
          __enter: true,
        };

        setLogs((prev) => {
          // Keep only the last 200 logs
          const updated = [entry, ...prev].slice(0, 200).map((it, idx) => ({
            ...it,
            __enter: idx === 0,
          }));
          return updated;
        });

        if (listRef.current) {
          listRef.current.scrollTo({ top: 0, behavior: "smooth" });
        }
      };

      ws.onerror = () => {
        setConnStatus("failed");
        setToast({ message: "Logs connection failed", type: "error" });
        setTimeout(() => setToast(null), 3000);
      };

      ws.onclose = () => {
        setConnStatus("failed");
        setToast({ message: "Logs connection closed", type: "error" });
        setTimeout(() => setToast(null), 3000);
        scheduleReconnect();
      };
    };

    const scheduleReconnect = () => {
      if (reconnectTimer) return;
      reconnectTimer = setTimeout(() => {
        reconnectTimer = null;
        connect();
      }, 3000); // retry after 3s
    };

    connect();

    return () => {
      try {
        if (ws && ws.readyState === WebSocket.OPEN) ws.close();
      } catch (e) {
        // ignore close errors
      }
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  return (
    <>
      <div className="card logs glow-hover" aria-live="polite" ref={listRef}>
        {connStatus === "connecting" && (
          <div
            className="logItem"
            style={{
              width: "100%",
              color: "#e6eef8",
              background: "rgba(255,255,255,0.03)",
              border: "1px dashed rgba(148,163,184,0.25)",
              textAlign: "left",
            }}
          >
            <div className="logTime">--:--</div>
            <div>
              <div style={{ fontWeight: 600, color: "inherit" }}>
                Pending connection to live logs…
              </div>
              <div className="muted" style={{ fontSize: 12 }}>
                wss://p2m.040203.xyz/logs
              </div>
            </div>
          </div>
        )}

        {logs.map((s) => (
          <button
            type="button"
            key={s.id}
            onClick={() => setSelected(s)}
            className={`logItem glow-hover ${s.__enter ? "enter" : ""}`}
            style={{
              width: "100%",
              color: "#e6eef8",
              background: "rgba(255,255,255,0.03)",
              border: "none",
              textAlign: "left",
            }}
            aria-haspopup="dialog"
            aria-label={`View details for log at ${s.t}`}
          >
            <div className="logTime">{s.t}</div>
            <div>
              <div style={{ fontWeight: 600, color: "inherit" }}>{s.m}</div>
              <div className="muted" style={{ fontSize: 12 }}>
                system
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div
          className="modalOverlay"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setSelected(null);
          }}
        >
          <div className="modalCard card" style={{ color: "#e6eef8" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ fontWeight: 700 }}>Log Details</div>
              <button
                className="closeBtn"
                onClick={() => setSelected(null)}
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
              Click outside or use × to close
            </div>

            <div style={{ marginTop: 12, display: "grid", gap: 10 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div className="muted">Time</div>
                <div style={{ fontWeight: 600 }}>{selected.t}</div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <div className="muted">Message</div>
                <div style={{ fontWeight: 600, maxWidth: "70%" }}>
                  {selected.m}
                </div>
              </div>

              {selected.recorder && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div className="muted">Recorder</div>
                  <div
                    style={{
                      fontWeight: 600,
                      wordBreak: "break-all",
                      maxWidth: "70%",
                    }}
                  >
                    {selected.recorder}
                  </div>
                </div>
              )}

              {selected.timestamp && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div className="muted">Timestamp</div>
                  <div style={{ fontWeight: 600 }}>
                    {formatUnixToAMPM(selected.timestamp) || selected.timestamp}
                  </div>
                </div>
              )}

              {selected.turbidity && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div className="muted">Turbidity</div>
                  <div style={{ fontWeight: 600 }}>{selected.turbidity}</div>
                </div>
              )}

              {selected.phValue && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div className="muted">pH Value</div>
                  <div style={{ fontWeight: 600 }}>{selected.phValue}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`toast ${toast.type}`}
          role="status"
          aria-live="polite"
          style={{ position: "fixed", right: 24, bottom: 24 }}
        >
          <div className="card" style={{ padding: 10 }}>
            {toast.message}
          </div>
        </div>
      )}
    </>
  );
}
