import { UserRole, AccountStatus, Gender, BloodGroup } from "./common.types";

export interface IUser {
  id: string;
  email: string | null;
  contactNumber: string;
  profilePictureUrl: string | null;
  role: UserRole;
  accountStatus: AccountStatus;
  needsPasswordChange: boolean;
  division: string | null;
  district: string | null;
  upazila: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  donorProfile?: IDonorProfile | null;
  hospital?: IHospital | null;
  organisation?: IOrganisation | null;
  admin?: IAdmin | null;
  bloodDonor?: IBloodDonor | null;
}

export interface IDonorProfile {
  id: string;
  name: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  weight: number | null;
  lastDonationDate: string | null;
  isAvailableForDonation: boolean;
}

export interface IHospital {
  id: string;
  name: string;
  registrationNumber: string | null;
  address: string | null;
}

export interface IOrganisation {
  id: string;
  name: string;
  registrationNumber: string | null;
  establishedYear: string | null;
}

export interface IAdmin {
  id: string;
  name: string;
}

export interface IBloodDonor {
  id: string;
  name: string;
  contactNumber: string;
  bloodGroup: BloodGroup;
  gender: Gender;
  lastDonationDate: string | null;
  isAvailable: boolean;
  division: string;
  district: string;
  upazila: string;
  area: string | null;
  userId: string | null;
}
