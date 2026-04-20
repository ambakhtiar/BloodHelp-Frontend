/**
 * parseApiError — Extracts a clear, user-friendly error message from any
 * Axios error thrown by our backend.
 *
 * Backend shape:
 *   { success: false, message: string, errorSources?: { path: string, message: string }[] }
 *
 * Security rules:
 *   - Never expose stack traces or raw DB error codes to the UI
 *   - 401/403 always get a safe, generic auth message
 *   - 500 always says "our team has been notified" — no internals leaked
 */

export interface ParsedApiError {
  /** Short headline to show in a toast */
  headline: string;
  /** Optional detailed lines (e.g. per-field errors from Zod/Prisma) */
  details: string[];
  /** HTTP status code, if available */
  status: number;
}

const SAFE_MESSAGES: Record<number, string> = {
  400: "The information you provided is invalid. Please review and try again.",
  401: "You need to be logged in to perform this action. Please sign in and try again.",
  403: "You don't have permission to perform this action. If you think this is a mistake, please contact support.",
  404: "The requested resource could not be found. It may have been removed or the link is incorrect.",
  409: "A conflict occurred — this record may already exist. Please check and try again.",
  422: "The data you submitted could not be processed. Please check all fields and try again.",
  429: "Too many requests. Please wait a moment and try again.",
  500: "Something went wrong on our end. Our team has been notified. Please try again in a moment.",
  503: "The service is temporarily unavailable. Please try again shortly.",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function parseApiError(error: any): ParsedApiError {
  // No response at all (network error, timeout, CORS)
  if (!error?.response) {
    return {
      headline: "Network error. Please check your internet connection and try again.",
      details: [],
      status: 0,
    };
  }

  const status: number = error.response.status ?? 500;
  const data = error.response.data ?? {};

  // 401 / 403 — always use safe messages, never echo backend details
  if (status === 401 || status === 403) {
    return {
      headline: SAFE_MESSAGES[status],
      details: [],
      status,
    };
  }

  // 500+ — safe generic message only
  if (status >= 500) {
    return {
      headline: SAFE_MESSAGES[500],
      details: [],
      status,
    };
  }

  // 4xx — extract as much useful detail as possible
  const headline: string =
    data.message ||
    SAFE_MESSAGES[status] ||
    "An unexpected error occurred. Please try again.";

  // errorSources is our backend's field-level error array
  const rawSources: Array<{ path?: string; message?: string }> =
    Array.isArray(data.errorSources) ? data.errorSources : [];

  const details: string[] = rawSources
    .map((src) => {
      const path = src.path ? `${src.path}: ` : "";
      return `${path}${src.message ?? ""}`.trim();
    })
    .filter(Boolean)
    // Don't duplicate the headline
    .filter((d) => d !== headline);

  return { headline, details, status };
}

/**
 * Quick helper used in useMutation onError handlers.
 * Shows the headline as a toast and returns the parsed error.
 */
import { toast } from "sonner";

export function toastApiError(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  error: any,
  fallback = "Something went wrong. Please try again."
): ParsedApiError {
  const parsed = parseApiError(error);
  const message = parsed.headline || fallback;

  if (parsed.details.length > 0) {
    // Show headline + first meaningful detail
    toast.error(message, {
      description: parsed.details.slice(0, 2).join(" • "),
    });
  } else {
    toast.error(message);
  }

  return parsed;
}
