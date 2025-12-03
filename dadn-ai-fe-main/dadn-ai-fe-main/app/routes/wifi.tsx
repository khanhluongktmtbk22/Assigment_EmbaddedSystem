import type { Route } from "./+types/wifi";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import Navbar from "../components/Navbar";
import Menu from "../components/home_components/Menu";
import WifiForm from "../components/home_components/WifiForm";

export function meta({ }: Route.MetaArgs) {
    return [
        { title: "WiFi Configuration - SmartClassroom" },
        { name: "description", content: "Configure WiFi settings" },
    ];
}

const EXPIRATION_TIME_MS = 4 * 60 * 60 * 1000;

export default function Wifi() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const checkAuthAndExpiry = async () => {
            const userId = localStorage.getItem("user_id");
            const loginTime = localStorage.getItem("loginTimestamp");

            if (!userId || !loginTime) {
                localStorage.clear();
                alert("You've not logged in!");
                navigate("/");
                return;
            }

            const now = new Date().getTime();
            const sessionAge = now - parseInt(loginTime, 10);

            if (sessionAge > EXPIRATION_TIME_MS) {
                alert("Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.");
                localStorage.clear();
                try {
                    fetch("http://localhost:3000/api/logout", {
                        method: "GET",
                        credentials: "include",
                    });
                } catch (err) {
                    console.warn("Cleanup logout call failed, navigating anyway.");
                }
                navigate("/");
            } else {
                setIsChecking(false);
            }
        };

        checkAuthAndExpiry();
    }, [navigate]);

    if (isChecking) {
        return null;
    }

    return (
        <>
            <Navbar />
            <div className="bg-gray-100 text-black flex flex-row min-h-screen">
                <Menu className="w-3xs flex-1" />
                <div className="flex-6 bg-gray-200 px-20 py-10">
                    <WifiForm />
                </div>
            </div>
        </>
    );
}
