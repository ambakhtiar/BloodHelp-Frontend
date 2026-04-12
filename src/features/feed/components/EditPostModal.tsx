"use client";

import { useState, useMemo, useCallback, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, X, AlertTriangle, Clock, Heart, HandHelping, MapPin, Droplets } from "lucide-react";
import { createPostSchema } from "@/validations/post.validation";
import { updatePost } from "@/services/post.service";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// ── Helper Components ────────────────────────────────────────────────────────
function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[10px] text-destructive mt-0.5 font-bold uppercase tracking-wider">{message}</p>;
}

function SectionDivider({ title, icon }: { title: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-t pt-4 mt-2 mb-1">
      {icon}
      <h3 className="text-xs font-bold text-foreground uppercase tracking-widest">{title}</h3>
    </div>
  );
}


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

        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* ════════════════ Info Badge ════════════════ */}
            <div className="sm:col-span-2 flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-primary/5">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 rounded-md ${form.type === "BLOOD_FINDING" ? "bg-destructive/10 text-destructive" :
                    form.type === "BLOOD_DONATION" ? "bg-emerald-500/10 text-emerald-600" : "bg-blue-500/10 text-blue-600"
                  }`}>
                  {form.type === "BLOOD_FINDING" ? <Droplets className="w-4 h-4" /> :
                    form.type === "BLOOD_DONATION" ? <Heart className="w-4 h-4" /> : <HandHelping className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Editing Post</p>
                  <p className="text-sm font-black">{form.type.replace("_", " ")}</p>
                </div>
              </div>
              <Badge variant="outline" className="text-[10px] font-bold border-primary/20">ID: {post.id.slice(0, 8)}...</Badge>
            </div>

            {/* ════════════════ Type Specific Fields ════════════════ */}

            {/* BLOOD_FINDING Fields */}
            {form.type === "BLOOD_FINDING" && (
              <>
                <div className="sm:col-span-2">
                  <SectionDivider title="Request Details" icon={<Heart className="w-3 h-3 text-primary" />} />
                </div>

                {/* Blood Group (LOCKED) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase flex items-center gap-1">
                    Blood Group <RequiredMark />
                  </label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="relative">
                          <select
                            value={form.bloodGroup}
                            disabled
                            className={`${selectClass} border-primary/20 bg-muted/50 cursor-not-allowed font-bold text-destructive`}
                          >
                            <option value={form.bloodGroup}>{form.bloodGroup}</option>
                          </select>
                          <div className="absolute inset-0 bg-transparent" />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-xs font-bold">Blood group cannot be changed after posting.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-[10px] text-muted-foreground italic">Immutable for search integrity</p>
                </div>

                {/* Blood Bags */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Bags Needed <RequiredMark />
                  </label>
                  <input
                    type="number"
                    value={form.bloodBags}
                    onChange={(e) => handleChange("bloodBags", e.target.value)}
                    onBlur={() => handleBlur("bloodBags")}
                    className={inputClass}
                    min={1}
                  />
                  <FieldError message={touched.bloodBags ? errors.bloodBags : undefined} />
                </div>

                {/* Reason */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">
                    Reason / Purpose <RequiredMark />
                  </label>
                  <input
                    type="text"
                    value={form.reason}
                    onChange={(e) => handleChange("reason", e.target.value)}
                    onBlur={() => handleBlur("reason")}
                    className={inputClass}
                    placeholder="e.g. Emergency Surgery"
                  />
                  <FieldError message={touched.reason ? errors.reason : undefined} />
                </div>

                {/* Urgency and Time */}
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Urgency Level <RequiredMark /></label>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {["EMERGENCY", "FIXED", "FLEXIBLE"].map((u: any) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => handleChange("donationTimeType", u)}
                        className={`py-2 px-1 rounded-md text-[10px] font-bold border transition-all ${form.donationTimeType === u
                            ? "bg-primary/10 border-primary text-primary"
                            : "border-muted text-muted-foreground hover:border-muted-foreground/30"
                          }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>

                  {form.donationTimeType !== "EMERGENCY" && (
                    <div className="mt-2 space-y-1.5">
                      <label className="text-xs font-bold text-muted-foreground uppercase">Target Date & Time</label>
                      <input
                        type="datetime-local"
                        value={form.donationTime}
                        onChange={(e) => handleChange("donationTime", e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  )}
                </div>
              </>
            )}

            {/* BLOOD_DONATION Fields */}
            {form.type === "BLOOD_DONATION" && (
              <>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Title <RequiredMark /></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Blood Group</label>
                  <select
                    value={form.bloodGroup}
                    disabled
                    className={`${selectClass} bg-muted opacity-50 cursor-not-allowed`}
                  >
                    <option value={form.bloodGroup}>{form.bloodGroup}</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Available Time <RequiredMark /></label>
                  <input
                    type="datetime-local"
                    value={form.donationTime}
                    onChange={(e) => handleChange("donationTime", e.target.value)}
                    className={inputClass}
                  />
                </div>
              </>
            )}

            {/* HELPING Fields */}
            {form.type === "HELPING" && (
              <>
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Campaign Title <RequiredMark /></label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Target Amount (BDT) <RequiredMark /></label>
                  <input
                    type="number"
                    value={form.targetAmount}
                    onChange={(e) => handleChange("targetAmount", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">bKash/Nagad Number <RequiredMark /></label>
                  <input
                    type="text"
                    value={form.bkashNagadNumber}
                    onChange={(e) => handleChange("bkashNagadNumber", e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase">Diagnosis / Issues <RequiredMark /></label>
                  <textarea
                    value={form.medicalIssues}
                    onChange={(e) => handleChange("medicalIssues", e.target.value)}
                    className={textareaClass}
                    rows={2}
                  />
                </div>
              </>
            )}

            {/* Common Description */}
            <div className="sm:col-span-2 space-y-1.5 pt-2">
              <label className="text-xs font-bold text-muted-foreground uppercase">Description <span className="text-[10px] font-medium lowercase italic">(optional)</span></label>
              <textarea
                value={form.content}
                onChange={(e) => handleChange("content", e.target.value)}
                className={textareaClass}
                rows={3}
              />
            </div>

            {/* ════════════════ Location & Contact ════════════════ */}
            <div className="sm:col-span-2">
              <SectionDivider title="Contact & Location" icon={<MapPin className="w-3 h-3 text-primary" />} />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Contact Number <RequiredMark /></label>
              <div className="flex">
                <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-2.5 text-xs font-bold text-muted-foreground">
                  +880
                </div>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "").slice(0, 10);
                    handleChange("phone", val);
                  }}
                  className={`${inputClass} rounded-l-none`}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase">Local Address</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleChange("location", e.target.value)}
                className={inputClass}
                placeholder="e.g. DMCH, Ward 5"
              />
            </div>

            {/* Cascading Areas */}
            <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-3 bg-secondary/10 p-4 rounded-xl border border-dashed border-primary/10">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Division</label>
                <select value={form.division} onChange={(e) => handleChange("division", e.target.value)} className={selectClass}>
                  <option value="">Select</option>
                  {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">District</label>
                <select value={form.district} onChange={(e) => handleChange("district", e.target.value)} disabled={!form.division} className={selectClass}>
                  <option value="">Select</option>
                  {districts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-muted-foreground">Upazila</label>
                <select value={form.upazila} onChange={(e) => handleChange("upazila", e.target.value)} disabled={!form.district} className={selectClass}>
                  <option value="">Select</option>
                  {upazilas.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </div>
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
