import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("accessToken")));

  useEffect(() => {
    async function loadUser() {
      try {
        if (!localStorage.getItem("accessToken")) return;
        const { data } = await api.get("/users/me");
        setUser(data.user);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(identifier, password) {
    const { data } = await api.post("/auth/login", { identifier, password });
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    setUser(data.user);
  }

  async function logout() {
    try {
      await api.post("/auth/logout", { refreshToken: localStorage.getItem("refreshToken") });
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setUser(null);
    }
  }

  const value = useMemo(() => ({ user, setUser, loading, login, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
