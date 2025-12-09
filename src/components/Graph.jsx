import React, { useEffect, useState, useRef } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function Graph({ recorder }) {
  const [chartData, setChartData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const chartRef = useRef(null);

  const formatTime = (unixSeconds) => {
    if (!unixSeconds) return "";
    const date = new Date(unixSeconds * 1000);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchData = async () => {
      try {
        const response = await fetch(
          `https://p2m.040203.xyz/api/logs/history?recorder=0x0D2bD687Ee43d92C6aEC83e5fFA81ec5a2A07558&days=2`,
          { signal }
        );

        if (!response.ok) throw new Error("Network response was not ok");

        const json = await response.json();

        if (json && Array.isArray(json.history)) {
          const sortedHistory = [...json.history].sort(
            (a, b) => a.timestamp - b.timestamp
          );

          const labels = sortedHistory.map((item) =>
            formatTime(item.timestamp)
          );
          const dataPoints = sortedHistory.map((item) => item.turbidity);

          setChartData({
            labels,
            datasets: [
              {
                label: "Turbidity (NTU)",
                data: dataPoints,
                borderColor: "rgba(124,58,237,0.9)",
                tension: 0.35,
                fill: true,
                pointRadius: 3,
                backgroundColor: (context) => {
                  const ctx = context.chart.ctx;
                  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                  gradient.addColorStop(0, "rgba(124,58,237,0.32)");
                  gradient.addColorStop(1, "rgba(110,231,183,0.06)");
                  return gradient;
                },
              },
            ],
          });
        }
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Failed to fetch graph data:", error);
        }
      } finally {
        if (!signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      controller.abort();
    };
  }, []);

  // --- SETTINGS FOR COLORS ARE HERE ---
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        mode: "index",
        intersect: false,
        backgroundColor: "rgba(0,0,0,0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
      },
    },
    scales: {
      x: {
        border: {
          display: true,
          color: "#ffffff", // <--- Color of the X-axis bottom line
        },
        grid: {
          display: false,
          drawTicks: true,
          tickColor: "#ffffff", // <--- Color of the little X-axis tick marks
        },
        ticks: {
          color: "#ffffff", // <--- Color of the X-axis time labels (Text)
          maxTicksLimit: 6,
          maxRotation: 0,
        },
      },
      y: {
        border: {
          display: true,
          color: "#ffffff", // <--- Color of the Y-axis left line
        },
        grid: {
          color: "rgba(255, 255, 255, 0.1)", // <--- Color of horizontal grid lines
          drawTicks: true,
          tickColor: "#ffffff", // <--- Color of the little Y-axis tick marks
        },
        ticks: {
          color: "#ffffff", // <--- Color of the Y-axis value labels (Text)
        },
      },
    },
  };

  return (
    <div
      className="card graphWrap"
      style={{
        minHeight: "300px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {isLoading ? (
        <div
          style={{
            color: "var(--muted, #94a3b8)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <div
            style={{
              width: "20px",
              height: "20px",
              border: "2px solid rgba(124,58,237,0.3)",
              borderTop: "2px solid rgba(124,58,237,0.9)",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <span>Fetching historical data...</span>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      ) : chartData ? (
        <div style={{ width: "100%", height: "100%" }}>
          <Line ref={chartRef} data={chartData} options={options} />
        </div>
      ) : (
        <div className="muted">No data available</div>
      )}
    </div>
  );
}
