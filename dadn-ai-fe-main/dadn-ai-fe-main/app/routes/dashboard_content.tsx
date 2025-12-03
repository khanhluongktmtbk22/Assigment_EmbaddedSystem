import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Content({ className = "" }) {
  const chartContainerStyle =
    "bg-white rounded-2xl shadow p-6 flex flex-col gap-4";

  // === Sample Data ===
  const studyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [
      {
        label: "Study Duration (hours)",
        data: [2, 3, 1, 3, 3, 3, 4],
        backgroundColor: "#007bff",
        borderRadius: 5,
      },
    ],
  };

  const tempData = {
    labels: ["13:00", "13:01", "13:02", "13:03", "13:04", "13:05"],
    datasets: [
      {
        label: "Temperature (°C)",
        data: [40, 35, 30, 35, 40, 33],
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const humidityData = {
    labels: ["00:00", "04:00", "08:00", "12:00", "16:00", "20:00"],
    datasets: [
      {
        label: "Humidity (%)",
        data: [85, 70, 80, 90, 75, 65],
        borderColor: "purple",
        backgroundColor: "rgba(128,0,128,0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const lightData = {
    labels: ["8:00", "8:05", "8:10", "8:15", "8:20", "8:25", "8:30"],
    datasets: [
      {
        label: "Light Level (lux)",
        data: [100, 80, 90, 120, 100, 90, 70],
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false, // Allows charts to shrink more easily
    plugins: {
      legend: { position: "top" as const },
    },
    scales: {
      x: { grid: { display: false } },
      y: { grid: { color: "#eee" } },
    },
  };

  return (
    <div className={`flex flex-col flex-1 p-6 md:p-10 bg-gray-100 gap-8 ${className}`}>
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
        {/* Study Duration */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-blue-900">Study Duration</h2>
            {/* Replaced p tag with a styled select dropdown */}
            <select className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer">
              <option>This Week</option>
              <option>Last Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-48">
            <Bar data={studyData} options={commonOptions} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Study Duration Date: <b>Sunday</b></span>
            <span>Shortest Study Duration Date: <b>Wednesday</b></span>
            <span>Average Study Duration: <b>3 hours</b></span>
          </div>
        </div>

        {/* Temperature */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-green-900">Temperature</h2>
             {/* Replaced p tag with a styled select dropdown */}
            <select className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer">
              <option>5 minutes</option>
              <option>15 minutes</option>
              <option>30 minutes</option>
            </select>
          </div>
           <div className="h-48">
            <Line data={tempData} options={commonOptions} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Temperature: <b>45°C</b></span>
            <span>Average Temperature: <b>35°C</b></span>
            <span>Lowest Temperature: <b>15°C</b></span>
          </div>
        </div>

        {/* Humidity */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-purple-900">Humidity</h2>
             {/* Replaced p tag with a styled select dropdown */}
            <select className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer">
              <option>Today</option>
              <option>Yesterday</option>
              <option>This Week</option>
            </select>
          </div>
           <div className="h-48">
            <Line data={humidityData} options={commonOptions} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Humidity: <b>82%</b></span>
            <span>Lowest Humidity: <b>25%</b></span>
            <span>Average Humidity: <b>63%</b></span>
          </div>
        </div>

        {/* Light Level */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-red-900">Light Level</h2>
            {/* Replaced p tag with a styled select dropdown */}
            <select className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer">
              <option>30 minutes</option>
              <option>1 hour</option>
              <option>Today</option>
            </select>
          </div>
           <div className="h-48">
            <Line data={lightData} options={commonOptions} />
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Light Level: <b>125 lux</b></span>
            <span>Average Light Level: <b>83 lux</b></span>
            <span>Lowest Light Level: <b>50 lux</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}

