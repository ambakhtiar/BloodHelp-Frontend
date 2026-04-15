import { z } from "zod";
import { bdPhoneRegex } from "./auth.validation";

export const createAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  contactNumber: z
    .string()
    .regex(bdPhoneRegex, "Enter a valid Bangladesh phone (+8801XXXXXXXXX)"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  division: z.string().min(1, "Division is required"),
  district: z.string().min(1, "District is required"),
  upazila: z.string().min(1, "Upazila is required"),
});

export const updateAdminSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  contactNumber: z
    .string()
    .regex(bdPhoneRegex, "Enter a valid Bangladesh phone (+8801XXXXXXXXX)")
    .optional(),
  email: z.string().email("Enter a valid email address").optional(),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
});

export type CreateAdminFormValues = z.infer<typeof createAdminSchema>;
export type UpdateAdminFormValues = z.infer<typeof updateAdminSchema>;
