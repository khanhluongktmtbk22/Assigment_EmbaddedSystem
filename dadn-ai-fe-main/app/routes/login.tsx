import type { Route } from "./+types/login";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router"; // thêm useNavigate
import { Eye, EyeOff } from "lucide-react";
import Illustration from "../assets/illustration.png";
import Logo from "../assets/logo.png"; // logo SmartClassroom

export function meta({}: Route.MetaArgs) {
  return [
    { title: "SmartClassroom - Login" },
    { name: "description", content: "Login to SmartClassroom" },
  ];
}
const EXPIRATION_TIME_MS = 4 * 60 * 60 * 1000;
export default function Login() {
  
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true); 
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ username?: string; password?: string }>({});

  useEffect(() => {
    // Đổi thành hàm async để có thể gọi API
    const checkAuthAndExpiry = async () => {
        const userId = localStorage.getItem("user_id");
        const loginTime = localStorage.getItem("loginTimestamp");

        if (!userId || !loginTime) {
            // 1. Nếu chưa từng login -> cho phép render form
            setIsChecking(false);
            return;
        }

        // 2. Đã login, kiểm tra thời gian
        const now = new Date().getTime();
        const sessionAge = now - parseInt(loginTime, 10);

        if (sessionAge > EXPIRATION_TIME_MS) {
            // 3. Đã hết hạn -> Xóa session cũ và cho phép render form
            
            // --- GỌI LOGOUT ĐỂ XÓA COOKIE ---
            try {
                // Gọi API logout để dọn dẹp cookie (fire and forget)
                fetch("http://localhost:3000/api/logout", {
                    method: "GET",
                    credentials: "include",
                });
            } catch (err) {
                console.warn("Cleanup logout call failed.");
            }
            // -----------------------------

            localStorage.clear(); // Xóa localStorage
            setIsChecking(false);  // Cho phép render form
        } else {
            // 4. Vẫn còn hạn -> Chuyển thẳng vào /home
            alert("You've already logged in!")
            navigate("/home", { replace: true });
        }
    };

    checkAuthAndExpiry(); // Gọi hàm async
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: typeof errors = {};

    if (!username.trim()) newErrors.username = "Username is required";
    if (!password.trim()) newErrors.password = "Password is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        const res = await fetch("http://localhost:3000/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
          credentials: 'include',
        });

        const data = await res.json();
        console.log(data)
        if (!res.ok) {
          // Handle backend error messages
          if (data.error || data.message) {
            const msg = data.error || data.message;

            // Handle common login errors
            if (msg.toLowerCase().includes("password")) {
              setErrors((prev) => ({ ...prev, password: msg }));
            } else if (msg.toLowerCase().includes("username")) {
              setErrors((prev) => ({ ...prev, username: msg }));
            } else {
              alert(msg);
            }
          } else {
            alert("Login failed. Please try again.");
          }
          return;
        }
        // ✅ Successful login
        alert("Login successful!");
        localStorage.clear();
        localStorage.setItem("user_id", data._id);
        localStorage.setItem("loginTimestamp", new Date().getTime().toString());
        navigate("/home", { replace: true });

      } catch (err) {
        console.error(err);
        alert("Cannot connect to server. Please try again later.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white relative overflow-hidden">
      {/* Góc trái trên logo */}
      <div className="absolute top-4 left-6 flex items-center space-x-2 z-20">
        <img src={Logo} alt="SmartClassroom Logo" className="w-6 h-6" />
        <span className="text-gray-900 font-semibold text-lg">
          SmartClassroom
        </span>
      </div>

      {/* Trang trí góc trái */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 -translate-x-1/3 -translate-y-1/3 z-0"></div>
      {/* Trang trí góc phải */}
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-pink-100 rounded-full blur-3xl opacity-50 translate-x-1/3 translate-y-1/3 z-0"></div>

      {/* Container chính */}
      <div className="max-w-5xl w-full grid grid-cols-1 md:grid-cols-2 gap-10 p-10 bg-white/90 rounded-2xl shadow-lg relative z-10">
        {/* Left section */}
        <form onSubmit={handleLogin} className="flex flex-col justify-center">
          <h1 className="text-2xl font-bold mb-2 text-gray-900">Welcome</h1>
          <p className="text-gray-600 mb-8">
            Get back to what you have left. Smart Classroom at your service
          </p>

          {/* Username */}
          <div className="mb-4">
            <label className="block text-sm text-gray-700 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={`w-full border-b ${
                errors.username ? "border-red-500" : "border-gray-300"
              } focus:outline-none focus:border-indigo-500 py-2 text-gray-900 placeholder-gray-400`}
              placeholder="Enter your username"
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">{errors.username}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full border-b ${
                  errors.password ? "border-red-500" : "border-gray-300"
                } focus:outline-none focus:border-indigo-500 py-2 pr-10 text-gray-900 placeholder-gray-400`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-0 top-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Login button */}
          <button
            type="submit"
            className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 transition"
          >
            Login
          </button>

          {/* Register link */}
          <p className="mt-4 text-sm text-gray-600">
            Don’t have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-indigo-500 font-medium hover:underline"
            >
              Create Account
            </button>
          </p>
        </form>

        {/* Right section */}
        <div className="hidden md:flex items-center justify-center">
          <img src={Illustration} alt="illustration" className="w-3/4" />
        </div>
      </div>
    </div>
  );
}
