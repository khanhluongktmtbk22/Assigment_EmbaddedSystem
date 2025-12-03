import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/", { replace: true });
      return;
    }

    fetch("http://localhost:3000/api/verify-token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Invalid token");
      })
      .catch(() => {
        localStorage.removeItem("token");
        navigate("/", { replace: true });
      })
      .finally(() => {
        setChecking(false);
      });
  }, [navigate]);

  if (checking) return null; // hoặc spinner nếu muốn

  return <>{children}</>;
}
