import React, { createContext, useState, useContext, useEffect } from "react";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  const getToken = () =>
    localStorage.getItem("token") || sessionStorage.getItem("token");

  const getStoredUser = () =>
    localStorage.getItem("user") || sessionStorage.getItem("user");

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");

    setUser(null);
    setIsAuthenticated(false);
  };

  const saveUser = (userData) => {
    const isLocal = !!localStorage.getItem("token");

    if (isLocal) {
      localStorage.setItem("user", JSON.stringify(userData));
    } else {
      sessionStorage.setItem("user", JSON.stringify(userData));
    }
  };

  useEffect(() => {
    const handleOAuthRedirect = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const tokenFromOAuth = urlParams.get("token");

      if (tokenFromOAuth) {
        localStorage.setItem("token", tokenFromOAuth);
        window.history.replaceState({}, "", window.location.pathname);
      }
    };

    const initializeAuth = async () => {
      try {
        handleOAuthRedirect();

        const token = getToken();
        const storedUser = getStoredUser();

        if (!token) {
          setLoading(false);
          return;
        }

        // Load cached user first (fast UI)
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            setUser(parsed);
            setIsAuthenticated(true);
          } catch (e) {
            console.warn("Invalid stored user");
          }
        }

        // Verify with backend
        const response = await authAPI.getMe();
        const freshUser = response.data?.data?.user;

        if (!freshUser?.id) throw new Error("Invalid session");

        setUser(freshUser);
        setIsAuthenticated(true);
        saveUser(freshUser);
      } catch (error) {
        const status = error.response?.status;

        console.log("Auth verification failed:", status);

        if (status === 401 || status === 403) {
          clearAuth();
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // LOGIN
  const login = async (email, password, rememberMe = false) => {
    try {
      const response = await authAPI.login(email, password);
      const { token, user } = response.data.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      setUser(user);
      setIsAuthenticated(true);

      toast.success("Login successful!");
      return { success: true, user };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      let errorMessage = "Login failed";

      if (status === 401) errorMessage = "Invalid email or password";
      else if (status === 403) errorMessage = "Account disabled";
      else if (message) errorMessage = message;

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // REGISTER
  const register = async (userData, rememberMe = false) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(user));
      }

      setUser(user);
      setIsAuthenticated(true);

      toast.success("Registration successful!");
      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";

      toast.error(message);
      return { success: false, error: message };
    }
  };

  // LOGOUT
  const logout = () => {
    clearAuth();
    toast.success("Logged out successfully");
  };

  // HELPERS
  const getUserRole = () => user?.role || null;
  const hasRole = (role) => user?.role === role;

  const isJobSeeker = () => user?.role === "job_seeker";
  const isEmployer = () => user?.role === "employer";
  const isAdmin = () => user?.role === "admin";

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);
    saveUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        getUserRole,
        hasRole,
        isJobSeeker,
        isEmployer,
        isAdmin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
