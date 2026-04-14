import { z } from "zod";

const bloodGroupValues = [
  "A_POSITIVE", "A_NEGATIVE",
  "B_POSITIVE", "B_NEGATIVE",
  "AB_POSITIVE", "AB_NEGATIVE",
  "O_POSITIVE", "O_NEGATIVE",
] as const;

const genderValues = ["MALE", "FEMALE"] as const;

export const addVolunteerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  contactNumber: z
    .string()
    .regex(/^(\+88)?01[3-9]\d{8}$/, "Valid BD contact number is required"),
  bloodGroup: z.enum(bloodGroupValues, {
    errorMap: () => ({ message: "Blood group is required" }),
  }),
  gender: z.enum(genderValues, {
    errorMap: () => ({ message: "Gender is required" }),
  }),
  lastDonationDate: z.string().optional(),
  isAvailable: z.boolean().default(true),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
});

export const updateDonationDateSchema = z.object({
  donationDate: z.string().min(1, "Donation date is required"),
});

export type AddVolunteerInput = z.infer<typeof addVolunteerSchema>;
export type UpdateDonationDateInput = z.infer<typeof updateDonationDateSchema>;
