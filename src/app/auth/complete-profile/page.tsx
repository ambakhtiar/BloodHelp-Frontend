import { Metadata } from "next";
import { CompleteProfileForm } from "@/features/auth/components/CompleteProfileForm";

export const metadata: Metadata = {
  title: "Complete Your Profile",
  description: "Please provide your blood group and location to complete your registration.",
};

export default function CompleteProfilePage() {
  return (
    <div className="container relative flex pt-20 flex-col items-center justify-center lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-primary">
            One Last Step!
          </h1>
          <p className="text-sm text-muted-foreground">
            Complete your donor profile to access the platform.
          </p>
        </div>
        
        <div className="grid gap-6 p-6 bg-card rounded-xl border shadow-sm">
          <CompleteProfileForm />
        </div>

        <p className="px-8 text-center text-xs text-muted-foreground leading-relaxed">
          By completing your profile, you agree to our{" "}
          <span className="underline underline-offset-4 hover:text-primary cursor-pointer">
            Terms of Service
          </span>{" "}
          and{" "}
          <span className="underline underline-offset-4 hover:text-primary cursor-pointer">
            Privacy Policy
          </span>.
        </p>
      </div>
    </div>
  );
}
