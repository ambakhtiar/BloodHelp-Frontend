import React from "react";
import { Shield, Lock, Eye, Calendar, Database, Bell } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | BloodLink",
  description: "Learn how BloodLink collects, uses, and protects your personal and medical information.",
};

export default function PrivacyPage() {
  const lastUpdated = "May 02, 2026";

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <section className="py-20 px-6 border-b border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-bold tracking-widest uppercase">
            <Shield className="h-3 w-3" />
            DATA PROTECTION
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Privacy Policy</h1>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>Last Updated: {lastUpdated}</span>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-card border border-border/40 rounded-[2.5rem] p-8 md:p-16 space-y-12">

            {/* Commitment */}
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <Lock className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">1. Our Commitment</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your privacy is critical to us. This policy explains how we collect, handle, and protect your personal information when you use BloodLink. We never sell your data to third parties.
              </p>
            </div>

            {/* Information Collection */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <Database className="h-6 w-6 text-emerald-500" />
                2. Information We Collect
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="p-6 rounded-2xl bg-muted/30 space-y-3">
                  <h4 className="font-bold">Personal Data</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Name, email address, contact number, and location details used for account management and matching.
                  </p>
                </div>
                <div className="p-6 rounded-2xl bg-muted/30 space-y-3">
                  <h4 className="font-bold">Medical Data</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Blood group, donation history, and weight to ensure donor eligibility and successful matching.
                  </p>
                </div>
              </div>
            </div>

            {/* Data Usage */}
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-6">
                <Eye className="h-6 w-6 text-blue-500" />
              </div>
              <h2 className="text-2xl font-bold">3. How We Use Your Data</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use your information primarily to facilitate life-saving connections. This includes:
              </p>
              <ul className="space-y-3 ml-4">
                {[
                  "Displaying your donor profile to verified seekers in emergencies.",
                  "Sending important notifications via email or SMS.",
                  "Verifying hospital and organisation registrations.",
                  "Improving our matching algorithms based on location."
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Security */}
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                <Bell className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">4. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement industry-standard encryption and security measures to protect your sensitive data from unauthorized access, alteration, or disclosure.
              </p>
            </div>

            {/* Your Rights */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">5. Your Rights</h2>
              <p className="text-muted-foreground leading-relaxed">
                You have the right to access, correct, or delete your personal information at any time through your profile settings. You can also opt-out of donor searches by setting your status to unavailable.
              </p>
            </div>

            {/* Contact */}
            <div className="pt-12 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground mb-4">Have concerns about your data?</p>
              <Link href="/contact" className="text-emerald-600 font-bold hover:underline">Contact Data Protection Officer</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
