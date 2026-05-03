"use client";

import { ThemeProvider } from "next-themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./AuthProvider";
import { TooltipProvider } from "@/components/ui/tooltip";

function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default function AppProviders({ children }: { children: ReactNode }) {
  // In Next.js, client-side environment variables must be prefixed with NEXT_PUBLIC_
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";

  if (typeof window !== "undefined" && !googleClientId && process.env.NODE_ENV === "production") {
    console.warn("[BloodLink] Google Client ID is missing. Google Login will not function correctly on Vercel.");
  }

  return (
    <QueryProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider>
            {/* AuthProvider is inside ThemeProvider so the loading screen uses correct theme */}
            <AuthProvider>{children}</AuthProvider>
          </TooltipProvider>
        </ThemeProvider>
      </GoogleOAuthProvider>
    </QueryProvider>
  );
}

