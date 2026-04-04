"use client";

import { useEffect, useState } from "react";
import { BookOpen, HeartHandshake, Droplets } from "lucide-react";

const quotes = [
  {
    id: 1,
    text: "Whoever saves one life, it is as if he had saved mankind entirely.",
    author: "Al-Quran, Surah Al-Ma'idah (5:32)",
    badge: "Divine Inspiration",
    note: "In Islam, saving a life is considered one of the greatest acts of virtue. Blood donation is a simple yet profound way to fulfill this sacred duty.",
    icon: BookOpen,
  },
  {
    id: 2,
    text: "The best of people are those who are most beneficial to people.",
    author: "Prophet Muhammad (PBUH)",
    badge: "Prophetic Wisdom",
    note: "This hadith reminds us that true greatness lies in service to others. Donating blood is one of the most direct ways to benefit your fellow human being.",
    icon: HeartHandshake,
  },
  {
    id: 3,
    text: "A single pint of blood can save three lives. A single gesture can create a million smiles.",
    author: "Humanitarian Fact",
    badge: "Did you know?",
    note: "One donation can help accident victims, surgery patients, and those with chronic illnesses. Your few minutes can mean a lifetime for someone else.",
    icon: Droplets,
  },
];

export default function MotivationalSlider() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % quotes.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 via-card to-primary/5 p-8 sm:p-12 min-h-[380px] flex items-center justify-center">

          {/* Decorative Quote Marks */}
          <div className="absolute top-4 left-6 text-8xl font-serif text-primary/10 leading-none select-none">
            &ldquo;
          </div>
          <div className="absolute bottom-4 right-6 text-8xl font-serif text-primary/10 leading-none select-none">
            &rdquo;
          </div>

          <div className="relative z-10 w-full">
            {quotes.map((quote, index) => (
              <div
                key={quote.id}
                className={`transition-all duration-700 ease-in-out absolute inset-0 flex flex-col items-center justify-center text-center px-2 ${index === current
                  ? "opacity-100 scale-100 translate-y-0"
                  : "opacity-0 scale-95 translate-y-4 pointer-events-none"
                  }`}
              >
                <div className="space-y-4 max-w-3xl mx-auto">
                  <quote.icon className="h-6 w-6 text-primary mx-auto" />

                  <span className="inline-flex items-center rounded-full bg-background/80 px-3 py-1 text-xs sm:text-sm font-medium text-primary border border-primary/20">
                    {quote.badge}
                  </span>

                  <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium leading-relaxed tracking-tight text-foreground">
                    {quote.text}
                  </blockquote>

                  <cite className="block text-sm sm:text-base text-primary font-semibold not-italic">
                    — {quote.author}
                  </cite>

                  <p className="text-sm text-muted-foreground max-w-xl mx-auto">
                    {quote.note}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Dots Indicator */}
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
            {quotes.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === current
                  ? "w-6 bg-primary"
                  : "w-1.5 bg-primary/20 hover:bg-primary/40"
                  }`}
                aria-label={`Go to quote ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}