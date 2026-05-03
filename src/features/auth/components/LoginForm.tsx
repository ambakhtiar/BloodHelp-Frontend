"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Loader2, AlertTriangle, XCircle, User, Building, Heart } from "lucide-react";
import { loginSchema } from "@/validations/auth.validation";
import { loginApi, googleLoginApi } from "@/services/auth.service";
import { setAccessToken } from "@/lib/axiosInstance";
import { fetchCurrentUser } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { useAuthContext } from "@/providers/AuthProvider";
import { parseApiError } from "@/lib/parseApiError";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import Link from "next/link";


const inputClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const { setUser } = useAuthContext();
  const [formData, setFormData] = useState({ emailOrPhone: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

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
    if (serverError) setServerError(null);
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
      router.push(callbackUrl || "/");
    },
    onError: (error: unknown) => {
      const parsed = parseApiError(error);
      // Build a combined message: headline + first detail if any
      const fullMessage = parsed.details.length > 0
        ? `${parsed.headline} ${parsed.details[0]}`
        : parsed.headline;
      setServerError(fullMessage);
    },
  });

  const googleMutation = useMutation({
    mutationFn: googleLoginApi,
    onSuccess: async (data: any) => {
      if (data?.data?.accessToken) setAccessToken(data.data.accessToken);

      const user = data?.data?.user;
      const isNewUser = data?.data?.isNewUser;

      if (user) {
        setUser(user);

        if (isNewUser || user.accountStatus === "INCOMPLETE") {
          toast.success("Google account created! Please complete your profile.");
          router.replace("/auth/complete-profile");
        } else {
          toast.success("Logged in with Google!");
          router.replace(callbackUrl || "/");
        }
      } else {
        toast.error("User data missing in response.");
      }
    },
    onError: (error: unknown) => {
      const parsed = parseApiError(error);
      toast.error(parsed.headline);
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
    setServerError(null);
    mutation.mutate(result.data);
  };

  const handleDemoLogin = (email: string, pass = "112233") => {
    const testData = { emailOrPhone: email, password: pass };
    setFormData(testData);
    setErrors({});
    setServerError(null);
    const result = loginSchema.safeParse(testData);
    if (result.success) {
      mutation.mutate(result.data);
    }
  };

  return (
    <div className="space-y-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {serverError && (
          <div className="flex animate-in fade-in slide-in-from-top-2 duration-300 items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-destructive shadow-sm">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm font-medium leading-relaxed">
              {serverError}
            </div>
            <button
              type="button"
              onClick={() => setServerError(null)}
              className="rounded-md p-1 hover:bg-destructive/10 transition-colors"
            >
              <XCircle className="h-4 w-4" />
            </button>
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium leading-none">
              Password <span className="text-destructive">*</span>
            </label>
            <Link
              href="/auth/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>
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

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
        </div>
      </div>

      <div className="flex justify-center w-full mt-2">
        <div className="flex justify-center w-[300px]">
          <GoogleLogin
            onSuccess={async (credentialResponse: CredentialResponse) => {
              if (credentialResponse.credential) {
                googleMutation.mutate(credentialResponse.credential);
              }
            }}
            onError={() => {
              toast.error("Google Sign-In failed. Please ensure your browser allows popups.");
            }}
            useOneTap={false}
            auto_select={false}
            theme="outline"
            shape="rectangular"
            text="signin_with"
            size="large"
          />
        </div>
      </div>


      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-muted-foreground/20" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground font-medium">Demo Accounts</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => handleDemoLogin('superadmin@bloodhelp.com', 'admin123')} disabled={mutation.isPending}>
            <User className="mr-2 h-3.5 w-3.5" /> Super Admin
          </Button>
          <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => handleDemoLogin('admin@bloodhelp.com', 'admin123')} disabled={mutation.isPending}>
            <User className="mr-2 h-3.5 w-3.5" /> Admin
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => handleDemoLogin('user@demo.com')} disabled={mutation.isPending}>
            <User className="mr-2 h-3.5 w-3.5" /> User
          </Button>
          <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => handleDemoLogin('hospital@demo.com')} disabled={mutation.isPending}>
            <Building className="mr-2 h-3.5 w-3.5" /> Hospital
          </Button>
          <Button type="button" variant="outline" size="sm" className="w-full text-xs" onClick={() => handleDemoLogin('org@demo.com')} disabled={mutation.isPending}>
            <Heart className="mr-2 h-3.5 w-3.5" /> Organisation
          </Button>
        </div>
      </div>
    </div>
  );
}
