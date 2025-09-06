import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../utils/api";
import toast from "react-hot-toast";

const AuthCtx = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [authLoading, setAuthLoading] = useState(
    !!localStorage.getItem("token")
  );

  useEffect(() => {
    const load = async () => {
      if (!token) {
        setAuthLoading(false);
        return;
      }
      try {
        const { data } = await api.get("/api/user/me");
        setUser(data.user);
      } catch {
        setUser(null);
        setToken("");
        localStorage.removeItem("token");
      } finally {
        setAuthLoading(false);
      }
    };
    load();
  }, [token]);

  const login = (tkn, usr) => {
    setToken(tkn);
    localStorage.setItem("token", tkn);
    setUser(usr);
    toast.success("Welcome back");
  };

  const logout = () => {
    setUser(null);
    setToken("");
    localStorage.removeItem("token");
    toast("Logged out");
  };

  const value = useMemo(
    () => ({ user, token, login, logout, setUser, authLoading }),
    [user, token, authLoading]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
