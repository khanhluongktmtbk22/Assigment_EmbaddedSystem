import { useState } from "react";
import { AiOutlineWifi } from "react-icons/ai";
import { MdTimer } from "react-icons/md";

export default function WifiForm() {
  // WiFi form state
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [isWifiSubmitting, setIsWifiSubmitting] = useState(false);
  const [wifiMessage, setWifiMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Interval form state
  const [interval, setInterval] = useState("");
  const [isIntervalSubmitting, setIsIntervalSubmitting] = useState(false);
  const [intervalMessage, setIntervalMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // WiFi configuration submit handler
  const handleWifiSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setWifiMessage(null);

    // Validation
    if (!ssid.trim()) {
      setWifiMessage({ type: "error", text: "SSID is required" });
      return;
    }
    if (ssid.length > 32) {
      setWifiMessage({ type: "error", text: "SSID must be 32 characters or less" });
      return;
    }
    if (!password) {
      setWifiMessage({ type: "error", text: "Password is required" });
      return;
    }
    if (password.length < 8) {
      setWifiMessage({ type: "error", text: "Password must be at least 8 characters" });
      return;
    }
    if (password.length > 63) {
      setWifiMessage({ type: "error", text: "Password must be 63 characters or less" });
      return;
    }

    setIsWifiSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/wifi/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ ssid, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to configure WiFi");
      }

      setWifiMessage({ type: "success", text: "WiFi configuration sent successfully!" });
      setSsid("");
      setPassword("");
    } catch (error) {
      console.error("WiFi configuration error:", error);
      setWifiMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to configure WiFi. Please try again.",
      });
    } finally {
      setIsWifiSubmitting(false);
    }
  };

  // Interval configuration submit handler
  const handleIntervalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIntervalMessage(null);

    // Validation
    if (!interval.trim()) {
      setIntervalMessage({ type: "error", text: "Data send interval is required" });
      return;
    }
    const intervalNum = parseInt(interval, 10);
    if (isNaN(intervalNum) || intervalNum <= 0) {
      setIntervalMessage({ type: "error", text: "Interval must be a positive number" });
      return;
    }

    setIsIntervalSubmitting(true);

    try {
      const response = await fetch("http://localhost:3000/api/interval/configure", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ interval: intervalNum }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to configure interval");
      }

      setIntervalMessage({ type: "success", text: "Interval configuration sent successfully!" });
      setInterval("");
    } catch (error) {
      console.error("Interval configuration error:", error);
      setIntervalMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to configure interval. Please try again.",
      });
    } finally {
      setIsIntervalSubmitting(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* WiFi Configuration Form */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <AiOutlineWifi className="text-3xl text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-800">WiFi Configuration</h2>
        </div>

        <p className="text-gray-600 mb-8">
          Configure your WiFi network settings. The credentials will be sent to the gateway device.
        </p>

        <form onSubmit={handleWifiSubmit} className="space-y-6">
          <div>
            <label htmlFor="ssid" className="block text-sm font-semibold text-gray-700 mb-2">
              Network Name (SSID)
            </label>
            <input
              type="text"
              id="ssid"
              value={ssid}
              onChange={(e) => setSsid(e.target.value)}
              placeholder="Enter WiFi network name"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              maxLength={32}
              disabled={isWifiSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">{ssid.length}/32 characters</p>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
              WiFi Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter WiFi password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              maxLength={63}
              disabled={isWifiSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              {password.length}/63 characters (min. 8 characters)
            </p>
          </div>

          {wifiMessage && (
            <div
              className={`p-4 rounded-lg ${wifiMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
                }`}
            >
              <p className="font-medium">{wifiMessage.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isWifiSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${isWifiSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 active:scale-[0.98]"
              }`}
          >
            {isWifiSubmitting ? "Sending..." : "Configure WiFi"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Note:</strong> Make sure the gateway device is connected and ready to receive the configuration.
          </p>
        </div>
      </div>

      {/* Data Send Interval Form */}
      <div className="bg-white rounded-2xl p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <MdTimer className="text-3xl text-green-600" />
          <h2 className="text-2xl font-bold text-gray-800">Data Send Interval</h2>
        </div>

        <p className="text-gray-600 mb-8">
          Configure how often sensor data should be sent from the gateway device.
        </p>

        <form onSubmit={handleIntervalSubmit} className="space-y-6">
          <div>
            <label htmlFor="interval" className="block text-sm font-semibold text-gray-700 mb-2">
              Interval (seconds)
            </label>
            <input
              type="number"
              id="interval"
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              placeholder="Enter interval in seconds (e.g., 5)"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              min="1"
              disabled={isIntervalSubmitting}
            />
            <p className="text-sm text-gray-500 mt-1">
              How often sensor data should be sent (in seconds)
            </p>
          </div>

          {intervalMessage && (
            <div
              className={`p-4 rounded-lg ${intervalMessage.type === "success"
                  ? "bg-green-50 border border-green-200 text-green-800"
                  : "bg-red-50 border border-red-200 text-red-800"
                }`}
            >
              <p className="font-medium">{intervalMessage.text}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isIntervalSubmitting}
            className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all ${isIntervalSubmitting
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 active:scale-[0.98]"
              }`}
          >
            {isIntervalSubmitting ? "Sending..." : "Configure Interval"}
          </button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Tip:</strong> Lower intervals send data more frequently but use more bandwidth.
          </p>
        </div>
      </div>
    </div>
  );
}
