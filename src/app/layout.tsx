import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";

import { cn } from "@/lib/utils";
import { Toaster } from "sonner";
import AppProviders from "@/providers/AppProviders";
import PasswordChangeGuard from "@/components/shared/PasswordChangeGuard";


const geist = Geist({ subsets: ['latin'], variable: '--font-sans' });

export const metadata: Metadata = {
  title: {
    default: `${process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'}${process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'} | Lifesaving Blood Donation & Medical Crowdfunding Platform`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'}${process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'}`,
  },
  description:
    `${process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'} ${process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'} is a comprehensive platform connecting blood donors with patients in emergency need. Features include real-time donor search, hospital donation tracking, organization management and secure medical crowdfunding.`,
  keywords: [
    "Blood Donation",
    "Blood Donors Bangladesh",
    "Medical Crowdfunding",
    "Emergency Blood Search",
    "BloodHelp",
    "Donate Blood"
  ],
  authors: [{ name: "AM Bakhtiar" }],
  openGraph: {
    title: `${process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'}${process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'} | Donate Blood, Save Lives`,
    description: `${process.env.NEXT_PUBLIC_APP_NAME_FF || 'Blood'} ${process.env.NEXT_PUBLIC_APP_NAME_SS || 'Help'} is a comprehensive platform connecting blood donors with patients in emergency need. Features include real-time donor search, hospital donation tracking, organization management and secure medical crowdfunding.`,
    type: "website",
    locale: "en_US",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("h-full", "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="min-h-screen flex flex-col antialiased">
        <AppProviders>
          <PasswordChangeGuard>
            {children}
          </PasswordChangeGuard>
        </AppProviders>
        <Toaster richColors position="bottom-right" duration={3000} closeButton />
      </body>
    </html>
  );
}
