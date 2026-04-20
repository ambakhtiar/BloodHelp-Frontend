import { AccountStatus } from "./common.types";

export interface IAdminAnalytics {
  totalUsers: number;
  totalPosts: number;
  totalBloodDonors: number;
  totalDonationHistories: number;
  totalHospital: number;
  pendingHospital: number;
  rejectedHospital: number;
  activeHospital: number;
  blockedHospital: number;
  totalOrg: number;
  pendingOrg: number;
  rejectedOrg: number;
  activeOrg: number;
  blockedOrg: number;
  totalStandardUser: number;
  blockedUser: number;
  rejectedUser: number;
  totalAdmin: number;
}

export interface IManageAdminResponse {
  id: string;
  name: string;
  user: {
    email: string;
    contactNumber: string;
    accountStatus: AccountStatus;
    division?: string | null;
    district?: string | null;
    upazila?: string | null;
  };
}

export interface ICreateAdminPayload {
  name: string;
  email: string;
  contactNumber: string;
  password: string;
  division: string;
  district: string;
  upazila: string;
}

export interface IUpdateAdminPayload {
  name?: string;
  contactNumber?: string;
  email?: string;
  division?: string;
  district?: string;
  upazila?: string;
}
