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
                  <Link href="/auth/register" className="flex items-center gap-2">
                    Become a Donor
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button size="lg" variant="secondary" className="rounded-full px-8 h-12 group border border-border">
                  <Link href="/feed?type=HELPING" className="flex items-center gap-2">
                    Donate Funds
                    <Heart className="h-4 w-4 text-destructive transition-transform group-hover:scale-110" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Middle Section: Links */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 pt-12">

              {/* Explore Links */}
              <div className="space-y-5 text-center sm:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  Explore
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/feed", label: "Blood Feed" },
                    { href: "/feed?type=HELPING", label: "Financial Help" },
                    { href: "/donors", label: "Donor Directory" },
                    { href: "/about", label: "Our Mission" },
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

              {/* Support & Community */}
              <div className="space-y-5 text-center sm:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  Support
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/support", label: "Help & FAQ" },
                    { href: "/contact", label: "Contact Us" },
                    { href: "/auth/register", label: "Join as Donor" },
                    { href: "/auth/register", label: "Partner Register" },
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

              {/* Legal & Safety */}
              <div className="space-y-5 text-center sm:text-left">
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground/80">
                  Legal
                </h3>
                <ul className="space-y-3">
                  {[
                    { href: "/terms", label: "Terms of Service" },
                    { href: "/privacy", label: "Privacy Policy" },
                    { href: "/support", label: "Medical Disclaimer" },
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
                  Connect
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Mail className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">support@bloodlink.com</span>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Phone className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">+880 1711223344</span>
                  </li>
                  <li className="flex items-center justify-center sm:justify-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <MapPin className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-muted-foreground font-medium">
                      Matarbari, Cox's Bazar, Bangladesh.
                    </span>
                  </li>
                </ul>

                {/* Social Media Links */}
                <div className="flex items-center justify-center sm:justify-start gap-4 pt-4 border-t border-border/50 w-full">
                  {[
                    { href: "https://facebook.com", icon: "fb", color: "hover:text-[#1877F2]" },
                    { href: "https://instagram.com", icon: "ig", color: "hover:text-[#E4405F]" },
                    { href: "https://linkedin.com", icon: "in", color: "hover:text-[#0A66C2]" },
                  ].map((social, i) => (
                    <Link
                      key={i}
                      href={social.href}
                      target="_blank"
                      className={`text-muted-foreground/60 transition-all duration-300 hover:scale-125 ${social.color}`}
                    >
                      {social.icon === "fb" && <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>}
                      {social.icon === "ig" && <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.984 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.237-.421-.569-.224-.96-.479-1.382-.899-.419-.419-.679-.824-.896-1.38-.164-.42-.359-1.065-.413-2.235-.057-1.274-.07-1.649-.07-4.859 0-3.211.015-3.586.074-4.859.061-1.171.256-1.816.421-2.237.224-.569.479-.96.899-1.382.419-.419.824-.679 1.38-.896.42-.164 1.065-.359 2.235-.413 1.274-.057 1.649-.07 4.859-.07zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405a1.441 1.441 0 11-2.882 0 1.441 1.441 0 012.882 0z" /></svg>}
                      {social.icon === "in" && <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24"><path d="M22.23 0H1.77C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.77 24h20.46c.98 0 1.77-.77 1.77-1.72V1.72C24 .77 23.2 0 22.23 0zM7.12 20.45H3.56V9h3.56v11.45zM5.34 7.58c-1.14 0-2.06-.93-2.06-2.06 0-1.14.92-2.06 2.06-2.06s2.06.92 2.06 2.06c0 1.13-.92 2.06-2.06 2.06zm15.11 12.87h-3.56v-5.6c0-1.34-.03-3.05-1.86-3.05-1.86 0-2.14 1.45-2.14 2.95v5.7h-3.56V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29z" /></svg>}
                    </Link>
                  ))}
                </div>
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
