"use client";

import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    category: "General",
    items: [
      {
        question: "How do I become a blood donor?",
        answer: "Simply create an account, complete your donor profile with your blood group and location, and set your availability status. You will then appear in donor searches for those in need.",
      },
      {
        question: "Is my personal information safe?",
        answer: "Yes, we take privacy seriously. Your contact number is only visible to verified users who have an active and approved blood request. We do not share your data with third parties.",
      },
    ],
  },
  {
    category: "Donation Process",
    items: [
      {
        question: "How often can I donate blood?",
        answer: "For healthy adults, the standard interval between whole blood donations is 90 days (3 months) for men and 120 days (4 months) for women to ensure your body has time to replenish iron levels.",
      },
      {
        question: "What should I do before donating?",
        answer: "Make sure you are well-hydrated, have had a healthy meal, and have gotten plenty of sleep. Avoid alcohol and heavy exercise 24 hours before your donation.",
      },
    ],
  },
  {
    category: "Crowdfunding",
    items: [
      {
        question: "How does medical crowdfunding work?",
        answer: "If you or someone you know needs help with medical bills, you can create a 'Helping' post with a target amount. Once verified by our team, donors can contribute directly via the provided payment methods.",
      },
      {
        question: "Are the crowdfunding campaigns verified?",
        answer: "Yes, our moderation team reviews every crowdfunding request. We may ask for hospital documents or prescriptions to verify the legitimacy of the need before making the campaign public.",
      },
    ],
  },
  {
    category: "Hospitals & Organisations",
    items: [
      {
        question: "How can a hospital join the platform?",
        answer: "Hospitals can register as a 'Hospital' account. After manual verification of their registration number, they can record official donations and manage donor requests directly.",
      },
    ],
  },
];

export function FAQSection() {
  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      {faqs.map((group, idx) => (
        <div key={idx} className="space-y-6">
          <h3 className="text-xl font-bold border-l-4 border-primary pl-4 uppercase tracking-widest text-sm text-primary/80">
            {group.category}
          </h3>
          <Accordion type="single" collapsible className="w-full space-y-4">
            {group.items.map((item, i) => (
              <AccordionItem
                key={i}
                value={`${idx}-${i}`}
                className="border border-border/40 bg-card px-6 rounded-2xl overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline font-bold text-left py-6">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-6">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
}
