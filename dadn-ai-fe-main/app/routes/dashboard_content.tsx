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
import { useEffect, useState, useMemo } from "react";

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

// --- 1. Định nghĩa kiểu dữ liệu cho API ---
interface SensorData {
  TEMP?: number;
  HUMI?: number;
  LIGHT?: number;
  time: string;
}

export default function Content({ className = "" }) {
  const chartContainerStyle =
    "bg-white rounded-2xl shadow p-6 flex flex-col gap-4";

  // --- 2. State quản lý dữ liệu và tùy chọn ---
  
  // Temperature
  const [rawTemps, setRawTemps] = useState<SensorData[]>([]);
  const [tempTimeRange, setTempTimeRange] = useState("5");
  const [tempStats, setTempStats] = useState({ max: 0, min: 0, avg: 0 });

  // Humidity
  const [rawHumis, setRawHumis] = useState<SensorData[]>([]);
  const [humiTimeRange, setHumiTimeRange] = useState("5");
  const [humiStats, setHumiStats] = useState({ max: 0, min: 0, avg: 0 });

  // Light Level
  const [rawLights, setRawLights] = useState<SensorData[]>([]);
  const [lightTimeRange, setLightTimeRange] = useState("5");
  const [lightStats, setLightStats] = useState({ max: 0, min: 0, avg: 0 });

  // --- 3. Cấu hình Chart chung (Xử lý trục X dynamic) ---
  const dynamicChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const } },
    scales: {
      y: { grid: { color: "#eee" } },
      x: {
        grid: { display: false },
        ticks: {
          // Logic: Ẩn bớt nhãn nếu quá dày
          callback: function (this: any, val: any, index: number, values: any[]) {
            const totalLabels = values.length;
            if (totalLabels <= 6) {
                return this.getLabelForValue(val);
            }
            // Tính bước nhảy để chỉ hiện khoảng 6-7 nhãn
            const step = Math.ceil(totalLabels / 6); 
            if (index % step === 0) {
              return this.getLabelForValue(val);
            }
            return null;
          },
        },
      },
    },
  };

  // --- 4. Fetch Data Functions ---
  
  // Fetch Temperature
  useEffect(() => {
    const fetchTemp = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/temperature?duration=${tempTimeRange}`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.temperatures) setRawTemps(data.temperatures);
        }
      } catch (error) {
        console.error("Error fetching temperature:", error);
      }
    };
    fetchTemp();
  }, [tempTimeRange]);

  // Fetch Humidity
  useEffect(() => {
    const fetchHumi = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/humidity?duration=${humiTimeRange}`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          // Lưu ý: Key trả về từ backend có thể là "humidities" hoặc "temperatures" tùy code BE.
          // Dựa trên pattern của bạn, tôi đoán là "humidities". Nếu BE trả về key khác thì sửa ở đây.
          // Nếu BE lười dùng chung key "result" thì log ra xem nhé.
          // Giả định backend trả về { humidities: [...] } hoặc { data: [...] }
          // Tạm thời để an toàn check log hoặc sửa theo thực tế. 
          // Ở đây tôi giả định BE trả về object có key chứa mảng data
          if (data.humidities) setRawHumis(data.humidities);
          else if (data.data) setRawHumis(data.data); // Fallback
          else if (data.temperatures) setRawHumis(data.temperatures); // Trường hợp copy paste quên đổi tên key
        }
      } catch (error) {
        console.error("Error fetching humidity:", error);
      }
    };
    fetchHumi();
  }, [humiTimeRange]);

  // Fetch Light
  useEffect(() => {
    const fetchLight = async () => {
      try {
        const response = await fetch(`http://localhost:3000/api/lightLevel?duration=${lightTimeRange}`, {
          method: "GET",
          credentials: "include",
        });
        if (response.ok) {
          const data = await response.json();
          if (data.lightLevels) setRawLights(data.lightLevels);
          else if (data.data) setRawLights(data.data);
          else if (data.temperatures) setRawLights(data.temperatures);
        }
      } catch (error) {
        console.error("Error fetching light:", error);
      }
    };
    fetchLight();
  }, [lightTimeRange]);

  // --- 5. Data Processing & Memoization ---

  // Helper để xử lý data chung
  const processData = (data: SensorData[], valueKey: "TEMP" | "HUMI" | "LIGHT", rangeStr: string) => {
    if (!data.length) return { chartData: [], stats: { max: 0, min: 0, avg: 0 } };

    // Lọc data theo thời gian (Frontend Filter - Backup cho backend)
    const now = new Date().getTime(); // UTC timestamp (máy tính tự hiểu)
    // Backend bạn trả về time dạng string ISO nhưng giá trị là giờ VN.
    // Frontend convert string đó sang timestamp sẽ ra giờ tương lai (+7h).
    // Tuy nhiên, nếu so sánh tương đối (future - duration) thì vẫn lọc được nếu backend trả về đúng dải.
    // Vì backend đã filter rồi nên bước filter này ở frontend chỉ là "phòng hờ".
    
    // Sắp xếp
    const sortedData = [...data].sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());

    // Tính Stats
    const values = sortedData.map(d => d[valueKey] || 0);
    const max = values.length ? Math.max(...values) : 0;
    const min = values.length ? Math.min(...values) : 0;
    const avg = values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

    return {
      chartData: sortedData,
      stats: { max, min, avg: parseFloat(avg.toFixed(1)) }
    };
  };

  // -- Temp Data --
  const tempChartInfo = useMemo(() => {
    const { chartData, stats } = processData(rawTemps, "TEMP", tempTimeRange);
    setTempStats(stats);
    return {
      labels: chartData.map(t => new Date(t.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })),
      datasets: [{
        label: "Temperature (°C)",
        data: chartData.map(t => t.TEMP),
        borderColor: "green",
        backgroundColor: "rgba(0,255,0,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      }],
    };
  }, [rawTemps, tempTimeRange]);

  // -- Humidity Data --
  const humiChartInfo = useMemo(() => {
    const { chartData, stats } = processData(rawHumis, "HUMI", humiTimeRange);
    setHumiStats(stats);
    return {
      labels: chartData.map(t => new Date(t.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })),
      datasets: [{
        label: "Humidity (%)",
        data: chartData.map(t => t.HUMI),
        borderColor: "purple",
        backgroundColor: "rgba(128,0,128,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      }],
    };
  }, [rawHumis, humiTimeRange]);

  // -- Light Data --
  const lightChartInfo = useMemo(() => {
    const { chartData, stats } = processData(rawLights, "LIGHT", lightTimeRange);
    setLightStats(stats);
    return {
      labels: chartData.map(t => new Date(t.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'UTC' })),
      datasets: [{
        label: "Light Level (lux)",
        data: chartData.map(t => t.LIGHT),
        borderColor: "red",
        backgroundColor: "rgba(255,0,0,0.1)",
        fill: true,
        tension: 0.4,
        pointRadius: 4,
      }],
    };
  }, [rawLights, lightTimeRange]);


  // Giữ nguyên Study Data (Hardcode)
  const studyData = {
    labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    datasets: [{ label: "Study Duration (hours)", data: [2, 3, 1, 3, 3, 3, 4], backgroundColor: "#007bff", borderRadius: 5 }],
  };
  const commonBarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: "top" as const } },
    scales: { x: { grid: { display: false } }, y: { grid: { color: "#eee" } } },
  };

  return (
    <div className={`flex flex-col flex-1 p-6 md:p-10 bg-gray-100 gap-8 ${className}`}>
      <h1 className="text-3xl font-bold">Dashboard</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
        
        {/* 1. Study Duration (Static) */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-blue-900">Study Duration</h2>
            <select className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer">
              <option>This Week</option> <option>Last Week</option> <option>This Month</option>
            </select>
          </div>
          <div className="h-48"><Bar data={studyData} options={commonBarOptions} /></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Study Duration: <b>Sunday</b></span> 
            <span>Average Study Duration: <b>3h</b></span>
            <span>Shortest Study Duration: <b>Wednesday</b></span> 
          </div>
        </div>

        {/* 2. Temperature (Dynamic) */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-green-900">Temperature</h2>
            <select 
                className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer"
                value={tempTimeRange} onChange={(e) => setTempTimeRange(e.target.value)}
            >
              <option value="5">5 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
           <div className="h-48"><Line data={tempChartInfo} options={dynamicChartOptions} /></div>
          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Temperature: <b>{tempStats.max}°C</b></span> 
            <span>Average Temperature: <b>{tempStats.avg}°C</b></span> 
            <span>Lowest Temperature: <b>{tempStats.min}°C</b></span>
          </div>
        </div>

        {/* 3. Humidity (Dynamic) */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-purple-900">Humidity</h2>
            <select 
                className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer"
                value={humiTimeRange} onChange={(e) => setHumiTimeRange(e.target.value)}
            >
              <option value="5">5 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
            </select>
          </div>
           <div className="h-48"><Line data={humiChartInfo} options={dynamicChartOptions} /></div>
           <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Humidity: <b>{humiStats.max}%</b></span> 
            <span>Average Humidity: <b>{humiStats.avg}%</b></span>
            <span>Lowest Humidity: <b>{humiStats.min}%</b></span> 
          </div>
        </div>

        {/* 4. Light Level (Dynamic) */}
        <div className={chartContainerStyle}>
          <div className="flex justify-between items-center">
            <h2 className="font-bold text-lg text-red-900">Light Level</h2>
            <select 
                className="text-sm text-gray-500 bg-transparent border-0 focus:ring-0 focus:outline-none cursor-pointer"
                value={lightTimeRange} onChange={(e) => setLightTimeRange(e.target.value)}
            >
               <option value="5">5 minutes</option>
               <option value="30">30 minutes</option>
               <option value="60">1 hour</option>
            </select>
          </div>
           <div className="h-48"><Line data={lightChartInfo} options={dynamicChartOptions} /></div>
           <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600 mt-2">
            <span>Highest Light Level: <b>{lightStats.max} lux</b></span> 
            <span>Average Light Level: <b>{lightStats.avg} lux</b></span> 
            <span>Lowest Light Level: <b>{lightStats.min} lux</b></span>
          </div>
        </div>
      </div>
    </div>
  );
}