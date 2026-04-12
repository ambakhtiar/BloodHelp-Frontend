import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, IUser } from "@/types";
import type { UpdateProfileFormValues } from "@/validations/user.validation";

/**
 * Fetches the current authenticated user's full profile
 */
export const getMyProfile = async (): Promise<ApiResponse<IUser>> => {
  const response = await axiosInstance.get<ApiResponse<IUser>>("/users/me");
  return response.data;
};

/**
 * Updates the current authenticated user's profile
 */
export const updateMyProfile = async (
  payload: UpdateProfileFormValues
): Promise<ApiResponse<IUser>> => {
  const response = await axiosInstance.put<ApiResponse<IUser>>(
    "/users/me",
    payload
  );
  return response.data;
};

/**
 * Fetches the donation history for the current authenticated user
 */
export const getDonationHistory = async (): Promise<ApiResponse<any[]>> => {
  const response = await axiosInstance.get<ApiResponse<any[]>>("/users/donation-history");
  return response.data;
};
