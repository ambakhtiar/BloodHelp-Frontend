import { AccountStatus, ApiResponse, IAdminAnalytics, IUser } from "@/types";
import axiosInstance from "@/lib/axiosInstance";

const getAnalytics = async (): Promise<ApiResponse<IAdminAnalytics>> => {
  const { data } = await axiosInstance.get("/admin/analytics");
  return data;
};

const getUsers = async (params: Record<string, unknown> = {}): Promise<ApiResponse<IUser[]>> => {
  const { data } = await axiosInstance.get("/admin/users", { params });
  return data;
};

const getHospitals = async (params: Record<string, unknown> = {}): Promise<ApiResponse<IUser[]>> => {
  const { data } = await axiosInstance.get("/admin/hospitals", { params });
  return data;
};

const getOrganisations = async (params: Record<string, unknown> = {}): Promise<ApiResponse<IUser[]>> => {
  const { data } = await axiosInstance.get("/admin/organisations", { params });
  return data;
};

const updateUserStatus = async (id: string, status: AccountStatus): Promise<ApiResponse<IUser>> => {
  const { data } = await axiosInstance.patch(`/admin/users/${id}/status`, { status });
  return data;
};

const updateHospitalStatus = async (id: string, status: AccountStatus): Promise<ApiResponse<IUser>> => {
  const { data } = await axiosInstance.patch(`/admin/hospitals/${id}/status`, { status });
  return data;
};

const updateOrganisationStatus = async (id: string, status: AccountStatus): Promise<ApiResponse<IUser>> => {
  const { data } = await axiosInstance.patch(`/admin/organisations/${id}/status`, { status });
  return data;
};

export const AdminServices = {
  getAnalytics,
  getUsers,
  getHospitals,
  getOrganisations,
  updateUserStatus,
  updateHospitalStatus,
  updateOrganisationStatus,
};
