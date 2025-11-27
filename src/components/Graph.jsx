import React from "react";
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

export default function Graph() {
  const data = {
    labels: Array.from({ length: 12 }, (_, i) => `M${i + 1}`),
    datasets: [
      {
        label: "Active",
        data: [12, 18, 9, 20, 15, 24, 18, 28, 20, 26, 30, 28],
        borderColor: "rgba(124,58,237,0.9)",
        backgroundColor:
          "linear-gradient(180deg, rgba(124,58,237,0.32), rgba(110,231,183,0.06))",
        tension: 0.35,
        fill: true,
        pointRadius: 3,
      },
    ],
  };

  const options = {
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: "var(--muted)" } },
      y: {
        grid: { color: "rgba(255,255,255,0.03)" },
        ticks: { color: "var(--muted)" },
      },
    },
  };

  return (
    <div className="card graphWrap">
      <Line data={data} options={options} />
    </div>
  );
}
