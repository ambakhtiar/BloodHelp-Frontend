import { ProfileDetails } from "@/features/profile/components/ProfileDetails";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `My Profile | ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
  description: `View and manage your ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS} profile and donation settings.`,
};

export default function ProfilePage() {
  return (
    <main className="min-h-screen pt-12 pb-24 px-4 sm:px-6">
      <div className="container mx-auto">
        <ProfileDetails />
      </div>
    </main>
  );
}
