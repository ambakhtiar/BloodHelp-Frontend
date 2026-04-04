import axiosInstance from "../lib/axiosInstance";
import { removeAccessToken } from "../lib/axiosInstance";
import type { ApiResponse, IUser } from "../types";

// ---------- Fetch current authenticated user ----------
export const fetchCurrentUser = async (): Promise<IUser> => {
  const response = await axiosInstance.get<ApiResponse<IUser>>("/users/me");
  return response.data.data;
};

// ---------- Logout ----------
export const logoutApi = async (): Promise<void> => {
  try {
    await axiosInstance.post("/auth/logout");
  } finally {
    // Always clear in-memory token even if API call fails
    removeAccessToken();
  }
};
