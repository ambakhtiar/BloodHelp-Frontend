"use client";

import Link from "next/link";
import { Droplets, Home, Search, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-6 relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 -mt-24 -ml-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 right-0 -mb-24 -mr-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="max-w-md w-full text-center relative z-10">
        {/* Animated Icon */}
        <div className="relative inline-block mb-8">
          <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-2xl shadow-primary/25">
            <Search className="h-12 w-12" />
          </div>
          <div className="absolute -bottom-2 -right-2 bg-background border-4 border-background rounded-full p-2">
            <Droplets className="h-6 w-6 text-primary" />
          </div>
        </div>

        {/* Content */}
        <h1 className="text-6xl font-black text-foreground tracking-tighter mb-4">
          404<span className="text-primary">.</span>
        </h1>
        <h2 className="text-2xl font-bold text-foreground mb-3 uppercase tracking-wide">
          Page Not Found
        </h2>
        <p className="text-muted-foreground mb-10 leading-relaxed">
          Oops! The page you are looking for doesn't exist or has been moved.
          Don't worry, you can always find your way back.
        </p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button asChild size="lg" className="h-14 text-base font-bold gap-2 shadow-lg shadow-primary/20">
            <Link href="/">
              <Home className="w-5 h-5" /> Back to Home
            </Link>
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" asChild size="lg" className="h-12 font-semibold gap-2">
              <Link href="/donors">
                <Search className="w-4 h-4" /> Find Donors
              </Link>
            </Button>
            <Button variant="ghost" onClick={() => window.history.back()} size="lg" className="h-12 font-semibold gap-2">
              <ArrowLeft className="w-4 h-4" /> Go Back
            </Button>
          </div>
        </div>

        {/* Branding Footer */}
        <div className="mt-16 flex items-center justify-center gap-2 opacity-50 grayscale">
          <Droplets className="h-4 w-4" />
          <span className="text-sm font-bold tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME_FF || "Blood"}<span className="text-primary">{process.env.NEXT_PUBLIC_APP_NAME_SS || "Link"}</span>
          </span>
        </div>
      </div>
    </main>
  );
}
