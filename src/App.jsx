import React, { useEffect, useState } from "react";
import { THRESHOLDS } from "./config/thresholds";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Widget from "./components/Widget";
import Graph from "./components/Graph";
import Logs from "./components/Logs";

export default function App() {
  const [deviceCount, setDeviceCount] = useState("-");
  const [latencyMs, setLatencyMs] = useState("-");
  const [activeView, setActiveView] = useState("dashboard"); // 'dashboard' | 'logs'
  const [surgeCount, setSurgeCount] = useState(0);
  const [criticalSurgeCount, setCriticalSurgeCount] = useState(0);
  const lastProcessedTsRef = React.useRef(null);
  const [serverStatus, setServerStatus] = useState("-");
  const [selectedRecorder, setSelectedRecorder] = useState(
    "0x0D2bD687Ee43d92C6aEC83e5fFA81ec5a2A07558"
  );

  useEffect(() => {
    const controller = new AbortController();
    const load = async () => {
      try {
        const res = await fetch("https://p2m.040203.xyz/api/recorders", {
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const recorders = Array.isArray(data?.recorders) ? data.recorders : [];
        console.log("Recorders fetched:", recorders);
        setDeviceCount(String(recorders.length));
      } catch (err) {
        console.error("Failed to fetch recorders", err);
      }
    };
    load();
    return () => controller.abort();
  }, []);

  // Derive availability from Avg. Response latency using P95 512ms reference
  const availabilityCalc = (() => {
    const n = Number(latencyMs);
    if (!Number.isFinite(n) || n <= 0) return null;
    const ratio = Math.min(1, 512 / n); // 100% at or below 512ms, lower above it
    const pct = ratio * 100;
    return pct;
  })();
  const availabilityText =
    availabilityCalc === null ? "-" : `${availabilityCalc.toFixed(1)}%`;
  const availabilityClass =
    availabilityCalc === null
      ? ""
      : availabilityCalc >= 99
      ? "text-neon-green"
      : availabilityCalc >= 95
      ? "text-neon-yellow"
      : "text-neon-red";

  // Server ping check for Summary -> Server status
  useEffect(() => {
    let cancelled = false;
    const checkPing = async () => {
      try {
        const res = await fetch("https://p2m.040203.xyz/ping");
        let active = false;
        if (res.ok) {
          const ct = res.headers.get("content-type") || "";
          if (ct.includes("application/json")) {
            const json = await res.json();
            active = json?.pong === true || /pong/i.test(JSON.stringify(json));
          } else {
            const text = await res.text();
            active = /pong/i.test(text);
          }
        }
        if (!cancelled) setServerStatus(active ? "Active" : "Inactive");
      } catch (e) {
        if (!cancelled) setServerStatus("Inactive");
      }
    };
    checkPing();
    return () => {
      cancelled = true;
    };
  }, []);

  // Latency checker inspired by provided example
  useEffect(() => {
    let cancelled = false;
    const checkLatency = async () => {
      const start = Date.now();
      try {
        const response = await fetch("https://p2m.040203.xyz/api/recorders");
        await response.json();
        const end = Date.now();
        if (!cancelled) setLatencyMs(String(end - start));
      } catch (error) {
        console.error("Latency check failed:", error);
      }
    };
    checkLatency();
    return () => {
      cancelled = true;
    };
  }, []);

  // Pollutant surge: check pH and turbidity every 3 seconds
  useEffect(() => {
    let timer;
    let aborted = false;
    // Thresholds imported from centralized config

    const checkLatest = async () => {
      try {
        const res = await fetch(
          `https://p2m.040203.xyz/api/logs/history?recorder=${encodeURIComponent(
            selectedRecorder
          )}&days=1`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const history = Array.isArray(json?.history) ? json.history : [];
        if (history.length === 0) return;
        const latest = history.reduce((a, b) =>
          a.timestamp > b.timestamp ? a : b
        );
        const turbidity = Number(latest?.turbidity);
        const phValue =
          latest?.phValue !== undefined ? Number(latest.phValue) : null;
        const ts = Number(latest?.timestamp);

        const turbidityMinor =
          Number.isFinite(turbidity) &&
          turbidity > THRESHOLDS.turbidityMinorNtu;
        const phMinorOutOfRange =
          phValue !== null &&
          Number.isFinite(phValue) &&
          (phValue < THRESHOLDS.phMinorMin || phValue > THRESHOLDS.phMinorMax);

        const turbidityCritical =
          Number.isFinite(turbidity) &&
          turbidity > THRESHOLDS.turbidityCriticalNtu;
        const phCriticalOutOfRange =
          phValue !== null &&
          Number.isFinite(phValue) &&
          (phValue < THRESHOLDS.phCriticalMin ||
            phValue > THRESHOLDS.phCriticalMax);

        // Deduplicate by timestamp: only count if timestamp is newer
        if (
          (turbidityMinor ||
            phMinorOutOfRange ||
            turbidityCritical ||
            phCriticalOutOfRange) &&
          !aborted &&
          Number.isFinite(ts) &&
          (lastProcessedTsRef.current === null ||
            ts > lastProcessedTsRef.current)
        ) {
          lastProcessedTsRef.current = ts;
          setSurgeCount((c) => c + 1);
          if (turbidityCritical || phCriticalOutOfRange) {
            setCriticalSurgeCount((c) => c + 1);
          }
        }
      } catch (err) {
        // Silent failure; do not increment on errors
        // console.error("Surge check failed", err);
      }
    };

    // initial check and then every 3s
    checkLatest();
    timer = setInterval(checkLatest, 3000);

    return () => {
      aborted = true;
      if (timer) clearInterval(timer);
    };
  }, [selectedRecorder]);

  // Recompute surge counts when recorder changes using 2-day history
  useEffect(() => {
    let cancelled = false;
    const computeFromHistory = async () => {
      try {
        const url = `https://p2m.040203.xyz/api/logs/history?recorder=${encodeURIComponent(
          selectedRecorder
        )}&days=2`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const history = Array.isArray(json?.history) ? json.history : [];
        const seenTs = new Set();
        let minor = 0;
        let critical = 0;
        for (const item of history) {
          const ts = Number(item?.timestamp);
          if (!Number.isFinite(ts) || seenTs.has(ts)) continue;
          seenTs.add(ts);
          const turbidity = Number(item?.turbidity);
          const phValue =
            item?.ph !== undefined
              ? Number(item.ph)
              : item?.phValue !== undefined
              ? Number(item.phValue)
              : NaN;

          const turbidityMinor =
            Number.isFinite(turbidity) &&
            turbidity > THRESHOLDS.turbidityMinorNtu;
          const phMinorOut =
            Number.isFinite(phValue) &&
            (phValue < THRESHOLDS.phMinorMin ||
              phValue > THRESHOLDS.phMinorMax);
          const turbidityCrit =
            Number.isFinite(turbidity) &&
            turbidity > THRESHOLDS.turbidityCriticalNtu;
          const phCritOut =
            Number.isFinite(phValue) &&
            (phValue < THRESHOLDS.phCriticalMin ||
              phValue > THRESHOLDS.phCriticalMax);

          if (turbidityMinor || phMinorOut || turbidityCrit || phCritOut)
            minor++;
          if (turbidityCrit || phCritOut) critical++;
        }
        if (!cancelled) {
          setSurgeCount(minor);
          setCriticalSurgeCount(critical);
        }
      } catch (e) {
        console.error("Surge compute error:", e);
      }
    };
    computeFromHistory();
    return () => {
      cancelled = true;
    };
  }, [selectedRecorder]);
  return (
    <div style={{ paddingBottom: 24 }}>
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "16px auto",
          padding: "0 18px",
        }}
      >
        <Header />
      </div>

      <div className="app">
        <Sidebar
          activeView={activeView}
          onNavigate={(view) => setActiveView(view)}
        />

        <main>
          <section className="widgets" style={{ marginBottom: 12 }}>
            <Widget
              title="Active Devices"
              value={deviceCount}
              muted="0%+ since last week"
              className="hover-neon-green"
              valueClassName="text-neon-green"
            />
            <Widget
              title="Pollutant surge"
              value={String(surgeCount)}
              muted={`${criticalSurgeCount} critical`}
              hideOnSmall
              className="hover-cyber-red"
              valueClassName="text-neon-red"
            />
            <Widget
              title="Avg. Response"
              value={latencyMs === "-" ? "-" : `${latencyMs} ms`}
              muted="P95: 512ms"
              hideOnSmall
              className="hover-yellow"
              valueClassName="text-neon-yellow"
            />
          </section>

          {activeView === "dashboard" && (
            <section className="grid" style={{ marginBottom: 12 }}>
              <div style={{ gridColumn: "1 / span 2" }}>
                <Graph recorder={selectedRecorder} />
              </div>
              <div>
                <div className="card neon-anim" style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>Summary</div>
                  <div className="muted" style={{ marginTop: 8 }}>
                    System metrics and alerts
                  </div>
                  <div style={{ marginTop: 12 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <div className="muted">Server</div>
                      <div
                        style={{ fontWeight: 700 }}
                        className={
                          serverStatus === "-"
                            ? ""
                            : serverStatus === "Active"
                            ? "text-neon-green"
                            : "text-neon-red"
                        }
                      >
                        {serverStatus}
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: 8,
                      }}
                    >
                      <div className="muted">Availability</div>
                      <div
                        style={{ fontWeight: 700 }}
                        className={availabilityClass}
                      >
                        {availabilityText}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          )}

          <section
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}
          >
            <div className="card">
              <div style={{ fontWeight: 700 }}>Activity Logs</div>
            </div>
            <Logs
              onSelectRecorder={(addr) => addr && setSelectedRecorder(addr)}
            />
          </section>
        </main>
      </div>
    </div>
  );
}
