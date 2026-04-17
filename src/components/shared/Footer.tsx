import Link from "next/link";
import { Droplets, Heart, Mail, Phone, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";


export default function Footer() {
  return (
    <footer className="w-full bg-background pt-10 pb-6 sm:pt-16 sm:pb-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Floating Island Footer Box */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-card border border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.12)]">

          {/* Subtle Background Glows */}
          <div className="absolute top-0 right-0 h-[30rem] w-[30rem] -translate-y-1/2 translate-x-1/3 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-[20rem] w-[20rem] translate-y-1/3 -translate-x-1/3 rounded-full bg-accent/5 blur-3xl" />

          <div className="relative z-10 px-8 py-12 sm:px-12 lg:px-16 lg:py-16">

            {/* Top Section: CTA + Branding */}
            <div className="flex flex-col lg:flex-row items-center justify-between gap-8 border-b border-border/50 pb-12">
              <div className="space-y-4 text-center lg:text-left">
                <Link href="/" className="inline-flex items-center gap-3 group">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                    <Droplets className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <span className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
                  </span>
                </Link>
                <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto lg:mx-0">
                  A digital lifeline connecting donors with those in need. Saving lives, one drop at a time across Bangladesh.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <Button size="lg" className="rounded-full px-8 h-12 shadow-primary/20 shadow-lg group">
                  <Link href="/register" className="flex items-center gap-2">
                    Become a Donor
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 group border border-border">
                  <Link href="/campaigns" className="flex items-center gap-2">
                    Donate Funds
                    <Heart className="h-4 w-4 text-destructive transition-transform group-hover:scale-110" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Middle Section: Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 pt-12">

              {/* Important Links */}
              <div className="space-y-5 text-center sm:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  Explore
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/feed", label: "Blood Feed" },
                    { href: "/campaigns", label: "Crowdfunding Campaigns" },
                    { href: "/about", label: "About Our Mission" },
                    { href: "/privacy", label: "Privacy Policy" },
                  ].map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-base text-muted-foreground transition-colors hover:text-primary font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* For Organizations */}
              <div className="space-y-5 text-center sm:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  Organizations
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/register", label: "Register Hospital" },
                    { href: "/register", label: "Register NGO/Organisation" },
                    { href: "/about", label: "How It Works" },
                    { href: "/about", label: "Partner With Us" },
                  ].map((link, i) => (
                    <li key={i}>
                      <Link
                        href={link.href}
                        className="text-base text-muted-foreground transition-colors hover:text-primary font-medium"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Contact Information */}
              <div className="space-y-5 flex flex-col items-center sm:items-start text-center sm:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  Contact Us
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base text-muted-foreground font-medium">support@{(process.env.NEXT_PUBLIC_APP_NAME_FF || 'blood') + (process.env.NEXT_PUBLIC_APP_NAME_SS || 'link').toLowerCase()}.bd</span>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base text-muted-foreground font-medium">+880 1711-223344</span>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-base text-muted-foreground font-medium">
                      Cox's Bazar, Bangladesh
                    </span>
                  </li>
                </ul>
              </div>

            </div>
          </div>
        </div>

        {/* Bottom Copyright Text */}
        <div className="mt-6 flex flex-col items-center justify-between gap-4 sm:flex-row px-4">
          <p className="text-sm text-muted-foreground font-medium">
            &copy; {new Date().getFullYear()} {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}. All rights reserved.
          </p>
          <div className="flex justify-center gap-1 sm:gap-2">
            <span className="text-sm text-muted-foreground font-medium flex items-center gap-1.5">
              Built with <Heart className="h-4 w-4 text-destructive fill-destructive animate-pulse" /> for Bangladesh
            </span>
          </div>
        </div>

      </div>
    </footer>
  );
}
