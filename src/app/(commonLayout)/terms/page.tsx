import React from "react";
import { FileText, ShieldCheck, Scale, Calendar } from "lucide-react";

export const metadata = {
  title: "Terms of Service | BloodLink",
  description: "Read the terms and conditions for using the BloodLink platform, including user responsibilities, medical disclaimers, and payment policies.",
};

export default function TermsPage() {
  const lastUpdated = "May 02, 2026";

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Header */}
      <section className="py-20 px-6 border-b border-border/40 bg-muted/20">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-bold tracking-widest uppercase">
            <Scale className="h-3 w-3" />
            LEGAL DOCUMENT
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Terms of Service</h1>
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
            
            {/* Introduction */}
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">1. Agreement to Terms</h2>
              <p className="text-muted-foreground leading-relaxed">
                By accessing or using BloodLink, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.
              </p>
            </div>

            {/* Medical Disclaimer */}
            <div className="space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                <ShieldCheck className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold">2. Medical Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                BloodLink is a platform to facilitate connections between donors and recipients. We are NOT a medical provider or emergency service. 
                All medical decisions should be made in consultation with qualified healthcare professionals at registered hospitals.
              </p>
            </div>

            {/* User Responsibilities */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold">3. User Responsibilities</h2>
              <ul className="space-y-4">
                {[
                  "You must provide accurate and truthful information during registration.",
                  "You are responsible for maintaining the confidentiality of your account.",
                  "Donors must ensure they meet the eligibility criteria for blood donation as per national guidelines.",
                  "Hospitals and Organisations must be legally registered entities."
                ].map((item, i) => (
                  <li key={i} className="flex gap-4">
                    <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 text-primary font-bold text-xs">
                      {i + 1}
                    </div>
                    <span className="text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Crowdfunding & Payments */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">4. Crowdfunding & Payments</h2>
              <p className="text-muted-foreground leading-relaxed">
                BloodLink facilitates financial assistance for medical emergencies. We do not process payments directly; we provide platform-verified accounts (e.g., bKash, Nagad) for direct transfers. 
                Users are advised to verify the legitimacy of campaigns before contributing.
              </p>
            </div>

            {/* Termination */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">5. Account Termination</h2>
              <p className="text-muted-foreground leading-relaxed">
                We reserve the right to suspend or terminate accounts that violate our community guidelines, provide false information, or engage in fraudulent activities.
              </p>
            </div>

            {/* Contact */}
            <div className="pt-12 border-t border-border/40 text-center">
              <p className="text-sm text-muted-foreground mb-4">Questions about our terms?</p>
              <a href="/contact" className="text-primary font-bold hover:underline">Contact Legal Support</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
