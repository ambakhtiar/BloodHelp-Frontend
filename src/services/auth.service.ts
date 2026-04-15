import axiosInstance from "../lib/axiosInstance";
import { removeAccessToken } from "../lib/axiosInstance";
import type { ApiResponse, IUser } from "../types";
import type { LoginFormValues, RegisterFormValues } from "../validations/auth.validation";

// ---------- Login ----------
export const loginApi = async (payload: LoginFormValues): Promise<any> => {
  const { emailOrPhone, password } = payload;
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailOrPhone);
  const body = isEmail
    ? { email: emailOrPhone, password }
    : { contactNumber: emailOrPhone, password };
  const response = await axiosInstance.post("/auth/login", body);
  return response.data;
};

// ---------- Register ----------
export const registerApi = async (payload: RegisterFormValues): Promise<any> => {
  const body: any = {
    email: payload.email,
    password: payload.password,
    contactNumber: payload.contactNumber,
    role: payload.role,
  };

  const locationData = {
    division: payload.division || "",
    district: payload.district || "",
    upazila: payload.upazila || "",
  };

  if (payload.role === "USER") {
    body.donorInfo = {
      name: payload.name,
      bloodGroup: payload.bloodGroup,
      gender: payload.gender,
      ...locationData,
    };
  } else if (payload.role === "HOSPITAL") {
    body.hospitalInfo = {
      name: payload.name,
      registrationNumber: payload.registrationNumber,
      address: payload.address,
      ...locationData,
    };
  } else if (payload.role === "ORGANISATION") {
    body.organisationInfo = {
      name: payload.name,
      registrationNumber: payload.registrationNumber,
      establishedYear: payload.establishedYear,
      ...locationData,
    };
  }

  const response = await axiosInstance.post("/auth/register", body);
  return response.data;
};

// ---------- Fetch current authenticated user ----------
export const fetchCurrentUser = async (): Promise<IUser> => {
  const response = await axiosInstance.get<ApiResponse<IUser>>("/users/me");
  return response.data.data;
};

// ---------- Logout ----------
export const logoutApi = async (): Promise<void> => {
  try {
    await axiosInstance.post("/auth/logout");
  } catch {
    // Ignore — token might already be expired
  } finally {
    removeAccessToken();
  }
};

// ---------- Forgot Password ----------
export const forgotPasswordApi = async (email: string): Promise<any> => {
  const response = await axiosInstance.post("/auth/forgot-password", { email });
  return response.data;
};

// ---------- Reset Password ----------
export const resetPasswordApi = async (payload: { id: string; token: string; newPassword: string }): Promise<any> => {
  const response = await axiosInstance.post("/auth/reset-password", payload);
  return response.data;
};

// ---------- Change Password ----------
export const changePasswordApi = async (payload: any): Promise<any> => {
  const response = await axiosInstance.post("/auth/change-password", payload);
  return response.data;
};
