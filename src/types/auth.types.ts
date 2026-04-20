import { UserRole, Gender } from "./common.types";
import { IUser } from "./user.types";

export interface ILoginPayload {
  contactNumber?: string;
  email?: string;
  password: string;
}

export interface ILoginResponse {
  user: Omit<IUser, "password">;
  accessToken: string;
  refreshToken: string;
}

export interface IRegisterPayload {
  email?: string;
  password: string;
  contactNumber: string;
  role: UserRole;
  donorInfo?: {
    name: string;
    bloodGroup: string;
    gender: Gender;
    weight?: number;
    lastDonationDate?: string;
    division: string;
    district: string;
    upazila: string;
  };
  hospitalInfo?: {
    name: string;
    registrationNumber?: string;
    address?: string;
    division: string;
    district: string;
    upazila: string;
  };
  organisationInfo?: {
    name: string;
    registrationNumber?: string;
    establishedYear?: string;
    division: string;
    district: string;
    upazila: string;
  };
}
