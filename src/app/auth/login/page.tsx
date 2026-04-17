import { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { Droplets } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Login - BloodLink",
  description: "Login to your BloodLink account",
};

export default function LoginPage() {
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
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-foreground">Welcome back</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>

        <div className="rounded-2xl border border-primary/20 bg-card p-6 shadow-xl sm:p-8">
          <LoginForm />
          <div className="mt-6 text-center text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/auth/register" className="font-semibold text-primary transition-colors hover:text-primary/80 hover:underline hover:underline-offset-4">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
