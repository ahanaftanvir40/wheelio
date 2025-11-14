import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter, useSegments } from "expo-router";
import api from "../lib/api";

// Types
interface User {
  name: string;
  email: string;
  userType: string;
  phoneNumber: string;
  avatar?: string;
  drivingLicense?: string;
  nationalId?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; message?: string }>;
  signup: (
    formData: FormData
  ) => Promise<{ success: boolean; message?: string; errors?: string }>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// Create Context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider Component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Handle navigation based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";

    if (!user && !inAuthGroup && !inOnboarding) {
      // Redirect to auth if not authenticated
      router.replace("/auth");
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated and on auth screen
      router.replace("/home");
    }
  }, [user, loading, segments]);

  // Check if user is authenticated
  const checkAuth = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Fetch user profile with token
      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUser(response.data);
      } else {
        // Invalid token, clear it
        await AsyncStorage.removeItem("authToken");
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      // Clear invalid token
      await AsyncStorage.removeItem("authToken");
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // Refresh user data
  const refreshUser = async () => {
    try {
      const token = await AsyncStorage.getItem("authToken");

      if (!token) {
        setUser(null);
        return;
      }

      const response = await api.get("/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to refresh user:", error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/loginuser", {
        email,
        password,
      });

      if (response.data.success) {
        // Store token
        await AsyncStorage.setItem("authToken", response.data.authToken);

        // Fetch user profile
        await checkAuth();

        return { success: true };
      } else {
        return { success: false, message: "Invalid email or password" };
      }
    } catch (error: any) {
      console.error("Login failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Login failed. Please try again.",
      };
    }
  };

  // Signup function
  const signup = async (formData: FormData) => {
    try {
      const response = await api.post("/createuser", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        return { success: true };
      } else {
        if (response.data.error) {
          // Handle validation errors from backend
          const errors = response.data.error
            .map((e: any) => e.message)
            .join("\n");
          return { success: false, errors };
        } else {
          return {
            success: false,
            message: "Email already exists or registration failed",
          };
        }
      }
    } catch (error: any) {
      console.error("Signup failed:", error);
      return {
        success: false,
        message:
          error.response?.data?.message || "Signup failed. Please try again.",
      };
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.removeItem("authToken");
      setUser(null);
      router.replace("/auth");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    checkAuth,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
