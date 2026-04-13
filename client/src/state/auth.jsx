import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../lib/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("hh_token") || "");
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("hh_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    setAuthToken(token || "");
    if (token) localStorage.setItem("hh_token", token);
    else localStorage.removeItem("hh_token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("hh_user", JSON.stringify(user));
    else localStorage.removeItem("hh_user");
  }, [user]);

  async function register({ name, email, password }) {
    const { data } = await api.post("/api/users/register", { name, email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  async function login({ email, password }) {
    const { data } = await api.post("/api/users/login", { email, password });
    setToken(data.token);
    setUser(data.user);
    return data;
  }

  function logout() {
    setToken("");
    setUser(null);
  }

  const value = useMemo(
    () => ({ token, user, isAuthed: Boolean(token), register, login, logout }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

