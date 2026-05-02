import React from "react";
import Link from "next/link";
import { HelpCircle, ArrowRight, MessageCircle, HelpCircle as HelpIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FAQSection } from "@/features/support/components/FAQSection";

export const metadata = {
  title: "Help & Support | BloodLink",
  description: "Find answers to frequently asked questions about blood donation, account management, and medical crowdfunding on BloodLink.",
};

export default function SupportPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-border/40 bg-muted/20">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(40%_40%_at_50%_10%,rgba(239,68,68,0.05)_0%,transparent_100%)]" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
            <HelpCircle className="h-3 w-3" />
            SUPPORT CENTER
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            How can we <span className="text-primary">help you?</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Find quick answers to common questions or reach out to our dedicated support team for personalized assistance.
          </p>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-muted-foreground">Everything you need to know about using the BloodLink platform.</p>
        </div>
        
        <FAQSection />
      </section>

      {/* Still Need Help CTA */}
      <section className="px-6">
        <div className="max-w-5xl mx-auto bg-foreground text-background p-10 md:p-16 rounded-[3rem] text-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl transition-transform duration-700 group-hover:scale-110" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center mb-6 ring-1 ring-primary/20">
              <MessageCircle className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-6 italic">Still didn't find your answer?</h2>
            <p className="text-foreground/70 mb-10 max-w-xl text-lg">
              Our support team is available to help you with any specific issues or partnership opportunities.
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-10 h-14 font-bold shadow-xl shadow-primary/20" asChild>
              <Link href="/contact" className="gap-2">
                Contact Support <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
