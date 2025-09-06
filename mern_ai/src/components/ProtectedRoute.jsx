import { Outlet } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import Login from "../pages/Login";
import Spinner from "./Spinner";

export default function ProtectedRoute() {
  const { user, authLoading } = useAuth();
  if (authLoading) return <Spinner label="Checking session" />;
  if (!user)
    return (
      <div className="max-w-md mx-auto mt-10">
        <Login />
      </div>
    );
  return <Outlet />;
}
