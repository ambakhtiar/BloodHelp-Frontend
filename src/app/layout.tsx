import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import "./globals.css";
import AppProviders from "../providers/AppProviders";
import Navbar from "../components/shared/Navbar";
import Footer from "../components/shared/Footer";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "BloodLink — Blood Donors Management System",
    template: "%s | BloodLink",
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
          <Navbar />
          <div className="flex-1">{children}</div>
          <Footer />
        </AppProviders>
      </body>
    </html>
  );
}
