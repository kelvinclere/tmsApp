import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode, JwtPayload } from "jwt-decode";
import axiosInstance from "../../lib/axiosInstance";
import { Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";

interface CustomJwtPayload extends JwtPayload {
  user_id?: string;
  full_name?: string;
  email?: string;
  role?: "super_admin" | "admin" | "user";
  pfl?: boolean;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: any;
  error?: string;
}

interface LoginCredentials {
  email: string;
  password?: string;
  code?: string;
}

interface AuthContextType {
  userInfo: CustomJwtPayload | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthResponse>;
  loginCode: (params: { email: string }) => Promise<AuthResponse>;
  verifyOTP: (credentials: LoginCredentials) => Promise<AuthResponse>;
  logout: () => void;
  register: (data: any) => Promise<AuthResponse>;
  isAuthenticated: boolean;
  authChecked: boolean;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const formatErrorMessage = (msg: unknown): string => {
  if (typeof msg === "string") return msg;
  try {
    return JSON.stringify(msg);
  } catch {
    return "An unexpected error occurred";
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userInfo, setUserInfo] = useState<CustomJwtPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  const navigation = useNavigation<any>();
  const BASE_URL = "https://pharmacology-recent-pairs-commodities.trycloudflare.com";

  const clearError = () => setError(null);

  const isTokenExpired = (token: string): boolean => {
    try {
      const decoded = jwtDecode<JwtPayload>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp ? decoded.exp < currentTime : true;
    } catch {
      return true;
    }
  };

  useEffect(() => {
    const loadUser = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token && !isTokenExpired(token)) {
        const decoded = jwtDecode<CustomJwtPayload>(token);
        console.log("🔑 Loaded user from token:", decoded);
        setUserInfo(decoded);
        setIsAuthenticated(true);
      } else {
        handleLogout();
      }
      setAuthChecked(true);
      setLoading(false);
    };
    loadUser();
  }, []);

  const register = async (data: any): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/v1/cemastea/register`, data);
      console.log("📩 Register response:", response.data); 
      const responseData = response.data as AuthResponse;
      if (responseData.success) {
        Alert.alert("Success", formatErrorMessage(responseData.data?.response || "Registration successful!"));
        navigation.navigate("Login");
        return { success: true, message: formatErrorMessage(responseData.data?.response) };
      } else {
        throw new Error(responseData.error || "Registration failed");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.response ||
        error?.message ||
        "Registration failed";
      setError(formatErrorMessage(errorMsg));
      Alert.alert("Error", formatErrorMessage(errorMsg));
      return { success: false, error: formatErrorMessage(errorMsg) };
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(
        `${BASE_URL}/v1/cemastea/login`,
        { email: credentials.email, password: credentials.password }
      );

      console.log("📩 Login response:", response.data);
      const data = response.data as AuthResponse;

      if (data.success) {
        await AsyncStorage.setItem("otpEmail", credentials.email);
        Alert.alert("OTP Sent", "A verification code has been sent to your email.");
        navigation.navigate("ConfirmOTP", { email: credentials.email });
        return { success: true, message: "OTP sent successfully" };
      } else {
        throw new Error(data.error || "Failed to initiate login");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.response ||
        error?.message ||
        "Failed to initiate login";
      setError(formatErrorMessage(errorMsg));
      Alert.alert("Error", formatErrorMessage(errorMsg));
      return { success: false, error: formatErrorMessage(errorMsg) };
    } finally {
      setLoading(false);
      setAuthChecked(true);
    }
  };

  const verifyOTP = async (credentials: LoginCredentials): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/api/v1/auth/2fa`, credentials);
      console.log("📩 Verify OTP response:", response.data); 
      const data = response.data as any;
      const tokens = data?.response;

      if (data?.success === "true" && tokens?.token) {
        await AsyncStorage.setItem("accessToken", tokens.token);
        if (tokens.refresh_token) {
          await AsyncStorage.setItem("refreshToken", tokens.refresh_token);
        }

        const decoded = jwtDecode<CustomJwtPayload>(tokens.token);
        console.log("🔑 Decoded token after OTP:", decoded); 
        setUserInfo(decoded);
        setIsAuthenticated(true);

        Alert.alert("Success", "Login successful!");

        navigation.reset({
          index: 0,
          routes: [{ name: "Main" }],
        });

        return { success: true, message: "Login successful!" };
      } else {
        throw new Error(data?.response ? JSON.stringify(data.response) : "Invalid OTP");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.response ||
        error?.response?.data?.error ||
        error?.message ||
        "OTP verification failed";
      setError(formatErrorMessage(errorMsg));
      Alert.alert("Error", formatErrorMessage(errorMsg));
      setIsAuthenticated(false);
      return { success: false, error: formatErrorMessage(errorMsg) };
    } finally {
      setLoading(false);
    }
  };

  const loginCode = async ({ email }: { email: string }): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.post(`${BASE_URL}/api/v1/auth/2fa`, { email });
      console.log("📩 Resend OTP response:", response.data); 
      const data = response.data as AuthResponse;
      if (data.success) {
        Alert.alert("OTP Sent", "A new code has been sent to your email.");
        return { success: true };
      } else {
        throw new Error(data.error || "Failed to send OTP");
      }
    } catch (error: any) {
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.response ||
        error?.message ||
        "Failed to send OTP";
      setError(formatErrorMessage(errorMsg));
      Alert.alert("Error", formatErrorMessage(errorMsg));
      return { success: false, error: formatErrorMessage(errorMsg) };
    } finally {
      setLoading(false);
    }
  };


  const handleLogout = async () => {
    setUserInfo(null);
    setIsAuthenticated(false);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
  };

  const logout = async () => {
    setLoading(true);
    try {
      await handleLogout();
      Alert.alert("Success", "Logged out successfully");
      navigation.navigate("Login");
    } catch (error: any) {
      const errorMsg = error?.message || "Logout failed";
      setError(formatErrorMessage(errorMsg));
      Alert.alert("Error", formatErrorMessage(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        userInfo,
        loading,
        error,
        login,
        loginCode,
        verifyOTP,
        logout,
        register,
        isAuthenticated,
        authChecked,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
