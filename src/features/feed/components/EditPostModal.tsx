"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, X, AlertTriangle, Clock, Heart, HandHelping, MapPin } from "lucide-react";
import { createPostSchema } from "@/validations/post.validation";
import { updatePost } from "@/services/post.service";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ── Styling Classes ───────────────────────────────────────────────────────────
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

interface EditPostModalProps {
  post: any;
  isOpen: boolean;
  onClose: () => void;
}

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
  bloodGroup: string | undefined;
  bloodBags: string;
  reason: string;
  donationTimeType: "EMERGENCY" | "FIXED" | "FLEXIBLE";
  donationTime: string;
  medicalIssues: string;
  targetAmount: string;
  bkashNagadNumber: string;
}

export function EditPostModal({ post, isOpen, onClose }: EditPostModalProps) {
  const queryClient = useQueryClient();
  
  // Initialize form with post data
  const [form, setForm] = useState<FormState>(() => {
    let rawPhone = post.contactNumber || "";
    if (rawPhone.startsWith(COUNTRY_CODE)) {
      rawPhone = rawPhone.substring(COUNTRY_CODE.length);
    }

    return {
      type: post.type,
      title: post.title || "",
      content: post.content || "",
      images: post.images || [],
      phone: rawPhone,
      location: post.location || "",
      division: post.division || "",
      district: post.district || "",
      upazila: post.upazila || "",
      bloodGroup: post.bloodGroup || "",
      bloodBags: post.bloodBags?.toString() || "",
      reason: post.reason || "",
      donationTimeType: post.donationTimeType || "EMERGENCY",
      donationTime: post.donationTime ? new Date(post.donationTime).toISOString().slice(0, 16) : "",
      medicalIssues: post.medicalIssues || "",
      targetAmount: post.targetAmount?.toString() || "",
      bkashNagadNumber: post.bkashNagadNumber || "",
    };
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [newImageUrl, setNewImageUrl] = useState("");

  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(
    () => (form.division ? getDistricts(form.division) : []),
    [form.division]
  );
  const upazilas = useMemo(
    () => (form.division && form.district ? getUpazilas(form.division, form.district) : []),
    [form.division, form.district]
  );

  const buildPayload = useCallback(() => {
    const contactNumber = form.phone ? `${COUNTRY_CODE}${form.phone}` : "";

    const base: Record<string, any> = {
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
      if (form.bloodGroup) base.bloodGroup = form.bloodGroup;
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
  }, [form]);

  const validateField = useCallback(
    (fieldName: string) => {
      const payload = buildPayload();
      const result = createPostSchema.safeParse(payload);
      if (!result.success) {
        const err = result.error.issues.find((i) => String(i.path[0]) === fieldName);
        setErrors((p) => ({ ...p, [fieldName]: err ? err.message : "" }));
      } else {
        setErrors((p) => { const n = { ...p }; delete n[fieldName]; return n; });
      }
    },
    [buildPayload]
  );

  const handleChange = useCallback(
    (name: keyof FormState, value: string | string[]) => {
      setForm((prev) => {
        const next = { ...prev, [name]: value };
        if (name === "division") { next.district = ""; next.upazila = ""; }
        if (name === "district") { next.upazila = ""; }
        return next;
      });
      const zodName = name === "phone" ? "contactNumber" : name;
      if (touched[zodName]) {
        setTimeout(() => validateField(zodName), 0);
      }
    },
    [touched, validateField]
  );

  const handleBlur = (name: string) => {
    const zodName = name === "phone" ? "contactNumber" : name;
    setTouched((p) => ({ ...p, [zodName]: true }));
    validateField(zodName);
  };

  const mutation = useMutation({
    mutationFn: (payload: any) => updatePost(post.id, payload),
    onSuccess: () => {
      toast.success("Post updated successfully! ✨");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update post");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    const result = createPostSchema.safeParse(payload);

    if (!result.success) {
      toast.error("Please fix the validation errors.");
      return;
    }

    mutation.mutate(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Post</DialogTitle>
          <DialogDescription>
            Update your donation request or information.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Title (if applicable) */}
            {(form.type === "BLOOD_DONATION" || form.type === "HELPING") && (
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Blood Group */}
            {form.type !== "HELPING" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Blood Group *</label>
                <select
                  value={form.bloodGroup}
                  onChange={(e) => handleChange("bloodGroup", e.target.value)}
                  className={selectClass}
                >
                  <option value="">Select</option>
                  {BLOOD_GROUPS.map((bg) => (
                    <option key={bg.value} value={bg.value}>{bg.label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Blood Bags */}
            {form.type === "BLOOD_FINDING" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Bags Needed *</label>
                <input
                  type="number"
                  value={form.bloodBags}
                  onChange={(e) => handleChange("bloodBags", e.target.value)}
                  className={inputClass}
                />
              </div>
            )}

            {/* Content / Description */}
            <div className="sm:col-span-2 space-y-2">
              <label className="text-sm font-medium">Description</label>
              <textarea
                value={form.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </div>

            {/* Location cascading */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Division</label>
              <select
                value={form.division}
                onChange={(e) => handleChange("division", e.target.value)}
                className={selectClass}
              >
                <option value="">Select Division</option>
                {divisions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">District</label>
              <select
                value={form.district}
                onChange={(e) => handleChange("district", e.target.value)}
                disabled={!form.division}
                className={selectClass}
              >
                <option value="">Select District</option>
                {districts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
