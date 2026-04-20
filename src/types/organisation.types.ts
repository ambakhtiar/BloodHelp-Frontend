import { BloodGroup, Gender, RequestStatus } from "./common.types";
import { IBloodDonor } from "./user.types";

export interface IHospitalDonationRecord {
  id: string;
  hospitalId: string;
  bloodDonorId: string;
  donationDate: string;
  weight: number;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  bloodDonor: IBloodDonor;
}

export interface IRecordDonationPayload {
  contactNumber: string;
  name?: string;
  bloodGroup?: BloodGroup;
  gender?: Gender;
  createPost?: boolean;
  postTitle?: string;
  postImages?: string[];
  postContent?: string;
}

export interface IOrganisationVolunteer {
  id: string;
  organisationId: string;
  bloodDonorId: string;
  status: RequestStatus;
  isDeleted: boolean;
  createdAt: string;
  bloodDonor: IBloodDonor;
}

export interface IAddVolunteerPayload {
  name: string;
  contactNumber: string;
  bloodGroup: BloodGroup | "";
  gender: Gender | "";
  lastDonationDate?: string;
  isAvailable: boolean;
  division?: string;
  district?: string;
  upazila?: string;
}
