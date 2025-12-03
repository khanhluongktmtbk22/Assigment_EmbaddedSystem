// app/components/home_components/Menu.tsx
import {
  AiFillHome,
  AiOutlineHome,
  AiOutlinePieChart,
  AiFillPieChart,
} from "react-icons/ai";
import { BiLogOut } from "react-icons/bi";
import { RiHistoryLine, RiHistoryFill } from "react-icons/ri";
import { AiOutlineWifi } from "react-icons/ai";
import { NavLink, useNavigate } from "react-router";
import { useState } from "react";


type MenuProps = { className?: string };

export default function Menu({ className = "" }: MenuProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      const res = await fetch("http://localhost:3000/api/logout", {
        method: "GET",
        credentials: "include",
        // headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error("Logout failed");
      }
      localStorage.removeItem("token");
      localStorage.clear();
      alert(data.message);

      // ✅ Replace navigation so Back won’t go back to dashboard
      navigate("/", { replace: true });
    } catch (err) {
      console.error("Logout error:", err);
      alert("Logout failed. Please try again.");
    } finally {
      setIsLoggingOut(false);
      setShowConfirm(false);
    }
  };

  const menuList = [
    {
      Icon: AiOutlineHome,
      ActiveIcon: AiFillHome,
      buttonText: "Home",
      linkTo: "/home",
    },
    {
      Icon: AiOutlinePieChart,
      ActiveIcon: AiFillPieChart,
      buttonText: "Dashboard",
      linkTo: "/dashboard",
    },
    {
      Icon: RiHistoryLine,
      ActiveIcon: RiHistoryFill,
      buttonText: "History",
      linkTo: "/history",
    },
    {
      Icon: AiOutlineWifi,
      ActiveIcon: AiOutlineWifi,
      buttonText: "WiFi",
      linkTo: "/wifi",
    },
    {
      Icon: BiLogOut,
      ActiveIcon: BiLogOut,
      buttonText: "Logout",
      linkTo: "/",
    },
  ];

  return (
    <div className={`flex flex-col ${className}`}>
      {menuList.map((item) =>
        item.buttonText === "Logout" ? (
          // 🔹 Logout button
          <button
            key={item.buttonText}
            onClick={() => setShowConfirm(true)} // 🔹 Open modal instead of logging out immediately
            disabled={isLoggingOut}
            className={`flex items-center gap-4 px-6 py-4 rounded-lg transition-all no-underline 
          ${isLoggingOut ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"}
        `}
          >
            <item.Icon className="text-gray-700 w-7 h-7" />
            <span className="text-xl text-black">
              {"Logout"}
            </span>
          </button>

        ) : (
          // 🔹 Normal navigation buttons
          <NavLink
            to={item.linkTo}
            key={item.buttonText}
            className={({ isActive }) =>
              `flex items-center gap-4 px-6 py-4 rounded-lg transition-all no-underline
            ${isActive ? "bg-gray-100" : "hover:bg-gray-50"}`
            }
          >
            {({ isActive }) => {
              const Icon = isActive ? item.ActiveIcon : item.Icon;
              return (
                <>
                  <Icon
                    className={`${isActive ? "text-black" : "text-gray-700"
                      } w-7 h-7`}
                  />
                  <span
                    className={`text-xl ${isActive ? "font-bold text-black" : "text-black"
                      }`}
                  >
                    {item.buttonText}
                  </span>
                </>
              );
            }}
          </NavLink>
        )
      )}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-80 text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to log out?
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition"
              >
                {isLoggingOut ? "Logging out..." : "Yes, Logout"}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
