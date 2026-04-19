"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Search,
  HandHeart,
  Activity,
  HeartPulse,
  UsersRound,
  ShieldPlus,
  Stethoscope
} from "lucide-react";
import { Button } from "../ui/button";

const slides = [
  {
    id: 1,
    badge: "Emergency Blood Network",
    title: "Save a Life Today",
    subtitle:
      "Every drop counts. Join thousands of donors who are making a difference across everyone's life.",
    cta: { label: "Find Blood", href: "/feed?type=BLOOD_FINDING", icon: Search },
    ctaSecondary: { label: "Become a Donor", href: "/register" },
    gradient:
      "from-primary/20 via-background to-background dark:from-primary/15 dark:via-background dark:to-background",
    accentGlow: "bg-primary/20 dark:bg-primary/10",
    icon: Activity,
    floatingEl: (
      <div className="relative flex h-40 w-40 sm:h-56 sm:w-56 lg:h-64 lg:w-64 items-center justify-center rounded-full bg-primary/10 shadow-2xl shadow-primary/20 backdrop-blur-md border border-primary/20 transition-transform duration-700 hover:scale-105">
        <Activity className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 text-primary drop-shadow-[0_0_15px_rgba(var(--primary),0.5)] animate-pulse" />
        <div className="absolute -bottom-4 -left-4 flex h-14 w-14 items-center justify-center rounded-full bg-card shadow-lg border border-border animate-bounce" style={{ animationDelay: "1s", animationDuration: "3s" }}>
          <HeartPulse className="h-7 w-7 text-destructive" />
        </div>
      </div>
    ),
  },
  {
    id: 2,
    badge: "Medical Crowdfunding",
    title: "Support Patients Financially",
    subtitle:
      "Help those who cannot afford medical treatment. Your generous contribution can change a life forever.",
    cta: { label: "Donate Funds", href: "/campaigns", icon: HandHeart },
    ctaSecondary: { label: "Start a Campaign", href: "/feed?type=HELPING" },
    gradient:
      "from-destructive/20 via-background to-background dark:from-destructive/15 dark:via-background dark:to-background",
    accentGlow: "bg-destructive/20 dark:bg-destructive/10",
    icon: HandHeart,
    floatingEl: (
      <div className="relative flex h-40 w-40 sm:h-56 sm:w-56 lg:h-64 lg:w-64 items-center justify-center rounded-[2rem] bg-destructive/10 shadow-2xl shadow-destructive/20 backdrop-blur-md border border-destructive/20 rotate-3 hover:rotate-0 transition-all duration-500 hover:scale-105">
        <HandHeart className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 text-destructive drop-shadow-[0_0_15px_rgba(var(--destructive),0.5)]" />
        <div className="absolute -top-4 -right-4 flex h-14 w-14 items-center justify-center rounded-xl bg-card shadow-lg border border-border animate-pulse" style={{ animationDuration: "2s" }}>
          <Stethoscope className="h-7 w-7 text-destructive/80" />
        </div>
      </div>
    ),
  },
  {
    id: 3,
    badge: "Community Driven",
    title: "Hospitals & Organisations",
    subtitle:
      "Register your institution. Track verifiable donations, manage volunteers, and build a stronger network.",
    cta: { label: "Register Now", href: "/register", icon: ShieldPlus },
    ctaSecondary: { label: "Learn More", href: "/about" },
    gradient:
      "from-chart-4/20 via-background to-background dark:from-chart-4/15 dark:via-background dark:to-background",
    accentGlow: "bg-chart-4/20 dark:bg-chart-4/10",
    icon: UsersRound,
    floatingEl: (
      <div className="relative flex h-40 w-40 sm:h-56 sm:w-56 lg:h-64 lg:w-64 items-center justify-center rounded-br-full rounded-tl-full bg-chart-4/10 shadow-2xl shadow-chart-4/20 backdrop-blur-md border border-chart-4/20 transition-transform duration-700 hover:scale-105">
        <UsersRound className="h-20 w-20 sm:h-24 sm:w-24 lg:h-32 lg:w-32 text-chart-4 drop-shadow-[0_0_15px_rgba(var(--chart-4),0.5)] animate-in zoom-in duration-1000" />
      </div>
    ),
  },
];

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % slides.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const slide = slides[current];

  return (
    <section
      className="relative overflow-hidden bg-background py-8 lg:py-12"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label={`Welcome to ${process.env.NEXT_PUBLIC_APP_NAME_FF}${process.env.NEXT_PUBLIC_APP_NAME_SS}`}
    >
      {/* Dynamic Background Gradients */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-80 transition-colors duration-1000 ease-in-out`}
      />

      {/* Decorative Glow Orbs */}
      <div
        className={`absolute -top-32 -right-32 h-[30rem] w-[30rem] rounded-full ${slide.accentGlow} blur-[100px] transition-colors duration-1000 ease-in-out dark:opacity-50`}
      />
      <div
        className={`absolute -bottom-32 -left-32 h-[20rem] w-[20rem] rounded-full ${slide.accentGlow} blur-[80px] transition-colors duration-1000 ease-in-out dark:opacity-50`}
      />

      {/* Main Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-10 lg:gap-8 items-center min-h-[10rem] lg:min-h-[15rem]">

          {/* Left Text Content */}
          <div className="flex flex-col justify-center space-y-6 md:space-y-7 z-10 py-6 min-h-[24rem] sm:min-h-[22rem] lg:min-h-[24rem]">
            {/* Badge */}
            <div
              key={`badge-${slide.id}`}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-background/60 backdrop-blur-md px-3.5 py-1.5 text-xs font-semibold shadow-sm">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                {slide.badge}
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-3">
              <h1
                key={`title-${slide.id}`}
                className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground drop-shadow-sm leading-tight"
              >
                {slide.title}
              </h1>
              <p
                key={`sub-${slide.id}`}
                className="animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 text-base sm:text-lg text-muted-foreground max-w-lg leading-relaxed"
              >
                {slide.subtitle}
              </p>
            </div>

            {/* CTAs */}
            <div
              key={`cta-${slide.id}`}
              className="animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300 flex flex-col sm:flex-row gap-3 pt-2"
            >
              <Button size="lg" className="gap-2 sm:w-auto w-full h-11 px-6 text-sm shadow-lg shadow-primary/20 group rounded-xl" asChild>
                <Link href={slide.cta.href}>
                  <slide.cta.icon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {slide.cta.label}
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="sm:w-auto w-full h-11 px-6 text-sm border-border bg-background/50 backdrop-blur-md hover:bg-accent rounded-xl" asChild>
                <Link href={slide.ctaSecondary.href}>
                  {slide.ctaSecondary.label}
                </Link>
              </Button>
            </div>
          </div>

          {/* Right Visual Content (Fancy Display) */}
          <div className="hidden md:flex justify-center items-center relative z-10 h-full drop-shadow-xl">
            <div key={`visual-${slide.id}`} className="animate-in fade-in zoom-in-95 duration-1000 delay-100">
              {slide.floatingEl}
            </div>
          </div>
        </div>

        {/* Custom Navigation Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-2 border-t border-border/40 pt-6">

          {/* Progress/Dots Wrapper */}
          <div className="flex items-center gap-3 bg-background/30 backdrop-blur-sm p-2 rounded-full border border-border/50">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                aria-label={`Go to slide ${i + 1}`}
                className="relative h-1.5 rounded-full overflow-hidden transition-all duration-500 ease-out flex items-center bg-foreground/10"
                style={{ width: i === current ? "2.5rem" : "0.75rem" }}
              >
                {/* Simulated filling bar for the active dot */}
                {i === current && (
                  <div
                    className="absolute inset-y-0 left-0 bg-primary h-full"
                    style={{
                      animation: isPaused ? "none" : "progress 6s linear forwards"
                    }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Fancy Navigation Arrows */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={prev}
              aria-label="Previous slide"
              className="group h-11 w-11 p-0 rounded-2xl border border-primary/20 bg-background/60 backdrop-blur-md shadow-sm hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all active:scale-90"
            >
              <ChevronLeft className="h-5 w-5 transition-transform group-hover:-translate-x-0.5" />
            </Button>
            <Button
              variant="outline"
              onClick={next}
              aria-label="Next slide"
              className="group h-11 w-11 p-0 rounded-2xl border border-primary/20 bg-background/60 backdrop-blur-md shadow-sm hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all active:scale-90"
            >
              <ChevronRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Embedded CSS for progress bar animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </section>
  );
}
