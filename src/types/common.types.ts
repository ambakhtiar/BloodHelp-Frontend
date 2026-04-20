export type UserRole = "SUPER_ADMIN" | "ADMIN" | "HOSPITAL" | "ORGANISATION" | "USER";

export type AccountStatus = "PENDING" | "ACTIVE" | "BLOCKED" | "REJECTED";

export type Gender = "MALE" | "FEMALE";

export const BloodGroup = {
  A_POSITIVE: "A_POSITIVE",
  A_NEGATIVE: "A_NEGATIVE",
  B_POSITIVE: "B_POSITIVE",
  B_NEGATIVE: "B_NEGATIVE",
  AB_POSITIVE: "AB_POSITIVE",
  AB_NEGATIVE: "AB_NEGATIVE",
  O_POSITIVE: "O_POSITIVE",
  O_NEGATIVE: "O_NEGATIVE",
} as const;
export type BloodGroup = typeof BloodGroup[keyof typeof BloodGroup];

export const PostType = {
  BLOOD_FINDING: "BLOOD_FINDING",
  BLOOD_DONATION: "BLOOD_DONATION",
  HELPING: "HELPING",
} as const;
export type PostType = typeof PostType[keyof typeof PostType];

export const DonationTimeType = {
  EMERGENCY: "EMERGENCY",
  FIXED: "FIXED",
  FLEXIBLE: "FLEXIBLE",
} as const;
export type DonationTimeType = typeof DonationTimeType[keyof typeof DonationTimeType];

export type RequestStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "CANCELLED";

export type PaymentStatus = "PENDING" | "SUCCESS" | "FAILED" | "CANCELLED";

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
