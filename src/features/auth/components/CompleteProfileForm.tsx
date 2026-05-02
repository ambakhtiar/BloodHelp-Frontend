"use client";

import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Phone, MapPin, Heart, User, Scale, AlertCircle } from "lucide-react";
import { completeProfileSchema, type CompleteProfileFormValues } from "@/validations/auth.validation";
import { completeProfileApi, fetchCurrentUser } from "@/services/auth.service";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { parseApiError } from "@/lib/parseApiError";

const COUNTRY_CODE = "+880";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-10 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200";

export function CompleteProfileForm() {
  const router = useRouter();
  const { user, setUser } = useAuthContext();

  const mutation = useMutation({
    mutationFn: completeProfileApi,
    onSuccess: async () => {
      try {
        const updatedUser = await fetchCurrentUser();
        setUser(updatedUser);
      } catch { }
      toast.success("Profile completed successfully! Welcome to BloodLink.");
      router.replace("/");
    },
    onError: (error: any) => {
      const parsed = parseApiError(error);
      // Backend returns 409 if contactNumber exists
      if (error?.response?.status === 409) {
        toast.error("This phone number is already registered with another account.");
      } else {
        toast.error(parsed.headline || "Failed to complete profile.");
      }
    },
  });

  const form = useForm({
    defaultValues: {
      name: user?.googleName || "",
      contactNumber: "",
      division: "",
      district: "",
      upazila: "",
      bloodGroup: "",
      gender: "",
      weight: undefined,
    } as any, // Using any here to bypass strict type matching for intermediate fields if any
    validators: {
      onChange: completeProfileSchema,
    },
    onSubmit: async ({ value }) => {
      // Weight is already processed by Zod preprocess in schema
      mutation.mutate(value);
    },
  });

  const divisions = getDivisions();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      {/* Name */}
      <form.Field
        name="name"
        children={(field) => (
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Full Name
            </label>
            <div className="relative group">
              <div className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors">
                <User className="h-4 w-4" />
              </div>
              <input
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                placeholder="John Doe"
                className={inputClass}
              />
            </div>
            {field.state.meta.errors.length > 0 && (
              <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                <AlertCircle className="h-3 w-3" /> {field.state.meta.errors[0]}
              </p>
            )}
          </div>
        )}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Phone / Contact Number */}
        <form.Field
          name="contactNumber"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary" /> Phone Number
              </label>
              <div className="flex relative group">
                <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs font-bold text-muted-foreground select-none group-focus-within:border-primary group-focus-within:ring-2 group-focus-within:ring-primary/20 transition-all">
                  🇧🇩 {COUNTRY_CODE}
                </div>
                <input
                  name={field.name}
                  value={field.state.value.replace(COUNTRY_CODE, "")}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    let digits = e.target.value.replace(/\D/g, "").slice(0, 10);
                    if (digits.startsWith("0")) digits = digits.substring(1);
                    field.handleChange(digits ? `${COUNTRY_CODE}${digits}` : "");
                  }}
                  placeholder="1XXXXXXXXX"
                  className={`${inputClass} rounded-l-none px-4`}
                  maxLength={10}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
                  <AlertCircle className="h-3 w-3" /> Enter valid 10 digits
                </p>
              )}
            </div>
          )}
        />

        {/* Gender */}
        <form.Field
          name="gender"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                 Gender
              </label>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as any)}
                className={selectClass}
              >
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-medium mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Blood Group */}
        <form.Field
          name="bloodGroup"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" /> Blood Group
              </label>
              <select
                name={field.name}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value as any)}
                className={selectClass}
              >
                <option value="">Select Blood Group</option>
                <option value="A_POSITIVE">A+</option>
                <option value="A_NEGATIVE">A-</option>
                <option value="B_POSITIVE">B+</option>
                <option value="B_NEGATIVE">B-</option>
                <option value="AB_POSITIVE">AB+</option>
                <option value="AB_NEGATIVE">AB-</option>
                <option value="O_POSITIVE">O+</option>
                <option value="O_NEGATIVE">O-</option>
              </select>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-medium mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        />

        {/* Weight (Optional) */}
        <form.Field
          name="weight"
          children={(field) => (
            <div className="space-y-2">
              <label className="text-sm font-semibold flex items-center gap-2">
                <Scale className="h-4 w-4 text-primary" /> Weight (Optional)
              </label>
              <div className="relative group">
                <div className="absolute left-3 top-3 text-muted-foreground group-focus-within:text-primary transition-colors">
                  <Scale className="h-4 w-4" />
                </div>
                <input
                  name={field.name}
                  value={field.state.value || ""}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      field.handleChange(undefined);
                    } else {
                      field.handleChange(Number(val));
                    }
                  }}
                  type="number"
                  placeholder="e.g. 70"
                  className={inputClass}
                />
              </div>
              {field.state.meta.errors.length > 0 && (
                <p className="text-xs text-destructive font-medium mt-1">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        />
      </div>

      {/* Location */}
      <div className="space-y-3 pt-2 border-t border-dashed">
        <label className="text-sm font-semibold flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" /> Current Location
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <form.Field
            name="division"
            children={(field) => (
              <div className="space-y-1">
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    form.setFieldValue("district", "");
                    form.setFieldValue("upazila", "");
                  }}
                  className={selectClass}
                >
                  <option value="">Division</option>
                  {divisions.map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] text-destructive font-medium">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />

          <form.Field
            name="district"
            children={(field) => (
              <div className="space-y-1">
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  disabled={!form.getFieldValue("division")}
                  onChange={(e) => {
                    field.handleChange(e.target.value);
                    form.setFieldValue("upazila", "");
                  }}
                  className={selectClass}
                >
                  <option value="">District</option>
                  {getDistricts(form.getFieldValue("division")).map((d) => (<option key={d} value={d}>{d}</option>))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] text-destructive font-medium">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />

          <form.Field
            name="upazila"
            children={(field) => (
              <div className="space-y-1">
                <select
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  disabled={!form.getFieldValue("district")}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={selectClass}
                >
                  <option value="">Upazila</option>
                  {getUpazilas(form.getFieldValue("division"), form.getFieldValue("district")).map((u) => (<option key={u} value={u}>{u}</option>))}
                </select>
                {field.state.meta.errors.length > 0 && (
                  <p className="text-[10px] text-destructive font-medium">{field.state.meta.errors[0]}</p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting, state.values]}
        children={([canSubmit, isSubmitting, values]) => {
          return (
            <Button 
              type="submit" 
              className="w-full h-12 text-md font-bold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all duration-300" 
              disabled={isSubmitting || mutation.isPending}
            >
              {mutation.isPending || isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Completing Profile...
                </>
              ) : (
                "Save & Continue"
              )}
            </Button>
          );
        }}
      />
      
      {/* Debug Helper (Only if button still disabled) */}
      <form.Subscribe
        selector={(state) => [state.errors]}
        children={([errors]) => {
          if (Object.keys(errors).length > 0) {
            return (
              <p className="text-[10px] text-muted-foreground text-center animate-pulse">
                Please fix all errors to enable the submit button.
              </p>
            )
          }
          return null;
        }}
      />
    </form>
  );
}
