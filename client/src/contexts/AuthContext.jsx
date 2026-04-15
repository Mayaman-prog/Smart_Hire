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

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const token =
        localStorage.getItem("token") || sessionStorage.getItem("token");
      const userData =
        localStorage.getItem("user") || sessionStorage.getItem("user");

      if (token && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          setIsAuthenticated(true);

          // Verify token with backend
          try {
            const response = await authAPI.getMe();
            const freshUser = response.data?.data?.user;

            if (freshUser) {
              setUser(freshUser);

              if (localStorage.getItem("token")) {
                localStorage.setItem("user", JSON.stringify(freshUser));
              } else if (sessionStorage.getItem("token")) {
                sessionStorage.setItem("user", JSON.stringify(freshUser));
              }
            }
          } catch (error) {
            // If token is invalid, clear storage
            console.error("Token validation failed:", error);
            localStorage.removeItem("token");
            sessionStorage.removeItem("token");
            localStorage.removeItem("user");
            setUser(null);
            setIsAuthenticated(false);
          }
        } catch (error) {
          console.error("Failed to parse user data:", error);
          localStorage.removeItem("token");
          sessionStorage.removeItem("token");
          localStorage.removeItem("user");
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login function - works with your api.js (mock mode)
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
      else if (status === 403)
        errorMessage = "Account disabled. Please contact support.";
      else if (status === 500)
        errorMessage = "Server error. Please try again later.";
      else if (message) errorMessage = message;

      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  // Register function
  const register = async (userData, rememberMe = false) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user: newUser } = response.data.data;

      if (rememberMe) {
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(newUser));
      } else {
        sessionStorage.setItem("token", token);
        sessionStorage.setItem("user", JSON.stringify(newUser));
      }

      setUser(newUser);
      setIsAuthenticated(true);

      toast.success("Registration successful! Welcome aboard!");
      return { success: true, user: newUser };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
    setUser(null);
    setIsAuthenticated(false);
    toast.success("Logged out successfully");
  };

  // Helper functions
  const getUserRole = () => {
    return user?.role || null;
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isJobSeeker = () => {
    return user?.role === "job_seeker";
  };

  const isEmployer = () => {
    return user?.role === "employer";
  };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const updateUser = (updatedData) => {
    const updatedUser = { ...user, ...updatedData };
    setUser(updatedUser);

    if (localStorage.getItem("token")) {
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else if (sessionStorage.getItem("token")) {
      sessionStorage.setItem("user", JSON.stringify(updatedUser));
    }

    toast.success("Profile updated successfully");
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
