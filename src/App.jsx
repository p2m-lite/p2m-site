import React from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Widget from "./components/Widget";
import Graph from "./components/Graph";
import Logs from "./components/Logs";

export default function App() {
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
        <Sidebar />

        <main>
          <section className="widgets" style={{ marginBottom: 12 }}>
            <Widget
              title="Active Devices"
              value="2,418"
              muted="+12% since last week"
              className="hover-neon-green"
            />
            <Widget
              title="Pollutant surge"
              value="34"
              muted="1 critical"
              hideOnSmall
              className="hover-cyber-red"
            />
            <Widget
              title="Avg. Response"
              value="232 ms"
              muted="P95: 512ms"
              hideOnSmall
              className="hover-yellow"
            />
          </section>

          <section className="grid" style={{ marginBottom: 12 }}>
            <div style={{ gridColumn: "1 / span 2" }}>
              <Graph />
            </div>
            <div>
              <div className="card neon-anim" style={{ padding: 12 }}>
                <div style={{ fontWeight: 700 }}>Summary</div>
                <div className="muted" style={{ marginTop: 8 }}>
                  Key metrics and recent alerts
                </div>
                <div style={{ marginTop: 12 }}>
                  <div
                    style={{ display: "flex", justifyContent: "space-between" }}
                  >
                    <div className="muted">Uptime</div>
                    <div style={{ fontWeight: 700 }}>99.98%</div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 8,
                    }}
                  >
                    <div className="muted">Throughput</div>
                    <div style={{ fontWeight: 700 }}>4,120 req/min</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}
          >
            <div className="card">
              <div style={{ fontWeight: 700 }}>Activity Logs</div>
            </div>
            <Logs />
          </section>
        </main>
      </div>
    </div>
  );
}
