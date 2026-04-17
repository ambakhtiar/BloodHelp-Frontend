import { Metadata } from "next";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { Droplets } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Register - BloodLink",
  description: "Create a new BloodLink account",
};

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 sm:p-8">
      <div className="w-full max-w-2xl">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Droplets className="h-6 w-6" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Create an Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Join thousands of heroes saving lives every day
          </p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-xl sm:p-8">
          <RegisterForm />
          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline hover:underline-offset-4">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
