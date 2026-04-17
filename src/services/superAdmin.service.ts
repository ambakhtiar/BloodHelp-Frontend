import { ApiResponse, ICreateAdminPayload, IManageAdminResponse, IUpdateAdminPayload } from "@/types";
import axiosInstance from "@/lib/axiosInstance";

const getAllAdmins = async (params: Record<string, unknown> = {}): Promise<ApiResponse<IManageAdminResponse[]>> => {
  const { data } = await axiosInstance.get("/manage-admins", { params });
  return data;
};

const createAdmin = async (payload: ICreateAdminPayload): Promise<ApiResponse<IManageAdminResponse>> => {
  const { data } = await axiosInstance.post("/manage-admins", payload);
  return data;
};

const updateAdmin = async (id: string, payload: IUpdateAdminPayload): Promise<ApiResponse<IManageAdminResponse>> => {
  const { data } = await axiosInstance.patch(`/manage-admins/${id}`, payload);
  return data;
};

const toggleAdminAccess = async (id: string, accountStatus: string): Promise<ApiResponse<IManageAdminResponse>> => {
  const { data } = await axiosInstance.patch(`/manage-admins/${id}/access`, { accountStatus });
  return data;
};

const deleteAdmin = async (id: string): Promise<ApiResponse<null>> => {
  const { data } = await axiosInstance.delete(`/manage-admins/${id}`);
  return data;
};

export const SuperAdminServices = {
  getAllAdmins,
  createAdmin,
  updateAdmin,
  toggleAdminAccess,
  deleteAdmin,
};
