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
    default: `${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS} — Blood Donors Management System`,
    template: `%s | ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`,
  },
  description:
    "Connect blood donors with those in need. A platform for managing blood donations, finding donors, and supporting medical crowdfunding.",
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
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
