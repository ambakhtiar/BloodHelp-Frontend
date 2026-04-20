"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, Clock, Heart, HandHelping, MapPin, Search, UserCheck, UserX } from "lucide-react";
import ImageUploader from "@/components/shared/ImageUploader";
import { createPostSchema, type CreatePostFormValues } from "@/validations/post.validation";
import { createPost, checkDonorByPhone } from "@/services/post.service";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";
import { toastApiError } from "@/lib/parseApiError";

// ── Styling Classes (consistent with RegisterForm) ───────────────────────────
const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 transition-colors";

const textareaClass =
  "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-none";

const COUNTRY_CODE = "+880";

const BLOOD_GROUPS = [
  { value: "O+", label: "O+" },
  { value: "O-", label: "O-" },
  { value: "A+", label: "A+" },
  { value: "A-", label: "A-" },
  { value: "B+", label: "B+" },
  { value: "B-", label: "B-" },
  { value: "AB+", label: "AB+" },
  { value: "AB-", label: "AB-" },
];

// ── Form State ───────────────────────────────────────────────────────────────
interface FormState {
  type: "BLOOD_FINDING" | "BLOOD_DONATION" | "HELPING";
  title: string;
  content: string;
  images: string[];
  phone: string;
  location: string;
  division: string;
  district: string;
  upazila: string;
  bloodGroup: string;
  bloodBags: string;
  reason: string;
  donationTimeType: "EMERGENCY" | "FIXED" | "FLEXIBLE";
  donationTime: string;
  medicalIssues: string;
  targetAmount: string;
  bkashNagadNumber: string;
  // Donor fields (for BLOOD_DONATION when posting for someone else)
  donorName: string;
  donorBloodGroup: string;
  donorGender: string;
}

const initialForm: FormState = {
  type: "BLOOD_FINDING",
  title: "",
  content: "",
  images: [],
  phone: "",
  location: "",
  division: "",
  district: "",
  upazila: "",
  bloodGroup: "",
  bloodBags: "",
  reason: "",
  donationTimeType: "EMERGENCY",
  donationTime: "",
  medicalIssues: "",
  targetAmount: "",
  bkashNagadNumber: "",
  donorName: "",
  donorBloodGroup: "",
  donorGender: "",
};

// ── Helper Components ────────────────────────────────────────────────────────
function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-destructive mt-1">{message}</p>;
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-t pt-4 mt-2">
      {icon}
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function CreatePostForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthContext();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const [donationTarget, setDonationTarget] = useState<"SELF" | "OTHER">("SELF");

  // ── Donor Lookup State (for BLOOD_DONATION OTHER mode) ────────────────────
  const [donorSearchInput, setDonorSearchInput] = useState(""); // raw digits user types
  const [donorLookupPhone, setDonorLookupPhone] = useState(""); // full phone number that triggers query

  // ── Donor Lookup Query (enabled only when donorLookupPhone is set) ──────────
  const {
    data: donorLookupData,
    isFetching: isSearchingDonor,
    isSuccess: donorSearchDone,
  } = useQuery({
    queryKey: ["checkDonor", donorLookupPhone],
    queryFn: () => checkDonorByPhone(donorLookupPhone),
    enabled: !!donorLookupPhone,
    staleTime: 0,
    retry: false,
  });

  const donorInfo = donorSearchDone ? donorLookupData?.data : null;

  // ── Location Cascading ───────────────────────────────────────────────────
  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(
    () => (form.division ? getDistricts(form.division) : []),
    [form.division]
  );
  const upazilas = useMemo(
    () => (form.division && form.district ? getUpazilas(form.division, form.district) : []),
    [form.division, form.district]
  );

  // ── Build Payload ────────────────────────────────────────────────────────
  const buildPayload = useCallback(() => {
    const contactNumber = form.phone ? `${COUNTRY_CODE}${form.phone}` : "";

    const base: Record<string, unknown> = {
      type: form.type,
      content: form.content,
      images: form.images.filter((url) => url.trim() !== ""),
      contactNumber,
      location: form.location,
      division: form.division,
      district: form.district,
      upazila: form.upazila,
    };

    if (form.type === "BLOOD_FINDING") {
      base.bloodGroup = form.bloodGroup;
      base.bloodBags = form.bloodBags ? Number(form.bloodBags) : undefined;
      base.reason = form.reason;
      base.donationTimeType = form.donationTimeType;
      if (form.donationTimeType !== "EMERGENCY" && form.donationTime) {
        base.donationTime = new Date(form.donationTime).toISOString();
      }
    } else if (form.type === "BLOOD_DONATION") {
      base.title = form.title;
      base.isForSelf = donationTarget === "SELF";

      if (donationTarget === "SELF") {
        // Backend reads blood group / gender / phone from user's donor profile
      } else {
        // Posting for someone else
        const fullDonorPhone = donorSearchInput ? `${COUNTRY_CODE}${donorSearchInput}` : "";
        base.donorContactNumber = fullDonorPhone;

        if (donorInfo && !donorInfo.found) {
          // B-1: manual input needed
          base.donorName = form.donorName;
          base.donorBloodGroup = form.donorBloodGroup;
          base.donorGender = form.donorGender;
        }
        // B-2/B-3: backend reads info from existing BloodDonor/User by phone
      }

      if (form.donationTime) {
        base.donationTime = new Date(form.donationTime).toISOString();
      }
    } else if (form.type === "HELPING") {
      base.title = form.title;
      base.reason = form.reason;
      base.medicalIssues = form.medicalIssues;
      base.targetAmount = form.targetAmount ? Number(form.targetAmount) : undefined;
      base.bkashNagadNumber = form.bkashNagadNumber;
    }

    return base;
  }, [form, donationTarget, donorSearchInput, donorInfo]);

  // ── Validation ───────────────────────────────────────────────────────────
  const validateField = useCallback(
    (fieldName: string) => {
      const payload = buildPayload();
      const result = createPostSchema.safeParse(payload);
      if (!result.success) {
        const err = result.error.issues.find((i) => {
          const path = String(i.path[0]);
          return path === fieldName;
        });
        if (err) {
          setErrors((p) => ({ ...p, [fieldName]: err.message }));
        } else {
          setErrors((p) => {
            const n = { ...p };
            delete n[fieldName];
            return n;
          });
        }
      } else {
        setErrors((p) => {
          const n = { ...p };
          delete n[fieldName];
          return n;
        });
      }
    },
    [buildPayload]
  );

  const handleChange = useCallback(
    (name: keyof FormState, value: string | string[]) => {
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        // Reset cascading location fields
        if (name === "division") {
          next.district = "";
          next.upazila = "";
        }
        if (name === "district") {
          next.upazila = "";
        }
        // Reset type-specific fields when switching type
        if (name === "type") {
          next.title = "";
          next.bloodGroup = "";
          next.bloodBags = "";
          next.reason = "";
          next.donationTimeType = "EMERGENCY";
          next.donationTime = "";
          next.medicalIssues = "";
          next.targetAmount = "";
          next.bkashNagadNumber = "";
          next.donorName = "";
          next.donorBloodGroup = "";
          next.donorGender = "";
          setErrors({});
          setTouched({});
          setDonorSearchInput("");
          setDonorLookupPhone("");
        }
        return next;
      });
      const zodName = name === "phone" ? "contactNumber" : name;
      if (touched[zodName]) {
        setTimeout(() => validateField(zodName as string), 0);
      }
    },
    [touched, validateField]
  );

  const handleBlur = useCallback(
    (name: string) => {
      const zodName = name === "phone" ? "contactNumber" : name;
      setTouched((p) => ({ ...p, [zodName]: true }));
      validateField(zodName);
    },
    [validateField]
  );
  
  // Effect to auto-fill contact number when "SELF" is selected
  useEffect(() => {
    if (form.type === "BLOOD_DONATION" && user?.role === "USER" && donationTarget === "SELF" && user?.contactNumber) {
      let digits = user.contactNumber.replace(/\D/g, "");
      if (digits.startsWith("880")) digits = digits.substring(3);
      else if (digits.startsWith("88")) digits = digits.substring(2);
      else if (digits.startsWith("8")) digits = digits.substring(1);
      if (digits.startsWith("0")) digits = digits.substring(1);
      digits = digits.slice(0, 10);
      if (form.phone !== digits) {
        handleChange("phone", digits);
      }
    }
  }, [form.type, user, donationTarget, handleChange]);

  // ── Image limit ────────────────────────────────────────────────────────────
  const MAX_IMAGES = 3;

  // ── Mutation ─────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      return createPost(payload as any);
    },
    onSuccess: () => {
      toast.success("Post created successfully! 🎉");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      router.push("/feed");
    },
    onError: (error: unknown) => {
      toastApiError(error, "Failed to create post. Please try again.");
    },
  });

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const payload = { ...buildPayload(), images: form.images.filter(url => url.trim() !== "") };
    const result = createPostSchema.safeParse(payload);

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      const allTouched: Record<string, boolean> = {};
      result.error.issues.forEach((i) => {
        const k = String(i.path[0]);
        if (!fieldErrors[k]) fieldErrors[k] = i.message;
        allTouched[k] = true;
      });
      setErrors(fieldErrors);
      setTouched((p) => ({ ...p, ...allTouched }));
      toast.error("Please fix the errors in the form.");
      return;
    }

    // Clean payload — remove empty optional fields
    const cleanPayload: Record<string, unknown> = {};
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        // Handle empty strings for string types with explicit narrowing/casting
        if (typeof value === "string" && (value as string).trim() === "") return;
        
        // Don't send empty arrays
        if (Array.isArray(value) && value.length === 0) return;
        
        cleanPayload[key] = value;
      }
    });

    mutation.mutate(cleanPayload);
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {/* ════════════════ Post Type Selection ════════════════ */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">
            Post Type <RequiredMark />
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                value: "BLOOD_FINDING",
                label: "🩸 Blood Finding",
                desc: "I need blood urgently",
              },
              {
                value: "BLOOD_DONATION",
                label: "💉 Blood Donation",
                desc: "I want to donate blood",
              },
              {
                value: "HELPING",
                label: "🤝 Financial Help",
                desc: "I need financial support",
              },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleChange("type", option.value)}
                className={`relative p-4 rounded-lg border-2 transition-all duration-200 text-left cursor-pointer hover:shadow-md ${
                  form.type === option.value
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-muted hover:border-muted-foreground/30"
                }`}
              >
                <p className="font-semibold text-sm">{option.label}</p>
                <p className="text-xs text-muted-foreground mt-1">{option.desc}</p>
                {form.type === option.value && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ════════════════ BLOOD_FINDING Fields ════════════════ */}
        {form.type === "BLOOD_FINDING" && (
          <>
            <div className="sm:col-span-2">
              <SectionDivider title="Blood Request Details" icon={<Heart className="w-4 h-4 text-primary" />} />
            </div>

            {/* Blood Group */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Blood Group <RequiredMark />
              </label>
              <select
                value={form.bloodGroup}
                onChange={(e) => handleChange("bloodGroup", e.target.value)}
                onBlur={() => handleBlur("bloodGroup")}
                className={selectClass}
              >
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg.value} value={bg.value}>
                    {bg.label}
                  </option>
                ))}
              </select>
              <FieldError message={touched.bloodGroup ? errors.bloodGroup : undefined} />
            </div>

            {/* Blood Bags */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Number of Bags <RequiredMark />
              </label>
              <input
                type="number"
                placeholder="e.g. 2"
                value={form.bloodBags}
                onChange={(e) => handleChange("bloodBags", e.target.value)}
                onBlur={() => handleBlur("bloodBags")}
                className={inputClass}
                min={1}
                max={50}
              />
              <FieldError message={touched.bloodBags ? errors.bloodBags : undefined} />
            </div>

            {/* Reason */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Reason <RequiredMark />
              </label>
              <textarea
                placeholder="e.g. Emergency Heart Surgery"
                value={form.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                onBlur={() => handleBlur("reason")}
                className={textareaClass}
                rows={2}
              />
              <FieldError message={touched.reason ? errors.reason : undefined} />
            </div>

            {/* Donation Time Type */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Urgency Level <RequiredMark />
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {[
                  {
                    value: "EMERGENCY",
                    label: "🚨 Emergency",
                    desc: "Within 2 hours",
                  },
                  {
                    value: "FIXED",
                    label: "📅 Fixed Time",
                    desc: "Specific date & time",
                  },
                  {
                    value: "FLEXIBLE",
                    label: "🕐 Flexible",
                    desc: "Anytime soon",
                  },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleChange("donationTimeType", opt.value)}
                    className={`p-3 rounded-lg border text-left transition-all duration-200 cursor-pointer ${
                      form.donationTimeType === opt.value
                        ? "border-primary bg-primary/5"
                        : "border-muted hover:border-muted-foreground/30"
                    }`}
                  >
                    <p className="font-medium text-sm">{opt.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{opt.desc}</p>
                  </button>
                ))}
              </div>

              {/* Helper text for EMERGENCY */}
              {form.donationTimeType === "EMERGENCY" && (
                <div className="flex items-start gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg mt-2">
                  <AlertTriangle className="w-4 h-4 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-destructive">
                    ২ ঘণ্টার মধ্যে রক্ত লাগলে <strong>Emergency</strong> নির্বাচন করুন। অন্যথায়{" "}
                    <strong>Fixed Time</strong> বা <strong>Flexible</strong> ব্যবহার করুন।
                  </p>
                </div>
              )}

              {/* Date Time Picker for FIXED */}
              {form.donationTimeType === "FIXED" && (
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium">
                    Donation Date & Time <RequiredMark />
                  </label>
                  <input
                    type="datetime-local"
                    value={form.donationTime}
                    onChange={(e) => handleChange("donationTime", e.target.value)}
                    onBlur={() => handleBlur("donationTime")}
                    className={inputClass}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                  <FieldError message={touched.donationTime ? errors.donationTime : undefined} />
                </div>
              )}

              {/* Date Time Picker for FLEXIBLE (optional) */}
              {form.donationTimeType === "FLEXIBLE" && (
                <div className="space-y-2 mt-2">
                  <label className="text-sm font-medium">
                    Preferred Date & Time <span className="text-muted-foreground text-xs">(optional)</span>
                  </label>
                  <input
                    type="datetime-local"
                    value={form.donationTime}
                    onChange={(e) => handleChange("donationTime", e.target.value)}
                    className={inputClass}
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>
              )}
            </div>
          </>
        )}

        {/* ════════════════ BLOOD_DONATION Fields ════════════════ */}
        {form.type === "BLOOD_DONATION" && (
          <>
            <div className="sm:col-span-2">
              <SectionDivider title="Donation Details" icon={<Heart className="w-4 h-4 text-primary" />} />
            </div>

            {/* ── Target Selection: only for USER role ── */}
            {user?.role === "USER" && (
              <div className="space-y-2 sm:col-span-2">
                <label className="text-sm font-medium">
                  এই পোস্ট কার জন্য? <RequiredMark />
                </label>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setDonationTarget("SELF");
                      setDonorSearchInput("");
                      setDonorLookupPhone("");
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all cursor-pointer hover:shadow-sm ${
                      donationTarget === "SELF" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-muted text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    🙋 For Myself
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setDonationTarget("OTHER");
                      handleChange("phone", "");
                    }}
                    className={`flex-1 py-2.5 px-4 rounded-lg border text-sm font-medium transition-all cursor-pointer hover:shadow-sm ${
                      donationTarget === "OTHER" ? "border-primary bg-primary/10 text-primary shadow-sm" : "border-muted text-muted-foreground hover:bg-muted/50"
                    }`}
                  >
                    👥 For Someone Else
                  </button>
                </div>
              </div>
            )}

            {/* ── SELF mode: informational callout ── */}
            {(donationTarget === "SELF" || user?.role !== "USER") && user?.role === "USER" && (
              <div className="sm:col-span-2 flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-lg">
                <UserCheck className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-medium text-primary">Your profile information will be used</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Blood group, gender and contact number will be taken automatically from your registered profile.</p>
                </div>
              </div>
            )}

            {/* ── OTHER mode: Donor phone lookup ── */}
            {(donationTarget === "OTHER" || user?.role === "HOSPITAL" || user?.role === "ORGANISATION") && (
              <div className="sm:col-span-2 space-y-4">
                {/* Phone search row */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Donor&apos;s Phone Number <RequiredMark />
                  </label>
                  <div className="flex gap-2">
                    <div className="flex flex-1">
                      <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none">
                        🇧🇩 {COUNTRY_CODE}
                      </div>
                      <input
                        type="tel"
                        placeholder="1XXXXXXXXX"
                        value={donorSearchInput}
                        onChange={(e) => {
                          let digits = e.target.value.replace(/\D/g, "");
                          if (digits.startsWith("880")) digits = digits.substring(3);
                          else if (digits.startsWith("88")) digits = digits.substring(2);
                          else if (digits.startsWith("8")) digits = digits.substring(1);
                          if (digits.startsWith("0")) digits = digits.substring(1);
                          digits = digits.slice(0, 10);
                          setDonorSearchInput(digits);
                          // Reset previous lookup if phone changes
                          if (donorLookupPhone) setDonorLookupPhone("");
                        }}
                        className={`${inputClass} rounded-l-none`}
                        maxLength={10}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="h-10 px-4 gap-2 shrink-0"
                      disabled={donorSearchInput.length < 10 || isSearchingDonor}
                      onClick={() => setDonorLookupPhone(`${COUNTRY_CODE}${donorSearchInput}`)}
                    >
                      {isSearchingDonor ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Search className="w-4 h-4" />
                      )}
                      Search
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">10-digit number, e.g. 1XXXXXXXXX</p>
                </div>

                {/* Donor found (B-2 or B-3) */}
                {donorInfo && donorInfo.found && (
                  <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800/40 rounded-lg">
                    <UserCheck className="w-5 h-5 text-green-600 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-green-700 dark:text-green-400">✅ Donor Found!</p>
                      <div className="mt-1.5 grid grid-cols-3 gap-2 text-xs">
                        <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                          👤 {donorInfo.name || "—"}
                        </span>
                        <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                          🩸 {donorInfo.bloodGroup || "—"}
                        </span>
                        <span className="bg-white dark:bg-green-900/20 rounded px-2 py-1 border border-green-200 dark:border-green-800/30 font-medium">
                          {donorInfo.gender === "FEMALE" ? "♀️ Female" : "♂️ Male"}
                        </span>
                      </div>
                      {donorInfo.type === "platform_user" && (
                        <p className="text-[10px] text-green-600 mt-1.5">Platform user — they will receive a consent notification.</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Donor NOT found (B-1) — manual input */}
                {donorInfo && !donorInfo.found && (
                  <div className="space-y-4 p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <UserX className="w-4 h-4 text-amber-600" />
                      <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
                        Donor not registered — please enter details manually
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Donor Name */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Donor Name <RequiredMark /></label>
                        <input
                          type="text"
                          placeholder="Full Name"
                          value={form.donorName}
                          onChange={(e) => handleChange("donorName", e.target.value)}
                          className={inputClass}
                        />
                      </div>
                      {/* Blood Group */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Blood Group <RequiredMark /></label>
                        <select
                          value={form.donorBloodGroup}
                          onChange={(e) => handleChange("donorBloodGroup", e.target.value)}
                          className={selectClass}
                        >
                          <option value="">Select</option>
                          {BLOOD_GROUPS.map((bg) => (
                            <option key={bg.value} value={bg.value}>{bg.label}</option>
                          ))}
                        </select>
                      </div>
                      {/* Gender */}
                      <div className="space-y-1">
                        <label className="text-xs font-medium">Gender <RequiredMark /></label>
                        <select
                          value={form.donorGender}
                          onChange={(e) => handleChange("donorGender", e.target.value)}
                          className={selectClass}
                        >
                          <option value="">Select</option>
                          <option value="MALE">Male</option>
                          <option value="FEMALE">Female</option>
                        </select>
                      </div>
                    </div>
                    {/* B-1: Contact Number (required for unregistered donor) */}
                    <div className="space-y-1">
                      <label className="text-xs font-medium">Donor Contact Number <RequiredMark /></label>
                      <p className="text-[10px] text-muted-foreground">Used to identify this donor if they register later.</p>
                    </div>
                    {/* B-1: Location (required) */}
                    <div className="space-y-2">
                      <p className="text-xs font-medium flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" /> Donor Location <RequiredMark />
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {/* Division */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Division</label>
                          <select
                            value={form.division}
                            onChange={(e) => handleChange("division", e.target.value)}
                            className={selectClass}
                          >
                            <option value="">Select Division</option>
                            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        {/* District */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">District</label>
                          <select
                            value={form.district}
                            onChange={(e) => handleChange("district", e.target.value)}
                            className={selectClass}
                            disabled={!form.division}
                          >
                            <option value="">{form.division ? "Select District" : "Select division first"}</option>
                            {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                          </select>
                        </div>
                        {/* Upazila */}
                        <div className="space-y-1">
                          <label className="text-[10px] text-muted-foreground">Upazila</label>
                          <select
                            value={form.upazila}
                            onChange={(e) => handleChange("upazila", e.target.value)}
                            className={selectClass}
                            disabled={!form.district}
                          >
                            <option value="">{form.district ? "Select Upazila" : "Select district first"}</option>
                            {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt to search first */}
                {!donorInfo && !isSearchingDonor && !donorLookupPhone && (
                  <p className="text-xs text-muted-foreground italic">
                    Enter donor&apos;s phone number and click &quot;Search&quot; to look them up.
                  </p>
                )}
              </div>
            )}

            {/* ── Post Title ── */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Post Title <span className="text-muted-foreground text-xs">(optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. I donated blood — a life was saved"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                className={inputClass}
              />
              <FieldError message={touched.title ? errors.title : undefined} />
            </div>

            {/* ── Donation Date (today or past only) ── */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Donation Date <RequiredMark />
              </label>
              <input
                type="datetime-local"
                value={form.donationTime}
                onChange={(e) => handleChange("donationTime", e.target.value)}
                onBlur={() => handleBlur("donationTime")}
                className={inputClass}
                max={new Date().toISOString().slice(0, 16)}
              />
              <p className="text-xs text-muted-foreground">When did the donation happen? Date must be today or in the past.</p>
              <FieldError message={touched.donationTime ? errors.donationTime : undefined} />
            </div>
          </>
        )}

        {/* ════════════════ HELPING Fields ════════════════ */}
        {form.type === "HELPING" && (
          <>
            <div className="sm:col-span-2">
              <SectionDivider title="Campaign Details" icon={<HandHelping className="w-4 h-4 text-primary" />} />
            </div>

            {/* Title */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Campaign Title <RequiredMark />
              </label>
              <input
                type="text"
                placeholder="e.g. Cancer Treatment Fund"
                value={form.title}
                onChange={(e) => handleChange("title", e.target.value)}
                onBlur={() => handleBlur("title")}
                className={inputClass}
              />
              <FieldError message={touched.title ? errors.title : undefined} />
            </div>

            {/* Reason */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Why Funds Are Needed <RequiredMark />
              </label>
              <textarea
                placeholder="e.g. Seeking financial aid for chemotherapy"
                value={form.reason}
                onChange={(e) => handleChange("reason", e.target.value)}
                onBlur={() => handleBlur("reason")}
                className={textareaClass}
                rows={2}
              />
              <FieldError message={touched.reason ? errors.reason : undefined} />
            </div>

            {/* Medical Issues */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">
                Medical Issues / Diagnosis <RequiredMark />
              </label>
              <textarea
                placeholder="e.g. Stage 3 Lymphoma"
                value={form.medicalIssues}
                onChange={(e) => handleChange("medicalIssues", e.target.value)}
                onBlur={() => handleBlur("medicalIssues")}
                className={textareaClass}
                rows={2}
              />
              <FieldError message={touched.medicalIssues ? errors.medicalIssues : undefined} />
            </div>

            {/* Target Amount */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Target Amount (BDT) <RequiredMark />
              </label>
              <input
                type="number"
                placeholder="e.g. 200000"
                value={form.targetAmount}
                onChange={(e) => handleChange("targetAmount", e.target.value)}
                onBlur={() => handleBlur("targetAmount")}
                className={inputClass}
                min={100}
              />
              <FieldError message={touched.targetAmount ? errors.targetAmount : undefined} />
            </div>

            {/* bKash/Nagad Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                bKash/Nagad Number <RequiredMark />
              </label>
              <input
                type="text"
                placeholder="e.g. 01800000001"
                value={form.bkashNagadNumber}
                onChange={(e) => handleChange("bkashNagadNumber", e.target.value)}
                onBlur={() => handleBlur("bkashNagadNumber")}
                className={inputClass}
              />
              <FieldError message={touched.bkashNagadNumber ? errors.bkashNagadNumber : undefined} />
            </div>
          </>
        )}

        {/* ════════════════ Common Fields ════════════════ */}
        <div className="sm:col-span-2">
          <SectionDivider title="Contact & Location" icon={<Clock className="w-4 h-4 text-primary" />} />
        </div>

        {/* Combined Row for Contact and Detailed Location */}
        <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Phone Number */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contact Number{" "}
              {form.type === "BLOOD_DONATION" && donorInfo && !donorInfo.found
                ? <RequiredMark />
                : <span className="text-muted-foreground text-xs">(optional)</span>}
            </label>
            <div className="flex">
              <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none">
                🇧🇩 {COUNTRY_CODE}
              </div>
              <input
                type="tel"
                placeholder="1XXXXXXXXX"
                value={form.phone}
                disabled={form.type === "BLOOD_DONATION" && user?.role === "USER" && donationTarget === "SELF"}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, "");
                  if (digits.startsWith("880")) digits = digits.substring(3);
                  else if (digits.startsWith("88")) digits = digits.substring(2);
                  else if (digits.startsWith("8")) digits = digits.substring(1);
                  if (digits.startsWith("0")) digits = digits.substring(1);
                  digits = digits.slice(0, 10);
                  handleChange("phone", digits);
                }}
                onBlur={() => handleBlur("phone")}
                className={`${inputClass} rounded-l-none`}
                maxLength={10}
              />
            </div>
            {form.type === "BLOOD_DONATION" && user?.role === "USER" && donationTarget === "SELF" && (
              <p className="text-[10px] text-muted-foreground mt-1">This is your registered contact number.</p>
            )}
            <FieldError message={touched.contactNumber ? errors.contactNumber : undefined} />
          </div>

          {/* Detailed Location */}
          <div className="space-y-1">
            <label className="text-sm font-medium">
              Detailed Location{" "}
              {form.type === "HELPING" ? <RequiredMark /> : <span className="text-muted-foreground text-xs">(optional — like Hospital, Ward)</span>}
            </label>
            <input
              type="text"
              placeholder="e.g. DMCH, Ward 5"
              value={form.location}
              onChange={(e) => handleChange("location", e.target.value)}
              onBlur={() => handleBlur("location")}
              className={inputClass}
            />
            <FieldError message={touched.location ? errors.location : undefined} />
          </div>
        </div>

        {/* Content / Description */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">
            Description{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <textarea
            placeholder="Add additional details about your post..."
            value={form.content}
            onChange={(e) => handleChange("content", e.target.value)}
            className={textareaClass}
            rows={3}
          />
        </div>

        {/* ════════════════ Location Cascading Sections (Division/District/Upazila) ════════════════ */}
        <div className="space-y-3 sm:col-span-2 border-t pt-4 mt-1 bg-muted/5 p-4 rounded-xl border border-dashed border-primary/10">
          <p className="text-sm font-bold flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary" />
            Area Selection
            {(form.type === "BLOOD_FINDING" || (form.type === "BLOOD_DONATION" && donorInfo && !donorInfo.found))
              ? <RequiredMark />
              : <span className="text-muted-foreground text-[10px] font-normal uppercase tracking-wider">(optional)</span>}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Division */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Division</label>
              <select
                value={form.division}
                onChange={(e) => handleChange("division", e.target.value)}
                onBlur={() => handleBlur("division")}
                className={selectClass}
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <FieldError message={touched.division ? errors.division : undefined} />
            </div>

            {/* District */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">District</label>
              <select
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                disabled={!form.division}
                onBlur={() => handleBlur("district")}
                className={selectClass}
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              <FieldError message={touched.district ? errors.district : undefined} />
            </div>

            {/* Upazila */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Upazila</label>
              <select
                value={form.upazila}
                onChange={(e) => handleChange("upazila", e.target.value)}
                disabled={!form.district}
                onBlur={() => handleBlur("upazila")}
                className={selectClass}
              >
                <option value="">Select Upazila</option>
                {upazilas.map((u) => (
                  <option key={u} value={u}>
                    {u}
                  </option>
                ))}
              </select>
              <FieldError message={touched.upazila ? errors.upazila : undefined} />
            </div>
          </div>
        </div>

        {/* ════════════════ Images Section ════════════════ */}
        <div className="space-y-3 sm:col-span-2 border-t pt-4 mt-1">
          <p className="text-sm font-medium">
            Images{" "}
            <span className="text-muted-foreground text-xs">(optional · max {MAX_IMAGES})</span>
          </p>
          <ImageUploader
            value={form.images}
            onChange={(urls) => setForm((prev) => ({ ...prev, images: urls }))}
            disabled={mutation.isPending}
          />
        </div>
      </div>

      {/* ════════════════ Submit Button ════════════════ */}
      <Button
        type="submit"
        className="w-full h-12 text-base font-semibold"
        disabled={mutation.isPending}
      >
        {mutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
        {mutation.isPending ? "Creating Post..." : "Create Post"}
      </Button>
    </form>
  );
}
