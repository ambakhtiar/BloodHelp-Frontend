import { z } from "zod";

// ── Shared Constants ─────────────────────────────────────────────────────────
const BD_PHONE_REGEX = /^\+8801[3-9]\d{8}$/;
const BKASH_NAGAD_REGEX = /^(01[3-9]\d{8}|\+8801[3-9]\d{8})$/;

const BLOOD_GROUPS = [
  "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-",
] as const;

const POST_TYPES = ["BLOOD_FINDING", "BLOOD_DONATION", "HELPING"] as const;
const DONATION_TIME_TYPES = ["EMERGENCY", "FIXED", "FLEXIBLE"] as const;

// ── Image URL Validation ─────────────────────────────────────────────────────
const imageUrlSchema = z
  .array(z.string().url("Image must be a valid URL"))
  .max(5, "Maximum 5 images are allowed")
  .optional()
  .default([]);

// ── Contact Number ───────────────────────────────────────────────────────────
const contactNumberSchema = z
  .string({ required_error: "A contact number is required", invalid_type_error: "A contact number is required" })
  .regex(BD_PHONE_REGEX, "Please provide a valid Bangladeshi phone number starting with +8801");

// ── BLOOD_FINDING Schema ─────────────────────────────────────────────────────
// Required: bloodBags, reason, contactNumber, division, district, upazila
// donationTimeType defaults to EMERGENCY
// EMERGENCY → donationTime NOT required
// FIXED → donationTime IS required
// FLEXIBLE → donationTime NOT required
const bloodFindingSchemaBase = z
  .object({
    type: z.literal("BLOOD_FINDING"),
    content: z.string().trim().optional().default(""),
    images: imageUrlSchema,
    bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]], {
      required_error: "Blood group is required",
      invalid_type_error: "Blood group is required",
    }),
    bloodBags: z.coerce
      .number({ 
        required_error: "Number of blood bags is required",
        invalid_type_error: "Number of blood bags is required"
      })
      .int("Number of blood bags must be an integer")
      .min(1, "At least 1 blood bag must be requested")
      .max(50, "Cannot request more than 50 bags at once"),
    reason: z
      .string({ 
        required_error: "Please specify the reason for needing blood",
        invalid_type_error: "Please specify the reason for needing blood"
      })
      .trim()
      .min(5, "Reason must be at least 5 characters long")
      .max(500, "Reason cannot exceed 500 characters"),
    // ⏱ EMERGENCY = 2 ঘণ্টার মধ্যে রক্ত লাগলে, অন্যথায় FIXED / FLEXIBLE ব্যবহার করুন
    donationTimeType: z
      .enum(DONATION_TIME_TYPES as unknown as [string, ...string[]], {
        required_error: "Please select a donation time type",
        invalid_type_error: "Please select a donation time type",
      })
      .default("EMERGENCY"),
    donationTime: z.string().optional().default(""),
    contactNumber: contactNumberSchema,
    location: z.string().trim().optional().default(""), // Detailed location
    division: z
      .string({ 
        required_error: "Division is required",
        invalid_type_error: "Division is required"
      })
      .trim()
      .min(1, "Division is required"),
    district: z
      .string({ 
        required_error: "District is required",
        invalid_type_error: "District is required"
      })
      .trim()
      .min(1, "District is required"),
    upazila: z
      .string({ 
        required_error: "Upazila is required",
        invalid_type_error: "Upazila is required"
      })
      .trim()
      .min(1, "Upazila is required"),
  });

const bloodFindingSchema = bloodFindingSchemaBase.refine(
    (data) => {
      // FIXED requires donationTime
      if (data.donationTimeType === "FIXED" && !data.donationTime) {
        return false;
      }
      return true;
    },
    {
      message: "Donation date & time is required when time type is FIXED",
      path: ["donationTime"],
    }
  );

// ── BLOOD_DONATION Schema ────────────────────────────────────────────────────
// Required: title, donationTime, contactNumber
// bloodGroup is optional (backend checks against user's registered blood group)
const bloodDonationSchema = z.object({
  type: z.literal("BLOOD_DONATION"),
  title: z
    .string({ 
      required_error: "Title is required for the donation post",
      invalid_type_error: "Title is required for the donation post"
    })
    .trim()
    .min(5, "Title must be at least 5 characters long")
    .max(100, "Title cannot exceed 100 characters"),
  content: z.string().trim().optional().default(""),
  images: imageUrlSchema,
  bloodGroup: z.enum(BLOOD_GROUPS as unknown as [string, ...string[]]).optional(),
  donationTime: z
    .string({ 
      required_error: "Please specify when you are available to donate",
      invalid_type_error: "Please specify when you are available to donate"
    })
    .min(1, "Please specify when you are available to donate"),
  contactNumber: contactNumberSchema,
  location: z.string().trim().optional().default(""),
  division: z.string().trim().optional().default(""),
  district: z.string().trim().optional().default(""),
  upazila: z.string().trim().optional().default(""),
});

// ── HELPING Schema ───────────────────────────────────────────────────────────
// Required: title, reason, medicalIssues, contactNumber, targetAmount, location, bkashNagadNumber
const helpingSchema = z.object({
  type: z.literal("HELPING"),
  title: z
    .string({ 
      required_error: "Campaign title is required",
      invalid_type_error: "Campaign title is required"
    })
    .trim()
    .min(5, "Title must be at least 5 characters long")
    .max(150, "Title cannot exceed 150 characters"),
  content: z.string().trim().optional().default(""),
  images: imageUrlSchema,
  reason: z
    .string({ 
      required_error: "Please specify why funds are needed",
      invalid_type_error: "Please specify why funds are needed"
    })
    .trim()
    .min(10, "Reason must be at least 10 characters long")
    .max(1000, "Reason description is too long"),
  medicalIssues: z
    .string({ 
      required_error: "Please describe the medical issues",
      invalid_type_error: "Please describe the medical issues"
    })
    .trim()
    .min(10, "Medical description must be at least 10 characters long")
    .max(2000, "Medical description is too long"),
  contactNumber: contactNumberSchema,
  targetAmount: z.coerce
    .number({ 
      required_error: "Target fund amount is required",
      invalid_type_error: "Target fund amount is required"
    })
    .min(100, "Target amount must be at least 100 BDT"),
  location: z
    .string({ 
      required_error: "Patient location/hospital name is required",
      invalid_type_error: "Patient location/hospital name is required"
    })
    .trim()
    .min(3, "Location description must be at least 3 characters"),
  bkashNagadNumber: z
    .string({ 
      required_error: "bKash/Nagad number is required for receiving funds",
      invalid_type_error: "bKash/Nagad number is required for receiving funds"
    })
    .regex(BKASH_NAGAD_REGEX, "Please provide a valid Bangladeshi mobile banking number")
    .trim(),
  division: z.string().trim().optional().default(""),
  district: z.string().trim().optional().default(""),
  upazila: z.string().trim().optional().default(""),
});

// ── Discriminated Union ──────────────────────────────────────────────────────
export const createPostSchema = z.discriminatedUnion("type", [
  bloodFindingSchemaBase,
  bloodDonationSchema,
  helpingSchema,
]).superRefine((data, ctx) => {
  if (data.type === "BLOOD_FINDING") {
    // FIXED requires donationTime
    if (data.donationTimeType === "FIXED" && !data.donationTime) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Donation date & time is required when time type is FIXED",
        path: ["donationTime"],
      });
    }
  }
});

export type CreatePostFormValues = z.infer<typeof createPostSchema>;
