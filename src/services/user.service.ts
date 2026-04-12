import axiosInstance from "@/lib/axiosInstance";
import type { ApiResponse, IUser } from "@/types";
import type { UpdateProfileFormValues } from "@/validations/user.validation";

export interface DonorFilters {
  bloodGroup?: string;
  division?: string;
  district?: string;
  upazila?: string;
  searchTerm?: string;
  page?: number;
  limit?: number;
}

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

/**
 * Fetches a list of donors based on filters
 */
export const getDonorsList = async (
  filters: DonorFilters
): Promise<ApiResponse<IUser[]>> => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.append(key, String(value));
    }
  });

  const response = await axiosInstance.get<ApiResponse<IUser[]>>(
    `/users/donors?${params.toString()}`
  );
  return response.data;
};
