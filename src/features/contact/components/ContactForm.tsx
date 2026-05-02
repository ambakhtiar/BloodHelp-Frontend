"use client";

import React from "react";
import { useForm } from "@tanstack/react-form";
import { zodValidator } from "@tanstack/zod-form-adapter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";
import { sendContactMessage } from "@/services/public.service";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormData = z.infer<typeof contactSchema>;

export function ContactForm() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    } as ContactFormData,
    validatorAdapter: zodValidator(),
    validators: {
      onChange: contactSchema,
    },
    onSubmit: async ({ value }) => {
      setIsSubmitting(true);
      try {
        const response = await sendContactMessage(value);
        if (response.success) {
          toast.success("Message sent! We'll get back to you soon.");
          form.reset();
        } else {
          toast.error(response.message || "Failed to send message");
        }
      } catch (error) {
        toast.error("An unexpected error occurred. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <div className="bg-card p-8 rounded-[2rem] border border-border/40 shadow-sm">
      <h3 className="text-2xl font-bold mb-6">Send us a Message</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <form.Field
            name="name"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold">Full Name</Label>
                <Input
                  id={field.name}
                  placeholder="John Doe"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border/60 focus:border-primary/50"
                />
                {field.state.meta.errors ? (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />

          <form.Field
            name="email"
            children={(field) => (
              <div className="space-y-2">
                <Label htmlFor={field.name} className="text-sm font-semibold">Email Address</Label>
                <Input
                  id={field.name}
                  type="email"
                  placeholder="john@example.com"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="h-12 rounded-xl bg-background border-border/60 focus:border-primary/50"
                />
                {field.state.meta.errors ? (
                  <p className="text-xs text-destructive font-medium mt-1">
                    {field.state.meta.errors.join(", ")}
                  </p>
                ) : null}
              </div>
            )}
          />
        </div>

        <form.Field
          name="subject"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-semibold">Subject</Label>
              <Input
                id={field.name}
                placeholder="How can we help you?"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
                className="h-12 rounded-xl bg-background border-border/60 focus:border-primary/50"
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive font-medium mt-1">
                  {field.state.meta.errors.join(", ")}
                </p>
              ) : null}
            </div>
          )}
        />

        <form.Field
          name="message"
          children={(field) => (
            <div className="space-y-2">
              <Label htmlFor={field.name} className="text-sm font-semibold">Your Message</Label>
              <Textarea
                id={field.name}
                placeholder="Write your message here..."
                className="min-h-[150px] rounded-xl bg-background border-border/60 focus:border-primary/50 resize-none"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
              {field.state.meta.errors ? (
                <p className="text-xs text-destructive font-medium mt-1">
                  {field.state.meta.errors.join(", ")}
                </p>
              ) : null}
            </div>
          )}
        />

        <Button
          type="submit"
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" /> Sending...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Send className="h-5 w-5" /> Send Message
            </span>
          )}
        </Button>
      </form>
    </div>
  );
}
