import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  return localStorage.getItem("adminToken")
    ? <Outlet />
    : <Navigate to="/admin/login" replace />;
}
