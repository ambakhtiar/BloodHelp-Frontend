import { Metadata } from "next";
import { ForgotPasswordForm } from "@/features/auth/components/ForgotPasswordForm";
import { Droplets } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: `Forgot Password - ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
  description: `Reset your ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS} account password`,
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/10 p-4 sm:p-8">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="inline-flex items-center gap-3 group">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Droplets className="h-6 w-6" />
            </div>
            <span className="text-3xl font-extrabold tracking-tight">
              {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
            </span>
          </Link>
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Forgot Password</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email to receive an OTP and reset your password
          </p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-xl sm:p-8">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
