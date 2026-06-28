import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "../services/authService";
import { getErrorMessage } from "../utils/formatters";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("taskflow_token"));
  const [booting, setBooting] = useState(Boolean(localStorage.getItem("taskflow_token")));
  const [error, setError] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      if (!token) {
        setBooting(false);
        return;
      }

      try {
        const data = await authService.me();
        setUser(data.user);
      } catch {
        localStorage.removeItem("taskflow_token");
        setToken(null);
      } finally {
        setBooting(false);
      }
    };

    loadUser();
  }, [token]);

  const persistSession = (data) => {
    localStorage.setItem("taskflow_token", data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const login = async (payload) => {
    setError("");
    try {
      const data = await authService.login(payload);
      persistSession(data);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const register = async (payload) => {
    setError("");
    try {
      const data = await authService.register(payload);
      persistSession(data);
      return true;
    } catch (err) {
      setError(getErrorMessage(err));
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("taskflow_token");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, token, booting, error, isAuthenticated: Boolean(user && token), login, register, logout }),
    [user, token, booting, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
