"use client";

import { useState, useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { registerSchema, type RegisterFormValues } from "@/validations/auth.validation";
import { registerApi, loginApi, fetchCurrentUser } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axiosInstance";
import { useAuthContext } from "@/providers/AuthProvider";
import { Button } from "@/components/ui/button";
import { getDivisions, getDistricts, getUpazilas } from "@/lib/bd-location";
import { toastApiError } from "@/lib/parseApiError";

const COUNTRY_CODE = "+880";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50";

type RoleType = "USER" | "HOSPITAL" | "ORGANISATION";

interface FormState {
  role: RoleType;
  name: string;
  email: string;
  phone: string;
  password: string;
  division: string;
  district: string;
  upazila: string;
  bloodGroup: string;
  gender: string;
  registrationNumber: string;
  address: string;
  establishedYear: string;
}

const initialForm: FormState = {
  role: "USER",
  name: "",
  email: "",
  phone: "",
  password: "",
  division: "",
  district: "",
  upazila: "",
  bloodGroup: "",
  gender: "",
  registrationNumber: "",
  address: "",
  establishedYear: "",
};

function RequiredMark() {
  return <span className="text-destructive ml-0.5">*</span>;
}

export function RegisterForm() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Location cascading
  const divisions = useMemo(() => getDivisions(), []);
  const districts = useMemo(() => (form.division ? getDistricts(form.division) : []), [form.division]);
  const upazilas = useMemo(() => (form.division && form.district ? getUpazilas(form.division, form.district) : []), [form.division, form.district]);

  // Build payload for Zod validation
  const buildPayload = () => {
    const contactNumber = form.phone ? `${COUNTRY_CODE}${form.phone}` : "";
    const base: Record<string, unknown> = {
      role: form.role,
      name: form.name,
      email: form.email,
      contactNumber,
      password: form.password,
      division: form.division,
      district: form.district,
      upazila: form.upazila,
    };

    if (form.role === "USER") {
      base.bloodGroup = form.bloodGroup;
      base.gender = form.gender;
    } else if (form.role === "HOSPITAL") {
      if (form.registrationNumber) base.registrationNumber = form.registrationNumber;
      base.address = form.address;
    } else if (form.role === "ORGANISATION") {
      if (form.registrationNumber) base.registrationNumber = form.registrationNumber;
      if (form.establishedYear) base.establishedYear = form.establishedYear;
    }
    return base;
  };

  const validateField = (zodName: string) => {
    const payload = buildPayload();
    const result = registerSchema.safeParse(payload);
    if (!result.success) {
      const err = result.error.issues.find((i) => String(i.path[0]) === zodName);
      if (err) {
        setErrors((p) => ({ ...p, [zodName]: err.message }));
      } else {
        setErrors((p) => { const n = { ...p }; delete n[zodName]; return n; });
      }
    } else {
      setErrors((p) => { const n = { ...p }; delete n[zodName]; return n; });
    }
  };

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      // Reset cascading location fields
      if (name === "division") { next.district = ""; next.upazila = ""; }
      if (name === "district") { next.upazila = ""; }
      return next;
    });
    const zodName = name === "phone" ? "contactNumber" : name;
    if (touched[zodName]) {
      setTimeout(() => validateField(zodName), 0);
    }
  };

  const handleBlur = (name: string) => {
    const zodName = name === "phone" ? "contactNumber" : name;
    setTouched((p) => ({ ...p, [zodName]: true }));
    validateField(zodName);
  };

  // Mutation
  const mutation = useMutation({
    mutationFn: async (payload: RegisterFormValues) => {
      await registerApi(payload);

      if (payload.role === "HOSPITAL" || payload.role === "ORGANISATION") {
        return { needsApproval: true };
      }

      const emailOrPhone = 'email' in payload && payload.email ? payload.email : payload.contactNumber;
      return loginApi({ emailOrPhone, password: payload.password });
    },
    onSuccess: async (data: any, originalPayload: RegisterFormValues) => {
      if (data?.needsApproval) {
        toast.success("Account created successfully! Admin approval is required.");
        router.push("/auth/login");
        return;
      }

      if (data?.data?.accessToken) setAccessToken(data.data.accessToken);
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch { }
      toast.success("Account created and logged in!");
      router.push("/");
    },
    onError: (error: unknown) => {
      toastApiError(error, "Registration failed. Please check your details and try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = buildPayload();
    const result = registerSchema.safeParse(payload);
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
      return;
    }
    mutation.mutate(result.data as RegisterFormValues);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

        {/* Role */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">I am registering as<RequiredMark /></label>
          <select value={form.role} onChange={(e) => handleChange("role", e.target.value)} className={selectClass}>
            <option value="USER">Personal Donor / User</option>
            <option value="HOSPITAL">Hospital</option>
            <option value="ORGANISATION">Organisation</option>
          </select>
        </div>

        {/* Name */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">
            {form.role === "HOSPITAL" ? "Hospital Name" : form.role === "ORGANISATION" ? "Organisation Name" : "Full Name"}
            <RequiredMark />
          </label>
          <input
            type="text"
            placeholder={form.role === "HOSPITAL" ? "Dhaka Medical College" : form.role === "ORGANISATION" ? "Bangladesh Red Crescent" : "John Doe"}
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            onBlur={() => handleBlur("name")}
            className={inputClass}
          />
          {touched.name && errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Phone Number<RequiredMark /></label>
          <div className="flex">
            <div className="flex h-10 items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-sm font-medium text-muted-foreground select-none">
              🇧🇩 {COUNTRY_CODE}
            </div>
            <input
              type="tel"
              placeholder="1XXXXXXXXX"
              value={form.phone}
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
          {touched.contactNumber && errors.contactNumber && <p className="text-sm text-destructive">{errors.contactNumber}</p>}
        </div>

        {/* Email */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Email<RequiredMark /></label>
          <input
            type="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={(e) => handleChange("email", e.target.value)}
            onBlur={() => handleBlur("email")}
            className={inputClass}
          />
          {touched.email && errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
        </div>

        {/* Password */}
        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-medium">Password<RequiredMark /></label>
          <input
            type="password"
            placeholder="Min 6 characters"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
            onBlur={() => handleBlur("password")}
            className={inputClass}
          />
          {touched.password && errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
        </div>

        {/* ===== USER fields ===== */}
        {form.role === "USER" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Group<RequiredMark /></label>
              <select value={form.bloodGroup} onChange={(e) => handleChange("bloodGroup", e.target.value)} onBlur={() => handleBlur("bloodGroup")} className={selectClass}>
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
              {touched.bloodGroup && errors.bloodGroup && <p className="text-sm text-destructive">{errors.bloodGroup}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Gender<RequiredMark /></label>
              <select value={form.gender} onChange={(e) => handleChange("gender", e.target.value)} onBlur={() => handleBlur("gender")} className={selectClass}>
                <option value="">Select Gender</option>
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
              {touched.gender && errors.gender && <p className="text-sm text-destructive">{errors.gender}</p>}
            </div>
          </>
        )}

        {/* ===== HOSPITAL fields ===== */}
        {form.role === "HOSPITAL" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Number</label>
              <input type="text" placeholder="REG-XXXX" value={form.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Full Address</label>
              <input type="text" placeholder="123 Hospital Road, Dhaka" value={form.address} onChange={(e) => handleChange("address", e.target.value)} onBlur={() => handleBlur("address")} className={inputClass} />
              {touched.address && errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
            </div>
          </>
        )}

        {/* ===== ORGANISATION fields ===== */}
        {form.role === "ORGANISATION" && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Registration Number</label>
              <input type="text" placeholder="GOV-XXXX" value={form.registrationNumber} onChange={(e) => handleChange("registrationNumber", e.target.value)} className={inputClass} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Established Year</label>
              <input type="text" placeholder="2015" value={form.establishedYear} onChange={(e) => handleChange("establishedYear", e.target.value)} className={inputClass} />
            </div>
          </>
        )}

        {/* ===== Location Section ===== */}
        <div className="space-y-1 sm:col-span-2 border-t pt-2 mt-1">
          <p className="text-sm font-medium">Location <RequiredMark /></p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Division <RequiredMark /></label>
              <select value={form.division} onChange={(e) => handleChange("division", e.target.value)} onBlur={() => handleBlur("division")} className={selectClass}>
                <option value="">Select Division</option>
                {divisions.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
              {touched.division && errors.division && <p className="text-xs text-destructive">{errors.division}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">District <RequiredMark /></label>
              <select value={form.district} onChange={(e) => handleChange("district", e.target.value)} disabled={!form.division} onBlur={() => handleBlur("district")} className={selectClass}>
                <option value="">Select District</option>
                {districts.map((d) => (<option key={d} value={d}>{d}</option>))}
              </select>
              {touched.district && errors.district && <p className="text-xs text-destructive">{errors.district}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground">Upazila <RequiredMark /></label>
              <select value={form.upazila} onChange={(e) => handleChange("upazila", e.target.value)} disabled={!form.district} onBlur={() => handleBlur("upazila")} className={selectClass}>
                <option value="">Select Upazila</option>
                {upazilas.map((u) => (<option key={u} value={u}>{u}</option>))}
              </select>
              {touched.upazila && errors.upazila && <p className="text-xs text-destructive">{errors.upazila}</p>}
            </div>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full h-11" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Create Account
      </Button>
    </form>
  );
}
