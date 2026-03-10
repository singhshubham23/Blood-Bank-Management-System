import React, { createContext, useState, useEffect } from "react";
import api from "../api/axios";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  const fetchProfile = async () => {
    if (!token) {
      setLoadingAuth(false);
      return;
    }

    try {
      const res = await api.get("/auth/me");

      // Save ONLY actual user object
      const actualUser = res.data.user;
      setUser(actualUser);
      localStorage.setItem("user", JSON.stringify(actualUser));
    } catch (err) {
      console.error("❌ Profile fetch failed:", err);
      setUser(null);
      localStorage.removeItem("user");
    } finally {
      setLoadingAuth(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post("/auth/login", { email, password });

      const newToken = res.data.token;
      setToken(newToken);
      localStorage.setItem("token", newToken);

      api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;

      const profileRes = await api.get("/auth/me");
      const actualUser = profileRes.data.user;

      setUser(actualUser);
      localStorage.setItem("user", JSON.stringify(actualUser));

      return true;
    } catch (err) {
      console.error("❌ Login failed:", err);
      throw err;
    }
  };

  const register = async (formData) => {
    try {
      await api.post("/auth/register", formData);
      return true;
    } catch (err) {
      console.error("❌ Register failed:", err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);

    localStorage.removeItem("token");
    localStorage.removeItem("user");

    delete api.defaults.headers.common["Authorization"];
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        token,
        login,
        register,
        logout,
        loadingAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
