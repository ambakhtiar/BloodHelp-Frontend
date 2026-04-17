import { z } from "zod";

/**
 * Validation schema for recording a blood donation.
 */
export const recordDonationSchema = z.object({
  contactNumber: z
    .string({ required_error: "Contact number is required" })
    .regex(/^01[3-9]\d{8}$/, "Please enter a valid Bangladesh phone number (e.g., 01712345678)"),
  weight: z
    .number({ 
      required_error: "Weight is required",
      invalid_type_error: "Weight must be a number"
    })
    .min(45, "Donor weight must be at least 45kg to safely donate blood"),
});

export type RecordDonationFormValues = z.infer<typeof recordDonationSchema>;
