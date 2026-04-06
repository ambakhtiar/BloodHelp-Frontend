"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { loginSchema } from "@/validations/auth.validation";
import { loginApi } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axiosInstance";
import { fetchCurrentUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";

const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function LoginForm() {
  const router = useRouter();
  const { setUser } = useAuthContext();
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: string, value: string) => {
    const testData = { ...formData, [name]: value };
    const result = loginSchema.safeParse(testData);
    if (!result.success) {
      const err = result.error.issues.find((i) => i.path[0] === name);
      setErrors((p) => (err ? { ...p, [name]: err.message } : (() => { const n = { ...p }; delete n[name]; return n; })()));
    } else {
      setErrors((p) => { const n = { ...p }; delete n[name]; return n; });
    }
  };

  const handleChange = (name: string, value: string) => {
    setFormData((p) => ({ ...p, [name]: value }));
    if (touched[name]) validateField(name, value);
  };

  const handleBlur = (name: string) => {
    setTouched((p) => ({ ...p, [name]: true }));
    validateField(name, formData[name as keyof typeof formData]);
  };

  const mutation = useMutation({
    mutationFn: loginApi,
    onSuccess: async (data: any) => {
      if (data?.data?.accessToken) setAccessToken(data.data.accessToken);
      try {
        const user = await fetchCurrentUser();
        setUser(user);
      } catch { /* will fetch on nav */ }
      toast.success("Logged in successfully!");
      router.push("/");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Login failed, please try again.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errs: Record<string, string> = {};
      result.error.issues.forEach((i) => { const k = String(i.path[0]); if (!errs[k]) errs[k] = i.message; });
      setErrors(errs);
      setTouched({ emailOrPhone: true, password: true });
      return;
    }
    setErrors({});
    mutation.mutate(result.data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Email or Phone Number <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          placeholder="you@example.com or +8801XXXXXXXXX"
          value={formData.emailOrPhone}
          onChange={(e) => handleChange("emailOrPhone", e.target.value)}
          onBlur={() => handleBlur("emailOrPhone")}
          className={inputClass}
        />
        {touched.emailOrPhone && errors.emailOrPhone && (
          <p className="text-sm text-destructive">{errors.emailOrPhone}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium leading-none">
          Password <span className="text-destructive">*</span>
        </label>
        <input
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={(e) => handleChange("password", e.target.value)}
          onBlur={() => handleBlur("password")}
          className={inputClass}
        />
        {touched.password && errors.password && (
          <p className="text-sm text-destructive">{errors.password}</p>
        )}
      </div>

      <Button type="submit" className="w-full h-11" disabled={mutation.isPending}>
        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Sign In
      </Button>
    </form>
  );
}
