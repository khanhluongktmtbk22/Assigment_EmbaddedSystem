import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"), // /
  route("home", "routes/home.tsx"),
  route("register", "routes/register.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("history", "routes/history.tsx"),
  route("wifi", "routes/wifi.tsx"),
] satisfies RouteConfig;
