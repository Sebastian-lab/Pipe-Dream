import {
  Chart,
  registerables,
  ScatterController,
  PointElement,
  LineElement,
  LinearScale,
  TimeScale,
} from "chart.js";
import "chartjs-plugin-annotation";
import { fetchWeatherHistoryGraph, fetchPredictions } from "../api/weather";

Chart.register(...registerables);
Chart.register(
  ScatterController,
  PointElement,
  LineElement,
  LinearScale,
  TimeScale,
);

export interface ChartData {
  city: string;
  historyData: {
    timestamp: string;
    tempC: number | null;
    tempF: number | null;
  }[];
  predictionData: { timestamp: string; value: number }[];
}

interface DataPoint {
  x: number;
  y: number | null;
}

let chartInstance: Chart | null = null;
let allChartData: ChartData[] = [];

export function getGraphContainer(): HTMLElement | null {
  return document.querySelector("#graph-canvas-container");
}

export function getGraphCitySelect(): HTMLSelectElement | null {
  return document.querySelector("#graph-city-select");
}

export async function initGraphComponent(): Promise<void> {
  const container = getGraphContainer();
  const citySelect = getGraphCitySelect();

  if (!container || !citySelect) return;

  try {
    const [history, predictions] = await Promise.all([
      fetchWeatherHistoryGraph(),
      fetchPredictions(),
    ]);

    allChartData = processChartData(history, predictions);
    console.log(`history: ${JSON.stringify(history, null, 2)}`);
    console.log(`predictions: ${JSON.stringify(predictions, null, 2)}`);
    // console.log(`allChartData: ${JSON.stringify(allChartData, null, 2)}`);

    const cities = [...new Set(allChartData.map((d) => d.city))];
    citySelect.innerHTML = cities
      .map((city) => `<option value="${city}">${city}</option>`)
      .join("");

    if (cities.length > 0) {
      renderChart(cities[0]);
    }

    citySelect.addEventListener("change", (e) => {
      const selectedCity = (e.target as HTMLSelectElement).value;
      renderChart(selectedCity);
    });
  } catch (error) {
    console.error("Error loading graph data:", error);
    container.innerHTML =
      '<p class="error-message">Failed to load chart data. Please try again later.</p>';
  }
}

function processChartData(history: any[], predictions: any[]): ChartData[] {
  const cityDataMap = new Map<string, ChartData>();

  history.forEach((reading: any) => {
    const city = reading.city;
    if (!cityDataMap.has(city)) {
      cityDataMap.set(city, {
        city,
        historyData: [],
        predictionData: [],
      });
    }

    const data = cityDataMap.get(city)!;
    if (reading.features && reading.features.length >= 3) {
      data.historyData.push({
        timestamp: reading.features[0] || reading.timestamp || "",
        tempC: reading.features[1],
        tempF: reading.features[2],
      });
    }
  });

  predictions.forEach((pred: any) => {
    const city = pred.city;
    if (!cityDataMap.has(city)) {
      cityDataMap.set(city, {
        city,
        historyData: [],
        predictionData: [],
      });
    }

    const data = cityDataMap.get(city)!;
    pred.timestamps.forEach((ts: string, index: number) => {
      data.predictionData.push({
        timestamp: ts,
        value: pred.predictions[index],
      });
    });
  });

  cityDataMap.forEach((data) => {
    data.historyData.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    data.predictionData.sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
  });

  return Array.from(cityDataMap.values());
}

function renderChart(city: string): void {
  const container = getGraphContainer();
  if (!container) return;

  const cityData = allChartData.find((d) => d.city === city);
  if (!cityData) return;

  if (chartInstance) {
    chartInstance.destroy();
  }

  const canvas = document.createElement("canvas");
  canvas.id = "history-prediction-chart";
  container.innerHTML = "";
  container.appendChild(canvas);

  const historyByTs = new Map(
    cityData.historyData.map((d) => [new Date(d.timestamp).getTime(), d.tempC]),
  );
  const predictionByTs = new Map(
    cityData.predictionData.map((d) => [
      new Date(d.timestamp).getTime(),
      d.value,
    ]),
  );

  const allTimestamps = [...historyByTs.keys(), ...predictionByTs.keys()].sort(
    (a, b) => a - b,
  );

  const historyPoints: DataPoint[] = allTimestamps.map((ts) => ({
    x: ts,
    y: historyByTs.get(ts) ?? null,
  }));

  const predictionPoints: DataPoint[] = allTimestamps.map((ts) => ({
    x: ts,
    y: predictionByTs.get(ts) ?? null,
  }));

  const totalPoints =
    historyPoints.filter((p) => p.y !== null).length +
    predictionPoints.filter((p) => p.y !== null).length;

  const pointRadius = totalPoints > 200 ? 3 : totalPoints > 50 ? 4 : 5;

  const predictionStartTs =
    cityData.predictionData.length > 0
      ? new Date(cityData.predictionData[0].timestamp).getTime()
      : null;

  const labels = allTimestamps.map((ts) =>
    formatTimestamp(new Date(ts).toISOString()),
  );

  chartInstance = new Chart(canvas, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Historical Temperature (°C)",
          data: historyPoints,
          borderColor: "#646cff",
          backgroundColor: "rgba(100, 108, 255, 0.5)",
          borderWidth: 2,
          pointRadius,
          pointHoverRadius: pointRadius + 2,
          pointStyle: "circle",
          tension: 0.3,
          showLine: true,
          spanGaps: false,
        },
        {
          label: "Predicted Values",
          data: predictionPoints,
          borderColor: "#ff9500",
          backgroundColor: "rgba(255, 149, 0, 0.5)",
          borderWidth: 2,
          pointRadius,
          pointHoverRadius: pointRadius + 2,
          pointStyle: "rectRot",
          tension: 0.3,
          showLine: false,
          spanGaps: false,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      parsing: {
        xAxisKey: "x",
        yAxisKey: "y",
      },
      interaction: {
        mode: "nearest",
        intersect: true,
      },
      plugins: {
        legend: {
          position: "top",
          labels: {
            color: "#fff",
            font: {
              family: "RobotoMono-Bold",
            },
          },
        },
        tooltip: {
          backgroundColor: "rgba(26, 26, 26, 0.9)",
          titleColor: "#fff",
          bodyColor: "#aaa",
          borderColor: "#444",
          borderWidth: 1,
          callbacks: {
            title: (items) => {
              if (items.length > 0) {
                const ts = items[0].raw as DataPoint;
                return formatTimestamp(new Date(ts.x).toISOString());
              }
              return "";
            },
            label: (context) => {
              const point = context.raw as DataPoint;
              if (point.y !== null) {
                return `${context.dataset.label}: ${point.y.toFixed(1)}°C`;
              }
              return `${context.dataset.label}: N/A`;
            },
          },
        },
        annotation: {
          annotations: predictionStartTs
            ? {
                predictionStartLine: {
                  type: "line",
                  xMin: predictionStartTs,
                  xMax: predictionStartTs,
                  borderColor: "#00ff88",
                  borderWidth: 2,
                  borderDash: [6, 6],
                  label: {
                    display: true,
                    content: "Prediction Start",
                    position: "start",
                    color: "#00ff88",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    font: {
                      size: 10,
                      family: "RobotoMono-Bold",
                    },
                  },
                },
              }
            : {},
        },
      },
      scales: {
        x: {
          type: "linear",
          position: "bottom",
          title: {
            display: true,
            text: "Time",
            color: "#aaa",
          },
          ticks: {
            color: "#aaa",
            maxRotation: 45,
            minRotation: 45,
            callback: (value) => {
              const ts = allTimestamps[Math.round(value as number)];
              if (ts) {
                return formatTimestamp(new Date(ts).toISOString());
              }
              return "";
            },
          },
          grid: {
            color: "#333",
          },
        },
        y: {
          title: {
            display: true,
            text: "Temperature (°C)",
            color: "#aaa",
          },
          ticks: {
            color: "#aaa",
          },
          grid: {
            color: "#333",
          },
        },
      },
    },
  });
}

function formatTimestamp(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return timestamp;
  }
}
