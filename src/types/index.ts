// Global TypeScript types matching backend models

export type UserRole = "SUPER_ADMIN" | "ADMIN" | "HOSPITAL" | "ORGANISATION" | "USER";

export type AccountStatus = "PENDING" | "ACTIVE" | "BLOCKED" | "REJECTED";

export type Gender = "MALE" | "FEMALE";

export type BloodGroup =
  | "A_POSITIVE"
  | "A_NEGATIVE"
  | "B_POSITIVE"
  | "B_NEGATIVE"
  | "AB_POSITIVE"
  | "AB_NEGATIVE"
  | "O_POSITIVE"
  | "O_NEGATIVE";

export type PostType = "BLOOD_FINDING" | "BLOOD_DONATION" | "HELPING";

export type DonationTimeType = "EMERGENCY" | "FIXED" | "FLEXIBLE";

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

// ---------- API Response Wrapper ----------
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}

// ---------- User ----------
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
}

// ---------- Post ----------
export interface IPost {
  id: string;
  authorId: string;
  type: PostType;
  title: string | null;
  content: string | null;
  images: string[];
  contactNumber: string | null;
  location: string | null;
  division: string | null;
  district: string | null;
  upazila: string | null;
  area: string | null;
  latitude: number | null;
  longitude: number | null;
  bloodGroup: BloodGroup | null;
  bloodBags: number | null;
  reason: string | null;
  donationTimeType: DonationTimeType | null;
  donationTime: string | null;
  hemoglobin: number | null;
  medicalIssues: string | null;
  targetAmount: number | null;
  raisedAmount: number | null;
  bkashNagadNumber: string | null;
  isVerified: boolean;
  isApproved: boolean;
  isResolved: boolean;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  author: Pick<IUser, "id" | "email" | "contactNumber" | "role"> & {
    bloodDonor?: IBloodDonor | null;
    hospital?: IHospital | null;
    organisation?: IOrganisation | null;
  };
  _count: {
    likes: number;
    comments: number;
  };
}

// ---------- Hospital Donation Records ----------
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

// ---------- Auth ----------
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
