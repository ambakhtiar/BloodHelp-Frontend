import { z } from "zod";

// Bangladesh phone: +880 followed by 1[3-9] then 8 digits = total 14 chars
export const bdPhoneRegex = /^\+8801[3-9]\d{8}$/;

// ---------- Login Schema ----------
export const loginSchema = z.object({
  emailOrPhone: z
    .string()
    .min(1, "Email or phone number is required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

// ---------- Register Schemas ----------
const baseFields = {
  role: z.enum(["USER", "HOSPITAL", "ORGANISATION"]),
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email address"),
  contactNumber: z
    .string()
    .min(1, "Phone number is required")
    .regex(bdPhoneRegex, "Enter a valid Bangladesh phone (+8801XXXXXXXXX)"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  division: z.string().optional(),
  district: z.string().optional(),
  upazila: z.string().optional(),
};

export const registerSchema = z.discriminatedUnion("role", [
  z.object({
    ...baseFields,
    role: z.literal("USER"),
    bloodGroup: z.enum(
      ["A_POSITIVE", "A_NEGATIVE", "B_POSITIVE", "B_NEGATIVE", "AB_POSITIVE", "AB_NEGATIVE", "O_POSITIVE", "O_NEGATIVE"],
      { message: "Blood group is required" }
    ),
    gender: z.enum(["MALE", "FEMALE"], { message: "Gender is required" }),
  }),
  z.object({
    ...baseFields,
    role: z.literal("HOSPITAL"),
    registrationNumber: z.string().optional(),
    address: z.string().min(1, "Address is required"),
  }),
  z.object({
    ...baseFields,
    role: z.literal("ORGANISATION"),
    registrationNumber: z.string().optional(),
    establishedYear: z.string().optional(),
  }),
]);

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
