import { BloodGroup, PostType, DonationTimeType } from "./common.types";
export { BloodGroup, PostType, DonationTimeType };
import { IUser, IBloodDonor, IHospital, IOrganisation } from "./user.types";


// ── Display Maps ─────────────────────────────────────────────────────────────
export const bloodGroupDisplayMap: Record<BloodGroup, string> = {
  [BloodGroup.A_POSITIVE]: "A+",
  [BloodGroup.A_NEGATIVE]: "A-",
  [BloodGroup.B_POSITIVE]: "B+",
  [BloodGroup.B_NEGATIVE]: "B-",
  [BloodGroup.AB_POSITIVE]: "AB+",
  [BloodGroup.AB_NEGATIVE]: "AB-",
  [BloodGroup.O_POSITIVE]: "O+",
  [BloodGroup.O_NEGATIVE]: "O-",
};

// Backend accepts friendly format like "O+", this maps to enum
export const bloodGroupInputMap: Record<string, string> = {
  "A+": "A_POSITIVE",
  "A-": "A_NEGATIVE",
  "B+": "B_POSITIVE",
  "B-": "B_NEGATIVE",
  "AB+": "AB_POSITIVE",
  "AB-": "AB_NEGATIVE",
  "O+": "O_POSITIVE",
  "O-": "O_NEGATIVE",
};

export const postTypeDisplayMap: Record<PostType, string> = {
  [PostType.BLOOD_FINDING]: "🩸 Blood Finding",
  [PostType.BLOOD_DONATION]: "💉 Blood Donation",
  [PostType.HELPING]: "🤝 Financial Help",
};

// ── Payload Interfaces ───────────────────────────────────────────────────────
export interface ICreatePostPayload {
  type: PostType;
  title?: string;
  content?: string;
  images?: string[];
  contactNumber: string;
  location?: string;
  division?: string;
  district?: string;
  upazila?: string;
  area?: string;
  bloodGroup?: string; // Sent as "O+" format — backend transforms
  bloodBags?: number;
  reason?: string;
  donationTimeType?: DonationTimeType;
  donationTime?: string; // ISO 8601 string
  medicalIssues?: string;
  targetAmount?: number;
  bkashNagadNumber?: string;
}

export interface IPostResponse {
  success: boolean;
  statusCode: number;
  message: string;
  data: {
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
    bloodGroup: string | null;
    bloodBags: number | null;
    reason: string | null;
    donationTimeType: DonationTimeType | null;
    donationTime: string | null;
    medicalIssues: string | null;
    targetAmount: number | null;
    raisedAmount: number;
    bkashNagadNumber: string | null;
    isVerified: boolean;
    isApproved: boolean;
    isResolved: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
  };
}

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
