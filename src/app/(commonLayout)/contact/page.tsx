import React from "react";
import { Mail, Phone, MapPin, Globe, Clock, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ContactForm } from "@/features/contact/components/ContactForm";

export const metadata = {
  title: "Contact Us | BloodLink",
  description: "Get in touch with the BloodLink support team for any queries, partnerships, or assistance with blood donation and crowdfunding.",
};

const contactInfo = [
  {
    icon: Phone,
    title: "Call Us",
    details: "+880 1711223344",
    description: "Mon-Fri from 9am to 6pm.",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
  {
    icon: Mail,
    title: "Email Us",
    details: "support@bloodlink.com",
    description: "Our team will respond within 24 hours.",
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    icon: MapPin,
    title: "Office",
    details: "Matarbari, Maheshkhali",
    description: "Cox's Bazar, Bangladesh.",
    color: "text-emerald-500",
    bg: "bg-emerald-500/10",
  },
];

export default function ContactPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <section className="relative py-24 px-6 overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(35%_35%_at_50%_50%,rgba(239,68,68,0.05)_0%,transparent_100%)]" />
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold ring-1 ring-primary/20">
            <MessageSquare className="h-3 w-3" />
            GET IN TOUCH
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            We're here to <span className="text-primary">help.</span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Have questions about donating blood, medical crowdfunding, or technical issues?
            Our dedicated support team is ready to assist you.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-5 gap-16">
            {/* Contact Details */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h2 className="text-3xl font-bold">Contact Information</h2>
                <p className="text-muted-foreground">
                  Reach out through any of these channels or use the form to send us a direct message.
                </p>
              </div>

              <div className="grid gap-6">
                {contactInfo.map((info, i) => (
                  <Card key={i} className="border-border/40 overflow-hidden group hover:border-primary/30 transition-all duration-300">
                    <CardContent className="p-6 flex items-start gap-5">
                      <div className={`h-12 w-12 rounded-2xl ${info.bg} flex items-center justify-center shrink-0`}>
                        <info.icon className={`h-6 w-6 ${info.color}`} />
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-lg">{info.title}</h4>
                        <p className="font-medium text-foreground">{info.details}</p>
                        <p className="text-sm text-muted-foreground">{info.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Extra Details */}
              <div className="p-8 rounded-[2rem] bg-muted/30 border border-border/40 space-y-6">
                <h4 className="font-bold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Global Support
                </h4>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Response time: <span className="font-bold">Under 24 Hours</span></span>
                  </div>
                  <div className="flex items-center gap-3 text-sm">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <span>Live Chat: <span className="font-bold">Coming Soon</span></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
