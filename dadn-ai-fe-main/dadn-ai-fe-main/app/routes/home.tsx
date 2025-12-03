import type { Route } from "./+types/home";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import HomeComponent from "~/components/home_components/HomeComponent";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}
const EXPIRATION_TIME_MS = 4 * 60 * 60 * 1000; 

export default function Home() {
    const navigate = useNavigate();
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        // Tạo một hàm async bên trong để gọi API
        const checkAuthAndExpiry = async () => {
            const userId = localStorage.getItem("user_id");
            const loginTime = localStorage.getItem("loginTimestamp");

          if (!userId || !loginTime) {
            // Nếu không có 1 trong 2, dọn dẹp và về login
                localStorage.clear();
                alert("You 've not logged in!")
                navigate("/");
                return;
        } 
            
            // Kiểm tra thời gian
            const now = new Date().getTime();
            const sessionAge = now - parseInt(loginTime, 10);

            if (sessionAge > EXPIRATION_TIME_MS) {       
                // 1. Thông báo cho user
                alert("Phiên của bạn đã hết hạn. Vui lòng đăng nhập lại.");

                // 2. Xóa localStorage
                localStorage.clear();

                try {
                    // 3. Gọi API logout để xóa cookie (như bạn yêu cầu)
                    // (Chúng ta không cần đợi hay check lỗi, cứ gọi để dọn dẹp)
                    fetch("http://localhost:3000/api/logout", {
                        method: "GET",
                        credentials: "include",
                    });
                } catch (err) {
                    // Bỏ qua lỗi nếu API logout có vấn đề
                    console.warn("Cleanup logout call failed, navigating anyway.");
                }

                // 4. Quay về trang login
                navigate("/");

            } else {
                // --- VẪN CÒN HẠN ---
                setIsChecking(false); // ✅ Cho phép render
          }
        };
        
        // Gọi hàm async
        checkAuthAndExpiry();

  }, [navigate]);
  if (isChecking) {
    return null;
  }

  return <HomeComponent />;
}
