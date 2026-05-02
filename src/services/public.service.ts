import axiosInstance from "@/lib/axiosInstance";
import { ApiResponse } from "@/types";

export interface IPublicStats {
  totalDonors: number;
  totalHospitals: number;
  totalOrgs: number;
  totalPosts: number;
}

export interface ITopDonor {
  id: string;
  name: string;
  bloodGroup: string;
  donationCount: number;
  profilePictureUrl?: string;
  district?: string;
}

/**
 * Fetches public platform statistics for the landing page
 */
export const getPublicStats = async (): Promise<ApiResponse<IPublicStats>> => {
  const response = await axiosInstance.get<ApiResponse<IPublicStats>>("/public/stats");
  return response.data;
};

/**
 * Fetches the top blood donors based on verified donation history
 */
export const getTopDonors = async (): Promise<ApiResponse<ITopDonor[]>> => {
  const response = await axiosInstance.get<ApiResponse<ITopDonor[]>>("/public/top-donors");
  return response.data;
};
/**
 * Sends a contact form message to the admin
 */
export const sendContactMessage = async (payload: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<ApiResponse<any>> => {
  const response = await axiosInstance.post<ApiResponse<any>>("/public/contact", payload);
  return response.data;
};
